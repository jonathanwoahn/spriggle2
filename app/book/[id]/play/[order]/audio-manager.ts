export class AudioChapterManager {
  private audioElement: HTMLAudioElement;

  constructor(audioElement: HTMLAudioElement) {
    this.audioElement = audioElement;
  }

  async prepareChapter(bookId: string, order: number) {
    this.audioElement.src = `/api/audio/${bookId}/${order}`;
    this.audioElement.load();
    this.audioElement.preload = 'auto';
  }

  play(): Promise<void> {
    return this.audioElement.play();
  }

  pause(): void {
    return this.audioElement.pause();
  }

  seek(position: number) {
    this.audioElement.currentTime = position;
  }

  playbackRate(speed: number) {
    this.audioElement.playbackRate = speed;
  }

  addEventListener(event: string, handler: EventListener) {
    this.audioElement.addEventListener(event, handler);
  }

  removeEventListener(event: string, handler: EventListener) {
    this.audioElement.removeEventListener(event, handler);
  }

  get duration() {
    return this.audioElement.duration;
  }

  get currentTime() {
    return this.audioElement.currentTime;
  }
}
