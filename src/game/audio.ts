let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let musicPlaying = false;
let musicStopHandle: (() => void) | null = null;

const NOTE = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51,
};

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.6;
    masterGain.connect(audioCtx.destination);

    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0.5;
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

const SCALE = [
  NOTE.C5, NOTE.D5, NOTE.E5, NOTE.G5, NOTE.A5,
  NOTE.C6, NOTE.D6, NOTE.E6,
];

const MELODY_PHRASES: number[][] = [
  [0, 2, 4, 5, 4, 2, 0, 1],
  [4, 5, 7, 5, 4, 2, 4, 2],
  [0, 2, 4, 2, 5, 4, 2, 0],
  [5, 7, 5, 4, 2, 4, 5, 4],
  [2, 4, 5, 7, 5, 4, 5, 2],
  [4, 2, 0, 2, 4, 5, 4, 2],
];

const HARMONY_OFFSETS = [-7, -5, -4, -3, -2];

function schedulePhrase(
  ctx: AudioContext,
  dest: AudioNode,
  phraseIndex: number,
  startTime: number,
  noteDur: number,
  noteGap: number,
  volume: number
): number {
  const phrase = MELODY_PHRASES[phraseIndex % MELODY_PHRASES.length];

  phrase.forEach((scaleIdx, i) => {
    const t = startTime + i * (noteDur + noteGap);
    const freq = SCALE[scaleIdx % SCALE.length];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 3000;
    filter.Q.value = 0.7;

    osc.type = 'sine';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.02);
    gain.gain.linearRampToValueAtTime(volume * 0.55, t + noteDur * 0.5);
    gain.gain.linearRampToValueAtTime(0, t + noteDur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + noteDur + 0.04);

    if (i % 3 === 0) {
      const harmOffset = HARMONY_OFFSETS[Math.floor(Math.random() * HARMONY_OFFSETS.length)];
      const harmFreq = freq * Math.pow(2, harmOffset / 12);
      const hosc = ctx.createOscillator();
      const hgain = ctx.createGain();
      hosc.type = 'sine';
      hosc.frequency.value = harmFreq;
      hgain.gain.setValueAtTime(0, t);
      hgain.gain.linearRampToValueAtTime(volume * 0.4, t + 0.025);
      hgain.gain.linearRampToValueAtTime(0, t + noteDur * 0.8);
      hosc.connect(hgain);
      hgain.connect(dest);
      hosc.start(t);
      hosc.stop(t + noteDur * 0.85);
    }
  });

  return startTime + phrase.length * (noteDur + noteGap);
}

function scheduleBass(
  ctx: AudioContext,
  dest: AudioNode,
  startTime: number,
  beats: number,
  beatDur: number,
  volume: number
) {
  const bassNotes = [NOTE.C4 * 0.5, NOTE.G4 * 0.5, NOTE.A4 * 0.5, NOTE.F4 * 0.5];
  for (let i = 0; i < beats; i++) {
    const t = startTime + i * beatDur;
    const freq = bassNotes[i % bassNotes.length];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500;
    filter.Q.value = 0.5;

    osc.type = 'sine';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.04);
    gain.gain.linearRampToValueAtTime(volume * 0.4, t + beatDur * 0.5);
    gain.gain.linearRampToValueAtTime(0, t + beatDur * 0.85);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + beatDur);
  }
}

function scheduleChime(
  ctx: AudioContext,
  dest: AudioNode,
  time: number,
  volume: number
) {
  const chimeNotes = [NOTE.C6, NOTE.E6, NOTE.G5, NOTE.A5];
  const note = chimeNotes[Math.floor(Math.random() * chimeNotes.length)];

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.value = note;

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(volume, time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.8);

  osc.connect(gain);
  gain.connect(dest);
  osc.start(time);
  osc.stop(time + 0.85);
}

export function startMusic() {
  if (musicPlaying) return;
  const ctx = getCtx();
  if (!musicGain) return;

  musicPlaying = true;

  const dest = musicGain;
  let stopped = false;

  const BPM = 120;
  const BEAT = 60 / BPM;
  const NOTE_DUR = BEAT * 0.85;
  const NOTE_GAP = BEAT * 0.15;
  const PHRASE_BEATS = 8;

  let phraseIndex = 0;
  let nextPhraseTime = ctx.currentTime + 0.1;

  const LOOKAHEAD = 2.5;
  const SCHEDULE_INTERVAL = 1000;

  let chimeInterval: ReturnType<typeof setInterval> | null = null;

  function scheduleMusicAhead() {
    if (stopped) return;

    while (nextPhraseTime < ctx.currentTime + LOOKAHEAD) {
      schedulePhrase(ctx, dest, phraseIndex, nextPhraseTime, NOTE_DUR, NOTE_GAP, 0.06);
      scheduleBass(ctx, dest, nextPhraseTime, PHRASE_BEATS, BEAT, 0.04);
      nextPhraseTime += PHRASE_BEATS * BEAT;
      phraseIndex++;
    }
  }

  scheduleMusicAhead();
  const scheduleTimer = setInterval(scheduleMusicAhead, SCHEDULE_INTERVAL);

  chimeInterval = setInterval(() => {
    if (stopped) return;
    if (Math.random() < 0.5) {
      const t = ctx.currentTime + Math.random() * 2;
      scheduleChime(ctx, dest, t, 0.035);
    }
  }, 3000);

  musicStopHandle = () => {
    stopped = true;
    clearInterval(scheduleTimer);
    if (chimeInterval) clearInterval(chimeInterval);
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
