import { AUDIO_BUCKET } from "@/app/api/jobs/execute/helpers";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string, filename: string }> },
) => {
  const { bookId, filename } = await params;

  // check if the file exists in the storage bucket
  const sb = await createClient();
  const { data, error } = await sb
    .storage
    .from(AUDIO_BUCKET)
    .list(bookId, { search: filename });

  if (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }

  if (data.length === 0) {
    return NextResponse.json({ exists: false, error: 'File not found' }, { status: 404 });
  }

  return NextResponse.json({ exists: true }, {status: 200});
}