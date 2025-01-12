import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    const sb = await createClient();

    await sb.from('jobs').update({ status: 'pending' }).eq('status', 'failed');

    return NextResponse.json({ message: 'Reset failed jobs' });
}