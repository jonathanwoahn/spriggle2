import { uploadFile } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";

// Upload an audio file to the storage bucket. Requires a bookId, filename and the file Blob
export const POST = async (req: NextRequest) => {
  const formData = await req.formData();
  const bookId = formData.get('bookId') as string;
  const filename = formData.get('filename') as string;
  const file = formData.get('file') as Blob;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    // check to see if the file ends in .mp3. if not, add it
    const fn = filename.endsWith('.mp3') ? filename : `${filename}.mp3`;

    await uploadFile(`${bookId}/${fn}`, buffer, 'audio/mpeg');

    return NextResponse.json({ message: 'Audio successfully stored', data: { filename: `${bookId}/${fn}` } });
  } catch (e) {
    return NextResponse.json({ message: (e as Error).message }, { status: 500 });
  }
}
