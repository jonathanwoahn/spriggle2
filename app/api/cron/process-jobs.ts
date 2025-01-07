import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  console.log('CRON JOB');
  return NextResponse.json({ message: "Hello from the jobs API!" });
}