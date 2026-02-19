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

// C major pentatonic — always cheerful
const PENTA = [
  NOTE.C5, NOTE.D5, NOTE.E5, NOTE.G5, NOTE.A5,
  NOTE.C6, NOTE.D6, NOTE.E6, NOTE.G6, NOTE.A6,
];

// Fun, bouncy 8-step melody phrases
const PHRASES: number[][] = [
  [0, 2, 4, 2, 5, 4, 2, 4],
  [4, 5, 4, 2, 0, 2, 4, 5],
  [2, 4, 5, 7, 5, 4, 2, 0],
  [5, 4, 2, 4, 5, 4, 5, 7],
  [0, 2, 4, 5, 7, 5, 4, 2],
  [4, 2, 4, 5, 4, 2, 0, 2],
];

// Bright xylophone/marimba — short, punchy, happy
function scheduleMarimba(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  t: number,
  vol: number
) {
  // Fundamental — pure sine for warmth
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.006);       // instant bright attack
  gain.gain.exponentialRampToValueAtTime(vol * 0.4, t + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32); // short, clean decay

  osc.connect(gain);
  gain.connect(dest);
  osc.start(t);
  osc.stop(t + 0.35);

  // 2nd harmonic (octave) — adds brightness without creepiness
  const osc2 = ctx.createOscillator();
  const g2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.value = freq * 2;
  g2.gain.setValueAtTime(0, t);
  g2.gain.linearRampToValueAtTime(vol * 0.22, t + 0.005);
  g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
  osc2.connect(g2);
  g2.connect(dest);
  osc2.start(t);
  osc2.stop(t + 0.16);
}

// Tiny "pip" accent — higher octave, very short, like a cute boing
function schedulePip(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  t: number,
  vol: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq * 2, t);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.06); // tiny pitch drop = "boing"

  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);

  osc.connect(gain);
  gain.connect(dest);
  osc.start(t);
  osc.stop(t + 0.12);
}

// Bouncy melody layer
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
    const t = startTime + i * stepDur + (Math.random() * 0.005 - 0.0025);
    const freq = PENTA[idx % PENTA.length];
    scheduleMarimba(ctx, dest, freq, t, vol);
    // Add a pip on every 3rd note for extra playfulness
    if (i % 3 === 0) {
      schedulePip(ctx, dest, freq, t, vol * 0.3);
    }
  });
  return startTime + phrase.length * stepDur;
}

// Cheerful bouncy bass — staccato oom-pah feel
function scheduleBass(
  ctx: AudioContext,
  dest: AudioNode,
  startTime: number,
  beats: number,
  beatDur: number,
  vol: number
) {
  const bassNotes = [NOTE.C4, NOTE.G4, NOTE.C4, NOTE.A4];
  for (let i = 0; i < beats; i++) {
    const t = startTime + i * beatDur;
    const freq = bassNotes[i % bassNotes.length] * 0.5; // drop an octave
    const isDownbeat = i % 2 === 0;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle'; // warmer than square, less buzzy than sawtooth
    osc.frequency.value = freq;

    const v = isDownbeat ? vol : vol * 0.55;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(v, t + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + beatDur * 0.55); // staccato = fun

    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + beatDur * 0.6);
  }
}

// Warm background pad — very subtle, just fills the air
function schedulePad(
  ctx: AudioContext,
  dest: AudioNode,
  startTime: number,
  duration: number,
  vol: number
) {
  [NOTE.C4, NOTE.E4, NOTE.G4].forEach((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    filter.Q.value = 0.5;

    osc.type = 'sine';
    osc.frequency.value = freq * (1 + (Math.random() * 0.003 - 0.0015));

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.5);
    gain.gain.setValueAtTime(vol, startTime + duration - 0.5);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  });
}

// Tinkle accent — bright, happy, short (not spooky)
function scheduleTinkle(
  ctx: AudioContext,
  dest: AudioNode,
  time: number,
  vol: number
) {
  const tinkleFreqs = [NOTE.C6, NOTE.E6, NOTE.G5, NOTE.A5, NOTE.D6];
  const freq = tinkleFreqs[Math.floor(Math.random() * tinkleFreqs.length)];

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(vol, time + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.22); // quick, not haunting

  osc.connect(gain);
  gain.connect(dest);
  osc.start(time);
  osc.stop(time + 0.25);
}

export function startMusic() {
  if (musicPlaying) return;
  const ctx = getCtx();
  if (!musicGain) return;

  musicPlaying = true;

  const dest = musicGain;
  let stopped = false;

  const BPM = 112; // upbeat and fun
  const BEAT = 60 / BPM;
  const STEP = BEAT * 0.5;
  const PHRASE_STEPS = 8;
  const PHRASE_DUR = PHRASE_STEPS * STEP;

  let phraseIndex = 0;
  let nextPhraseTime = ctx.currentTime + 0.1;

  const LOOKAHEAD = 3.0;
  const SCHEDULE_INTERVAL = 900;

  let tinkleInterval: ReturnType<typeof setInterval> | null = null;

  function scheduleMusicAhead() {
    if (stopped) return;

    while (nextPhraseTime < ctx.currentTime + LOOKAHEAD) {
      const pt = nextPhraseTime;

      scheduleMelody(ctx, dest, phraseIndex, pt, STEP, 0.06);
      scheduleBass(ctx, dest, pt, PHRASE_STEPS, BEAT, 0.05);

      if (phraseIndex % 2 === 0) {
        schedulePad(ctx, dest, pt, PHRASE_DUR * 2, 0.014);
      }

      nextPhraseTime += PHRASE_DUR;
      phraseIndex++;
    }
  }

  scheduleMusicAhead();
  const scheduleTimer = setInterval(scheduleMusicAhead, SCHEDULE_INTERVAL);

  // Cheerful tinkles — quick and bright, not long and eerie
  tinkleInterval = setInterval(() => {
    if (stopped) return;
    if (Math.random() < 0.65) {
      scheduleTinkle(ctx, dest, ctx.currentTime + Math.random() * 1.2, 0.028 + Math.random() * 0.02);
    }
    if (Math.random() < 0.25) {
      scheduleTinkle(ctx, dest, ctx.currentTime + Math.random() * 0.4, 0.02);
      scheduleTinkle(ctx, dest, ctx.currentTime + 0.2 + Math.random() * 0.3, 0.016);
    }
  }, 1600);

  musicStopHandle = () => {
    stopped = true;
    clearInterval(scheduleTimer);
    if (tinkleInterval) clearInterval(tinkleInterval);
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
