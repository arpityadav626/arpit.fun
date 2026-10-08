/**
 * Studio-Grade Audio & Tactile Haptic Feedback Synthesizer using Web Audio API.
 * Built for zero-glitch, smooth, pop-free acoustic micro-feedback across Desktop & Mobile.
 *
 * Core Features:
 * - Anti-pop 3ms attack & smooth exponential decay envelopes (zero DC offset step noise)
 * - Master DynamicsCompressor limiter to completely prevent clipping & distortion
 * - Smart rate-limiting / throttle (drops rapid-fire buffer overruns during fast scrolling)
 * - Hardware unlocker with silent warm-up buffer for iOS Safari & Android WebKit
 * - Tab visibility auto-suspend / resume
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private enabled: boolean = true;
  private lastClickTime: number = 0;
  private isUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.ensureContext();
        if (this.ctx) {
          if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
          }
          // Warm up hardware audio buffer with silent 1-sample burst to prevent first-sound latency & popping
          if (!this.isUnlocked) {
            try {
              const buffer = this.ctx.createBuffer(1, 1, 22050);
              const source = this.ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(this.ctx.destination);
              source.start(0);
              this.isUnlocked = true;
            } catch {
              // Ignore
            }
          }
        }
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('click', unlockAudio);
      };

      window.addEventListener('pointerdown', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
      window.addEventListener('click', unlockAudio, { passive: true });

      // Handle background tab visibility
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.ctx && this.ctx.state === 'running') {
          this.ctx.suspend().catch(() => {});
        } else if (!document.hidden && this.ctx && this.ctx.state === 'suspended' && this.enabled) {
          this.ctx.resume().catch(() => {});
        }
      });
    }
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;

      try {
        this.ctx = new AudioCtx({ latencyHint: 'interactive' });
      } catch {
        this.ctx = new AudioCtx();
      }

      // Master bus with brickwall limiter to eliminate any digital clipping
      try {
        this.limiter = this.ctx.createDynamicsCompressor();
        this.limiter.threshold.setValueAtTime(-3, this.ctx.currentTime);
        this.limiter.knee.setValueAtTime(6, this.ctx.currentTime);
        this.limiter.ratio.setValueAtTime(20, this.ctx.currentTime);
        this.limiter.attack.setValueAtTime(0.002, this.ctx.currentTime);
        this.limiter.release.setValueAtTime(0.05, this.ctx.currentTime);

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

        this.masterGain.connect(this.limiter);
        this.limiter.connect(this.ctx.destination);
      } catch {
        // Fallback: direct connection if compressor creation fails
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public setEnabled(enable: boolean) {
    this.enabled = enable;
    if (enable) {
      this.ensureContext();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Safe, pop-free pure tone synthesizer with smooth linear attack and exponential decay.
   * Completely eliminates the instant DC offset jump that causes pops & crackles.
   */
  public playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.02) {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      // Smooth envelope: 3ms attack from ZERO -> target volume -> exponential decay
      const attackTime = 0.003;
      gain.gain.setValueAtTime(0.00001, now);
      gain.gain.linearRampToValueAtTime(volume, now + attackTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + duration);

      osc.connect(gain);

      if (this.masterGain) {
        gain.connect(this.masterGain);
      } else {
        gain.connect(ctx.destination);
      }

      osc.start(now);
      osc.stop(now + duration + 0.01);

      // Clean up Web Audio graph after note completes
      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {
          // Ignore
        }
      };
    } catch {
      // AudioContext policy suppression fallback
    }
  }

  /**
   * Subtle, velvety mechanical micro-tick (tactile haptic feedback).
   * Throttled to min 50ms interval to eliminate stutter & buffer flooding during fast scrolling/swiping.
   */
  public playKeyClick() {
    if (!this.enabled) return;
    const nowMs = performance.now();
    if (nowMs - this.lastClickTime < 50) return; // Rate-limit throttle
    this.lastClickTime = nowMs;

    // 820Hz pure tone with 28ms fast dampening - sounds like a clean iPhone mechanical tick
    this.playTone(820, 'sine', 0.028, 0.018);
  }

  /**
   * Soft, warm button click (e.g., toolbar actions, pills, toggles)
   */
  public playButtonTap() {
    if (!this.enabled) return;
    const nowMs = performance.now();
    if (nowMs - this.lastClickTime < 50) return;
    this.lastClickTime = nowMs;

    this.playTone(580, 'sine', 0.04, 0.022);
  }

  /**
   * Smooth, crystalline double-harmonic chime on card selection / search
   */
  public playSearchPulse() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;

    try {
      // Tone 1: C5 (523.25 Hz)
      this.playTone(523.25, 'triangle', 0.12, 0.022);
      // Tone 2: G5 (783.99 Hz) subtle harmonic shimmer after 18ms
      setTimeout(() => {
        this.playTone(783.99, 'sine', 0.10, 0.014);
      }, 18);
    } catch {
      // Fallback
    }
  }

  /**
   * Melodic ascending chime for AI completion & generation
   */
  public playAiAction() {
    if (!this.enabled) return;
    this.playTone(659.25, 'sine', 0.14, 0.025); // E5
    setTimeout(() => {
      this.playTone(880.0, 'sine', 0.16, 0.020); // A5
    }, 45);
  }

  /**
   * Backward-compatible chime helper (used by settings toggle)
   */
  public playChime(freq = 440, type: OscillatorType = 'sine', duration = 0.15) {
    this.playTone(freq, type, duration, 0.025);
  }
}

export const soundEngine = new SoundEngine();
