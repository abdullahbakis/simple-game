let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let musicOscillators: OscillatorNode[] = [];
let musicPlaying = false;
let arpeggioTimeout: ReturnType<typeof setTimeout> | null = null;

const NOTES = {
  C3: 130.81, G3: 196.00,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50,
};

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.55;
    masterGain.connect(audioCtx.destination);

    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0.45;
    musicGain.connect(masterGain);

    sfxGain = audioCtx.createGain();
    sfxGain.gain.value = 0.7;
    sfxGain.connect(masterGain);
  }
  return audioCtx;
}

export function resumeAudio() {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
}

export function setMasterVolume(vol: number) {
  getAudioContext();
  if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, vol));
}

export function setMusicVolume(vol: number) {
  getAudioContext();
  if (musicGain) musicGain.gain.value = Math.max(0, Math.min(1, vol));
}

export function setSfxVolume(vol: number) {
  getAudioContext();
  if (sfxGain) sfxGain.gain.value = Math.max(0, Math.min(1, vol));
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 1, delay = 0) {
  const ctx = getAudioContext();
  if (!sfxGain) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = freq;

  gain.gain.value = 0;
  gain.gain.setValueAtTime(0, ctx.currentTime + delay);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
  gain.gain.linearRampToValueAtTime(volume * 0.7, ctx.currentTime + delay + duration * 0.3);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + duration);

  osc.connect(gain);
  gain.connect(sfxGain);

  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration + 0.05);
}

export function playCollect() {
  const baseFreq = 600 + Math.random() * 200;
  playTone(baseFreq, 0.08, 'sine', 0.35);
  playTone(baseFreq * 1.5, 0.1, 'sine', 0.2, 0.03);
}

export function playMiss() {
  playTone(180, 0.15, 'sawtooth', 0.18);
  playTone(140, 0.12, 'sawtooth', 0.12, 0.05);
}

export function playHazardKill() {
  playTone(250, 0.08, 'square', 0.15);
  playTone(150, 0.15, 'sawtooth', 0.12, 0.02);
}

export function playLevelComplete() {
  const melody = [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6];
  melody.forEach((freq, i) => {
    playTone(freq, 0.22, 'sine', 0.3, i * 0.1);
    playTone(freq * 0.5, 0.28, 'triangle', 0.12, i * 0.1);
  });
}

export function playVictory() {
  const melody = [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6, NOTES.G5, NOTES.C6];
  melody.forEach((freq, i) => {
    playTone(freq, 0.28, 'sine', 0.35, i * 0.12);
    playTone(freq * 0.5, 0.32, 'triangle', 0.15, i * 0.12);
  });
}

export function playGameOver() {
  const melody = [NOTES.E4, NOTES.D4, NOTES.C4, NOTES.C4 * 0.5];
  melody.forEach((freq, i) => {
    playTone(freq, 0.3, 'triangle', 0.25, i * 0.15);
  });
}

export function playCountdownTick() {
  playTone(NOTES.G4, 0.09, 'sine', 0.2);
}

export function playCountdownGo() {
  playTone(NOTES.C5, 0.18, 'sine', 0.3);
  playTone(NOTES.E5, 0.18, 'sine', 0.22, 0.05);
  playTone(NOTES.G5, 0.22, 'sine', 0.18, 0.1);
}

export function playDraw() {
  const freq = 400 + Math.random() * 300;
  playTone(freq, 0.04, 'sine', 0.09);
}

const CHORDS: number[][] = [
  [NOTES.C3, NOTES.G3, NOTES.C4, NOTES.E4, NOTES.G4],
  [NOTES.A4 * 0.5 * 0.9, NOTES.C4 * 0.9, NOTES.E4 * 0.9, NOTES.A4 * 0.9],
  [NOTES.F4 * 0.5 * 0.9, NOTES.C4 * 0.9, NOTES.F4 * 0.9, NOTES.A4 * 0.9],
  [NOTES.G3, NOTES.D4 * 0.9, NOTES.G4 * 0.9, NOTES.B4 * 0.9],
];

