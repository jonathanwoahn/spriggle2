import Cashmere from "@/lib/cashmere";
import { listFiles } from "@/lib/storage";
import { db, blockMetadata } from "@/db";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";


// DEPRECATED: This route is no longer used in the application.
export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> },
) => {
  console.log('Processing block metadata');
  const { bookId } = await params;

  const audioFiles = await listFiles(`${bookId}/`);

  const baseUrl = request.nextUrl.origin;
  const response = await fetch(`${baseUrl}/api/settings/cashmereApiKey`);
  const { value } = await response.json();

  const cash = new Cashmere(value);
  const book = await cash.getBook(bookId);

  if (!book.data.nav) {
    throw new Error('No sections found for this book');
  }

  for (let i = 0; i < (book.data.nav || []).length; i++) {
    const order = book.data.nav[i].order;
    console.log(`Reading metadata for blocks in section ${order}`);

    const blocks = (await cash.getSectionBookBlocks(bookId, `${i}`));
    const metadata = await db
      .select()
      .from(blockMetadata)
      .where(
        and(
          eq(blockMetadata.bookId, bookId),
          eq(blockMetadata.sectionOrder, order)
        )
      );

    let startTime = 0;

    // go through each of the blocks in the section, and ensure the proper data exists (audio file, metadata).
    // If all the information needed is there, then update the metadata with the start time
    for (let j = 0; j < blocks.length; j++) {
      // only process text blocks
      if (blocks[j].type !== 'text') continue;

      const block = blocks[j];
      const audioFile = audioFiles.find((file) => file.key === `${bookId}/${block.uuid}.mp3`);

      if (!audioFile) {
        console.log(`No audio file found for block ${block.uuid}`);
        throw new Error(`No audio file found for block ${block.uuid}`);
      }

      const meta = (metadata || []).find((m) => m.blockId === block.uuid);

      if (!meta) {
        console.log(`No metadata found for block ${block.uuid}`);
        throw new Error(`No metadata found for block ${block.uuid}`);
      }

      const data = {
        ...(meta.data as object),
        start_time: startTime,
      };

      startTime += (meta.data as any)?.duration || 0;

      await db
        .update(blockMetadata)
        .set({ data })
        .where(eq(blockMetadata.id, meta.id));
    }

    const sectionMeta = (metadata || []).find((block) => block.type === 'section');
    if (sectionMeta) {
      const sectionData = {
        ...(sectionMeta.data as object),
        duration: startTime,
      };

      await db
        .update(blockMetadata)
        .set({ data: sectionData })
        .where(eq(blockMetadata.id, sectionMeta.id));
    }
  };

  return NextResponse.json({ bookId });
}
