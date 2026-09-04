/* ============================================================
   SCENES (DELUXE) — full-colour pixel art, 1990-edition style.
   Painted on a 280x120 logical grid (2x2 device px) with parallax
   layers, a day/night cycle, weather and an animated walking column.
   Everything is drawn in code — no image files, no licences.
   ============================================================ */
(function () {
  const W = 280, H = 120, P = 2;
  let ctx, T = 0;                      // T = seconds since scene start
  const hash = (x, y) => { const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return n - Math.floor(n); };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const hex = c => c[0] === "#" ? [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)] : c.match(/[\d.]+/g).slice(0, 3).map(Number);
  const rgb = (r, g, b) => `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); return rgb(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)); };
  const shade = (c, k) => { const A = hex(c); return rgb(clamp(A[0] * k, 0, 255), clamp(A[1] * k, 0, 255), clamp(A[2] * k, 0, 255)); };
  const px = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x) * P, Math.round(y) * P, P, P); };
  const rect = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x) * P, Math.round(y) * P, Math.round(w) * P, Math.round(h) * P); };
  const vgrad = (y0, y1, c0, c1) => { for (let y = y0; y < y1; y++) rect(0, y, W, 1, mix(c0, c1, (y - y0) / Math.max(1, y1 - y0 - 1))); };
  const text = (s, x, y, c, size) => { ctx.fillStyle = c; ctx.font = (size || 12) + "px 'Press Start 2P', monospace"; ctx.fillText(s, x * P, y * P); };
  const textC = (s, y, c, size) => { ctx.font = (size || 12) + "px 'Press Start 2P', monospace"; const w = ctx.measureText(s).width; ctx.fillStyle = c; ctx.fillText(s, (W * P - w) / 2, y * P); };
  const sprite = (art, x, y, pal) => {
    for (let j = 0; j < art.length; j++) for (let i = 0; i < art[j].length; i++) {
      const ch = art[j][i]; if (ch === "." || ch === " ") continue;
      const c = pal[ch]; if (c) px(x + i, y + j, c);
    }
  };
  const flipArt = art => art.map(r => r.split("").reverse().join(""));

  /* ---------- palette ---------- */
  const SKY = { // [top, bottom] keyframes by time of day t 0..1
    dawn: ["#3a3f7a", "#f0a469"], day: ["#3f86d6", "#a8d4f2"], noon: ["#2f78cf", "#9ccbf0"], dusk: ["#2a2657", "#ff8a3d"], night: ["#04081c", "#16264a"]
  };
  const skyAt = t => { // t: 0 dawn .. 1 next dawn
    const k = [[0, "dawn"], [0.12, "day"], [0.45, "noon"], [0.7, "day"], [0.82, "dusk"], [0.9, "night"], [1, "dawn"]];
    for (let i = 0; i < k.length - 1; i++) if (t >= k[i][0] && t <= k[i + 1][0]) {
      const u = (t - k[i][0]) / (k[i + 1][0] - k[i][0]); const a = SKY[k[i][1]], b = SKY[k[i + 1][1]];
      return [mix(a[0], b[0], u), mix(a[1], b[1], u)];
    }
    return SKY.day;
  };
  const darkAt = t => t < 0.82 ? 0 : t < 0.9 ? (t - 0.82) / 0.08 * 0.55 : t < 0.97 ? 0.55 : 0.55 - (t - 0.97) / 0.03 * 0.55;
  const REGION = {
    sinai: { far: "#b58a8c", mid: "#8a5a5e", near: "#6e4245", sand: "#dcb97e", sand2: "#c79b5f", rock: "#8c6a4a", scrub: "#7f8a4a" },
    paran: { far: "#dccbb0", mid: "#c3a97f", near: "#a68a5e", sand: "#e6cf9a", sand2: "#cfb27a", rock: "#a89272", scrub: "#9a9a5c" },
    arabah: { far: "#8c7a70", mid: "#5f4a42", near: "#43332e", sand: "#d3924f", sand2: "#b87a3f", rock: "#6d5548", scrub: "#7a7a3f" },
    moab: { far: "#a9b7ad", mid: "#7d8f5a", near: "#5e7040", sand: "#c9c48a", sand2: "#a8a86a", rock: "#8a8a6a", scrub: "#4f7a3a" }
  };
  const regionFor = idx => idx <= 5 ? "sinai" : idx <= 9 ? "paran" : idx <= 12 ? "arabah" : "moab";
  const PEOPLE = { // robe colours per household member
    robes: ["#a63d2f", "#3d6aa6", "#7a4f9e", "#c98a2e", "#3f8a5a", "#8a3f6a"],
    skin: "#d9a066", skin2: "#b8794a", hair: "#2b1a12", veil: "#eadbc0", veil2: "#c6b394", belt: "#4a2f1a", staff: "#6b4a2a"
  };

  /* ---------- sprites (colour) ---------- */
  // h hair, s skin, r robe, v veil/cloth, b belt, t staff, w white, k dark, p pack, e eye
  const MAN_TOP = ["..vvv..", ".vvvvv.", ".vsssv.", "..sss..", ".rrrrr.", "rrrrrrr", "r.rrr.r", "s.rrr.s", "..rrr..", "..bbb..", "..rrr.."];
  const LEGS = [["..s.s..", "..s.s..", "..k.k.."], [".s...s.", ".s...s.", "k.....k"], ["..ss...", ".s..s..", "k...k.."]];
  const WOMAN_TOP = ["..vvv..", ".vvvvv.", ".vsssv.", ".vsssv.", "vvrrrvv", "vvrrrvv", "v.rrr.v", "s.rrr.s", "..rrr..", "..bbb..", ".rrrrr."];
  const WLEGS = [[".rrrrr.", "rrrrrrr", ".k...k."], [".rrrrr.", ".rrrrr.", "..k.k.."], [".rrrrr.", "rrrrrrr", "k.....k"]];
  const ELDER_TOP = ["..www..", ".wwwww.", ".wsssw.", ".wwsww.", "..rrr.t", ".rrrrrt", "r.rrr.t", "s.rrrst", "..rrr.t", "..bbb.t", "..rrr.t"];
  const KID = [["..hhh..", "..sss..", "..rrr..", ".rrrrr.", "..rrr..", "..s.s..", "..k.k.."], ["..hhh..", "..sss..", "..rrr..", ".rrrrr.", "..rrr..", ".s...s.", "k.....k"], ["..hhh..", "..sss..", "..rrr..", ".rrrrr.", "..rrr..", "..ss...", ".k..k.."]];
  const DONKEY = [[
    "..............aa..", ".............aeaa.", "........pppp.aaaa.", "......pppppppaaa..", "..ddddddpppppd....", ".dddddddddddd.....", ".dddddddddddd.....", ".d.d.......d.d....", ".d.d.......d.d....", ".d.d.......d.d....", "kk.kk.....kk.kk..."], [
    "..............aa..", ".............aeaa.", "........pppp.aaaa.", "......pppppppaaa..", "..ddddddpppppd....", ".dddddddddddd.....", ".dddddddddddd.....", ".d.d.......d.d....", "..d.d.....d.d.....", ".d...d...d...d....", "kk..kk...kk..kk..."], [
    "..............aa..", ".............aeaa.", "........pppp.aaaa.", "......pppppppaaa..", "..ddddddpppppd....", ".dddddddddddd.....", ".dddddddddddd.....", ".d.d.......d.d....", ".d..d.....d..d....", ".d..d.....d..d....", "kk..kk...kk..kk..."]];
  const SHEEP = [[".wwwwww.", "wwwwwwwk", "wwwwwwkk", ".k.ww.k.", ".k....k."], [".wwwwww.", "wwwwwwwk", "wwwwwwkk", "..k.wk..", ".k....k."]];
  const PALM = ["......gg......", "..gg..gg..gg..", ".g..g.gg.g..g.", "g....gggg....g", "....ggGGgg....", "...g.GGGG.g...", "..g..tGGt..g..", ".....tttt.....", "......tt......", "......tt......", "......tt......", "......tt......", "......tt......", ".....tttt....."];
  const TENT = ["......k......", ".....vvv.....", "....vvvvv....", "...vvvvvvv...", "..vvvvvvvvv..", ".vvvvvvvvvvv.", "vvvvvvvvvvvvv", "vvvvv.k.vvvvv"];
  const BUSH = ["..gggg..", ".gggggg.", "gggggggg", ".gggggg.", "...tt..."];
  const ROCK = [".kkkk.", "kkkkkk", "kkkkkk"];
  const ARK = ["ooo...ooo", "oo.o.o.oo", "ooooooooo", "ooooooooo", "ooooooooo", "tooooooot", "t.......t"];
  const GRAVE = ["...kkkk...", "..kkkkkk..", ".kkkkkkkk.", ".kkk..kkk.", ".kkkkkkkk.", ".kkkkkkkk.", ".kkk..kkk.", ".kkkkkkkk.", ".kkkkkkkk.", ".kkkkkkkk."];
  const ALTAR = ["oo.o.oo", ".ooooo.", "kkkkkkk", "kkkkkkk", "k.....k", "k.....k", "kkkkkkk"];
  const SNAKE = ["....oo....", "...o..o...", "..o....o..", ".o......o.", "o........o", "o........o", ".o......o.", "..o....o..", "...o..o...", "....oo....", "....oo....", "....oo....", "....oo....", "...oooo..."];
  const PAL = {
    man: i => ({ v: i % 2 ? PEOPLE.veil : PEOPLE.veil2, s: PEOPLE.skin, r: PEOPLE.robes[i % PEOPLE.robes.length], b: PEOPLE.belt, k: "#3a2a1a", h: PEOPLE.hair }),
    woman: i => ({ v: PEOPLE.robes[(i + 3) % PEOPLE.robes.length], s: PEOPLE.skin, r: PEOPLE.robes[i % PEOPLE.robes.length], b: "#e8d9b0", k: "#3a2a1a", h: PEOPLE.hair }),
    elder: i => ({ w: "#f0ead8", s: PEOPLE.skin2, r: "#8a7a62", b: PEOPLE.belt, t: PEOPLE.staff, k: "#3a2a1a" }),
    kid: i => ({ h: PEOPLE.hair, s: PEOPLE.skin, r: PEOPLE.robes[(i + 1) % PEOPLE.robes.length], k: "#3a2a1a" }),
    donkey: i => ({ d: i % 2 ? "#7a6a5a" : "#6a5646", a: "#8a7a6a", e: "#111", p: i % 2 ? "#a63d2f" : "#3d6aa6", k: "#2a201a" }),
    sheep: { w: "#f2ecd8", k: "#3a2a1a" },
    palm: { g: "#3f8a3a", G: "#2c6a2a", t: "#8a6a3a" },
    tent: i => ({ v: i % 3 === 0 ? "#6b5a48" : i % 3 === 1 ? "#8a6a4a" : "#5a4a3a", k: "#2a1a10" }),
    bush: { g: "#6f8a3a", t: "#6b4a2a" }, rock: { k: "#6d5a48" },
    ark: { o: "#e6b422", t: "#6b4a2a" }, grave: { k: "#9a8a78" }, altar: { o: "#ff8c2a", k: "#5a4a3a" }, snake: { o: "#d08a2a" }
  };
  const walkFrame = t => [0, 1, 0, 2][Math.floor(t * 6) % 4];
  function person(kind, i, x, y, t) {
    const f = walkFrame(t + i * 0.37);
    if (kind === "man") { sprite(MAN_TOP, x, y, PAL.man(i)); sprite(LEGS[f], x, y + 11, PAL.man(i)); }
    else if (kind === "woman") { sprite(WOMAN_TOP, x, y, PAL.woman(i)); sprite(WLEGS[f], x, y + 11, PAL.woman(i)); }
    else if (kind === "elder") { const p = PAL.elder(i); sprite(ELDER_TOP, x, y + 1, p); sprite(LEGS[f === 2 ? 0 : f], x, y + 12, Object.assign({}, p, { s: PEOPLE.skin2 })); }
    else sprite(KID[f], x, y + 7, PAL.kid(i));
  }

  /* ---------- landscape layers ---------- */
  const vnoise = (x, seed) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i, seed), hash(i + 1, seed), u); };
  function terrain(base, amp, freq, seed, scroll, k, color, jag) {
    // ridge line = layered sines + smooth value-noise; drawn column by column, shaded a little on the sunlit side
    let prev = null;
    for (let i = 0; i < W; i++) {
      const wx = i + scroll * k + seed * 1000;
      let h = Math.sin(wx * freq) * 0.5 + Math.sin(wx * freq * 2.3 + seed) * 0.3 + Math.sin(wx * freq * 0.37 + seed * 2) * 0.6;
      if (jag) h += (vnoise(wx / 9, seed) - 0.5) * jag * 0.12 + (vnoise(wx / 3, seed + 5) - 0.5) * jag * 0.04;
      const y = Math.round(base - amp * (0.5 + 0.5 * h));
      rect(i, y, 1, H - y, color);
      if (prev !== null && y < prev) rect(i, y, 1, Math.min(4, prev - y + 1), shade(color, 1.12));
      prev = y;
    }
  }
  function dunes(base, amp, scroll, k, color, color2) {
    for (let i = 0; i < W; i++) {
      const wx = i + scroll * k;
      const y = base - amp * (0.5 + 0.5 * Math.sin(wx * 0.045) * Math.cos(wx * 0.013 + 1));
      rect(i, y, 1, H - y, color);
      if (Math.cos(wx * 0.045) > 0.2) rect(i, y, 1, 1, color2);
    }
  }
  function scatter(y0, y1, spacing, scroll, k, seed, fn) {
    const period = W + 60;
    for (let n = 0; n < Math.ceil(period / spacing) + 2; n++) {
      const wx = n * spacing + hash(n, seed) * spacing;
      let sx = ((wx - scroll * k) % period + period) % period - 30;
      const y = y0 + hash(n, seed + 1) * (y1 - y0);
      fn(sx, y, hash(n, seed + 2), n);
    }
  }
  function sunMoon(t) {
    const a = t * Math.PI; // sun path: rises left, sets right over t 0..0.85
    const st = clamp(t / 0.85, 0, 1);
    const sx = 20 + st * 240, sy = 62 - Math.sin(st * Math.PI) * 54;
    if (t < 0.87) { const c = t < 0.1 || t > 0.72 ? "#ffb347" : "#fff3b0"; rect(sx - 3, sy - 1, 7, 3, c); rect(sx - 2, sy - 2, 5, 5, c); rect(sx - 1, sy - 3, 3, 7, c); }
    if (t > 0.86) { const mt = (t - 0.86) / 0.14; const mx = 240 - mt * 200, my = 20 + Math.sin(mt * Math.PI) * -8; rect(mx - 2, my - 3, 5, 7, "#e8e8f0"); rect(mx - 3, my - 2, 7, 5, "#e8e8f0"); rect(mx, my - 2, 3, 5, "#b9b9d0"); }
    if (t > 0.88 || t < 0.03) for (let i = 0; i < 50; i++) if (hash(i, 77) < 0.9) px(hash(i, 3) * W, hash(i, 7) * 55, (i + Math.floor(T * 2)) % 7 ? "#dfe6ff" : "#ffffff");
  }
  function nationLine(y, scroll) { // the whole camp on the move, far away
    for (let i = 0; i < W; i += 2) { const wx = i + scroll * 0.25; if (hash(Math.floor(wx / 2), 41) < 0.5) px(i, y - 1 + Math.floor(hash(Math.floor(wx / 2), 42) * 2), "#3a2a20"); }
  }
  function pillar(x, y, t, night) {
    // pillar of cloud by day, fire by night (Ex 13:21)
    const top = 2;
    for (let j = top; j < y; j++) {
      const w = 5 + Math.sin(j * 0.25 + T * 1.5) * 2 + Math.sin(j * 0.08 - T) * 3 + (j < 20 ? (20 - j) * 0.35 : 0);
      const wob = Math.sin(j * 0.15 + T * 2) * 1.5;
      if (!night) { rect(x - w / 2 + wob, j, w, 1, j % 3 === 0 ? "#ffffff" : "#e9eef5"); rect(x - w / 2 + wob + 1, j, 1, 1, "#ffffff"); }
      else { const fl = hash(j, Math.floor(T * 12)) ; rect(x - w / 2 + wob, j, w, 1, fl < 0.3 ? "#ffd23f" : fl < 0.7 ? "#ff8c2a" : "#ff5a1f"); }
    }
    if (night) { ctx.save(); ctx.globalAlpha = 0.18 + Math.sin(T * 5) * 0.04; ctx.fillStyle = "#ffb347"; ctx.beginPath(); ctx.arc(x * P, (y - 10) * P, 70 * P / 2, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  }
  function weatherFX(w, t) {
    if (w === "wind") { ctx.save(); ctx.globalAlpha = 0.35; rect(0, 0, W, H, "#d8b06a"); ctx.restore(); for (let i = 0; i < 90; i++) { const x = ((hash(i, 5) * W) - T * (120 + hash(i, 6) * 80)) % W; px((x + W * 10) % W, hash(i, 7) * H, "#f0d9a0"); px((x + 1 + W * 10) % W, hash(i, 7) * H, "#f0d9a0"); } }
    if (w === "scorching") { ctx.save(); ctx.globalAlpha = 0.16; rect(0, 0, W, H, "#ffd36a"); ctx.restore(); }
    if (w === "rain" || w === "storm") {
      ctx.save(); ctx.globalAlpha = w === "storm" ? 0.45 : 0.3; rect(0, 0, W, H, "#4a5568"); ctx.restore();
      for (let i = 0; i < 120; i++) { const x = (hash(i, 2) * W + T * 40) % W, y = (hash(i, 3) * H + T * (160 + hash(i, 4) * 60)) % H; px(x, y, "#b9d3f0"); px(x - 1, y + 1, "#b9d3f0"); }
      if (w === "storm" && hash(Math.floor(T * 3), 99) < 0.12) { ctx.save(); ctx.globalAlpha = 0.6; rect(0, 0, W, H, "#ffffff"); ctx.restore(); }
    }
  }
  function nightShade(t) { const d = darkAt(t); if (d > 0) { ctx.save(); ctx.globalAlpha = d; rect(0, 0, W, H, "#050a20"); ctx.restore(); } }

  /* ---------- the landscape composer ---------- */
  function landscape(o) {
    // o: {region, t (time of day 0..1), scroll, weather, water, horizon, bigMountain, flat}
    const R = REGION[o.region || "sinai"], t = o.t === undefined ? 0.35 : o.t, sc = o.scroll || 0;
    const sky = skyAt(t); vgrad(0, 70, sky[0], sky[1]);
    sunMoon(t);
    if (o.clouds !== false && t > 0.05 && t < 0.85) for (let i = 0; i < 5; i++) { const x = ((hash(i, 21) * W * 1.5) - sc * 0.05 - T * 1.2) % (W + 60); const cx = ((x % (W + 60)) + W + 60) % (W + 60) - 30, cy = 8 + hash(i, 22) * 22; ctx.save(); ctx.globalAlpha = 0.85; rect(cx, cy + 2, 18 + hash(i, 23) * 14, 3, "#ffffff"); rect(cx + 4, cy, 10 + hash(i, 23) * 8, 2, "#ffffff"); rect(cx + 2, cy + 5, 14 + hash(i, 23) * 10, 1, "#dde6f0"); ctx.restore(); }
    if (o.bigMountain) { terrain(70, 44, 0.012, 9, sc, 0.05, R.far, 3); terrain(72, 66, 0.011, 3, sc, 0.02, R.mid, 6); terrain(72, 26, 0.03, 6, sc, 0.12, R.near, 4); }
    else { terrain(66, 30, 0.02, 1, sc, 0.08, R.far, 4); terrain(68, 20, 0.032, 2, sc, 0.18, R.mid, 5); }
    if (!o.flat) terrain(71, 10, 0.05, 4, sc, 0.35, R.near, 3);
    // ground
    rect(0, 70, W, H - 70, R.sand);
    dunes(76, 6, sc, 0.55, shade(R.sand, 1.06), shade(R.sand, 1.15));
    rect(0, 82, W, H - 82, R.sand);
    for (let y = 84; y < H; y += 2) for (let x = 0; x < W; x++) if (hash(x + Math.floor(sc * 1.0), y) < 0.12) px(x, y, R.sand2);
    // near details scroll fastest
    scatter(86, 116, 34, sc, 1.0, 7, (x, y, r) => { if (r < 0.45) sprite(BUSH, x, y - 5, { g: R.scrub, t: "#6b4a2a" }); else if (r < 0.8) sprite(ROCK, x, y - 3, { k: R.rock }); else { px(x, y, R.sand2); px(x + 1, y, R.sand2); px(x + 3, y + 1, R.sand2); } });
    scatter(74, 82, 60, sc, 0.5, 8, (x, y, r) => { if (r < 0.5) sprite(ROCK, x, y - 2, { k: shade(R.rock, 0.9) }); });
    if (o.water) { const w = o.water; rect(0, w.y, W, w.h, "#2f6fa8"); for (let j = 0; j < w.h; j++) for (let i = 0; i < W; i += 2) if ((i + j * 3 + Math.floor(T * 6)) % 9 < 3) px(i, w.y + j, j % 2 ? "#5aa0d8" : "#8ac6ee"); rect(0, w.y, W, 1, "#a9d8f2"); }
  }

  /* ---------- the column ---------- */
  function column(St, t, x0, y, opts) {
    opts = opts || {};
    const party = St && St.party ? St.party.filter(p => p.alive) : [{ age: 35 }, { age: 31 }, { age: 63 }, { age: 12 }, { age: 8 }];
    const kinds = party.map((p, i) => p.age >= 55 ? "elder" : p.age < 18 ? "kid" : (i % 2 ? "woman" : "man"));
    const donkeys = St ? Math.min(3, St.donkeys || 0) : 2, sheep = St ? Math.min(7, Math.ceil((St.flock || 0) / 4)) : 5;
    let x = x0;
    // leading donkeys & the head of the household in front (right)
    for (let i = 0; i < donkeys; i++) { sprite(DONKEY[walkFrame(t + i * 0.5)], x, y - 11, PAL.donkey(i)); x -= 22; }
    kinds.forEach((k, i) => { person(k, i, x, y - 14, t); x -= k === "kid" ? 10 : 12; });
    for (let i = 0; i < sheep; i++) { sprite(SHEEP[Math.floor((t * 4 + i) % 2)], x - 2, y - 5 + (i % 3), PAL.sheep); x -= 10; }
    // dust at the feet
    if (opts.dust !== false) for (let i = 0; i < 10; i++) { const dx = x0 + 10 - ((T * 25 + i * 17) % 120), dy = y - hash(i, Math.floor(T * 3)) * 3; ctx.save(); ctx.globalAlpha = 0.35; px(dx, dy, "#e9d8b0"); ctx.restore(); }
  }

  /* ---------- scene definitions ---------- */
  const S = {};
  S.travel = (t, St, o, tr) => {
    const w = St ? St.weather : "clear"; const idx = St ? St.stopIdx : 1;
    const prog = tr && tr.progress !== undefined ? tr.progress : (T % 12) / 12; // time of day across the travel day
    const tod = 0.02 + prog * 0.96;
    const scroll = tr && tr.scroll !== undefined ? tr.scroll : T * 30;
    landscape({ region: regionFor(idx), t: tod, scroll, bigMountain: idx === 5 || idx === 6 });
    nationLine(70, scroll);
    const night = tod > 0.86 || tod < 0.02;
    pillar(236, 84, T, night);
    column(St, T, 205, 100);
    weatherFX(w, tod); nightShade(tod);
    if (night) { ctx.save(); ctx.globalAlpha = 0.35; rect(0, 0, W, H, "#000"); ctx.restore(); pillar(236, 84, T, true); }
  };
  S.event = S.travel;
  S.title = (t) => {
    landscape({ region: "sinai", t: 0.8, scroll: T * 8, bigMountain: true });
    nationLine(70, T * 8); pillar(236, 84, T, false); column(null, T, 205, 100);
    nightShade(0.8);
    ctx.save(); ctx.globalAlpha = 0.55; rect(20, 14, 240, 40, "#1a0e06"); ctx.restore();
    textC("THE EXODUS TRAIL", 34, "#ffd86a", 16); textC("From the Sea of Reeds to Jericho", 46, "#f5e9cf", 7);
    textC("D E L U X E   E D I T I O N", 108, "#f5e9cf", 6);
  };
  S.sea = (t) => { landscape({ region: "sinai", t: 0.3, water: { y: 72, h: 24 }, flat: true }); rect(0, 96, W, 24, REGION.sinai.sand); for (let x = 0; x < W; x += 3) if (hash(x, 1) < 0.5) px(x, 96, "#a9d8f2"); for (let i = 0; i < 14; i++) person("woman", i + 3, 8 + i * 17, 94 + (i % 3) * 2, T * 0.6); column(null, T * 0.4, 250, 119, { dust: false }); };
  S.marah = (t) => { landscape({ region: "sinai", t: 0.5 }); rect(100, 94, 70, 10, "#6b7a3a"); for (let i = 0; i < 70; i += 3) px(100 + i, 94 + (i % 2), "#8a9a4a"); person("man", 0, 88, 78, 0); person("man", 1, 172, 78, 0); person("woman", 2, 184, 78, 0); person("kid", 3, 70, 82, 0); sprite(BUSH, 40, 86, PAL.bush); rect(96, 84, 1, 10, "#8a6a3a"); rect(97, 83, 1, 1, "#8a6a3a"); };
  S.elim = (t) => { landscape({ region: "sinai", t: 0.35, water: { y: 98, h: 10 } }); for (let i = 0; i < 10; i++) sprite(PALM, 6 + i * 28 + (i % 2) * 6, 62 - (i % 3) * 6, PAL.palm); for (let i = 0; i < 4; i++) sprite(TENT, 150 + i * 20, 112 - (i % 2) * 4, PAL.tent(i)); person("woman", 1, 60, 84, 0); person("kid", 4, 74, 86, 0); sprite(SHEEP[0], 120, 108, PAL.sheep); sprite(SHEEP[1], 132, 110, PAL.sheep); };
  S.desert = (t) => { landscape({ region: "sinai", t: 0.06 }); for (let i = 0; i < 90; i++) px(hash(i, 11) * W, 86 + hash(i, 12) * 32, "#ffffff"); for (let i = 0; i < 4; i++) sprite(TENT, 10 + i * 22, 78 - (i % 2) * 4, PAL.tent(i)); person("woman", 0, 130, 88, 0); person("kid", 2, 144, 92, 0); person("man", 1, 180, 86, 0); person("kid", 5, 200, 92, 0); text("MANNA", 208, 116, "#3a2a1a", 6); };
  S.rock = (t) => { landscape({ region: "sinai", t: 0.4, bigMountain: true }); rect(120, 44, 40, 30, "#6e4245"); rect(124, 40, 30, 6, "#8a5a5e"); for (let j = 0; j < 30; j += 3) for (let i = 0; i < 40; i += 4) if (hash(i, j) < 0.3) px(120 + i, 44 + j, "#5a3438"); rect(139, 58, 2, 40, "#8ac6ee"); rect(141, 60, 1, 38, "#5aa0d8"); rect(100, 98, 80, 4, "#5aa0d8"); person("man", 4, 104, 50, 0); rect(104, 46, 1, 8, PEOPLE.staff); person("man", 1, 60, 84, 0); person("woman", 2, 72, 84, 0); person("man", 3, 190, 84, 0); person("kid", 0, 204, 88, 0); };
  S.sinai = (t) => { landscape({ region: "sinai", t: 0.3, bigMountain: true, clouds: false }); ctx.save(); ctx.globalAlpha = 0.85; for (let j = 0; j < 22; j++) rect(96 + Math.sin(j * 0.6 + T) * 6 - j * 0.5, 6 + j, 90 + j * 2, 1, j % 2 ? "#ffffff" : "#e1e6ee"); ctx.restore(); if (Math.floor(T * 4) % 5 === 0) { rect(140, 8, 1, 18, "#ffffff"); rect(141, 14, 1, 14, "#fff3b0"); } for (let i = 0; i < 6; i++) sprite(TENT, 4 + i * 18, 108 - (i % 2) * 6, PAL.tent(i)); for (let i = 0; i < 5; i++) sprite(TENT, 190 + i * 18, 108 - (i % 2) * 6, PAL.tent(i + 1)); tabernacle(122, 112); };
  function tabernacle(x, y) { rect(x, y - 14, 41, 14, "#e8ddc0"); rect(x, y - 14, 41, 1, "#8a6a3a"); for (let i = 0; i < 40; i += 4) px(x + i, y - 8, "#a63d2f"); rect(x + 12, y - 12, 16, 12, "#6b4a2a"); rect(x + 12, y - 12, 16, 1, "#e6b422"); rect(x + 14, y - 10, 12, 8, "#3d3a8a"); for (let i = 0; i < 5; i++) px(x + 14 + i * 3, y - 7, "#e6b422"); rect(x + 4, y - 4, 4, 4, "#8a6a3a"); rect(x + 5, y - 6, 2, 2, "#ff8c2a"); pillar(x + 20, y - 14, T, false); }
  S.fire = (t) => { landscape({ region: "paran", t: 0.93, clouds: false }); for (let i = 0; i < 6; i++) sprite(TENT, 20 + i * 20, 104 - (i % 2) * 6, PAL.tent(i)); for (let i = 0; i < 5; i++) { const x = 220 + i * 10, fl = Math.floor(T * 10 + i) % 3; rect(x + 1, 86 - fl, 3, 3 + fl, "#ffd23f"); rect(x, 88, 5, 4, "#ff8c2a"); rect(x + 2, 84 - fl, 1, 2, "#ffffff"); } ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = "#ff8c2a"; ctx.beginPath(); ctx.arc(245 * P, 88 * P, 40 * P, 0, 7); ctx.fill(); ctx.restore(); sprite(SHEEP[0], 100, 108, PAL.sheep); sprite(SHEEP[1], 112, 110, PAL.sheep); nightShade(0.93); };
  S.camp = (t) => { landscape({ region: "paran", t: 0.15 }); for (let i = 0; i < 7; i++) sprite(TENT, 4 + i * 18 + (i % 2) * 4, 104 - (i % 2) * 6, PAL.tent(i)); for (let i = 0; i < 5; i++) sprite(TENT, 176 + i * 18, 104 - (i % 2) * 6, PAL.tent(i + 2)); tabernacle(110, 116); sprite(SHEEP[Math.floor(T * 2) % 2], 20, 112, PAL.sheep); sprite(SHEEP[0], 34, 114, PAL.sheep); person("woman", 2, 200, 96, 0); };
  S.oasis = (t) => { landscape({ region: "paran", t: 0.35, water: { y: 100, h: 6 } }); for (let i = 0; i < 6; i++) sprite(PALM, 20 + i * 24, 66 - (i % 2) * 5, PAL.palm); for (let i = 0; i < 4; i++) sprite(TENT, 180 + i * 20, 112 - (i % 2) * 4, PAL.tent(i)); person("man", 0, 150, 80, 0); person("man", 1, 162, 80, 0); rect(150, 76, 22, 1, "#8a6a3a"); rect(158, 77, 6, 6, "#7a4f9e"); };
  S.wander = (t, St) => { landscape({ region: "paran", t: 0.6, scroll: T * 12 }); nationLine(70, T * 12); for (let i = 0; i < 6; i++) sprite(GRAVE, 10 + i * 46, 104, PAL.grave); column(St, T, 205, 100); };
  S.mountain = (t) => { landscape({ region: "arabah", t: 0.4, bigMountain: true, clouds: false }); person("man", 4, 130, 14, 0); person("man", 5, 140, 14, 0); person("man", 0, 150, 16, 0); for (let i = 0; i < 5; i++) sprite(TENT, 10 + i * 18, 112 - (i % 2) * 4, PAL.tent(i)); for (let i = 0; i < 4; i++) sprite(TENT, 190 + i * 18, 112 - (i % 2) * 4, PAL.tent(i)); text("MOUNT HOR", 100, 117, "#3a2a1a", 7); };
  S.arabah = (t) => { landscape({ region: "arabah", t: 0.45 }); rect(139, 40, 2, 62, "#8a6a3a"); sprite(SNAKE, 135, 24, PAL.snake); person("man", 1, 90, 82, 0); person("woman", 2, 102, 82, 0); person("man", 3, 180, 82, 0); person("kid", 0, 194, 86, 0); for (let i = 0; i < 6; i++) { const x = 30 + i * 44, y = 104 + (i % 2) * 6; for (let k = 0; k < 5; k++) px(x + k, y + (k % 2), "#d08a2a"); } };
  S.battle = (t) => { landscape({ region: "moab", t: 0.4 }); for (let i = 0; i < 8; i++) person(i % 2 ? "man" : "man", i, 16 + i * 12, 78 + (i % 2) * 8, T); for (let i = 0; i < 8; i++) { const p = PAL.man(i); sprite(MAN_TOP, 170 + i * 12, 78 + (i % 2) * 8, Object.assign({}, p, { r: "#4a4a5a", v: "#7a7a8a" })); sprite(LEGS[walkFrame(T + i)], 170 + i * 12, 89 + (i % 2) * 8, p); } for (let i = 0; i < 6; i++) { const x = 110 + i * 8, y = 82 + (Math.floor(T * 6) + i) % 3; rect(x, y, 8, 1, "#e8e8f0"); } };
  S.moab = (t) => { landscape({ region: "moab", t: 0.7, water: { y: 108, h: 8 } }); for (let i = 0; i < 5; i++) sprite(PALM, 30 + i * 50, 58, PAL.palm); rect(196, 30, 24, 12, "#7a6a5a"); sprite(ALTAR, 204, 24, PAL.altar); rect(206, 20 - Math.floor(T * 8) % 2, 3, 4, "#ffd23f"); person("man", 2, 190, 12, 0); sprite(DONKEY[0], 222, 20, PAL.donkey(1)); for (let i = 0; i < 6; i++) sprite(TENT, 10 + i * 18, 106 - (i % 2) * 4, PAL.tent(i)); nightShade(0.7); };
  S.nebo = (t) => { landscape({ region: "moab", t: 0.78, bigMountain: true, clouds: false }); ctx.save(); ctx.globalAlpha = 0.9; rect(130, 74, 150, 46, "#7d8f5a"); ctx.restore(); for (let i = 130; i < W; i += 2) { const y = 82 + Math.sin(i / 9) * 4; px(i, y, "#5e7040"); } rect(130, 92, 150, 22, "#3f6a9a"); for (let i = 0; i < 150; i += 3) if ((i + Math.floor(T * 5)) % 9 < 3) px(130 + i, 94 + (i % 5) * 3, "#8ac6ee"); rect(150, 88, 6, 6, "#e8ddc0"); rect(150, 87, 6, 1, "#a63d2f"); person("elder", 0, 40, 26, 0); rect(38, 30, 1, 14, PEOPLE.staff); text("THE LAND", 190, 40, "#fff3b0", 8); nightShade(0.78); };
  S.jordan = (t, St) => { landscape({ region: "moab", t: 0.3, water: { y: 92, h: 18 } }); for (let i = 0; i < 4; i++) sprite(PALM, 200 + i * 20, 60, PAL.palm); rect(0, 110, W, 10, REGION.moab.sand); rect(120, 92, 30, 18, "#b09a6a"); rect(120, 92, 1, 18, "#2f6fa8"); rect(150, 92, 1, 18, "#2f6fa8"); sprite(ARK, 128, 84, PAL.ark); person("man", 4, 118, 78, T); person("man", 5, 140, 78, T); column(St, T, 90, 90, { dust: false }); };
  S.jericho = (t, St, o) => { landscape({ region: "moab", t: 0.35, flat: true }); for (let i = 0; i < 4; i++) sprite(PALM, 10 + i * 22, 74, PAL.palm); jerichoWalls(120, 96, o && o.fallen); sprite(ARK, 92, 88, PAL.ark); person("man", 4, 82, 82, T); for (let i = 0; i < 7; i++) person(i % 3 ? "man" : "woman", i, 16 + i * 10, 98 + (i % 2) * 6, T); };
  function jerichoWalls(x, y, fallen) {
    if (!fallen) { rect(x, y - 34, 96, 34, "#b8a07a"); for (let j = 0; j < 34; j += 4) for (let i = 0; i < 96; i += 8) { rect(x + i + (j % 8 ? 4 : 0), y - 34 + j, 7, 3, j % 8 ? "#c9b08a" : "#a8906a"); } for (let i = 0; i < 96; i += 8) rect(x + i, y - 38, 4, 4, "#b8a07a"); rect(x + 34, y - 52, 14, 18, "#a8906a"); rect(x + 34, y - 52, 14, 1, "#e8ddc0"); rect(x + 38, y - 46, 4, 6, "#3a2a1a"); rect(x + 78, y - 30, 6, 8, "#3a2a1a"); rect(x + 78, y - 36, 6, 1, "#a63d2f"); }
    else { for (let i = 0; i < 80; i++) { const bx = x + hash(i, 4) * 116 - 10, by = y - hash(i, 5) * 14; rect(bx, by, 2 + hash(i, 6) * 5, 2, i % 2 ? "#b8a07a" : "#a8906a"); } rect(x + 78, y - 30, 8, 30, "#b8a07a"); rect(x + 78, y - 30, 8, 1, "#e8ddc0"); rect(x + 80, y - 24, 4, 3, "#a63d2f"); for (let i = 0; i < 12; i++) { ctx.save(); ctx.globalAlpha = 0.5; px(x + hash(i, 8) * 100, y - 40 - ((T * 10 + i * 4) % 30), "#e8ddc0"); ctx.restore(); } }
  }
  S.scroll = (t) => { vgrad(0, H, "#2a1a0e", "#4a3220"); rect(30, 10, 220, 100, "#e8d9b5"); rect(30, 10, 220, 100, "#e8d9b5"); rect(22, 6, 12, 108, "#8a6a3a"); rect(246, 6, 12, 108, "#8a6a3a"); rect(24, 8, 8, 104, "#b08a4a"); rect(248, 8, 8, 104, "#b08a4a"); for (let j = 22; j < 100; j += 6) for (let i = 44; i < 236; i += 3) if (hash(i, j) > 0.35) px(i, j, "#8a7a62"); rect(60, 52, 160, 16, "#e8d9b5"); textC("SCROLL OF INSIGHT", 64, "#5a2a12", 10); };
  S.grave = (t) => { landscape({ region: "paran", t: 0.86, clouds: false }); sprite(GRAVE, 130, 86, { k: "#d9c9a8" }); for (let i = 0; i < 6; i++) rect(120 + i * 4, 96 + (i % 2) * 2, 3, 2, "#9a8a78"); sprite(BUSH, 90, 100, PAL.bush); sprite(BUSH, 180, 98, PAL.bush); nightShade(0.86); };
  S.store = (t) => { landscape({ region: "sinai", t: 0.3, water: { y: 104, h: 16 }, flat: true }); sprite(DONKEY[0], 60, 84, PAL.donkey(0)); sprite(DONKEY[1], 90, 84, PAL.donkey(1)); for (let i = 0; i < 8; i++) sprite(SHEEP[i % 2], 130 + i * 10, 92 + (i % 3) * 3, PAL.sheep); person("man", 0, 30, 82, 0); person("woman", 1, 42, 82, 0); rect(208, 82, 34, 16, "#8a6a3a"); rect(210, 84, 30, 12, "#e8d9b5"); for (let i = 0; i < 6; i++) rect(212 + i * 5, 86, 3, 3, "#e6b422"); for (let i = 0; i < 6; i++) rect(212 + i * 5, 92, 3, 3, "#dfe6ff"); };
  S.promised = (t) => { landscape({ region: "moab", t: 0.2 }); ctx.save(); ctx.globalAlpha = 0.6; rect(0, 84, W, 36, "#6f9a4a"); ctx.restore(); for (let i = 0; i < 5; i++) sprite(PALM, 20 + i * 55, 66, PAL.palm); for (let i = 0; i < 12; i++) rect(150 + (i % 6) * 5, 96 + Math.floor(i / 6) * 5, 3, 3, "#7a4f9e"); person("man", 0, 100, 84, 0); person("woman", 1, 112, 84, 0); person("kid", 2, 124, 88, 0); sprite(SHEEP[0], 134, 104, PAL.sheep); };
  S.stones = (t) => { landscape({ region: "moab", t: 0.9, flat: true, clouds: false }); for (let i = 0; i < 12; i++) { const x = 40 + (i % 6) * 36, y = 84 - Math.floor(i / 6) * 12; rect(x, y, 8, 14, "#7a6a58"); rect(x + 1, y + 1, 6, 12, "#a8987f"); rect(x + 2, y + 2, 2, 4, "#d9c9a8"); } text("GILGAL", 110, 116, "#f5e9cf", 8); nightShade(0.9); };

  SINAI.ScenesDeluxe = {
    W, H, P,
    draw(c, name, tSec, St, opts, travel) { ctx = c; T = Math.max(0, tSec || 0); ctx.imageSmoothingEnabled = false; (S[name] || S.travel)(T, St, opts, travel); },
    names: Object.keys(S)
  };
})();
