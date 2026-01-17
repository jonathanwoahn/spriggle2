import { IBlockMetadata, ILicenseReport, LicenseType } from "@/lib/types";
import { v4 as uuid } from 'uuid';

export class PlaybackReporter {
  private static instance: PlaybackReporter;
  private _db!: IDBDatabase;
  private _worker!: Worker;
  private readonly DB_NAME = 'PlaybackReportsDB';
  private readonly STORE_NAME = 'reports';


  constructor(private readonly _metadataBlocks: IBlockMetadata[] = []) {
    if(typeof window !== 'undefined') {
      // initialize the worker
      this._worker = new Worker('/playback-reporter.worker.js');
      this._worker.addEventListener('message', this._handleWorkerMessage.bind(this));
      this._worker.postMessage({ task: 'start' });
      
      // initialize the database
      this._initDb();
    }
    
  }

  public static getInstance(metadataBlocks: IBlockMetadata[] = []): PlaybackReporter {
    if(!PlaybackReporter.instance) {
      PlaybackReporter.instance = new PlaybackReporter(metadataBlocks);
    }

    return PlaybackReporter.instance;
  }

  private _handleWorkerMessage(event: MessageEvent) {
    if(event.data.status === 'error') {
      console.error('Error sending reports:', event.data);
    }
  }

  private async _initDb() {
    this._db = await this._openDatabase();
  }

  private _openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);

      request.onupgradeneeded = (event) => {
        const request = event.target as IDBOpenDBRequest;
        if (request) {
          const db = request.result;
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          store.createIndex('blockId', 'blockId', {unique: true});
        }
      };

      request.onsuccess = (event) => {
        const request = event.target as IDBOpenDBRequest;
        if (request) {
          resolve(request.result);
        }
      };

      request.onerror = (event) => {
        const request = event.target as IDBOpenDBRequest;
        if (request) {
          reject(request.error);
        }
      };
    });
  }

  private async _saveReport(report: ILicenseReport): Promise<void> {
    const transaction = this._db.transaction(this.STORE_NAME, 'readwrite');
    const store = transaction.objectStore(this.STORE_NAME);
    store.add(report);
  }

  private async _reportExists(blockId: string): Promise<boolean> {
    const transaction = this._db.transaction(this.STORE_NAME, 'readonly');
    const store = transaction.objectStore(this.STORE_NAME);
    return new Promise((resolve, reject) => {
      const index = store.index('blockId');
      const request = index.get(blockId);

      request.onsuccess = (event) => {
        const target = event.target as IDBRequest;
        if (target) {
          resolve(!!target.result);
        } else {
          reject(new Error('Target is null'));
        }
      };

      request.onerror = (event) => {
        const target = event.target as IDBRequest;
        if (target) {
          reject(target.error);
        } else {
          reject(new Error('Target is null'));
        }
      };
    });
  }

  async reportPlayback(position: number): Promise<void> {
    const findBlock = (position: number): IBlockMetadata | undefined => {
      return this._metadataBlocks.find((block) => {
        const data = block.data as Record<string, unknown>;
        const startTime = typeof data.start_time === 'number' ? data.start_time : undefined;
        const duration = typeof data.duration === 'number' ? data.duration : undefined;
        if (startTime === undefined || duration === undefined) return false;
        return (startTime / 1000) <= position && position < ((startTime + duration) / 1000);
      });
    }

    const block = findBlock(position);
    if(!block) {
      // Silently return for early positions (startup) or if metadata not loaded
      // Only log if position is significant and we expected to find a block
      if (position > 1 && this._metadataBlocks.length > 0) {
        console.warn('No block found for position', position);
      }
      return;
    }

    const report: ILicenseReport = {
      id: uuid(),
      blockId: block.blockId,
      licenseType: LicenseType.AUDIO_PLAYBACK,
      timestamp: Date.now(),
    };

    const exists = await this._reportExists(block.blockId);

    if(exists) {
      return;
    }

    await this._saveReport(report);
  }
}