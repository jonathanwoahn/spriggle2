import { schedules, logger } from "@trigger.dev/sdk/v3";
import type { ILicenseReport, LicenseType } from "@/lib/types";

export const syncReports = schedules.task({
  id: "sync-reports",
  cron: "*/5 * * * *", // Every 5 minutes
  run: async () => {
    logger.info("Starting license report sync");

    // Dynamic imports
    const { db } = await import("@/db");
    const { appSettings, reporting } = await import("@/db/schema");
    const { eq, isNull, inArray } = await import("drizzle-orm");

    // Get Cashmere API key
    const cashmereKeySetting = await db.select()
      .from(appSettings)
      .where(eq(appSettings.key, 'cashmereApiKey'));

    if (!cashmereKeySetting.length || !cashmereKeySetting[0].value) {
      logger.warn("Cashmere API key not configured, skipping report sync");
      return { success: true, skipped: true };
    }

    // Get unsynced reports
    const unsyncedReports = await db.select()
      .from(reporting)
      .where(isNull(reporting.syncedAt))
      .limit(100); // Process in batches of 100

    if (unsyncedReports.length === 0) {
      logger.info("No unsynced reports found");
      return { success: true, synced: 0 };
    }

    logger.info(`Found ${unsyncedReports.length} unsynced reports`);

    try {
      // Initialize Cashmere client
      const { default: Cashmere } = await import("@/lib/cashmere");
      const cashmere = new Cashmere(cashmereKeySetting[0].value);

      // Format reports for Cashmere API
      const formattedReports: ILicenseReport[] = unsyncedReports.map(report => ({
        id: report.id,
        blockId: report.blockId,
        licenseType: report.licenseType as LicenseType,
        data: report.data as { length?: number; includedChildren?: boolean } | undefined,
        timestamp: report.timestamp?.getTime() || Date.now(),
      }));

      // Send to Cashmere
      const response = await cashmere.reportLicenseUsage(formattedReports);

      // Mark reports as synced
      const reportIds = unsyncedReports.map(r => r.id);
      await db.update(reporting)
        .set({
          syncedAt: new Date(),
          transactionId: response.transactionId,
        })
        .where(inArray(reporting.id, reportIds));

      logger.info("Successfully synced reports", {
        count: unsyncedReports.length,
        transactionId: response.transactionId,
      });

      return {
        success: true,
        synced: unsyncedReports.length,
        transactionId: response.transactionId,
      };
    } catch (error) {
      logger.error("Failed to sync reports to Cashmere", { error });

      // Don't throw - we'll retry on next scheduled run
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        pendingCount: unsyncedReports.length,
      };
    }
  },
});