export function startMusic() {
  if (musicPlaying) return;

  const ctx = getAudioContext();
  if (!musicGain) return;

  musicPlaying = true;

  let chordIndex = 0;
  let lastChordTime = ctx.currentTime;

  function createDrone(freq: number, gainVal = 0.07): OscillatorNode {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const reverb = ctx.createConvolver();

    osc.type = 'sine';
    osc.frequency.value = freq;

    filter.type = 'lowpass';
    filter.frequency.value = 800;
    filter.Q.value = 0.8;

    gain.gain.value = gainVal;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(musicGain!);

    osc.start();
    musicOscillators.push(osc);

    void reverb;
    return osc;
  }

  function createPadLayer(freq: number): OscillatorNode {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.value = freq;

    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    filter.Q.value = 0.5;

    gain.gain.value = 0.035;

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.3;
    lfoGain.gain.value = 4;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();
    musicOscillators.push(lfo);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(musicGain!);

    osc.start();
    musicOscillators.push(osc);

    return osc;
  }

  const chord = CHORDS[0];
  const drones = chord.map((freq, i) => createDrone(freq, i === 0 ? 0.1 : 0.06));
  chord.forEach(freq => createPadLayer(freq * 2));

  function updateChord() {
    if (!musicPlaying) return;

    const now = ctx.currentTime;
    if (now - lastChordTime > 4.5) {
      lastChordTime = now;
      chordIndex = (chordIndex + 1) % CHORDS.length;

      drones.forEach((osc, i) => {
        const newChord = CHORDS[chordIndex];
        const targetFreq = newChord[Math.min(i, newChord.length - 1)];
        osc.frequency.linearRampToValueAtTime(targetFreq, now + 2.5);
      });
    }

    if (musicPlaying) requestAnimationFrame(updateChord);
  }

  updateChord();

  const ARPEGGIO_PATTERNS = [
    [0, 2, 1, 3, 0, 2],
    [0, 1, 2, 1, 0, 3],
    [2, 0, 3, 1, 2, 0],
  ];
  let arpPatternIndex = 0;
  let arpStepIndex = 0;

  function playArpNote() {
    if (!musicPlaying) return;

    const chord = CHORDS[chordIndex];
    const pattern = ARPEGGIO_PATTERNS[arpPatternIndex];
    const noteIndex = pattern[arpStepIndex] % chord.length;
    const octaveBoost = arpStepIndex >= 3 ? 2 : 1;
    const freq = chord[noteIndex] * octaveBoost;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.value = freq;

    filter.type = 'bandpass';
    filter.frequency.value = freq * 1.5;
    filter.Q.value = 2;

    gain.gain.value = 0;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(musicGain!);

    osc.start();
    osc.stop(ctx.currentTime + 0.7);

    arpStepIndex = (arpStepIndex + 1) % pattern.length;
    if (arpStepIndex === 0) {
      arpPatternIndex = (arpPatternIndex + 1) % ARPEGGIO_PATTERNS.length;
    }

    const nextDelay = 200 + Math.random() * 300;
    if (musicPlaying) {
      arpeggioTimeout = setTimeout(playArpNote, nextDelay);
    }
  }

  arpeggioTimeout = setTimeout(playArpNote, 800);

  function playMelodyPhrase() {
    if (!musicPlaying) return;

    const chord = CHORDS[chordIndex];
    const melodyFreqs = [
      chord[2] * 2,
      chord[3 % chord.length] * 2,
      chord[1] * 2,
      chord[2] * 2,
      chord[0] * 4,
    ];

    melodyFreqs.forEach((freq, i) => {
      if (!musicPlaying) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.value = 0;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.28);
      gain.gain.linearRampToValueAtTime(0.055, ctx.currentTime + i * 0.28 + 0.06);
      gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + i * 0.28 + 0.15);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.28 + 0.26);

      osc.connect(gain);
      gain.connect(musicGain!);
      osc.start(ctx.currentTime + i * 0.28);
      osc.stop(ctx.currentTime + i * 0.28 + 0.3);
    });

    if (musicPlaying) {
      setTimeout(playMelodyPhrase, 8000 + Math.random() * 4000);
    }
  }

  setTimeout(playMelodyPhrase, 3000);
}

export function stopMusic() {
  musicPlaying = false;
  if (arpeggioTimeout) {
    clearTimeout(arpeggioTimeout);
    arpeggioTimeout = null;
  }
  musicOscillators.forEach(osc => {
    try { osc.stop(); } catch { }
  });
  musicOscillators = [];
}

export function toggleMusic(): boolean {
  if (musicPlaying) {
    stopMusic();
    return false;
  } else {
    startMusic();
    return true;
  }
}
