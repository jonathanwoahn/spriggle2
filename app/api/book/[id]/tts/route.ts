import Cashmere from "@/lib/cashmere";
import { NextRequest, NextResponse } from "next/server";


interface IJobLog { }

export interface IBlockJobs {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  type: 'text' | 'section';
  data: {
    bookBlockId: string;
    omnibookId: string;
    text: string;
    index: number;
    section_order: number;
  };
  log: IJobLog[];
  id?: number;
}

const processBlock = (block: any, blocks: any[]) => {
  const { children, ...blockData } = block;
  blocks.push(blockData);

  if (children) {
    children.forEach((child: any) => processBlock(child, blocks));
  }

  return blocks;
}


export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;

  const baseUrl = request.nextUrl.origin;
  const response = await fetch(`${baseUrl}/api/settings/cashmereApiKey`);
  const { value } = await response.json();

  const cash = new Cashmere(value);
  const book = await cash.getBook(id);
  

  const blockJobs: IBlockJobs[] = [];

  for(let i = 0; i< (book.data.nav || []).length; i++) {
    const blocks = await cash.getSectionBookBlocks(id, `${i}`);
    let count = 0;

    blocks
      .filter((block: {type: string}) => block.type === 'text' || block.type === 'section')
      .forEach((block: {uuid: string, type: 'text' | 'section', properties: {text: string}}, idx: number) => {
        
        if(!book.data.nav || !book.data.nav[i]) {
          throw new Error(`Section order "${i}" not found or doesn't exist`)
        }

        blockJobs.push({
          status: 'pending',
          type: block.type,
          data: {
            bookBlockId: block.uuid,
            omnibookId: id,
            text: Array.isArray(block.properties.text) ? block.properties.text.join(' ') : block.properties.text,
            index: count++,
            section_order: book.data.nav[i].order,
          },
          log: [],
        });
      });
  };

  await fetch(`${baseUrl}/api/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(blockJobs),
  });

  return NextResponse.json({message: 'success'});

}