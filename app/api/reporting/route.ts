import { IResponse } from "@/lib/types";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

export const POST = async (req: Request): Promise<NextResponse<IResponse>> => {
  const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const keyResponse = await fetch(`${defaultUrl}/api/settings/cashmereApiKey`);
  if(!keyResponse.ok) {
    return NextResponse.json({message: 'Unable to get the Cashmere API key'}, {status: 500});
  }
  
  const { value } = await keyResponse.json();
  
  const transactionId = uuidv4();
  const clientReports = await req.json();

  const reports = clientReports.map((report: {blockId: string, id: string; licenseType: string; timestamp: number;}) => {
    return {
      id: report.id,
      block_id: report.blockId,
      transaction_id: transactionId,
      api_key: value,
      license_type: report.licenseType,
      used_at: new Date(report.timestamp).toISOString(),
      reported_at: new Date().toISOString(),
    };
  });

  const sb = await createClient();


  const {data: existingReports, error: existingError } = await sb.from('reporting')
    .select('id,transaction_id')
    .in('id', reports.map((report: { id: string }) => report.id));

  if (existingError || !existingReports) {
    console.error(existingError);
    return NextResponse.json({ message: 'Unable to fetch existing reports' }, { status: 500 });
  }

  const existingReportIds = existingReports?.map((report: { id: string }) => report.id);

  // Filter out duplicate reports
  const uniqueReports = reports.filter((report: { id: string }) => !existingReportIds.includes(report.id));

  // Insert unique reports
  const { error: uniqueError } = await sb.from('reporting').insert(uniqueReports);
  if (uniqueError) {
    console.error(uniqueError);
    return NextResponse.json({ message: uniqueError.message }, { status: 500 });
  }

  const data = [
    ...existingReports.map((report: {id: string, transaction_id: string}) => ({id: report.id, transactionId: report.transaction_id})),
    ...uniqueReports.map((report: {id: string}) => ({id: report.id, transactionId }))
  ];

  return NextResponse.json({message: 'Reports stored successfully', data});
}