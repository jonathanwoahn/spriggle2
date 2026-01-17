import { fileExists } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";

// Utility endpoint that checks to see if a file already exists on the server. It helps to prevent excessive server load
export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string, filename: string }> },
) => {
  const { bookId, filename } = await params;

  try {
    const exists = await fileExists(`${bookId}/${filename}`);

    if (!exists) {
      return NextResponse.json({ exists: false, error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json({ exists: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
