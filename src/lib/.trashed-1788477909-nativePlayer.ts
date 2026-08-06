const SILENT_WAV =
  "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIAAAAA";

export class NativePlayer {
  audio: HTMLAudioElement;
  primed = false;
  hasTrack = false;
  onProgress?: (position: number, duration: number) => void;
  onEnded?: () => void;
  onError?: () => void;
  onState?: (playing: boolean) => void;

  constructor() {
    this.audio = new Audio();
    this.audio.preload = "auto";
    this.audio.addEventListener("timeupdate", () => {
      const pos = this.audio.currentTime;
      const dur = this.audio.duration;
      if (Number.isFinite(pos) && Number.isFinite(dur)) this.onProgress?.(pos, dur);
    });
    this.audio.addEventListener("durationchange", () => {
      if (Number.isFinite(this.audio.duration)) this.onProgress?.(this.audio.currentTime, this.audio.duration);
    });
    this.audio.addEventListener("play", () => {
      if (this.hasTrack) this.onState?.(true);
    });
    this.audio.addEventListener("pause", () => {
      if (this.hasTrack) this.onState?.(false);
    });
    this.audio.addEventListener("ended", () => this.onEnded?.());
    this.audio.addEventListener("error", () => {
      if (this.audio.src) this.onError?.();
    });
  }

  prime() {
    if (this.primed) return;
    this.primed = true;
    if (!this.audio.src) this.audio.src = SILENT_WAV;
    this.audio.volume = 1;
    void this.audio.play().catch(() => {
      /* gestur belum valid, akan dicoba lagi saat play lagu */
    });
  }

  async load(videoId: string, autoplay: boolean) {
    const response = await fetch(`/api/stream?id=${encodeURIComponent(videoId)}`);
    if (!response.ok) throw new Error("stream tidak tersedia");
    const payload = (await response.json()) as { url?: string | null };
    if (!payload.url) throw new Error("stream kosong");
    this.hasTrack = true;
    this.audio.src = payload.url;
    if (autoplay) await this.audio.play();
  }

  play() {
    if (this.audio.src) void this.audio.play().catch(() => this.onError?.());
  }

  pause() {
    this.audio.pause();
  }

  seek(seconds: number) {
    if (this.audio.src && Number.isFinite(this.audio.duration)) {
      this.audio.currentTime = Math.max(0, Math.min(seconds, this.audio.duration || seconds));
    }
  }

  setVolume(percent: number) {
    this.audio.volume = Math.max(0, Math.min(1, percent / 100));
  }

  destroy() {
    this.audio.pause();
    this.audio.src = "";
  }
}
