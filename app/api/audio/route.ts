import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { AUDIO_BUCKET, ensureBucketExists } from "../jobs/execute/helpers";

export const POST = async (req: NextRequest) => {
  const sb = await createClient();
  const formData = await req.formData();
  const bookId = formData.get('bookId') as string;
  const filename = formData.get('filename') as string;
  const file = formData.get('file') as Blob;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    // check to make sure the bucket exists, if not, create it
    await ensureBucketExists(sb, AUDIO_BUCKET);
  
    // check to see if the file ends in .mp3. if not, add it
    const fn = filename.endsWith('.mp3') ? filename : `${filename}.mp3`;
    
    const { data: storageData, error: storageError } = await sb.storage
      .from(AUDIO_BUCKET)
      .upload(`${bookId}/${fn}`, buffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });
  
    if (storageError) {
      throw new Error(`Error storing audio: ${storageError.message}`);
    }

    return NextResponse.json({message: 'Audio successfully stored', data: {filename: `${AUDIO_BUCKET}/${bookId}/${fn}`}});
  } catch (e) {
    return NextResponse.json({message: (e as Error).message}, {status: 500});
  }
}