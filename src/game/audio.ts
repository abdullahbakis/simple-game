let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let musicPlaying = false;
let musicStopHandle: (() => void) | null = null;

const NOTE = {
  C3: 130.81, G3: 196.00,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51, G6: 1567.98, A6: 1760.00,
};

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.6;
    masterGain.connect(audioCtx.destination);

    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0.48;
    musicGain.connect(masterGain);

    sfxGain = audioCtx.createGain();
    sfxGain.gain.value = 0.65;
    sfxGain.connect(masterGain);
  }
  return audioCtx;
}

export function resumeAudio() {
  const ctx = getCtx();
  if (ctx.state === 'suspended') ctx.resume();
}

export function setMasterVolume(v: number) {
  getCtx();
  if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, v));
}
export function setMusicVolume(v: number) {
  getCtx();
  if (musicGain) musicGain.gain.value = Math.max(0, Math.min(1, v));
}
export function setSfxVolume(v: number) {
  getCtx();
  if (sfxGain) sfxGain.gain.value = Math.max(0, Math.min(1, v));
}

function playNote(
  freq: number,
  startTime: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine',
  destination?: AudioNode
) {
  const ctx = getCtx();
  const dest = destination ?? sfxGain!;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.015);
  gain.gain.linearRampToValueAtTime(volume * 0.7, startTime + duration * 0.4);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);

  osc.connect(gain);
  gain.connect(dest);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

export function playCollect() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  const base = 700 + Math.random() * 300;
  playNote(base, t, 0.07, 0.22, 'sine');
  playNote(base * 1.5, t + 0.025, 0.07, 0.12, 'sine');
}

export function playMiss() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  playNote(200, t, 0.12, 0.14, 'triangle');
  playNote(160, t + 0.04, 0.1, 0.1, 'triangle');
}

export function playHazardKill() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  playNote(260, t, 0.06, 0.12, 'square');
  playNote(155, t + 0.02, 0.13, 0.1, 'triangle');
}

export function playLevelComplete() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  const m = [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6];
  m.forEach((f, i) => {
    playNote(f, t + i * 0.11, 0.22, 0.25, 'sine');
    playNote(f * 0.5, t + i * 0.11, 0.28, 0.1, 'triangle');
  });
}

export function playVictory() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  const m = [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6, NOTE.E6];
  m.forEach((f, i) => {
    playNote(f, t + i * 0.12, 0.26, 0.28, 'sine');
    playNote(f * 0.5, t + i * 0.12, 0.3, 0.12, 'triangle');
  });
}

export function playGameOver() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  [NOTE.E4, NOTE.D4, NOTE.C4, NOTE.C4 * 0.5].forEach((f, i) => {
    playNote(f, t + i * 0.16, 0.3, 0.22, 'triangle');
  });
}

export function playCountdownTick() {
  const ctx = getCtx();
  playNote(NOTE.G4, ctx.currentTime, 0.08, 0.18, 'sine');
}

export function playCountdownGo() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  playNote(NOTE.C5, t, 0.15, 0.25, 'sine');
  playNote(NOTE.E5, t + 0.05, 0.15, 0.2, 'sine');
  playNote(NOTE.G5, t + 0.1, 0.2, 0.18, 'sine');
}

export function playDraw() {
  const ctx = getCtx();
  const f = 500 + Math.random() * 400;
  playNote(f, ctx.currentTime, 0.035, 0.07, 'sine');
}

// ─── CUTE MUSIC ENGINE ────────────────────────────────────────────────────────

// C major pentatonic: C D E G A  — always happy, never clashes
const PENTA = [
  NOTE.C5, NOTE.D5, NOTE.E5, NOTE.G5, NOTE.A5,
  NOTE.C6, NOTE.D6, NOTE.E6, NOTE.G6, NOTE.A6,
];

