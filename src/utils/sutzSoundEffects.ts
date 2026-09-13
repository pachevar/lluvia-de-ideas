// Efectos de sonido y música ambiental procedural para Sutz Mundo Virtual usando Web Audio API
// No requiere descargar archivos pesados, funciona offline y reacciona de forma instantánea.

class SutzAudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicEnabled: boolean = false;
  private hapticEnabled: boolean = true;

  // Manejo de música procedural
  private musicGain: GainNode | null = null;
  private musicInterval: number | null = null;
  private activeMusicNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
  private currentChordIndex: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      const storedMute = localStorage.getItem('sutz_audio_muted');
      this.isMuted = storedMute === 'true';

      const storedMusic = localStorage.getItem('sutz_music_enabled');
      this.musicEnabled = storedMusic === 'true';

      const storedHaptic = localStorage.getItem('sutz_haptic_enabled');
      this.hapticEnabled = storedHaptic !== 'false';
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- CONTROL DE EFECTOS DE SONIDO (SFX) ---
  public toggleMute(): boolean {
    return this.setSoundEnabled(this.isMuted);
  }

  public setSoundEnabled(enabled: boolean): boolean {
    this.isMuted = !enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('sutz_audio_muted', String(this.isMuted));
    }
    if (!this.isMuted) {
      this.playClick();
    }
    return !this.isMuted;
  }

  public isSoundEnabled(): boolean {
    return !this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // --- CONTROL DE VIBRACIÓN HÁPTICA ---
  public isHapticsSupported(): boolean {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  public isHapticEnabled(): boolean {
    return this.hapticEnabled;
  }

  public setHapticEnabled(enabled: boolean): boolean {
    this.hapticEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('sutz_haptic_enabled', String(enabled));
    }
    if (enabled) {
      this.triggerHaptic([30]);
    }
    return this.hapticEnabled;
  }

  public toggleHaptic(): boolean {
    return this.setHapticEnabled(!this.hapticEnabled);
  }

  public triggerHaptic(pattern: number | number[] = [25]) {
    if (!this.hapticEnabled) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignorar si el navegador bloquea vibración sin gesto
      }
    }
  }

  // --- CONTROL DE MÚSICA AMBIENTAL PROCEDURAL (BGM) ---
  public isMusicPlaying(): boolean {
    return this.musicEnabled;
  }

  public toggleMusic(): boolean {
    return this.setMusicEnabled(!this.musicEnabled);
  }

  public setMusicEnabled(enabled: boolean): boolean {
    this.musicEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('sutz_music_enabled', String(enabled));
    }

    if (enabled) {
      this.startAmbientMusic();
    } else {
      this.stopAmbientMusic();
    }

    return this.musicEnabled;
  }

  public startAmbientMusic() {
    if (!this.musicEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      if (!this.musicGain) {
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(0.045, this.ctx.currentTime);
        this.musicGain.connect(this.ctx.destination);
      }

      if (this.musicInterval !== null) {
        window.clearInterval(this.musicInterval);
      }

      // Progresión de acordes cósmico-mayas (pentatónica mística)
      const chords = [
        [146.83, 220.00, 293.66, 349.23], // D3, A3, D4, F4 (D menor místico)
        [130.81, 196.00, 261.63, 329.63], // C3, G3, C4, E4 (C mayor astral)
        [116.54, 174.61, 233.08, 293.66], // Bb2, F3, Bb3, D4 (Bb lírico)
        [110.00, 164.81, 220.00, 261.63]  // A2, E3, A3, C4 (A suspendido)
      ];

      const playNextPadChord = () => {
        if (!this.ctx || !this.musicEnabled || !this.musicGain) return;

        const now = this.ctx.currentTime;
        const currentChord = chords[this.currentChordIndex % chords.length];
        this.currentChordIndex++;

        // Limpiar nodos antiguos
        this.activeMusicNodes = [];

        // Filtro paso bajo suave para sensación de nebulosa espacial
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(550, now);
        filter.connect(this.musicGain);

        currentChord.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          // Pequeño desafinado sutil para riqueza acústica espacial
          osc.frequency.setValueAtTime(freq + (idx * 0.4 - 0.6), now);

          // Ataque suave, sostenido y desvanecimiento
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.exponentialRampToValueAtTime(0.02, now + 1.8);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.6);

          osc.connect(gain);
          gain.connect(filter);

          osc.start(now);
          osc.stop(now + 5.7);

          this.activeMusicNodes.push({ osc, gain });
        });
      };

      // Disparar inmediatamente y programar repetición cíclica
      playNextPadChord();
      this.musicInterval = window.setInterval(playNextPadChord, 5200);
    } catch {
      // Audio fallback si el navegador restringe audio
    }
  }

  public stopAmbientMusic() {
    if (this.musicInterval !== null) {
      window.clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (this.ctx && this.musicGain) {
      try {
        this.musicGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.4);
      } catch {
        // Fallback
      }
    }
    this.activeMusicNodes.forEach(({ osc }) => {
      try {
        osc.stop();
      } catch {
        // Ignorar
      }
    });
    this.activeMusicNodes = [];
  }

  // --- EFECTOS DE SONIDO PROCEDURALES (SFX) ---

  // Sonido de clic táctil suave de botón
  public playClick() {
    this.triggerHaptic([20]);
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {
      // Ignorar si el navegador bloquea audio sin interacción
    }
  }

  // Sonido al abrir un panel / modal estilo menú RPG
  public playOpenModal() {
    this.triggerHaptic([30]);
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Audio fallback
    }
  }

  // Sonido al cerrar panel
  public playCloseModal() {
    this.triggerHaptic([20]);
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Audio fallback
    }
  }

  // Fanfarria de recompensa o misión completada
  public playReward() {
    this.triggerHaptic([40, 60, 40, 80]);
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime + index * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.22);
      });
    } catch {
      // Audio fallback
    }
  }

  // Efecto de recolección de monedas / gemas
  public playCoin() {
    this.triggerHaptic([25, 50, 30]);
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.06); // E6

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // Audio fallback
    }
  }
}

export const sutzAudio = new SutzAudioManager();
