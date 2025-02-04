import { AUDIO_BUCKET } from "@/app/api/jobs/execute/helpers";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// returns an audio file from the storage bucket
export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string, filename: string }> },
) => {

  const { bookId, filename } = await params;
  const sb = await createClient();

  // return the file from the storage bucket
  const { data, error } = await sb
    .storage
    .from(AUDIO_BUCKET)
    .download(`${bookId}/${filename}`);

  if (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }

  const fileBuffer = await data.arrayBuffer();
  const fileBlob = new Blob([fileBuffer]);

  return new NextResponse(fileBlob, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}