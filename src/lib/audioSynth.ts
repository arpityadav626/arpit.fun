/**
 * Ambient Audio & Feedback Synthesizer using Web Audio API.
 * Muted by default to respect user environments.
 * NO continuous background humming sound - only clean, subtle micro-clicks on interaction.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  public setEnabled(enable: boolean) {
    this.enabled = enable;
    if (enable) {
      this.initContext();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public playChime(freq = 440, type: OscillatorType = 'sine', duration = 0.15) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.3, this.ctx.currentTime + duration);

      // Very subtle, quiet volume (0.015 max gain) so it never disturbs the user
      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // AudioContext policy suppression fallback
    }
  }

  public playSearchPulse() {
    this.playChime(523.25, 'triangle', 0.12); // High C gentle blip
  }

  public playKeyClick() {
    this.playChime(784, 'sine', 0.05); // Super short, soft subtle tick
  }

  public playButtonTap() {
    this.playChime(620, 'sine', 0.06); // Soft pleasant click
  }

  public playAiAction() {
    this.playChime(659.25, 'sine', 0.18); // Soft E5
  }
}

export const soundEngine = new SoundEngine();