// Catchy 8-step phrases — indices into PENTA
const PHRASES: number[][] = [
  [0, 2, 4, 5, 4, 2, 4, 5],   // bouncy skip
  [5, 4, 2, 0, 2, 4, 5, 7],   // climbing wonder
  [2, 4, 5, 4, 2, 0, 2, 4],   // gentle sway
  [4, 5, 7, 5, 4, 5, 4, 2],   // playful hop
  [0, 4, 2, 5, 4, 2, 5, 4],   // surprise twirl
  [5, 7, 5, 4, 2, 4, 2, 0],   // winding down then up
];

// Counter-melody (plays on beats 2, 4, 6, 8 — slight offset for depth)
const COUNTER_PHRASES: number[][] = [
  [4, 2, 5, 4, 5, 4, 2, 4],
  [2, 4, 2, 5, 4, 2, 0, 2],
  [5, 4, 2, 4, 5, 7, 5, 4],
];

// Soft bell tone with long natural decay (ASMR crystal/xylophone feel)
function scheduleBell(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  t: number,
  vol: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  filter.type = 'bandpass';
  filter.frequency.value = freq * 2;
  filter.Q.value = 4;

  osc.type = 'sine';
  osc.frequency.value = freq;

  // Add a tiny overtone for "bell-like" timbre
  const osc2 = ctx.createOscillator();
  const g2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.value = freq * 2.756; // inharmonic partial = bell character
  g2.gain.setValueAtTime(0, t);
  g2.gain.linearRampToValueAtTime(vol * 0.18, t + 0.008);
  g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
  osc2.connect(g2);
  g2.connect(dest);
  osc2.start(t);
  osc2.stop(t + 0.4);

  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.008);
  gain.gain.exponentialRampToValueAtTime(vol * 0.3, t + 0.12);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.1); // long ASMR tail

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  osc.start(t);
  osc.stop(t + 1.15);
}

// Warm "glockenspiel" melody layer
function scheduleMelody(
  ctx: AudioContext,
  dest: AudioNode,
  phraseIdx: number,
  startTime: number,
  stepDur: number,
  vol: number
): number {
  const phrase = PHRASES[phraseIdx % PHRASES.length];
  phrase.forEach((idx, i) => {
    const t = startTime + i * stepDur + (Math.random() * 0.008 - 0.004); // humanize
    const freq = PENTA[idx % PENTA.length];
    scheduleBell(ctx, dest, freq, t, vol);
  });
  return startTime + phrase.length * stepDur;
}

// Airy counter-melody (softer, slightly delayed)
function scheduleCounter(
  ctx: AudioContext,
  dest: AudioNode,
  phraseIdx: number,
  startTime: number,
  stepDur: number,
  vol: number
) {
  const phrase = COUNTER_PHRASES[phraseIdx % COUNTER_PHRASES.length];
  phrase.forEach((idx, i) => {
    if (i % 2 === 1) {
      const t = startTime + i * stepDur + stepDur * 0.5 + (Math.random() * 0.01);
      const freq = PENTA[idx % PENTA.length] * 0.5; // one octave lower
      scheduleBell(ctx, dest, freq, t, vol * 0.55);
    }
  });
}

// Soft thumpy bass — sine with short decay, very low filter (ASMR warmth)
function scheduleBass(
  ctx: AudioContext,
  dest: AudioNode,
  startTime: number,
  beats: number,
  beatDur: number,
  vol: number
) {
  const pattern = [1, 0, 0.7, 0, 1, 0, 0.8, 0]; // on-beat emphasis
  const bassRoot = [NOTE.C3, NOTE.G3, NOTE.C3, NOTE.G3 * 0.75];

  for (let i = 0; i < beats; i++) {
    const accent = pattern[i % pattern.length];
    if (accent === 0) continue;
    const t = startTime + i * beatDur + (Math.random() * 0.006 - 0.003);
    const freq = bassRoot[Math.floor(i / 2) % bassRoot.length];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    filter.Q.value = 0.4;

    osc.type = 'sine';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol * accent, t + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + beatDur * 0.7);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + beatDur * 0.75);
  }
}

