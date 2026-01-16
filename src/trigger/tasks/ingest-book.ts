import { task, logger } from "@trigger.dev/sdk/v3";
import { processSection } from "./process-section";
import { generateSummary } from "./generate-summary";
import { generateEmbedding } from "./generate-embedding";

interface IngestBookPayload {
  bookId: string;
  voiceId: string;
  voiceName?: string;
}

export const ingestBook = task({
  id: "ingest-book",
  maxDuration: 3600, // 1 hour for full book ingestion
  run: async ({ bookId, voiceId, voiceName }: IngestBookPayload) => {
    const startTime = Date.now();
    logger.info("=== STARTING BOOK INGESTION ===", {
      bookId,
      voiceId,
      voiceName,
      timestamp: new Date().toISOString(),
    });

    // Import dynamically to avoid bundling issues
    const { db } = await import("@/db");
    const { ingestionStatus, omnipubs, bookVoices } = await import("@/db/schema");
    const { eq, and } = await import("drizzle-orm");

    // Step 1: Check if already ingested in omnipubs table
    logger.info("[Step 1] Checking if book already exists in omnipubs", { bookId });
    const existingOmnipub = await db.select()
      .from(omnipubs)
      .where(eq(omnipubs.uuid, bookId))
      .limit(1);

    if (existingOmnipub.length > 0 && existingOmnipub[0].ready) {
      logger.info("[Step 1] Book already ingested and ready, skipping", {
        bookId,
        title: existingOmnipub[0].title,
      });
      return { success: true, bookId, skipped: true, reason: "Already ingested" };
    }
    logger.info("[Step 1] Book status", {
      exists: existingOmnipub.length > 0,
      ready: existingOmnipub[0]?.ready,
    });

    // Update ingestion status to in_progress
    const existing = await db.select().from(ingestionStatus).where(eq(ingestionStatus.bookId, bookId));
    if (existing.length > 0) {
      await db.update(ingestionStatus)
        .set({ status: 'in_progress', startedAt: new Date(), updatedAt: new Date() })
        .where(eq(ingestionStatus.bookId, bookId));
    } else {
      await db.insert(ingestionStatus).values({
        bookId,
        status: 'in_progress',
        startedAt: new Date(),
      });
    }

    // Store voice selection with isDefault flag
    const existingVoice = await db.select()
      .from(bookVoices)
      .where(and(eq(bookVoices.bookId, bookId), eq(bookVoices.voiceId, voiceId)));

    if (existingVoice.length > 0) {
      await db.update(bookVoices)
        .set({ voiceName, status: 'processing', isDefault: true, updatedAt: new Date() })
        .where(and(eq(bookVoices.bookId, bookId), eq(bookVoices.voiceId, voiceId)));
    } else {
      await db.insert(bookVoices).values({
        bookId,
        voiceId,
        voiceName,
        isDefault: true,
        status: 'processing',
      });
    }

    try {
      // Step 2: Fetch book from Cashmere
      logger.info("[Step 2] Fetching book from Cashmere API", { bookId });
      const { default: Cashmere } = await import("@/lib/cashmere");
      const { appSettings, reporting } = await import("@/db/schema");
      const { v4: uuid } = await import("uuid");

      logger.info("[Step 2] Checking Cashmere API key");
      const apiKeySetting = await db.select()
        .from(appSettings)
        .where(eq(appSettings.key, 'cashmereApiKey'));

      if (!apiKeySetting.length || !apiKeySetting[0].value) {
        logger.error("[Step 2] FAILED: Cashmere API key not configured");
        throw new Error("Cashmere API key not configured");
      }
      logger.info("[Step 2] Cashmere API key found, fetching book data");

      const cashmere = new Cashmere(apiKeySetting[0].value);
      const book = await cashmere.getBook(bookId);
      logger.info("[Step 2] Book data fetched successfully", {
        bookId: book.uuid,
        hasNav: !!book.data.nav,
        navLength: book.data.nav?.length || 0,
      });

      // Extract book metadata with proper type handling
      const bookTitle = typeof book.data.title === 'string'
        ? book.data.title
        : Array.isArray(book.data.title) ? book.data.title[0] : 'Untitled';
      const bookSubtitle = typeof book.data.subtitle === 'string'
        ? book.data.subtitle
        : Array.isArray(book.data.subtitle) ? book.data.subtitle[0] : undefined;
      const bookCreators = Array.isArray(book.data.creators)
        ? book.data.creators as string[]
        : book.data.creators ? [String(book.data.creators)] : [];
      const bookPublisher = typeof book.data.publisher === 'string'
        ? book.data.publisher
        : Array.isArray(book.data.publisher) ? book.data.publisher[0] : undefined;

      // Cover image URL can be constructed from the book ID
      const coverImageUrl = `https://omnibk.ai/api/v2/omnipub/${bookId}/cover_image`;

      logger.info("[Step 2] Extracted book metadata", {
        title: bookTitle,
        subtitle: bookSubtitle,
        creators: bookCreators,
        publisher: bookPublisher,
        sections: book.data.nav?.length || 0,
      });

      // Step 3: Store omnipub metadata in dedicated table
      logger.info("[Step 3] Storing book metadata in omnipubs table");
      if (existingOmnipub.length > 0) {
        await db.update(omnipubs)
          .set({
            title: bookTitle || 'Untitled',
            subtitle: bookSubtitle,
            creators: bookCreators,
            publisher: bookPublisher,
            coverImage: coverImageUrl,
            updatedAt: new Date(),
          })
          .where(eq(omnipubs.uuid, bookId));
      } else {
        await db.insert(omnipubs).values({
          uuid: bookId,
          title: bookTitle || 'Untitled',
          subtitle: bookSubtitle,
          creators: bookCreators,
          publisher: bookPublisher,
          coverImage: coverImageUrl,
        });
      }

      // Step 4: Report storage to Cashmere
      logger.info("[Step 4] Recording license usage for storage");
      await db.insert(reporting).values({
        id: uuid(),
        blockId: bookId,
        licenseType: 'storage',
        data: { sections: book.data.nav?.length || 0 },
        timestamp: new Date(),
      });
      logger.info("[Step 4] License usage recorded");

      // Step 5: Filter to BODY matter only (exclude front/back matter)
      logger.info("[Step 5] Filtering sections for body matter");
      const navItems = book.data.nav || [];
      const bodyNavItems = navItems.filter((nav: any) => {
        // Check for matter type - allow 'body' or undefined (default to body)
        const matter = nav.matter || nav.type || 'body';
        return matter === 'body' || matter === 'bodymatter';
      });

      // If no body items found, process all items (fallback)
      const itemsToProcess = bodyNavItems.length > 0 ? bodyNavItems : navItems;

      // Update total sections count (only body sections)
      const totalSections = itemsToProcess.length;
      await db.update(ingestionStatus)
        .set({ totalSections, updatedAt: new Date() })
        .where(eq(ingestionStatus.bookId, bookId));

      logger.info("[Step 5] Section filtering complete", {
        totalNavItems: navItems.length,
        bodyNavItems: bodyNavItems.length,
        itemsToProcess: itemsToProcess.length,
        usingFallback: bodyNavItems.length === 0,
      });

      // Step 6: Process all body sections in parallel
      // Each section processes its blocks sequentially with request stitching,
      // but sections themselves are independent and can run concurrently
      logger.info("[Step 6] Preparing section processing payloads");
      const sectionPayloads = itemsToProcess.map((navItem: any) => ({
        payload: {
          bookId,
          sectionOrder: navItem.order,
          voiceId,
        },
      }));

      logger.info(`[Step 6] Triggering ${sectionPayloads.length} section tasks in parallel`, {
        sectionOrders: sectionPayloads.map(p => p.payload.sectionOrder),
      });

      // Use batchTriggerAndWait to process all sections concurrently
      const results = await processSection.batchTriggerAndWait(sectionPayloads);
      logger.info("[Step 6] All section tasks completed", {
        totalRuns: results.runs.length,
        successful: results.runs.filter(r => r.ok).length,
        failed: results.runs.filter(r => !r.ok).length,
      });

      // Check for failures - if ANY section fails, fail the entire job
      const failures = results.runs.filter(r => r.ok === false);
      if (failures.length > 0) {
        // Log details about each failure
        for (const failure of failures) {
          if (!failure.ok) {
            logger.error("Section processing failed", {
              sectionOrder: (failure as any).payload?.sectionOrder,
              error: failure.error,
            });
          }
        }

        // Throw error to fail the entire ingestion
        const errorMessage = failures.length === 1
          ? `Section processing failed: ${failures[0].ok === false ? failures[0].error : 'Unknown error'}`
          : `${failures.length} of ${results.runs.length} sections failed to process`;

        throw new Error(errorMessage);
      }

      // Update completed sections count
      await db.update(ingestionStatus)
        .set({ completedSections: itemsToProcess.length, updatedAt: new Date() })
        .where(eq(ingestionStatus.bookId, bookId));

      logger.info("All sections processed successfully", {
        sectionsCompleted: results.runs.length,
      });

      // Step 7: Generate summary and store on omnipub
      logger.info("[Step 7] Generating book summary");
      const summaryResult = await generateSummary.triggerAndWait({ bookId });
      logger.info("[Step 7] Summary generation completed", {
        success: summaryResult.ok,
        output: summaryResult.ok ? summaryResult.output : summaryResult.error,
      });

      // Step 8: Generate embedding and store on omnipub (indexed for semantic search)
      logger.info("[Step 8] Generating summary embedding");
      const embeddingResult = await generateEmbedding.triggerAndWait({ bookId });
      logger.info("[Step 8] Embedding generation completed", {
        success: embeddingResult.ok,
        output: embeddingResult.ok ? embeddingResult.output : embeddingResult.error,
      });

      // Step 9: Mark book as ready in both tables
      logger.info("[Step 9] Marking book as ready");
      // Update omnipubs table
      await db.update(omnipubs)
        .set({
          ready: true,
          updatedAt: new Date(),
        })
        .where(eq(omnipubs.uuid, bookId));

      // Update voice status to completed
      await db.update(bookVoices)
        .set({ status: 'completed', updatedAt: new Date() })
        .where(and(eq(bookVoices.bookId, bookId), eq(bookVoices.voiceId, voiceId)));

      // Update ingestion status to completed
      await db.update(ingestionStatus)
        .set({
          status: 'completed',
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(ingestionStatus.bookId, bookId));

      const totalDuration = Date.now() - startTime;
      logger.info("=== BOOK INGESTION COMPLETED SUCCESSFULLY ===", {
        bookId,
        sectionsProcessed: itemsToProcess.length,
        totalDurationMs: totalDuration,
        totalDurationMinutes: (totalDuration / 60000).toFixed(2),
      });

      return {
        success: true,
        bookId,
        sectionsProcessed: itemsToProcess.length,
        durationMs: totalDuration,
      };
    } catch (error) {
      const totalDuration = Date.now() - startTime;
      logger.error("=== BOOK INGESTION FAILED ===", {
        bookId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        durationMs: totalDuration,
      });

      // Update ingestion status to failed
      await db.update(ingestionStatus)
        .set({
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          updatedAt: new Date(),
        })
        .where(eq(ingestionStatus.bookId, bookId));

      // Update voice status to failed
      await db.update(bookVoices)
        .set({ status: 'failed', updatedAt: new Date() })
        .where(and(eq(bookVoices.bookId, bookId), eq(bookVoices.voiceId, voiceId)));

      throw error;
    }
  },
});
