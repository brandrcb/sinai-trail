/* ============================================================
   SCENES — pixel art painted on a 280x96 logical grid (2x2 px)
   Apple II hi-res palette: black, green, white, orange, purple, blue
   ============================================================ */
(function () {
  const W = 280, H = 96, P = 2;
  const C = { g: "#33ff33", w: "#ffffff", o: "#ff7a1a", p: "#d35cff", b: "#3aa0ff", k: "#000000", d: "#1a7a1a" };
  let ctx;
  const px = (x, y, c) => { ctx.fillStyle = c || C.g; ctx.fillRect(Math.round(x) * P, Math.round(y) * P, P, P); };
  const rect = (x, y, w, h, c) => { ctx.fillStyle = c || C.g; ctx.fillRect(Math.round(x) * P, Math.round(y) * P, Math.round(w) * P, Math.round(h) * P); };
  const line = (x0, y0, x1, y1, c) => { // Bresenham
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
    for (; ;) { px(x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  };
  const poly = (pts, c) => { ctx.fillStyle = c || C.g; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0] * P, p[1] * P) : ctx.moveTo(p[0] * P, p[1] * P)); ctx.closePath(); ctx.fill(); };
  const dither = (x, y, w, h, c, dens) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (((i + j) % 2 === 0) && (dens === undefined || hash(x + i, y + j) < dens)) px(x + i, y + j, c); };
  const hash = (x, y) => { const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return n - Math.floor(n); };
  const sprite = (art, x, y, cols) => {
    cols = cols || {}; for (let j = 0; j < art.length; j++) for (let i = 0; i < art[j].length; i++) {
      const ch = art[j][i]; if (ch === "." || ch === " ") continue;
      px(x + i, y + j, ch === "#" ? (cols["#"] || C.g) : (C[ch] || cols[ch] || C.g));
    }
  };
  const text = (s, x, y, c, size) => { ctx.fillStyle = c || C.g; ctx.font = (size || 12) + "px 'Press Start 2P', monospace"; ctx.fillText(s, x * P, y * P); };

  /* ---- sprites ---- */
  const MAN = [[
    "..###..", "..###..", "...#...", ".#####.", "#.###.#", "#.###.#", "..###..", "..###..", "..#.#..", "..#.#..", ".#...#.", ".#...#."], [
    "..###..", "..###..", "...#...", ".#####.", "#.###.#", "#.###.#", "..###..", "..###..", "..#.#..", ".#...#.", ".#...#.", "#.....#"]];
  const WOMAN = [[
    "..###..", ".#####.", "..###..", ".#####.", "#.###.#", "#.###.#", "..###..", ".#####.", ".#####.", "#######", "..#.#..", "..#.#.."], [
    "..###..", ".#####.", "..###..", ".#####.", "#.###.#", "#.###.#", "..###..", ".#####.", ".#####.", "#######", ".#...#.", ".#...#."]];
  const KID = [["..##..", "..##..", ".####.", "#.##.#", "..##..", "..##..", ".#..#.", ".#..#."], ["..##..", "..##..", ".####.", "#.##.#", "..##..", "..##..", "..##..", ".#..#."]];
  const DONKEY = [[
    "...............##.", "..............#.##", "........wwww..###.", "......wwwwwwww###.", "..#######wwww##...", ".#############....", ".#############....", ".#.#.......#.#....", ".#.#.......#.#....", ".#.#.......#.#....", ".#.#........#.#...", "##.##......##.##.."], [
    "...............##.", "..............#.##", "........wwww..###.", "......wwwwwwww###.", "..#######wwww##...", ".#############....", ".#############....", ".#.#.......#.#....", "..#.#.....#.#.....", ".#...#...#...#....", ".#...#...#...#....", "##..##...##..##..."]];
  const SHEEP = [[".######.", "########", "########", ".#.##.#.", ".#....#."], [".######.", "########", "########", "..#..#..", ".#....#."]];
  const PALM = ["......#......", "..##..#..##..", ".#..#.#.#..#.", "#....###....#", ".....###.....", "....#.#.#....", "...#..#..#...", "......#......", "......#......", "......#......", "......#......", "......#......", "......#......", ".....###....."];
  const TENT = ["......#......", ".....###.....", "....#####....", "...#######...", "..#########..", ".###########.", "#############", "####.....####"];
  const BUSH = ["..####..", ".######.", "########", ".######.", "...##..."];
  const ALTAR = ["oooo.oooo", ".o.oooo.o", "#########", "#########", "#.......#", "#.......#", "#########"];
  const CLOUD = ["...wwww...", ".wwwwwwww.", "wwwwwwwwww", "wwwwwwwwww", ".wwwwwwww.", "..wwwwww..", "...wwww...", "...wwww...", "...wwww...", "....ww....", "....ww....", "....ww....", "....ww....", "....ww....", "....ww....", "....ww....", "....ww....", "....ww....", "....ww....", "....ww....", "....ww...."];
  const ARK = ["ooo...ooo", "oo.o.o.oo", "ooooooooo", "ooooooooo", "ooooooooo", "#ooooooo#", "#ooooooo#"];
  const GRAVE = ["...####...", "..######..", ".########.", ".###..###.", ".########.", ".########.", ".###..###.", ".########.", ".########.", ".########."];
  const SNAKE = ["....##....", "...#..#...", "..#....#..", ".#......#.", "#........#", "#........#", "#........#", ".#......#.", "..#....#..", "...#..#...", "....##....", "....##....", "....##....", "....##....", "....##....", "....##....", "...####..."];

  /* ---- components ---- */
  function sky(night) { rect(0, 0, W, H, C.k); if (night) for (let i = 0; i < 40; i++) px(hash(i, 3) * W, hash(i, 7) * 40, C.w); }
  function sun(x, y, c) { rect(x - 2, y - 4, 5, 9, c || C.o); rect(x - 4, y - 2, 9, 5, c || C.o); }
  function ground(y, scroll, c) { line(0, y, W, y, c); for (let i = 0; i < 24; i++) { const x = ((hash(i, 1) * W) - (scroll || 0) * 3 + W * 4) % W; px(x, y + 2 + Math.floor(hash(i, 2) * 8), c); if (hash(i, 9) > 0.5) px(x + 1, y + 2 + Math.floor(hash(i, 2) * 8), c); } }
  function mountains(base, pts, c, fill) { const p = [[0, base]].concat(pts).concat([[W, base]]); if (fill) { poly(p, fill); } for (let i = 0; i < p.length - 1; i++) line(p[i][0], p[i][1], p[i + 1][0], p[i + 1][1], c); }
  function caravan(x, y, f, big) {
    const a = f % 2;
    sprite(CLOUD, x + 120, y - 30);
    sprite(MAN[a], x + 100, y - 12); sprite(DONKEY[a], x + 74, y - 12); sprite(WOMAN[a], x + 64, y - 12); sprite(KID[a], x + 56, y - 8);
    sprite(MAN[a], x + 44, y - 12); sprite(SHEEP[a], x + 30, y - 5); sprite(SHEEP[(f + 1) % 2], x + 20, y - 6); sprite(SHEEP[a], x + 10, y - 4); sprite(KID[(f + 1) % 2], x + 2, y - 8);
    if (big) { sprite(MAN[a], x - 12, y - 12); sprite(DONKEY[(f + 1) % 2], x - 36, y - 12); sprite(WOMAN[(f + 1) % 2], x - 46, y - 12); }
  }
  function camp(x, y, n) { for (let i = 0; i < n; i++) sprite(TENT, x + i * 18 + (i % 2) * 4, y - (i % 2) * 6); }
  function tabernacle(x, y) { rect(x, y, 40, 1); rect(x, y - 14, 1, 14); rect(x + 40, y - 14, 1, 14); rect(x, y - 14, 41, 1); for (let i = 0; i < 40; i += 4) px(x + i, y - 7, C.w); rect(x + 12, y - 10, 16, 10, C.k); rect(x + 12, y - 10, 16, 1, C.w); rect(x + 12, y - 10, 1, 10, C.w); rect(x + 27, y - 10, 1, 10, C.w); rect(x + 12, y - 1, 16, 1, C.w); for (let i = 0; i < 5; i++) px(x + 14 + i * 3, y - 6, C.b); sprite(CLOUD, x + 15, y - 34); }
  function water(y, h, f, c) { for (let j = 0; j < h; j++) for (let i = 0; i < W; i += 2) if ((i + j * 3 + f) % 8 < 3) px(i, y + j, c || C.b); }
  function jerichoWalls(x, y, fallen) {
    if (!fallen) { rect(x, y - 30, 90, 30, C.k); for (let j = 0; j < 30; j += 4) for (let i = 0; i < 90; i += 6) { line(x + i + (j % 8 ? 3 : 0), y - 30 + j, x + i + 5 + (j % 8 ? 3 : 0), y - 30 + j); px(x + i + (j % 8 ? 3 : 0), y - 29 + j); } for (let i = 0; i < 90; i += 6) rect(x + i, y - 34, 3, 4); rect(x + 30, y - 46, 12, 16); rect(x + 30, y - 46, 12, 1, C.w); }
    else { for (let i = 0; i < 60; i++) { const bx = x + hash(i, 4) * 110 - 10, by = y - hash(i, 5) * 12; rect(bx, by, 2 + hash(i, 6) * 4, 2); } rect(x + 30, y - 28, 12, 28); rect(x + 30, y - 28, 12, 1, C.w); px(x + 36, y - 20, C.o); rect(x + 34, y - 18, 4, 3, C.o); }
  }

  /* ---- scene painters ---- */
  const S = {};
  S.title = (f) => { sky(true); mountains(70, [[30, 40], [70, 22], [110, 50], [150, 30], [190, 12], [230, 44], [260, 34]], C.g); ground(70, f); caravan(50, 70, f, true); sun(250, 12, C.w); text("THE EXODUS TRAIL", 60, 22, C.g, 14); text("From the Sea of Reeds to Jericho", 52, 34, C.w, 7); };
  S.sea = (f) => { sky(); sun(40, 12); mountains(60, [[180, 50], [220, 30], [260, 45]], C.g); ground(60, 0); water(62, 34, f); dither(0, 62, W, 34, C.k, 0.3); rect(0, 88, W, 8, C.g); caravan(100, 58, f, true); for (let i = 0; i < 12; i++) sprite(WOMAN[(f + i) % 2], 8 + i * 9 - (i % 2) * 2, 44 - (i % 3) * 2); };
  S.marah = (f) => { sky(); sun(230, 10); mountains(64, [[40, 30], [90, 40], [130, 20], [200, 46]], C.g); ground(64, 0); rect(100, 70, 60, 10, C.b); dither(100, 70, 60, 10, C.k); sprite(MAN[0], 90, 52); sprite(MAN[1], 165, 52); sprite(WOMAN[0], 175, 52); sprite(KID[0], 60, 56); sprite(BUSH, 40, 60); line(96, 58, 108, 68, C.w); };
  S.elim = (f) => { sky(); sun(40, 10); ground(66, 0); for (let i = 0; i < 9; i++) sprite(PALM, 10 + i * 30 + (i % 2) * 6, 40 - (i % 3) * 6); water(74, 8, f); water(84, 6, f); camp(150, 90, 4); sprite(WOMAN[0], 60, 62); sprite(KID[1], 72, 66); sprite(SHEEP[0], 120, 80); sprite(SHEEP[1], 132, 82); };
  S.desert = (f) => { sky(); sun(140, 10); mountains(62, [[60, 42], [120, 52], [180, 36], [240, 50]], C.g); ground(62, 0); caravan(60, 62, f); for (let i = 0; i < 60; i++) px(hash(i, 11) * W, 64 + hash(i, 12) * 30, C.w); text("MANNA", 200, 90, C.w, 6); };
  S.rock = (f) => { sky(); sun(30, 10); mountains(56, [[100, 8], [140, 14], [170, 6], [230, 30]], C.g, "#062"); rect(120, 30, 40, 26, C.k); rect(120, 30, 40, 26); dither(122, 32, 36, 22, C.k); line(140, 44, 138, 70, C.b); line(141, 44, 140, 72, C.b); water(72, 4, f); ground(70, 0); sprite(MAN[0], 100, 40, { "#": C.w }); line(104, 36, 96, 44, C.w); sprite(MAN[1], 60, 60); sprite(WOMAN[0], 70, 60); sprite(MAN[0], 190, 60); sprite(KID[0], 200, 64); };
  S.sinai = (f) => { sky(); mountains(74, [[80, 60], [120, 8], [150, 4], [180, 12], [220, 60]], C.g, "#041"); for (let i = 0; i < 14; i++) px(130 + hash(i, 5) * 40, hash(i, 6) * 10, C.w); if (f % 4 < 2) { line(150, 4, 146, 0, C.w); line(150, 4, 156, 0, C.w); } dither(110, 12, 80, 30, C.w, 0.5); rect(90, 62, 120, 1, C.o); ground(74, 0); camp(10, 92, 5); camp(200, 92, 4); tabernacle(122, 92); };
  S.fire = (f) => { sky(true); ground(66, 0); camp(30, 84, 6); camp(150, 90, 4); for (let i = 0; i < 4; i++) { const x = 230 + i * 10; sprite(["..o..", ".ooo.", "ooooo", ".o.o."], x, 60 - (f + i) % 3 * 2); } for (let i = 0; i < 20; i++) px(hash(i, 8) * 280, 64 + hash(i, 9) * 30, C.o); sprite(SHEEP[0], 100, 80); sprite(SHEEP[1], 112, 82); };
  S.camp = (f) => { sky(); sun(250, 10); mountains(62, [[50, 40], [100, 48], [160, 34], [220, 50]], C.g); ground(62, 0); camp(6, 80, 7); camp(160, 78, 5); tabernacle(110, 92); sprite(SHEEP[f % 2], 20, 88); sprite(SHEEP[0], 34, 90); sprite(WOMAN[0], 200, 82); };
  S.oasis = (f) => { sky(); sun(60, 10); mountains(66, [[120, 40], [180, 52], [240, 30]], C.g); ground(66, 0); for (let i = 0; i < 6; i++) sprite(PALM, 20 + i * 24, 44 - (i % 2) * 5); water(76, 6, f); camp(180, 92, 4); sprite(MAN[0], 150, 56); sprite(MAN[1], 160, 56); line(154, 52, 164, 52); rect(157, 53, 4, 6, C.p); };
  S.wander = (f) => { sky(); sun(200, 8); mountains(60, [[40, 48], [90, 30], [140, 54], [200, 40], [250, 52]], C.g); ground(60, f); caravan(80, 60, f); for (let i = 0; i < 6; i++) sprite(GRAVE, 10 + i * 44, 82, { "#": C.d }); };
  S.mountain = (f) => { sky(); mountains(76, [[100, 60], [140, 10], [180, 60]], C.g, "#041"); ground(76, 0); sprite(MAN[0], 130, 0, { "#": C.w }); sprite(MAN[1], 138, 0, { "#": C.w }); sprite(MAN[0], 146, 2); camp(10, 94, 5); camp(190, 94, 4); text("MOUNT HOR", 100, 92, C.w, 7); };
  S.arabah = (f) => { sky(); sun(20, 8, C.w); mountains(50, [[60, 20], [120, 40], [200, 16], [260, 36]], C.g, "#031"); ground(70, 0); dither(0, 52, W, 18, C.d); rect(139, 24, 2, 46, C.g); sprite(SNAKE, 135, 8, { "#": C.o }); sprite(MAN[0], 90, 58); sprite(WOMAN[0], 100, 58); sprite(MAN[1], 180, 58); sprite(KID[0], 190, 62); for (let i = 0; i < 5; i++) sprite(["#.#.#", ".#.#."], 30 + i * 50, 80 + (i % 2) * 6, { "#": C.o }); };
  S.battle = (f) => { sky(); sun(240, 8); mountains(60, [[80, 44], [160, 30], [240, 46]], C.g); ground(60, 0); for (let i = 0; i < 8; i++) sprite(MAN[(f + i) % 2], 20 + i * 12, 50 + (i % 2) * 8); for (let i = 0; i < 8; i++) { sprite(MAN[(f + i + 1) % 2], 170 + i * 12, 50 + (i % 2) * 8, { "#": C.p }); } for (let i = 0; i < 6; i++) line(110 + i * 8, 56 + (f + i) % 3, 120 + i * 8, 50 + (f + i) % 3, C.w); };
  S.moab = (f) => { sky(); sun(40, 10); mountains(50, [[60, 30], [120, 44], [200, 20], [260, 40]], C.g); ground(50, 0); dither(0, 52, W, 44, C.d, 0.4); for (let i = 0; i < 5; i++) sprite(PALM, 30 + i * 50, 34); sprite(ALTAR, 200, 12); sprite(MAN[0], 212, 0, { "#": C.p }); sprite(DONKEY[0], 224, 2, { "#": C.w }); camp(20, 92, 6); camp(160, 92, 3); water(88, 8, f); };
  S.nebo = (f) => { sky(); sun(200, 6, C.w); mountains(90, [[0, 30], [60, 20], [120, 40]], C.g, "#041"); for (let i = 130; i < W; i += 2) { const y = 60 + Math.sin(i / 9) * 4; px(i, y, C.d); } dither(130, 62, 150, 34, C.d, 0.5); water(70, 26, f, "#123"); rect(140, 72, 6, 8, C.w); rect(140, 72, 6, 1); sprite(MAN[0], 40, 8, { "#": C.w }); line(44, 4, 38, 20, C.w); text("THE LAND", 190, 30, C.g, 8); };
  S.jordan = (f) => { sky(); sun(30, 10); mountains(50, [[180, 34], [240, 40]], C.g); ground(50, 0); for (let i = 0; i < 4; i++) sprite(PALM, 200 + i * 20, 36); water(70, 18, f); rect(0, 88, W, 8, C.g); sprite(ARK, 128, 60); sprite(MAN[f % 2], 118, 56); sprite(MAN[(f + 1) % 2], 140, 56); caravan(10, 58, f); rect(120, 70, 30, 18, C.k); rect(120, 70, 30, 18, "#221"); line(120, 70, 120, 88, C.b); line(150, 70, 150, 88, C.b); };
  S.jericho = (f, St, o) => { sky(); sun(240, 8); ground(70, 0); for (let i = 0; i < 4; i++) sprite(PALM, 10 + i * 22, 50); jerichoWalls(120, 70, o && o.fallen); sprite(ARK, 90, 62); sprite(MAN[f % 2], 80, 58); for (let i = 0; i < 7; i++) sprite(MAN[(f + i) % 2], 20 + i * 9, 74 + (i % 2) * 6); line(240, 46, 240, 62, C.o); px(240, 44, C.o); px(241, 45, C.o); };
  S.travel = (f, St) => {
    const night = St && St.weather === "storm"; sky(night);
    const w = St ? St.weather : "clear";
    if (w === "scorching" || w === "hot") sun(40, 10, C.o); else if (w !== "rain" && w !== "storm" && w !== "wind") sun(40, 10, C.w);
    const idx = St ? St.stopIdx : 1;
    if (idx <= 5) mountains(62, [[30, 40], [70, 18], [110, 50], [150, 26], [190, 8], [230, 40], [260, 30]], C.g, "#041");
    else if (idx <= 9) mountains(62, [[50, 52], [100, 44], [150, 54], [200, 46], [250, 56]], C.g);
    else if (idx <= 12) mountains(62, [[20, 30], [80, 50], [140, 24], [200, 48], [260, 30]], C.g, "#031");
    else mountains(62, [[60, 44], [120, 50], [180, 40], [240, 48]], C.g);
    ground(62, f);
    if (w === "wind") dither(0, 0, W, 62, C.o, 0.15);
    if (w === "rain" || w === "storm") for (let i = 0; i < 60; i++) line((hash(i, 2) * W + f * 4) % W, hash(i, 3) * 60, (hash(i, 2) * W + f * 4) % W - 2, hash(i, 3) * 60 + 4, C.b);
    caravan(70, 62, f, true);
    if (St && St.stopIdx >= 5) { camp(2, 92, 2); }
  };
  S.event = S.travel;
  S.scroll = (f) => { sky(); rect(20, 6, 240, 84, C.k); rect(20, 6, 240, 84); rect(22, 8, 236, 80, C.k); rect(14, 4, 8, 88, C.w); rect(258, 4, 8, 88, C.w); for (let j = 16; j < 84; j += 6) for (let i = 34; i < 246; i += 3) if (hash(i, j) > 0.35) px(i, j, C.d); text("SCROLL OF INSIGHT", 60, 50, C.g, 10); };
  S.grave = (f) => { sky(true); mountains(70, [[40, 50], [100, 30], [160, 56], [220, 40]], C.g); ground(70, 0); sprite(GRAVE, 130, 50, { "#": C.w }); for (let i = 0; i < 6; i++) rect(120 + i * 4, 60 + (i % 2) * 2, 3, 2); sprite(BUSH, 90, 66); sprite(BUSH, 180, 64); };
  S.store = (f) => { sky(); sun(30, 10); ground(64, 0); water(80, 16, f); sprite(DONKEY[0], 60, 52); sprite(DONKEY[1], 90, 52); for (let i = 0; i < 8; i++) sprite(SHEEP[i % 2], 130 + i * 10, 58 + (i % 3) * 3); sprite(MAN[0], 30, 52); sprite(WOMAN[0], 40, 52); rect(210, 50, 30, 14, C.k); rect(210, 50, 30, 14); for (let i = 0; i < 6; i++) rect(212 + i * 5, 52, 3, 3, C.o); for (let i = 0; i < 6; i++) rect(212 + i * 5, 58, 3, 3, C.w); };
  S.promised = (f) => { sky(); sun(40, 10, C.w); mountains(56, [[60, 36], [120, 44], [180, 30], [240, 44]], C.g, "#041"); ground(56, 0); dither(0, 58, W, 38, C.g, 0.5); for (let i = 0; i < 5; i++) sprite(PALM, 20 + i * 55, 40); for (let i = 0; i < 12; i++) rect(150 + (i % 6) * 4, 70 + Math.floor(i / 6) * 4, 3, 3, C.p); sprite(MAN[0], 100, 60); sprite(WOMAN[0], 110, 60); sprite(KID[0], 120, 64); sprite(SHEEP[0], 130, 68); };
  S.stones = (f) => { sky(true); ground(70, 0); for (let i = 0; i < 12; i++) { const x = 40 + (i % 6) * 36, y = 58 - Math.floor(i / 6) * 10; rect(x, y, 8, 12, C.k); rect(x, y, 8, 12); rect(x + 1, y + 1, 6, 10, C.k); } text("GILGAL", 110, 92, C.w, 8); };

  SINAI.Scenes = {
    draw(c, name, f, St, opts) { ctx = c; ctx.imageSmoothingEnabled = false; (S[name] || S.travel)(f, St, opts); },
    names: Object.keys(S)
  };
})();
