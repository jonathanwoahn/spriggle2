interface IJobLog {
  timestamp: string;
  message: string;
  data?: any;
}

export enum BlockType {
  TEXT = 'text',
  SECTION = 'section',
  BOOK = 'book',
}
// export type IJobStatus = 'pending' | 'processing' | 'completed' | 'failed';
export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  WAITING = 'waiting',
}

export enum JobType {
  // BUILD_AUDIOBOOK = 'build-audiobook',
  // First job, which creates all of the jobs needed to create an audio book
  CREATE_JOBS = 'create-jobs',

  // job for each of the text blocks. Generates the audio file, and then creates the text block metadata
  TEXT_TO_AUDIO_META = 'convert-to-audio',

  // job for each of the section blocks. concatenates all of the audio files, and then creates the section block metadata. Also calculates the start time for each text block
  SECTION_CONCAT_META = 'section-concat-meta',

  // Generates a brief summary of the entire book for display to the customer
  BOOK_SUMMARY = 'book-summary',

  // Generates an embedding of the book summary that we can use in the recommendation engine
  SUMMARY_EMBEDDING = 'summary-embedding',

  // job for the book block. calculates the length of the audio book, checks to make sure all of the other jobs are completed, and marks the book as ready or not
  BOOK_META = 'book-meta',
}

export interface IBlockJob {
  status: JobStatus;
  job_type: JobType;
  data: {
    blockId: string;
    bookId: string;
    blockIndex?: number;
    order?: number;
  };
  log: IJobLog[];
  id: string;
  dependencies?: string[];
}

export interface IBlockMetadata {
  id?: number;
  book_id: string;
  block_id: string;
  section_order: number;
  block_index: number;
  type: BlockType;
  data: {
    duration?: number;
    start_time?: number;
    summary?: string;
    ready?: boolean;
  };
  embedding?: number[];
  created_at?: string;
  updated_at?: string;
}

export interface IResponse {
  message?: string;
  data?: any;
  // error?: string;
}
