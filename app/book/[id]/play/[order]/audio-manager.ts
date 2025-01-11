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

  play() {
    this.audioElement.play();
  }

  pause() {
    this.audioElement.pause();
  }

  seek(position: number) {
    // let totalBuffered = 0;
    // for (let i = 0; i < this.audioElement.buffered.length; i++) {
    //   totalBuffered += this.audioElement.buffered.end(i) - this.audioElement.buffered.start(i);
    // }

    this.audioElement.currentTime = position;
    
    // if (this.audioElement.readyState >= 1) { // HAVE_METADATA or higher
    //   console.log('audioElement.currentTime after seek: ', this.audioElement.currentTime);
    // } else {
    //   console.warn('Audio element is not ready to seek');
    //   this.audioElement.addEventListener('canplay', () => {
    //     this.audioElement.currentTime = position;
    //     console.log('audioElement.currentTime after seek (canplay): ', this.audioElement.currentTime);
    //   }, { once: true });

    //   this.audioElement.addEventListener('canplaythrough', () => {
    //     console.log('Audio element can play through');
    //   }, { once: true });
    // }
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
