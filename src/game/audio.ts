let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let musicOscillators: OscillatorNode[] = [];
let musicPlaying = false;

const NOTES = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00,
};

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(audioCtx.destination);

    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0.15;
    musicGain.connect(masterGain);

    sfxGain = audioCtx.createGain();
    sfxGain.gain.value = 0.4;
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
  if (musicGain) musicGain.gain.value = Math.max(0, Math.min(1, vol * 0.2));
}

export function setSfxVolume(vol: number) {
  getAudioContext();
  if (sfxGain) sfxGain.gain.value = Math.max(0, Math.min(1, vol * 0.5));
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
  playTone(baseFreq, 0.08, 'sine', 0.3);
  playTone(baseFreq * 1.5, 0.1, 'sine', 0.2, 0.03);
}

export function playMiss() {
  playTone(180, 0.15, 'sawtooth', 0.15);
  playTone(140, 0.12, 'sawtooth', 0.1, 0.05);
}

export function playHazardKill() {
  playTone(250, 0.08, 'square', 0.12);
  playTone(150, 0.15, 'sawtooth', 0.1, 0.02);
}

export function playLevelComplete() {
  const melody = [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C5 * 2];
  melody.forEach((freq, i) => {
    playTone(freq, 0.2, 'sine', 0.25, i * 0.1);
    playTone(freq * 0.5, 0.25, 'triangle', 0.1, i * 0.1);
  });
}

export function playVictory() {
  const melody = [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C5 * 2, NOTES.G5, NOTES.C5 * 2];
  melody.forEach((freq, i) => {
    playTone(freq, 0.25, 'sine', 0.3, i * 0.12);
    playTone(freq * 0.5, 0.3, 'triangle', 0.15, i * 0.12);
  });
}

export function playGameOver() {
  const melody = [NOTES.E4, NOTES.D4, NOTES.C4, NOTES.C4 * 0.5];
  melody.forEach((freq, i) => {
    playTone(freq, 0.3, 'triangle', 0.2, i * 0.15);
  });
}

export function playCountdownTick() {
  playTone(NOTES.G4, 0.08, 'sine', 0.15);
}

export function playCountdownGo() {
  playTone(NOTES.C5, 0.15, 'sine', 0.25);
  playTone(NOTES.E5, 0.15, 'sine', 0.2, 0.05);
}

export function playDraw() {
  const freq = 400 + Math.random() * 300;
  playTone(freq, 0.04, 'sine', 0.08);
}

export function startMusic() {
  if (musicPlaying) return;

  const ctx = getAudioContext();
  if (!musicGain) return;

  musicPlaying = true;

  const chordNotes = [
    [NOTES.C4 * 0.5, NOTES.G4 * 0.5, NOTES.C4],
    [NOTES.A4 * 0.5 * 0.9, NOTES.E4 * 0.9, NOTES.A4 * 0.9],
    [NOTES.F4 * 0.5 * 0.9, NOTES.C4 * 0.9, NOTES.F4 * 0.9],
    [NOTES.G4 * 0.5 * 0.9, NOTES.D4 * 0.9, NOTES.G4 * 0.9],
  ];

  let chordIndex = 0;
  let lastChordTime = ctx.currentTime;

  function createDrone(freq: number): OscillatorNode {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.value = freq;

    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 1;

    gain.gain.value = 0.08;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(musicGain!);

    osc.start();
    musicOscillators.push(osc);

    return osc;
  }

  const drones = chordNotes[0].map(freq => createDrone(freq));

  function updateChord() {
    if (!musicPlaying) return;

    const now = ctx.currentTime;
    if (now - lastChordTime > 4) {
      lastChordTime = now;
      chordIndex = (chordIndex + 1) % chordNotes.length;

      drones.forEach((osc, i) => {
        const targetFreq = chordNotes[chordIndex][i];
        osc.frequency.linearRampToValueAtTime(targetFreq, now + 2);
      });
    }

    if (musicPlaying) {
      requestAnimationFrame(updateChord);
    }
  }

  updateChord();

  function playArpeggio() {
    if (!musicPlaying) return;

    const chord = chordNotes[chordIndex];
    const noteIndex = Math.floor(Math.random() * chord.length);
    const freq = chord[noteIndex] * (Math.random() > 0.5 ? 2 : 1);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    gain.gain.value = 0;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(musicGain!);

    osc.start();
    osc.stop(ctx.currentTime + 1);

    if (musicPlaying) {
      setTimeout(playArpeggio, 600 + Math.random() * 1200);
    }
  }

  setTimeout(playArpeggio, 1000);
}

export function stopMusic() {
  musicPlaying = false;
  musicOscillators.forEach(osc => {
    try { osc.stop(); } catch { /* ignore */ }
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
