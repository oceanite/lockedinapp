// ─────────────────────────────────────────────────────────────
// Lightweight Web Audio engine.
//
// The four music presets are synthesized ambient loops (no binary
// assets needed). Each preset is a sustained chord with a slow
// tremolo so it loops forever without seams. "Deadline Panic" adds a
// faster rhythmic pulse to feel tense; "Zen Mode" is sparse & calm.
//
// Also exposes a short alarm chime for timer completion.
// ─────────────────────────────────────────────────────────────

let ctx = null;
function audioCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

// per-preset character
const PRESETS = {
  // tense minor chord, fast tremolo + rhythmic pulse
  deadline:   { freqs: [220.0, 261.63, 311.13], type: "sawtooth", tremoloHz: 5.5, depth: 0.5, gain: 0.06, pulse: 2.2 },
  // deep, slow evolving pad
  brainstorm: { freqs: [110.0, 164.81, 220.0],  type: "sine",     tremoloHz: 0.18, depth: 0.35, gain: 0.10, pulse: 0 },
  // warm major chord, gentle lo-fi feel
  chill:      { freqs: [261.63, 329.63, 392.0], type: "triangle", tremoloHz: 0.22, depth: 0.28, gain: 0.07, pulse: 0 },
  // sparse open fifths, very calm
  zen:        { freqs: [196.0, 293.66, 392.0],  type: "sine",     tremoloHz: 0.10, depth: 0.22, gain: 0.07, pulse: 0 },
};

export const SynthEngine = {
  nodes: null,        // active graph
  presetId: null,
  volume: 0.6,

  isPreset(id) {
    return !!id && Object.prototype.hasOwnProperty.call(PRESETS, id);
  },

  start(presetId, volume = this.volume) {
    if (!this.isPreset(presetId)) return;
    // already playing this preset → just refresh volume
    if (this.presetId === presetId && this.nodes) {
      this.setVolume(volume);
      return;
    }
    this.stop();
    this.volume = volume;
    this.presetId = presetId;

    const c = audioCtx();
    const cfg = PRESETS[presetId];
    const now = c.currentTime;

    // master gain (scaled by user volume)
    const master = c.createGain();
    master.gain.value = cfg.gain * volume;
    master.connect(c.destination);

    // tremolo LFO modulating master amplitude
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.value = cfg.tremoloHz;
    lfoGain.gain.value = cfg.gain * volume * cfg.depth;
    lfo.connect(lfoGain).connect(master.gain);
    lfo.start(now);

    // chord voices
    const voices = cfg.freqs.map(f => {
      const o = c.createOscillator();
      o.type = cfg.type;
      o.frequency.value = f;
      const g = c.createGain();
      g.gain.value = 1 / cfg.freqs.length;
      o.connect(g).connect(master);
      o.start(now);
      return { o, g };
    });

    // optional rhythmic pulse (gates the master gain) for "deadline"
    let pulse = null;
    if (cfg.pulse > 0) {
      const p = c.createOscillator();
      const pGain = c.createGain();
      p.type = "square";
      p.frequency.value = cfg.pulse;
      // square -1..1 → scale so it dips the amplitude rhythmically
      pGain.gain.value = cfg.gain * volume * 0.4;
      p.connect(pGain).connect(master.gain);
      p.start(now);
      pulse = { p, pGain };
    }

    this.nodes = { master, lfo, lfoGain, voices, pulse, cfg };
  },

  setVolume(volume) {
    this.volume = volume;
    if (!this.nodes) return;
    const { master, lfoGain, pulse, cfg } = this.nodes;
    const c = audioCtx();
    const t = c.currentTime;
    master.gain.setTargetAtTime(cfg.gain * volume, t, 0.05);
    lfoGain.gain.setTargetAtTime(cfg.gain * volume * cfg.depth, t, 0.05);
    if (pulse) pulse.pGain.gain.setTargetAtTime(cfg.gain * volume * 0.4, t, 0.05);
  },

  stop() {
    if (!this.nodes) { this.presetId = null; return; }
    const { master, lfo, voices, pulse } = this.nodes;
    const c = audioCtx();
    const t = c.currentTime;
    try {
      master.gain.setTargetAtTime(0, t, 0.08);
      const stopAt = t + 0.25;
      lfo.stop(stopAt);
      voices.forEach(v => v.o.stop(stopAt));
      if (pulse) pulse.p.stop(stopAt);
    } catch { /* nodes may already be stopped */ }
    this.nodes = null;
    this.presetId = null;
  },
};

// Short, friendly alarm chime: three rising notes, repeated `repeats` times.
// Returns a stop() function.
export function playAlarm({ volume = 0.5, repeats = 3 } = {}) {
  const c = audioCtx();
  const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
  const noteDur = 0.18;
  const gap = 0.06;
  const patternDur = notes.length * (noteDur + gap) + 0.25;
  const oscillators = [];

  for (let r = 0; r < repeats; r++) {
    const base = c.currentTime + r * patternDur;
    notes.forEach((freq, i) => {
      const start = base + i * (noteDur + gap);
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "triangle";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(volume, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, start + noteDur);
      o.connect(g).connect(c.destination);
      o.start(start);
      o.stop(start + noteDur + 0.05);
      oscillators.push(o);
    });
  }

  return function stop() {
    oscillators.forEach(o => { try { o.stop(); } catch { /* noop */ } });
  };
}

// Resume the audio context — call from a user gesture so later
// programmatic playback (e.g. the timer-complete alarm) is allowed.
export function primeAudio() {
  try { audioCtx(); } catch { /* unsupported */ }
}
