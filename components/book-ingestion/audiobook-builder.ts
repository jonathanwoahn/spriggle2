/**
 * information we need to get (by book id):
 * 1. total # of jobs (sb)
 * 2. total # of completed jobs (sb)
 * 3. total # of metadata blocks (sb)
 * 5. total duration of the book (sb)
 * 6. total # of audio files (sb storage)
 * 8. has summary (sb)
 * 9. has embedding (sb)
 * 4. total number of blocks (text, section, book) in the book (cash)
 * 7. total # of section blocks (cash)
 */

import EventEmitter from "events";

/**
 * Books ready for production meet the following requirements:
 * 1. All jobs have been generated, and are completed
 * 2. Every block has metadata
 * 3. metadata includes duration for all blocks
 * 4. all text blocks have audio files generated
 * 5. all sections have an audio file associated with it
 * 6. There is a summary of the book, stored on the book block metadata
 * 7. There is an embedding of the book, stored on the book block metadata
 */

// interface IStep {
//   index: number;
//   label: string;
//   key: string;
//   action: () => any,
// }

// enum EVENTS {
//   startJob = 'start-job',
//   endJob = 'end-job',
// }

// export interface IIngestionMetrics {
//   totalJobs: number;
//   completedJobs: number;
//   totalMetadataBlocks: number;
//   totalDuration: number;
//   totalAudioFiles: number;
//   hasSummary: boolean;
//   hasEmbedding: boolean;
//   totalBlocks: number;
//   totalSectionBlocks: number;
// }

// export const DEFAULT_METRICS: IIngestionMetrics = {
//   totalJobs: 0,
//   completedJobs: 0,
//   totalMetadataBlocks: 0,
//   totalDuration: 0,
//   totalAudioFiles: 0,
//   hasSummary: false,
//   hasEmbedding: false,
//   totalBlocks: 0,
//   totalSectionBlocks: 0,
// };

// export class AudiobookBuilder extends EventEmitter {

//   private readonly _bookId: string;
//   private readonly _steps : IStep[] = [
//     {
//       index: 0,
//       label: 'Jobs',
//       key: 'jobs',
//       action: this.generateJobs,
//     },
//     // {
//     //   index: 1,
//     //   label: 'Metadata',
//     //   key: 'metadata',
//     // },
//     // {
//     //   index: 2,
//     //   label: 'Audio',
//     //   key: 'audio',
//     // },
//     // {
//     //   index: 3,
//     //   label: 'Summary',
//     //   key: 'summary',
//     // },
//   ];
//   private _isThinking: boolean = false;

//   private _metrics: IIngestionMetrics = DEFAULT_METRICS;

//   constructor({bookId}: {bookId: string}) {
//     super();
//     this._bookId = bookId;
//   }
  
//   async generateJobs(): Promise<any> {
//     this.emit(EVENTS.startJob);

//     try {
//       const url = `/api/book/${this._bookId}/control/generate-jobs`;
//       const response = await fetch(url ,{ method: 'POST', });
//       const {data, error, message} = await response.json();

//       if(error) {
//         throw new Error(error);
//       }

//       this._metrics = {
//         ...this._metrics,
//         totalJobs: data.totalJobs
//       };
//     } catch (error) {
//       console.error(error);
//     } finally {
//       this.emit(EVENTS.endJob, this._metrics);
//     }
//   }
  
//   get steps(): IStep[] {
//     return this.steps;
//   }

//   get isThinking(): boolean {
//     return this._isThinking;
//   }
  
  
  

// }