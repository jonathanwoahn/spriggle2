import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { checkDependencies } from "../execute/helpers";

// Checks to see if there are any jobs waiting to be processed, and if their children are complete, updates them
export const POST = async (
  req: NextRequest,
) => {

  const sb = await createClient();
  const { data: jobs, error } = await sb.from('jobs').select('*').eq('status', 'waiting');

  if(error) {
    console.error('Error fetching jobs:', error);
    throw new Error(error.message);
  }

  const processedJobs = await Promise.all((jobs || []).map(async (job: any) => {
    // check if job is ready to be processed
    const ready = await checkDependencies(job, sb);
    if(ready) {
      // update job status to pending
      const updatedJob = {
        ...job,
        status: 'pending',
      };

      await sb.from('jobs').upsert(updatedJob);
    }

    return {job, ready};
  }));
  
  return NextResponse.json({data: processedJobs, message: `${processedJobs.length} jobs processed`});
  
}