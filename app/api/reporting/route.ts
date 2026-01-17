import { IResponse } from "@/lib/types";
import { getServerURL } from "@/lib/utils";
import { db, reporting } from "@/db";
import { inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

export const POST = async (req: Request): Promise<NextResponse<IResponse>> => {
  try {
    const keyResponse = await fetch(`${getServerURL()}/api/settings/cashmereApiKey`);
    if (!keyResponse.ok) {
      return NextResponse.json({ message: 'Unable to get the Cashmere API key' }, { status: 500 });
    }

    const { value } = await keyResponse.json();

    const transactionId = uuidv4();
    const clientReports = await req.json();

    const reports = clientReports.map((report: { blockId: string, id: string; licenseType: string; timestamp: number; }) => {
      return {
        id: report.id,
        blockId: report.blockId,
        licenseType: report.licenseType,
        data: {
          transaction_id: transactionId,
          api_key: value,
          used_at: new Date(report.timestamp).toISOString(),
          reported_at: new Date().toISOString(),
        },
        timestamp: new Date(report.timestamp),
      };
    });

    // Check for existing reports
    const reportIds = reports.map((report: { id: string }) => report.id);
    const existingReports = await db
      .select({ id: reporting.id })
      .from(reporting)
      .where(inArray(reporting.id, reportIds));

    const existingReportIds = existingReports.map(r => r.id);

    // Filter out duplicate reports
    const uniqueReports = reports.filter((report: { id: string }) => !existingReportIds.includes(report.id));

    // Insert unique reports
    if (uniqueReports.length > 0) {
      await db.insert(reporting).values(uniqueReports);
    }

    const data = [
      ...existingReports.map((report) => ({ id: report.id, transactionId: 'existing' })),
      ...uniqueReports.map((report: { id: string }) => ({ id: report.id, transactionId }))
    ];

    return NextResponse.json({ message: 'Reports stored successfully', data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
