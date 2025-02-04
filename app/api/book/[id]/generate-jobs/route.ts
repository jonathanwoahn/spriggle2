import Cashmere from "@/lib/cashmere";
import { BlockType, IBlockJob, IBlockMetadata, IResponse, JobStatus, JobType } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

const processBlock = (block: any, blocks: any[]) => {
  const { children, ...blockData } = block;
  blocks.push(blockData);

  if (children) {
    children.forEach((child: any) => processBlock(child, blocks));
  }

  return blocks;
}

const buildBookMetadata = (bookId: string): IBlockMetadata => {
  return {
    book_id: bookId,
    block_id: bookId,
    section_order: 0,
    block_index: 0,
    type: BlockType.BOOK,
    data: {
      ready: false,
    },
  };
}

const buildJob = ({bookId, blockId, jobType, blockIndex, order, dependencies = []}: {blockIndex?: number, bookId: string, blockId: string, jobType: JobType, dependencies?: string[], order?: number}): IBlockJob => {
  return {
    id: uuidv4(),
    status: dependencies.length > 0 ? JobStatus.WAITING : JobStatus.PENDING,
    job_type: jobType,
    data: {
      bookId,
      blockId,
      blockIndex,
      order,
    },
    log: [],
    dependencies,
  };
}

// creates all of the jobs required to convert a book into an audiobook
export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<IResponse>> => {
  try {

    const { id: bookId } = await params;
  
    const jobs: IBlockJob[] = [];
    const metadata: IBlockMetadata[] = [buildBookMetadata(bookId)];
  
    // generate summary and embedding jobs
    const summaryJob = buildJob({bookId, blockId: bookId, jobType: JobType.BOOK_SUMMARY});
    const embeddingJob = buildJob({bookId, blockId: bookId, jobType: JobType.SUMMARY_EMBEDDING, dependencies: [summaryJob.id]});
    
    jobs.push(summaryJob);
    jobs.push(embeddingJob);
  
    // get the omnibook data to build the jobs
    const baseUrl = request.nextUrl.origin;
    const response = await fetch(`${baseUrl}/api/settings/cashmereApiKey`);
    const { value } = await response.json();
  
    const cash = new Cashmere(value);
    const book = await cash.getBook(bookId);
  
    if (!book.data.nav) {
      throw new Error('Book has no navigation data');
    };
    
    // create jobs for each section and blocks in the section
    for(let i = 0; i< (book.data.nav || []).length; i++) {
      const order = book.data.nav[i].order;
      const blocks = await cash.getSectionBookBlocks(bookId, `${order}`);
      let count = 0;
  
      const sectionBlockJobs: IBlockJob[] = [];
  
      // build jobs for each of the blocks in the section
      blocks
        .filter((block: {type: string}) => block.type ==='text')
        .forEach((block: any, idx: number) => {
          const audioJob = buildJob({
            bookId,
            blockId: block.uuid,
            jobType: JobType.TEXT_TO_AUDIO_META,
            blockIndex: count++,
            order,
          });

          sectionBlockJobs.push(audioJob);
        });
  

      // generate the jobs for the section
      const sectionBlock = blocks.find((block: {type: string}) => block.type === BlockType.SECTION);
      const sectionConcatJob = buildJob({
        bookId,
        order,
        blockId: sectionBlock.uuid,
        jobType: JobType.SECTION_CONCAT_META,
        dependencies: sectionBlockJobs.map(job => job.id),
      });
  
      // add all the section jobs to the main jobs array
      jobs.push(...sectionBlockJobs, sectionConcatJob);
    };
  
    // build the metadata job for the book
    const bookDependencies = jobs.filter(job => job.job_type === JobType.SECTION_CONCAT_META).map(job => job.id);
    bookDependencies.push(embeddingJob.id);
    const bookMetaJob = buildJob({
      bookId,
      blockId: bookId,
      jobType: JobType.BOOK_META,
      dependencies: bookDependencies,
    });
    
    jobs.push(bookMetaJob);
  
    // store the jobs in supabase
    const jobResponse = await fetch(`${baseUrl}/api/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobs),
    });

    if(!jobResponse.ok) {
      const {message} = await jobResponse.json();
      throw new Error(message);
    }

    // store the metadata in supabase
    const metaResponse = await fetch(`${baseUrl}/api/metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if(!metaResponse.ok) {
      const {message} = await metaResponse.json();
      throw new Error(message);
    }
  
    return NextResponse.json({message: `${jobs.length} new jobs created`, data: {totalJobs: jobs.length}});
  } catch (e) {
    return NextResponse.json({message: (e as Error).message}, {status: 500});
  }
}