// Shimmery pad — soft chord drone for ASMR texture
function schedulePad(
  ctx: AudioContext,
  dest: AudioNode,
  startTime: number,
  duration: number,
  vol: number
) {
  const chordFreqs = [NOTE.C4, NOTE.E4, NOTE.G4, NOTE.C5]; // C major
  chordFreqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    filter.Q.value = 0.3;

    osc.type = 'sine';
    osc.frequency.value = freq * (1 + (Math.random() * 0.002 - 0.001)); // tiny detune
    osc.frequency.linearRampToValueAtTime(freq * 1.001, startTime + duration);

    const fadeIn = 0.4;
    const fadeOut = 0.6;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol * (0.5 + i * 0.08), startTime + fadeIn);
    gain.gain.setValueAtTime(vol * (0.5 + i * 0.08), startTime + duration - fadeOut);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  });
}

// Sparkle accent — tiny high tinkle scattered randomly (ASMR glitter)
function scheduleSparkle(
  ctx: AudioContext,
  dest: AudioNode,
  time: number,
  vol: number
) {
  const sparkleFreqs = [NOTE.C6, NOTE.E6, NOTE.G6, NOTE.A6, NOTE.D6];
  const freq = sparkleFreqs[Math.floor(Math.random() * sparkleFreqs.length)];

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(vol, time + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.5);

  osc.connect(gain);
  gain.connect(dest);
  osc.start(time);
  osc.stop(time + 0.55);
}

export function startMusic() {
  if (musicPlaying) return;
  const ctx = getCtx();
  if (!musicGain) return;

  musicPlaying = true;

  const dest = musicGain;
  let stopped = false;

  // BPM 96 — not too fast, keeps it cute and relaxed
  const BPM = 96;
  const BEAT = 60 / BPM;
  const STEP = BEAT * 0.5; // eighth notes for glockenspiel
  const PHRASE_STEPS = 8;
  const PHRASE_DUR = PHRASE_STEPS * STEP;

  let phraseIndex = 0;
  let nextPhraseTime = ctx.currentTime + 0.1;

  const LOOKAHEAD = 3.0;
  const SCHEDULE_INTERVAL = 900;

  let sparkleInterval: ReturnType<typeof setInterval> | null = null;

  function scheduleMusicAhead() {
    if (stopped) return;

    while (nextPhraseTime < ctx.currentTime + LOOKAHEAD) {
      const pt = nextPhraseTime;

      // Main glockenspiel melody
      scheduleMelody(ctx, dest, phraseIndex, pt, STEP, 0.055);

      // Counter-melody for depth
      scheduleCounter(ctx, dest, phraseIndex, pt, STEP, 0.04);

      // Soft bass on every phrase
      scheduleBass(ctx, dest, pt, PHRASE_STEPS * 2, BEAT, 0.045);

      // Pad every 2 phrases — long ambient drone underneath
      if (phraseIndex % 2 === 0) {
        schedulePad(ctx, dest, pt, PHRASE_DUR * 2, 0.018);
      }

      nextPhraseTime += PHRASE_DUR;
      phraseIndex++;
    }
  }

  scheduleMusicAhead();
  const scheduleTimer = setInterval(scheduleMusicAhead, SCHEDULE_INTERVAL);

  // Random sparkles — ASMR glitter effect
  sparkleInterval = setInterval(() => {
    if (stopped) return;
    const chance = Math.random();
    if (chance < 0.6) {
      const offset = Math.random() * 1.8;
      scheduleSparkle(ctx, dest, ctx.currentTime + offset, 0.022 + Math.random() * 0.018);
    }
    // Sometimes a tiny cluster of 2-3 sparkles
    if (chance < 0.2) {
      scheduleSparkle(ctx, dest, ctx.currentTime + Math.random() * 0.8, 0.015);
      scheduleSparkle(ctx, dest, ctx.currentTime + 0.3 + Math.random() * 0.5, 0.012);
    }
  }, 1800);

  musicStopHandle = () => {
    stopped = true;
    clearInterval(scheduleTimer);
    if (sparkleInterval) clearInterval(sparkleInterval);
    musicStopHandle = null;
  };
}

export function stopMusic() {
  musicPlaying = false;
  if (musicStopHandle) musicStopHandle();
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
