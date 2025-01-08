export class AudioChapterManager {
  private audioContext: AudioContext;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private blockQueue: {blockId: string, index: number, url: string}[] = [];
  private bookId: string = '';
  private currentSource?: AudioBufferSourceNode;
  private startTime: number = 0;
  private pauseTime: number = 0;
  private isPlaying: boolean = false;
  private duration: number = 0;
  private metadataLoaded: boolean = false;

  constructor() {
    this.audioContext = new AudioContext();
  }

  async prepareChapter(blockIds: {blockId: string, index: number, url: string}[], bookId: string) {
    this.blockQueue = blockIds;
    this.bookId = bookId;

    // First pass: Just fetch metadata for all blocks
    await this.loadMetadata();

    // Start preloading blocks in background
    this.startPreloading();
  }

  private async loadMetadata() {
    // Fetch just headers to get content-length and duration info
    for (const block of this.blockQueue) {
      const response = await fetch(`/api/audio/${this.bookId}/${block.blockId}`, {
        method: 'HEAD'
      });
      // Parse duration from header or calculate from content-length
      const blockDuration = parseFloat(response.headers.get('X-Audio-Duration') || '0');
      this.duration += blockDuration;
    }
    this.metadataLoaded = true;
  }

  private async startPreloading() {
    // Start loading blocks in background
    for (const blockId of this.blockQueue) {
      if (!this.audioBuffers.has(blockId)) {
        try {
          const buffer = await this.loadBlock(blockId);
          this.audioBuffers.set(blockId, buffer);
        } catch (error) {
          console.error(`Failed to preload block ${blockId}:`, error);
        }
      }
    }
  }

  private async loadBlock(blockId: string): Promise<AudioBuffer> {
    const response = await fetch(`/api/audio/${this.bookId}/${blockId}`);
    const arrayBuffer = await response.arrayBuffer();
    return await this.audioContext.decodeAudioData(arrayBuffer);
  }

  async play(startPosition: number = 0) {
    if (this.isPlaying) return;

    // Find which block contains our target position
    let accumulatedTime = 0;
    let targetBlockId: string | null = null;
    let targetTime = 0;

    for (const blockId of this.blockQueue) {
      const blockDuration = await this.getBlockDuration(blockId);
      if (startPosition >= accumulatedTime &&
        startPosition < accumulatedTime + blockDuration) {
        targetBlockId = blockId;
        targetTime = startPosition - accumulatedTime;
        break;
      }
      accumulatedTime += blockDuration;
    }

    if (targetBlockId) {
      // Load block if not cached
      if (!this.audioBuffers.has(targetBlockId)) {
        const buffer = await this.loadBlock(targetBlockId);
        this.audioBuffers.set(targetBlockId, buffer);
      }

      const buffer = this.audioBuffers.get(targetBlockId)!;
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);

      this.currentSource = source;
      this.startTime = this.audioContext.currentTime - targetTime;
      source.start(0, targetTime);
      this.isPlaying = true;

      // Set up next block
      source.onended = () => this.playNextBlock(targetBlockId!);
    }
  }

  private async playNextBlock(currentBlockId: string) {
    const currentIndex = this.blockQueue.indexOf(currentBlockId);
    if (currentIndex < this.blockQueue.length - 1) {
      const nextBlockId = this.blockQueue[currentIndex + 1];
      await this.play(this.getBlockStartTime(nextBlockId));
    }
  }

  private getBlockStartTime(blockId: string): number {
    let startTime = 0;
    for (const id of this.blockQueue) {
      if (id === blockId) break;
      startTime += this.getBlockDuration(id);
    }
    return startTime;
  }

  private async getBlockDuration(blockId: string): Promise<number> {
    if (this.audioBuffers.has(blockId)) {
      return this.audioBuffers.get(blockId)!.duration;
    }
    // Return metadata duration if available
    // Could store this in a separate map when loading metadata
    return 0; // Implement metadata lookup
  }

  getDuration(): number {
    return this.duration;
  }


  // ... rest of controls (pause, seek, etc.)
}