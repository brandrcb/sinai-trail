/* ============================================================
   AUDIO — original chiptune loop (WebAudio) + sound effects.
   To use a royalty-free track instead (e.g. from pixabay.com/music),
   drop the file in assets/music/ and set MUSIC_URL below, e.g.
     const MUSIC_URL = "assets/music/desert-caravan.mp3";
   ============================================================ */
(function () {
  const MUSIC_URL = "";      // <-- optional Pixabay track
  const BPM = 126;
  // An original melody in D Dorian (rests = 0). [midi, beats]
  const MELODY = [
    [62, 1], [65, 1], [69, 2], [67, 1], [65, 1], [62, 2],
    [60, 1], [62, 1], [65, 2], [64, 1], [62, 1], [60, 2],
    [62, 1], [65, 1], [69, 1], [72, 1], [71, 2], [69, 2],
    [67, 1], [65, 1], [67, 1], [69, 1], [62, 4],
    [69, 1], [71, 1], [72, 2], [71, 1], [69, 1], [67, 2],
    [65, 1], [67, 1], [69, 2], [67, 1], [65, 1], [64, 2],
    [62, 1], [64, 1], [65, 1], [67, 1], [69, 2], [65, 2],
    [64, 1], [62, 1], [60, 1], [59, 1], [62, 4]
  ];
  const BASS = [
    [38, 4], [38, 4], [36, 4], [36, 4], [38, 4], [41, 4], [43, 4], [38, 4],
    [41, 4], [41, 4], [38, 4], [38, 4], [36, 4], [36, 4], [43, 4], [38, 4]
  ];
  let ac = null, on = false, timer = null, nextTime = 0, mi = 0, bi = 0, gain, audioEl = null;
  const f = m => 440 * Math.pow(2, (m - 69) / 12);
  function ensure() { if (!ac) { ac = new (window.AudioContext || window.webkitAudioContext)(); gain = ac.createGain(); gain.gain.value = 0.08; gain.connect(ac.destination); } if (ac.state === "suspended") ac.resume(); }
  function note(midi, t, dur, type, vol) { if (!midi) return; const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f(midi); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.95); o.connect(g); g.connect(gain); o.start(t); o.stop(t + dur); }
  function schedule() {
    const beat = 60 / BPM;
    while (nextTime < ac.currentTime + 0.5) {
      const m = MELODY[mi % MELODY.length], b = BASS[bi % BASS.length];
      // melody and bass advance independently on a shared clock: schedule melody note, and bass when aligned
      note(m[0], nextTime, m[1] * beat, "square", 1);
      let elapsed = 0; for (let i = 0; i < mi; i++) elapsed += MELODY[i % MELODY.length][1];
      let belapsed = 0; for (let i = 0; i < bi; i++) belapsed += BASS[i % BASS.length][1];
      if (belapsed <= elapsed) { note(b[0], nextTime, b[1] * beat, "triangle", 0.9); bi++; }
      nextTime += m[1] * beat; mi++;
      if (mi >= MELODY.length * 4) { mi = 0; bi = 0; }
    }
  }
  SINAI.Audio = {
    get on() { return on; },
    start() { if (on) return; this.toggle(); },
    toggle() {
      on = !on;
      document.getElementById("sndbtn").textContent = on ? "SOUND: ON (S)" : "SOUND: OFF (S)";
      if (MUSIC_URL) {
        if (!audioEl) { audioEl = new Audio(MUSIC_URL); audioEl.loop = true; audioEl.volume = 0.4; }
        on ? audioEl.play().catch(() => { }) : audioEl.pause(); return;
      }
      if (on) { try { ensure(); nextTime = ac.currentTime + 0.1; mi = 0; bi = 0; timer = setInterval(schedule, 200); schedule(); } catch (e) { on = false; } }
      else { clearInterval(timer); timer = null; }
    },
    click() { if (!on || MUSIC_URL) return; try { ensure(); note(84, ac.currentTime, 0.05, "square", 0.5); } catch (e) { } },
    alarm() { if (!on || MUSIC_URL) return; try { ensure(); note(50, ac.currentTime, 0.4, "sawtooth", 0.8); note(45, ac.currentTime + 0.4, 0.6, "sawtooth", 0.8); } catch (e) { } }
  };
})();
