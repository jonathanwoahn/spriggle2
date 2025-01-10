export class AudioChapterManager {
  // private audioContext: AudioContext;
  private audioElement: HTMLAudioElement;

  constructor(audioElement: HTMLAudioElement) {
    // this.audioContext = new AudioContext();
    this.audioElement = audioElement;
  }

  async prepareChapter(bookId: string, order: number) {
    this.audioElement.src = `/api/audio/${bookId}/${order}`;
    this.audioElement.load();
  }

  play() {
    this.audioElement.play();
  }

  pause() {
    this.audioElement.pause();
  }

  seek(position: number) {
    this.audioElement.currentTime = position;
  }

  getDuration() {
    return this.audioElement.duration;
  }

  getCurrentTime() {
    return this.audioElement.currentTime;
  }
}
