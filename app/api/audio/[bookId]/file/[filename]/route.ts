import { downloadFile } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";

// returns an audio file from the storage bucket
export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string, filename: string }> },
) => {
  const { bookId, filename } = await params;

  try {
    const fileBuffer = await downloadFile(`${bookId}/${filename}`);
    const fileBlob = new Blob([fileBuffer]);

    return new NextResponse(fileBlob, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
