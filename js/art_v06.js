/* ============================================================
   ART v0.6 PROPOSALS — NOT wired into the game.
   Hero household (camel / donkeys / baggage options), pillar redraw,
   outline pass, nation silhouette, portraits, named grave, event
   vignettes, stop postcards, parchment map, cover art.
   Everything is drawn in code on a logical pixel grid.
   ============================================================ */
(function () {
  const hash = (x, y) => { const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return n - Math.floor(n); };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const rgb = (r, g, b) => "#" + [r, g, b].map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, "0")).join("");
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); return rgb(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)); };
  const shade = (c, k) => { const A = hex(c); return rgb(A[0] * k, A[1] * k, A[2] * k); };

  /* ---------- Bitmap: a logical-pixel canvas with shape tools ---------- */
  class Bmp {
    constructor(w, h) { this.w = w; this.h = h; this.d = new Array(w * h).fill(null); }
    px(x, y, c) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.d[y * this.w + x] = c; }
    get(x, y) { x = Math.round(x); y = Math.round(y); return (x >= 0 && y >= 0 && x < this.w && y < this.h) ? this.d[y * this.w + x] : null; }
    rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c); }
    ellipse(cx, cy, rx, ry, c) { for (let j = -ry; j <= ry; j++) for (let i = -rx; i <= rx; i++) if ((i * i) / (rx * rx + .01) + (j * j) / (ry * ry + .01) <= 1) this.px(cx + i, cy + j, c); }
    line(x0, y0, x1, y1, c, t) { t = t || 1; const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1; for (let k = 0; k <= n; k++) { const x = x0 + (x1 - x0) * k / n, y = y0 + (y1 - y0) * k / n; if (t === 1) this.px(x, y, c); else this.ellipse(x, y, t / 2, t / 2, c); } }
    poly(pts, c) { // scanline fill
      const ys = pts.map(p => p[1]); for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
        const xs = []; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if ((y >= a[1]) !== (y >= b[1])) xs.push(a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1])); }
        xs.sort((a, b) => a - b); for (let i = 0; i < xs.length - 1; i += 2) for (let x = Math.round(xs[i]); x <= Math.round(xs[i + 1]); x++) this.px(x, y, c);
      }
    }
    // draw string-art (like the game's sprite()) with a palette
    art(rows, x, y, pal) { for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j].length; i++) { const ch = rows[j][i]; if (ch === "." || ch === " ") continue; if (pal[ch]) this.px(x + i, y + j, pal[ch]); } }
    blit(b, x, y) { for (let j = 0; j < b.h; j++) for (let i = 0; i < b.w; i++) { const c = b.d[j * b.w + i]; if (c) this.px(x + i, y + j, c); } }
    // one-pixel outline in ink around every painted cell (the 1992 look)
    outline(ink) { const src = this.d.slice(); for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (!src[y * this.w + x]) { if ((x > 0 && src[y * this.w + x - 1]) || (x < this.w - 1 && src[y * this.w + x + 1]) || (y > 0 && src[(y - 1) * this.w + x]) || (y < this.h - 1 && src[(y + 1) * this.w + x])) this.d[y * this.w + x] = ink; } return this; }
    // darken the lower part of every column of a colour (cheap volume)
    shadeBottom(c, k, from) { for (let x = 0; x < this.w; x++) for (let y = from; y < this.h; y++) if (this.d[y * this.w + x] === c) this.d[y * this.w + x] = shade(c, k); return this; }
    flip() { const b = new Bmp(this.w, this.h); for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) b.d[y * this.w + (this.w - 1 - x)] = this.d[y * this.w + x]; return b; }
    scale(k) { const b = new Bmp(this.w * k, this.h * k); for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) { const c = this.d[y * this.w + x]; if (c) b.rect(x * k, y * k, k, k, c); } return b; }
    draw(ctx, x, y, P) { for (let j = 0; j < this.h; j++) for (let i = 0; i < this.w; i++) { const c = this.d[j * this.w + i]; if (c) { ctx.fillStyle = c; ctx.fillRect((x + i) * P, (y + j) * P, P, P); } } }
  }

  /* ---------- palette ---------- */
  const INK = "#2a1a10";
  const PEOPLE = { skin: "#c98c5a", skin2: "#a86e42", hair: "#2b1a12", grey: "#d8d2c4", robes: ["#a63d2f", "#3d6aa6", "#7a4f9e", "#c98a2e", "#3f8a5a", "#8a3f6a"], veil: "#eadbc0", veil2: "#c6b394", belt: "#4a2f1a", staff: "#6b4a2a" };
  const CAMEL = { body: "#c99a5e", dark: "#a67a44", light: "#dbb377", blanket: "#a63d2f", blanket2: "#e6b422", rope: "#6b4a2a", hoof: "#3a2a1a" };
  const DONKEY = { body: "#7a6a5a", dark: "#5c4e42", light: "#948373", muzzle: "#c9b9a8", pack: "#e8d9b5", pack2: "#8a6a3a", skin: "#a86e42" };
  const OX = { body: "#8a5a3a", dark: "#6a4229", light: "#a8764f", horn: "#e8ddc0" };
  const CART = { wood: "#8a6a3a", wood2: "#6b4a2a", canvas: "#e8d9b5", canvas2: "#cbb68f", wheel: "#5a3e28", iron: "#3a3a3a" };

  /* ============================================================
     HERO-SCALE SPRITES (2x the old grid: a person is ~14 x 28)
     ============================================================ */
  function personHero(kind, i, frame, opts) {
    opts = opts || {};
    const b = new Bmp(18, 30), r = PEOPLE.robes[i % 6], r2 = shade(r, 0.75);
    const v = kind === "woman" ? PEOPLE.robes[(i + 3) % 6] : (kind === "elder" ? PEOPLE.grey : (i % 2 ? PEOPLE.veil : PEOPLE.veil2));
    const skin = kind === "elder" ? PEOPLE.skin2 : PEOPLE.skin;
    const legF = [[0, 0], [-2, 2], [2, -2]][frame % 3]; // leg offsets
    // legs
    b.rect(6 + legF[0], 22, 2, 6, skin); b.rect(9 + legF[1], 22, 2, 6, skin);
    b.rect(5 + legF[0], 27, 3, 1, INK); b.rect(9 + legF[1], 27, 3, 1, INK); // sandals
    // robe (trapezoid), women's to the ankle
    b.poly([[6, 9], [11, 9], [13, kind === "woman" ? 27 : 23], [4, kind === "woman" ? 27 : 23]], r);
    b.rect(5, 15, 8, 1, PEOPLE.belt); // belt
    for (let y = 10; y < 26; y += 3) b.px(11, y, r2); // fold
    // arms
    b.rect(3, 10, 3, 2, r); b.rect(3, 12, 2, 5, r); b.rect(3, 17, 2, 2, skin);
    b.rect(11, 10, 3, 2, r); b.rect(12, 12, 2, 5, r); b.rect(12, 17, 2, 2, skin);
    // head + headcloth
    b.ellipse(8.5, 5, 3, 3.5, skin);
    b.poly([[5, 2], [12, 2], [13, 6], [12, 9], [11, 6], [6, 6], [5, 9], [4, 6]], v); // headcloth falls to shoulders
    b.rect(6, 2, 5, 1, shade(v, 0.8)); // head band
    b.rect(6, 4, 5, 4, skin); // face
    b.px(9, 5, INK); // eye (facing right)
    if (kind === "elder") { b.rect(6, 7, 5, 3, PEOPLE.grey); b.rect(7, 10, 3, 2, PEOPLE.grey); } // beard
    else if (kind === "man") { b.rect(6, 8, 5, 1, PEOPLE.hair); b.rect(7, 9, 3, 1, PEOPLE.hair); }
    if (kind === "elder" || opts.staff) { b.rect(15, 4, 1, 24, PEOPLE.staff); b.rect(14, 3, 3, 1, PEOPLE.staff); b.rect(14, 17, 2, 2, skin); }
    if (kind === "woman" && opts.jar) { b.rect(5, -1 + 1, 7, 1, INK); b.ellipse(8.5, -1 + 1, 3, 1, "#b8794a"); }
    return b.outline(INK);
  }
  function kidHero(i, frame) {
    const b = new Bmp(12, 20), r = PEOPLE.robes[(i + 1) % 6];
    const legF = [[0, 0], [-1, 1], [1, -1]][frame % 3];
    b.rect(4 + legF[0], 15, 2, 4, PEOPLE.skin); b.rect(6 + legF[1], 15, 2, 4, PEOPLE.skin);
    b.poly([[4, 7], [8, 7], [9, 16], [3, 16]], r); b.rect(2, 8, 2, 5, r); b.rect(8, 8, 2, 5, r);
    b.ellipse(6, 4, 2.5, 3, PEOPLE.skin); b.rect(3, 1, 6, 2, PEOPLE.hair); b.px(7, 4, INK);
    return b.outline(INK);
  }
  function riderHero(kind, i, opts) { // seated, legs to the left side (facing right)
    opts = opts || {};
    const b = new Bmp(16, 22), r = PEOPLE.robes[i % 6], v = kind === "woman" ? PEOPLE.robes[(i + 3) % 6] : PEOPLE.veil, skin = PEOPLE.skin;
    b.poly([[5, 8], [11, 8], [12, 18], [4, 18]], r); // torso + lap
    b.rect(2, 15, 5, 2, r); b.rect(2, 17, 2, 4, skin); b.rect(1, 20, 3, 1, INK); // leg hanging on near side
    b.rect(4, 13, 6, 1, PEOPLE.belt);
    b.rect(11, 10, 3, 2, r); b.rect(13, 12, 2, 3, skin); // arm forward (reins)
    b.ellipse(8, 4, 3, 3.5, skin); b.poly([[4, 1], [12, 1], [13, 5], [11, 8], [11, 5], [6, 5], [5, 8], [3, 5]], v); b.rect(6, 1, 5, 1, shade(v, 0.8));
    b.rect(6, 3, 5, 4, skin); b.px(9, 4, INK);
    if (kind === "man") { b.rect(6, 7, 5, 1, PEOPLE.hair); b.rect(7, 8, 3, 1, PEOPLE.hair); }
    if (opts.baby) { b.ellipse(3, 11, 2, 2, skin); b.rect(1, 12, 5, 4, PEOPLE.veil2); }
    return b.outline(INK);
  }
  function kidRider(i) {
    const b = new Bmp(11, 16), r = PEOPLE.robes[(i + 1) % 6];
    b.poly([[3, 6], [8, 6], [9, 13], [2, 13]], r); b.rect(1, 11, 3, 2, r); b.rect(1, 13, 2, 3, PEOPLE.skin);
    b.rect(8, 8, 3, 2, r); b.ellipse(5.5, 3, 2.5, 3, PEOPLE.skin); b.rect(3, 0, 6, 2, PEOPLE.hair); b.px(7, 3, INK);
    return b.outline(INK);
  }
  function camelHero(frame, opts) { // dromedary facing right, ~46 x 34
    opts = opts || {};
    const b = new Bmp(54, 36), c = CAMEL.body, d = CAMEL.dark, l = CAMEL.light;
    // legs (4), two frames of stride
    const st = [[0, 0, 0, 0], [2, -2, 2, -2], [-2, 2, -2, 2]][frame % 3];
    const legs = [[12, st[0]], [17, st[1]], [30, st[2]], [35, st[3]]];
    legs.forEach(([x, s], k) => { const col = k % 2 ? d : c; b.rect(x, 18, 2, 8, col); b.rect(x + s / 2, 26, 2, 7, col); b.rect(x + s / 2, 33, 3, 2, CAMEL.hoof); b.px(x + s / 2, 26, shade(col, 0.85)); });
    // body + hump
    b.ellipse(24, 15, 13, 5, c); b.ellipse(24, 10, 7, 5, c); // hump
    b.ellipse(24, 13, 12, 3, l); b.ellipse(24, 17, 12, 2, d); b.ellipse(24, 10, 5, 2, l); // volume
    // neck (curving up-right) and head
    b.line(35, 13, 41, 5, c, 5); b.line(35, 13, 41, 5, l, 2);
    b.ellipse(43, 5, 4, 3, c); b.rect(45, 5, 3, 3, c); b.rect(46, 7, 2, 1, d); // head + muzzle
    b.px(44, 4, INK); b.rect(41, 2, 1, 2, d); b.rect(43, 2, 1, 2, d); // eye, ears
    // tail
    b.line(11, 13, 8, 20, d, 1); b.rect(7, 20, 2, 3, INK);
    // saddle blanket over the hump, fringe, girth, rein
    if (opts.saddle !== false) { b.poly([[15, 10], [33, 10], [34, 16], [14, 16]], CAMEL.blanket); for (let x = 15; x < 34; x += 3) b.rect(x, 15, 1, 3, CAMEL.blanket2); b.rect(15, 12, 19, 1, CAMEL.blanket2); b.rect(22, 16, 2, 6, CAMEL.rope); }
    b.line(46, 7, 34, 12, CAMEL.rope, 1);
    if (opts.bags) { b.rect(12, 12, 5, 7, DONKEY.pack); b.rect(12, 12, 5, 1, DONKEY.pack2); b.rect(13, 14, 3, 1, DONKEY.pack2); }
    return b.outline(INK);
  }
  function donkeyHero(frame, opts) { // ~28 x 22, facing right
    opts = opts || {};
    const b = new Bmp(34, 24), c = DONKEY.body, d = DONKEY.dark, l = DONKEY.light;
    const st = [[0, 0, 0, 0], [1, -1, 1, -1], [-1, 1, -1, 1]][frame % 3];
    [[7, st[0]], [11, st[1]], [19, st[2]], [23, st[3]]].forEach(([x, s], k) => { const col = k % 2 ? d : c; b.rect(x, 14, 2, 4, col); b.rect(x + s, 18, 2, 4, col); b.rect(x + s, 22, 2, 1, CAMEL.hoof); });
    b.ellipse(15, 11, 10, 5, c); b.ellipse(15, 9, 9, 3, l); b.ellipse(15, 13, 9, 2, d);
    b.line(24, 9, 26, 4, c, 3); b.ellipse(27, 3, 3, 2.5, c); b.rect(29, 3, 2, 2, DONKEY.muzzle); b.px(28, 2, INK);
    b.rect(25, 0, 1, 3, c); b.rect(27, 0, 1, 3, c); // long ears
    b.line(5, 10, 3, 15, d, 1); b.rect(2, 15, 2, 2, INK);
    b.rect(11, 6, 9, 1, DONKEY.dark); // back stripe
    if (opts.pack) { // baggage: two bundles, a waterskin, a rolled tent
      b.rect(8, 3, 14, 6, DONKEY.pack); b.rect(8, 3, 14, 1, DONKEY.pack2); b.rect(14, 3, 1, 6, DONKEY.pack2);
      b.ellipse(11, 1, 4, 2, "#b09a6a"); b.rect(7, 2, 8, 1, "#8a6a3a"); // rolled tent
      b.ellipse(21, 9, 3, 4, "#a86e42"); b.rect(21, 4, 1, 2, "#6b4a2a"); // waterskin
      b.rect(9, 9, 12, 1, CAMEL.rope); b.rect(14, 9, 1, 5, CAMEL.rope); // ropes
      b.rect(6, 6, 2, 5, "#e6b422"); // a pot
    }
    if (opts.blanket) { b.rect(10, 6, 10, 4, PEOPLE.robes[(opts.i || 0) % 6]); for (let x = 10; x < 20; x += 2) b.px(x, 10, "#e6b422"); }
    return b.outline(INK);
  }
  function oxCartHero(frame) { // ox + two-wheeled covered cart (Num 7:3 'agalot tsav'), ~64 x 30
    const b = new Bmp(72, 32);
    // cart body
    b.rect(2, 16, 26, 6, CART.wood); b.rect(2, 16, 26, 1, CART.wood2); b.rect(2, 21, 26, 1, CART.wood2);
    b.poly([[3, 16], [27, 16], [26, 6], [22, 3], [8, 3], [4, 6]], CART.canvas); // rounded canvas cover
    b.rect(4, 12, 23, 1, CART.canvas2); b.rect(4, 8, 23, 1, CART.canvas2); b.rect(15, 3, 1, 13, CART.canvas2);
    // wheel (one visible, spoked)
    b.ellipse(15, 24, 7, 7, CART.wheel); b.ellipse(15, 24, 5, 5, null); b.ellipse(15, 24, 1.5, 1.5, CART.iron);
    for (let a = 0; a < 6; a++) { const dx = Math.cos(a * Math.PI / 3) * 5, dy = Math.sin(a * Math.PI / 3) * 5; b.line(15, 24, 15 + dx, 24 + dy, CART.wood, 1); }
    // pole / yoke to ox
    b.line(28, 19, 42, 15, CART.wood, 1); b.rect(42, 12, 2, 6, CART.wood2);
    // ox
    const st = [[0, 0], [2, -2], [-2, 2]][frame % 3], c = OX.body, d = OX.dark;
    [[46, st[0]], [50, st[1]], [58, st[0]], [62, st[1]]].forEach(([x, s], k) => { b.rect(x, 22, 3, 4, k % 2 ? d : c); b.rect(x + s / 2, 26, 3, 5, k % 2 ? d : c); b.rect(x + s / 2, 30, 3, 2, CAMEL.hoof); });
    b.ellipse(54, 18, 11, 6, c); b.ellipse(54, 16, 10, 3, OX.light); b.ellipse(54, 21, 10, 2, d);
    b.rect(62, 11, 4, 8, c); b.ellipse(64, 14, 3, 4, c); b.rect(65, 16, 2, 2, DONKEY.muzzle); b.px(64, 12, INK);
    b.line(62, 10, 60, 7, OX.horn, 1); b.line(66, 10, 67, 7, OX.horn, 1); // horns
    b.line(44, 16, 42, 22, d, 1); b.rect(41, 22, 2, 3, INK); // tail
    b.rect(43, 11, 22, 1, CART.wood2); // yoke across the neck
    return b.outline(INK);
  }
  function sheepHero(frame) { const b = new Bmp(16, 12); const st = frame % 2 ? 1 : 0; b.rect(4, 8, 2, 3, INK); b.rect(7 + st, 8, 2, 3, INK); b.rect(11 - st, 8, 2, 3, INK); b.ellipse(8, 5, 6, 3.5, "#f2ecd8"); b.ellipse(8, 4, 5, 2, "#ffffff"); b.ellipse(13, 5, 2.5, 2, "#3a2a1a"); b.px(14, 4, "#ffffff"); return b.outline(INK); }

  /* ============================================================
     LANDSCAPE (copied from scenes_deluxe so postcards can be drawn
     stand-alone; on insertion these call the existing helpers)
     ============================================================ */
  const W = 280, H = 120, P = 2;
  let ctx, T = 0;
  const px = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x) * P, Math.round(y) * P, P, P); };
  const rect = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x) * P, Math.round(y) * P, Math.round(w) * P, Math.round(h) * P); };
  const vgrad = (y0, y1, c0, c1) => { for (let y = y0; y < y1; y++) rect(0, y, W, 1, mix(c0, c1, (y - y0) / Math.max(1, y1 - y0 - 1))); };
  const text = (s, x, y, c, size) => { ctx.fillStyle = c; ctx.font = (size || 12) + "px 'Press Start 2P', monospace"; ctx.fillText(s, x * P, y * P); };
  const textC = (s, y, c, size) => { ctx.font = (size || 12) + "px 'Press Start 2P', monospace"; const w = ctx.measureText(s).width; ctx.fillStyle = c; ctx.fillText(s, (W * P - w) / 2, y * P); };
  const SKY = { dawn: ["#3a3f7a", "#f0a469"], day: ["#3f86d6", "#a8d4f2"], noon: ["#2f78cf", "#9ccbf0"], dusk: ["#2a2657", "#ff8a3d"], night: ["#04081c", "#16264a"] };
  const skyAt = t => { const k = [[0, "dawn"], [0.12, "day"], [0.45, "noon"], [0.7, "day"], [0.82, "dusk"], [0.9, "night"], [1, "dawn"]]; for (let i = 0; i < k.length - 1; i++) if (t >= k[i][0] && t <= k[i + 1][0]) { const u = (t - k[i][0]) / (k[i + 1][0] - k[i][0]); const a = SKY[k[i][1]], b = SKY[k[i + 1][1]]; return [mix(a[0], b[0], u), mix(a[1], b[1], u)]; } return SKY.day; };
  const darkAt = t => t < 0.82 ? 0 : t < 0.9 ? (t - 0.82) / 0.08 * 0.55 : t < 0.97 ? 0.55 : 0.55 - (t - 0.97) / 0.03 * 0.55;
  const REGION = {
    sinai: { far: "#b58a8c", mid: "#8a5a5e", near: "#6e4245", sand: "#dcb97e", sand2: "#c79b5f", rock: "#8c6a4a", scrub: "#7f8a4a" },
    paran: { far: "#dccbb0", mid: "#c3a97f", near: "#a68a5e", sand: "#e6cf9a", sand2: "#cfb27a", rock: "#a89272", scrub: "#9a9a5c" },
    arabah: { far: "#8c7a70", mid: "#5f4a42", near: "#43332e", sand: "#d3924f", sand2: "#b87a3f", rock: "#6d5548", scrub: "#7a7a3f" },
    moab: { far: "#a9b7ad", mid: "#7d8f5a", near: "#5e7040", sand: "#c9c48a", sand2: "#a8a86a", rock: "#8a8a6a", scrub: "#4f7a3a" }
  };
  const vnoise = (x, seed) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i, seed), hash(i + 1, seed), u); };
  function terrain(base, amp, freq, seed, scroll, k, color, jag, hh) {
    hh = hh || H; let prev = null;
    for (let i = 0; i < W; i++) {
      const wx = i + scroll * k + seed * 1000;
      let h = Math.sin(wx * freq) * 0.5 + Math.sin(wx * freq * 2.3 + seed) * 0.3 + Math.sin(wx * freq * 0.37 + seed * 2) * 0.6;
      if (jag) h += (vnoise(wx / 9, seed) - 0.5) * jag * 0.12 + (vnoise(wx / 3, seed + 5) - 0.5) * jag * 0.04;
      const y = Math.round(base - amp * (0.5 + 0.5 * h));
      rect(i, y, 1, hh - y, color);
      if (prev !== null && y < prev) rect(i, y, 1, Math.min(4, prev - y + 1), shade(color, 1.12));
      prev = y;
    }
  }
  function sunMoon(t) { const st = clamp(t / 0.85, 0, 1); const sx = 20 + st * 240, sy = 62 - Math.sin(st * Math.PI) * 54; if (t < 0.87) { const c = t < 0.1 || t > 0.72 ? "#ffb347" : "#fff3b0"; rect(sx - 3, sy - 1, 7, 3, c); rect(sx - 2, sy - 2, 5, 5, c); rect(sx - 1, sy - 3, 3, 7, c); } if (t > 0.88 || t < 0.03) for (let i = 0; i < 50; i++) if (hash(i, 77) < 0.9) px(hash(i, 3) * W, hash(i, 7) * 55, "#dfe6ff"); }
  function clouds(sc) { for (let i = 0; i < 5; i++) { const x = ((hash(i, 21) * W * 1.5) - sc * 0.05 - T * 1.2) % (W + 60); const cx = ((x % (W + 60)) + W + 60) % (W + 60) - 30, cy = 8 + hash(i, 22) * 22; ctx.save(); ctx.globalAlpha = 0.85; rect(cx, cy + 2, 18 + hash(i, 23) * 14, 3, "#ffffff"); rect(cx + 4, cy, 10 + hash(i, 23) * 8, 2, "#ffffff"); rect(cx + 2, cy + 5, 14 + hash(i, 23) * 10, 1, "#dde6f0"); ctx.restore(); } }
  function landscape(o) {
    const R = REGION[o.region || "sinai"], t = o.t === undefined ? 0.35 : o.t, sc = o.scroll || 0, hh = o.H || H, hz = o.horizon || 70;
    const sky = skyAt(t); vgrad(0, hz, sky[0], sky[1]); sunMoon(t); if (o.clouds !== false && t > 0.05 && t < 0.85) clouds(sc);
    if (o.bigMountain) { terrain(hz, 44, 0.012, 9, sc, 0.05, R.far, 3, hh); terrain(hz + 2, 66, 0.011, 3, sc, 0.02, R.mid, 6, hh); terrain(hz + 2, 26, 0.03, 6, sc, 0.12, R.near, 4, hh); }
    else if (!o.noHills) { terrain(hz - 4, 30, 0.02, 1, sc, 0.08, R.far, 4, hh); terrain(hz - 2, 20, 0.032, 2, sc, 0.18, R.mid, 5, hh); }
    if (!o.flat && !o.noHills) terrain(hz + 1, 10, 0.05, 4, sc, 0.35, R.near, 3, hh);
    rect(0, hz, W, hh - hz, R.sand);
    for (let y = hz + 6; y < hh; y += 2) for (let x = 0; x < W; x++) if (hash(x + Math.floor(sc), y) < 0.12) px(x, y, R.sand2);
    if (o.water) { const w = o.water; rect(0, w.y, W, w.h, "#2f6fa8"); for (let j = 0; j < w.h; j++) for (let i = 0; i < W; i += 2) if ((i + j * 3 + Math.floor(T * 6)) % 9 < 3) px(i, w.y + j, j % 2 ? "#5aa0d8" : "#8ac6ee"); rect(0, w.y, W, 1, "#a9d8f2"); }
    return R;
  }
  function nightShade(t, hh) { const d = darkAt(t); if (d > 0) { ctx.save(); ctx.globalAlpha = d; rect(0, 0, W, hh || H, "#050a20"); ctx.restore(); } }

  /* ---------- pillar redraw: a real column, ground to sky ---------- */
  function pillar(x, yBase, t, night, hh) {
    // a column that frays and widens at the top; day = cloud, night = fire
    for (let j = 0; j < yBase; j++) {
      const k = j / yBase; // 0 top .. 1 base
      const w = 4 + (1 - k) * (1 - k) * 14 + Math.sin(j * 0.22 + t * 1.6) * 1.5 + Math.sin(j * 0.07 - t) * 2;
      const wob = Math.sin(j * 0.12 + t * 1.8) * (1.5 + (1 - k) * 2);
      const x0 = x - w / 2 + wob;
      if (!night) { rect(x0, j, w, 1, "#e6ebf2"); rect(x0 + 1, j, Math.max(1, w * 0.5), 1, "#ffffff"); if (hash(j, Math.floor(t * 4)) < 0.25) px(x0 - 1, j, "#e6ebf2"); if (hash(j + 9, Math.floor(t * 4)) < 0.25) px(x0 + w, j, "#e6ebf2"); }
      else { const fl = hash(j, Math.floor(t * 12)); rect(x0, j, w, 1, fl < 0.3 ? "#ffd23f" : fl < 0.7 ? "#ff8c2a" : "#ff5a1f"); rect(x0 + w * 0.3, j, Math.max(1, w * 0.35), 1, "#fff3b0"); }
    }
    // frayed crown
    for (let i = 0; i < 12; i++) { const a = hash(i, 5) * 22 - 11, y = hash(i, 6) * 6; px(x + a, y, night ? "#ff8c2a" : "#e6ebf2"); }
    if (night) { ctx.save(); ctx.globalAlpha = 0.2; ctx.fillStyle = "#ffb347"; ctx.beginPath(); ctx.arc(x * P, (yBase - 10) * P, 60 * P / 2, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  }
  /* ---------- nation silhouette: people to the horizon ---------- */
  function nationSilhouette(y, scroll, col) {
    col = col || "#4a3428";
    for (let i = -10; i < W + 10; i += 1) {
      const wx = Math.floor((i + scroll * 0.25) / 4); const r = hash(wx, 41);
      const cell = Math.floor((i + scroll * 0.25)) % 4;
      if (r < 0.55) { if (cell < 2) rect(i, y - 3, 1, 3, col); if (cell === 0) px(i, y - 4, col); }           // a figure
      else if (r < 0.75) { if (cell === 1) rect(i, y - 3, 1, 3, col); else if (cell < 3) rect(i, y - 2, 1, 2, col); } // a tent
      else if (r < 0.82) { if (cell === 0) { rect(i, y - 7, 1, 7, col); rect(i + 1, y - 7, 2, 2, PEOPLE.robes[wx % 6]); } } // a standard
      else if (r < 0.9 && cell < 3) rect(i, y - 2, 1, 2, col); // a beast
    }
    ctx.save(); ctx.globalAlpha = 0.4; rect(0, y - 8, W, 5, "#e9d8b0"); ctx.restore(); // dust over the column
  }

  /* ============================================================
     HERO GROUP — three options for mounts/baggage
     ============================================================ */
  function heroGroup(opt, frame, x0, y, o) {
    // opt: "A" camel + kid donkeys + pack donkey; "B" camel + kid donkeys + ox-cart; "C" donkeys only (no camel)
    o = o || {}; let x = x0; const f = frame;
    const place = (b, dx, dy) => { b.draw(ctx, x + dx, y - b.h + dy, P); };
    if (opt !== "C") {
      // father walks ahead leading the camel (a man leads; the 1992 wagon had a walker too)
      place(personHero("man", 0, f, { staff: true }), 46, 0);
      const cam = camelHero(f, { bags: true }); place(cam, 0, 0);
      const rm = riderHero("man", 0); rm.draw(ctx, x + 18, y - cam.h - 2, P);
      const rw = riderHero("woman", 1, { baby: false }); rw.draw(ctx, x + 9, y - cam.h - 0, P);
      x -= 30;
    } else {
      place(personHero("man", 0, f, { staff: true }), 4, 0); x -= 12;
      place(personHero("woman", 1, (f + 1) % 3, { jar: true }), 4, 0); x -= 16;
    }
    // children on donkeys
    const d1 = donkeyHero(f, { blanket: true, i: 4 }); d1.draw(ctx, x, y - d1.h, P); kidRider(4).draw(ctx, x + 10, y - d1.h - 6, P); x -= 24;
    const d2 = donkeyHero((f + 1) % 3, { blanket: true, i: 5 }); d2.draw(ctx, x, y - d2.h + 1, P); kidRider(5).draw(ctx, x + 10, y - d2.h - 5, P); x -= 26;
    // the elder walks — "leaning on the staff, and will not be carried"
    place(personHero("elder", 2, (f + 2) % 3), 6, 0); x -= 18;
    // baggage
    if (opt === "B") { const cart = oxCartHero(f); cart.draw(ctx, x - 64, y - cart.h + 1, P); x -= 70; }
    else { const pk = donkeyHero((f + 2) % 3, { pack: true }); pk.draw(ctx, x - 2, y - pk.h + 1, P); x -= 30; if (opt === "C") { const pk2 = donkeyHero(f, { pack: true }); pk2.draw(ctx, x - 2, y - pk2.h + 1, P); x -= 30; } }
    // the flock
    for (let i = 0; i < (o.sheep === undefined ? 4 : o.sheep); i++) { const s = sheepHero(f + i); s.draw(ctx, x - i * 13, y - s.h + (i % 2), P); }
    // dust
    for (let i = 0; i < 12; i++) { const dx = x0 + 60 - ((T * 25 + i * 21) % 200), dy = y - hash(i, Math.floor(T * 3)) * 3; ctx.save(); ctx.globalAlpha = 0.35; px(dx, dy, "#e9d8b0"); ctx.restore(); }
  }

  function heroGroupFor(St, tSec, x0, y, o) {
    o = o || {}; const f = [0, 1, 0, 2][Math.floor(tSec * 6) % 4];
    const party = St && St.party ? St.party.filter(p => p.alive) : null;
    if (!party) return heroGroup("A", f, x0, y, o);
    const adults = party.filter(p => p.age >= 18 && p.age < 55), elders = party.filter(p => p.age >= 55), kids = party.filter(p => p.age < 18);
    const donkeys = St.donkeys || 0, sheep = Math.min(7, Math.ceil((St.flock || 0) / 4));
    let x = x0;
    const place = (b, dx, dy) => b.draw(ctx, x + dx, y - b.h + (dy || 0), P);
    // the head of the household leads on foot; the other adult rides the camel (both ride if a third adult exists)
    if (adults.length) { place(personHero("man", 0, f, { staff: true }), 46, 0); }
    if (adults.length >= 2 || (adults.length === 1 && !elders.length)) {
      const cam = camelHero(f, { bags: true }); place(cam, 0, 0);
      if (adults.length >= 2) riderHero("woman", 1).draw(ctx, x + 9, y - cam.h, P);
      if (adults.length >= 3) riderHero("man", 2).draw(ctx, x + 18, y - cam.h - 2, P);
      x -= 26;
    } else x -= 6;
    let dk = 0;
    kids.forEach((k, i) => { if (dk < donkeys) { const d = donkeyHero((f + i) % 3, { blanket: true, i: 4 + i }); d.draw(ctx, x, y - d.h + (i % 2), P); kidRider(4 + i).draw(ctx, x + 10, y - d.h - 6 + (i % 2), P); x -= 23; dk++; } else { place(kidHero(4 + i, (f + i) % 3), 2, 0); x -= 13; } });
    elders.forEach((e, i) => { place(personHero("elder", 2 + i, (f + 2 + i) % 3), 6, 0); x -= 16; });
    if (donkeys > dk) { const pk = donkeyHero((f + 1) % 3, { pack: true }); pk.draw(ctx, x - 2, y - pk.h + 1, P); x -= 28; } // one pack donkey stands for the rest
    const ns = o.sheep === undefined ? Math.min(sheep, Math.max(0, Math.floor((x + 4) / 11))) : o.sheep; // only as many as fit in the frame
    for (let i = 0; i < ns; i++) { const s = sheepHero(f + i); s.draw(ctx, x + 2 - i * 11, y - s.h + (i % 2), P); }
    if (o.dust !== false) for (let i = 0; i < 12; i++) { const dx = x0 + 60 - ((T * 25 + i * 21) % 200), dy = y - hash(i, Math.floor(T * 3)) * 3; ctx.save(); ctx.globalAlpha = 0.35; px(dx, dy, "#e9d8b0"); ctx.restore(); }
  }

  /* ============================================================
     LAYOUT OPTIONS for "family always large in front, background changes"
     ============================================================ */
  const LAYOUT = {};
  // 1. WAGON STRIP — one taller frame (280x150). Postcard above, hero band below, one ground.
  LAYOUT.strip = (bg, opt, f, t) => {
    const hh = 150; const R = landscape(Object.assign({ H: hh, horizon: 78 }, bg));
    nationSilhouette(78, T * 30);
    pillar(232, 92, t, bg.t > 0.86);
    // near ground darker so the hero pops
    for (let i = 0; i < 14; i++) { const x = ((hash(i, 31) * (W + 40)) - (bg.scroll || 0) * 0.5 + W * 8) % (W + 40) - 20, y = 84 + hash(i, 32) * 22; if (hash(i, 33) < 0.5) { const b = new Bmp(10, 7); b.ellipse(5, 3, 4, 2.5, R.scrub); b.ellipse(4, 2, 2, 1, shade(R.scrub, 1.2)); b.rect(4, 5, 2, 2, "#6b4a2a"); b.outline(INK); b.draw(ctx, x, y, P); } else { const b = new Bmp(8, 5); b.ellipse(4, 2, 4, 2, R.rock); b.ellipse(3, 1, 2, 1, shade(R.rock, 1.2)); b.outline(INK); b.draw(ctx, x, y, P); } }
    for (let x = 0; x < W; x++) { const y = 106 - 5 * (0.5 + 0.5 * Math.sin(x * 0.045) * Math.cos(x * 0.013 + 1)); rect(x, y, 1, hh - y, shade(R.sand, 0.94)); if (Math.cos(x * 0.045) > 0.2) px(x, y, shade(R.sand, 1.1)); }
    for (let x = 0; x < W; x += 2) if (hash(x, 3) < 0.3) px(x, 112 + hash(x, 4) * 30, R.sand2);
    heroGroup(opt, f, 190, 148);
    nightShade(bg.t, hh);
  };
  // 2. INTEGRATED — standard 280x120 frame; the hero group stands in the scene at its natural (2x-old) size, anchored bottom-right.
  LAYOUT.integrated = (bg, opt, f, t) => {
    landscape(Object.assign({ horizon: 66 }, bg)); nationSilhouette(66, T * 30); pillar(236, 80, t, bg.t > 0.86);
    heroGroup(opt, f, 190, 118, { sheep: 3 });
    nightShade(bg.t);
  };
  // 3. SPLIT PANEL — scene untouched (280x120) + a separate 280x40 hero panel with its own ground, like 1992's wagon-with-status.
  LAYOUT.split = (bg, opt, f, t) => {
    landscape(bg); nationSilhouette(70, T * 30); pillar(236, 84, t, bg.t > 0.86); nightShade(bg.t);
    const R = REGION[bg.region || "sinai"];
    rect(0, H, W, 2, "#5a3e28"); rect(0, H + 2, W, 40, shade(R.sand, 0.96)); for (let x = 0; x < W; x += 2) if (hash(x, 9) < 0.25) px(x, H + 6 + hash(x, 8) * 34, R.sand2);
    heroGroup(opt, f, 190, H + 40);
  };

  /* ============================================================
     PORTRAIT STRIP — 16x16 faces, one per household role
     ============================================================ */
  function portrait(kind, i, state) {
    const b = new Bmp(16, 16), r = PEOPLE.robes[i % 6];
    const v = kind === "woman" ? PEOPLE.robes[(i + 3) % 6] : kind === "elder" ? PEOPLE.grey : PEOPLE.veil;
    const skin = kind === "elder" ? PEOPLE.skin2 : PEOPLE.skin;
    b.rect(0, 0, 16, 16, "#1a0e06"); b.rect(1, 1, 14, 14, kind === "kid" ? "#3d3a5a" : "#4a3220");
    b.rect(3, 13, 10, 3, r); // shoulders
    b.ellipse(8, 8, 4, 4.5, skin);
    if (kind === "kid") { b.rect(4, 3, 8, 3, PEOPLE.hair); b.ellipse(8, 9, 3.5, 4, skin); }
    else { b.poly([[3, 3], [13, 3], [14, 8], [13, 13], [12, 8], [4, 8], [3, 13], [2, 8]], v); b.rect(5, 3, 6, 1, shade(v, 0.8)); b.rect(5, 6, 6, 4, skin); }
    b.px(6, 7, INK); b.px(10, 7, INK); // eyes
    if (kind === "elder") { b.rect(5, 10, 6, 3, PEOPLE.grey); b.rect(6, 13, 4, 1, PEOPLE.grey); }
    else if (kind === "man") b.rect(5, 10, 6, 1, PEOPLE.hair);
    if (state === "ill") { b.rect(5, 9, 6, 1, "#8a9a5a"); b.px(4, 12, "#8ac6ee"); } // sallow, a bead of sweat
    if (state === "dead") { for (let y = 1; y < 15; y++) for (let x = 1; x < 15; x++) if ((x + y) % 2) b.px(x, y, "#1a0e06"); }
    return b;
  }
  function portraitStrip(x, y, party, look) {
    party.forEach((p, i) => {
      const kind = p.age >= 55 ? "elder" : p.age < 18 ? "kid" : (i % 2 ? "woman" : "man");
      const state = !p.alive ? "dead" : p.ill ? "ill" : "well";
      const b = look === "classic" ? portraitClassic(kind, i, state) : portrait(kind, i, state); b.draw(ctx, x + i * 52, y, P);
      // health bar + name
      const hp = p.alive ? p.hp : 0, col = hp > 75 ? "#3f8a5a" : hp > 50 ? "#e6b422" : hp > 25 ? "#ff8c2a" : "#a63d2f";
      rect(x + i * 52 + 18, y + 2, 30, 4, look === "classic" ? "#1a7a1a" : "#4a3220"); rect(x + i * 52 + 18, y + 2, Math.round(30 * hp / 100), 4, look === "classic" ? "#33ff33" : col);
      text(p.name.slice(0, 8).toUpperCase(), x + i * 52 + 18, y + 12, look === "classic" ? "#33ff33" : "#3a2a1a", 6);
      text(!p.alive ? "DEAD" : p.ill ? p.ill.toUpperCase().slice(0, 9) : hp > 75 ? "WELL" : hp > 50 ? "TIRED" : "WEAK", x + i * 52 + 18, y + 17, look === "classic" ? "#1a7a1a" : (hp > 50 ? "#5a3e28" : "#a63d2f"), 5);
    });
  }
  function portraitClassic(kind, i, state) { // white line-art version for the Classic look
    const b = portrait(kind, i, state); const o = new Bmp(16, 16);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const c = b.d[y * 16 + x]; if (!c) continue; if (c === "#1a0e06" || c === "#4a3220" || c === "#3d3a5a") continue; if (c === INK) o.px(x, y, "#ffffff"); else if (c === PEOPLE.skin || c === PEOPLE.skin2) o.px(x, y, "#33ff33"); else o.px(x, y, kind === "kid" && y < 6 ? "#ffffff" : "#1a7a1a"); }
    return o;
  }

  /* ============================================================
     POSTCARDS — one big object per stop
     ============================================================ */
  const CARD = {};
  function label(s) { ctx.font = "7px 'Press Start 2P', monospace"; const w = ctx.measureText(s).width / P + 8; ctx.save(); ctx.globalAlpha = 0.7; rect(0, 0, w, 11, "#1a0e06"); ctx.restore(); rect(0, 11, w, 1, "#e6b422"); text(s, 4, 8, "#f5e9cf", 7); }
  function palm(x, y, big) { // big palm ~ 20 x 36
    const b = new Bmp(26, 40); b.rect(11, 12, 3, 28, "#8a6a3a"); for (let j = 12; j < 40; j += 4) b.rect(11, j, 3, 1, "#6b4a2a");
    const fr = [[-10, 4], [-8, -2], [-3, -6], [3, -6], [8, -2], [10, 4]]; fr.forEach(([dx, dy]) => { b.line(12, 12, 12 + dx, 12 + dy, "#2c6a2a", 3); b.line(12, 12, 12 + dx, 12 + dy, "#3f8a3a", 1); });
    b.rect(10, 10, 5, 3, "#c98a2e"); b.outline(INK); b.draw(ctx, x, y - 40, P);
  }
  function tent(x, y, i) { const b = new Bmp(22, 12); const c = ["#6b5a48", "#8a6a4a", "#5a4a3a"][i % 3]; b.poly([[0, 11], [11, 0], [21, 11]], c); b.poly([[6, 11], [11, 4], [16, 11]], shade(c, 0.8)); b.rect(9, 6, 3, 5, INK); b.outline(INK); b.draw(ctx, x, y - 12, P); }
  function crowd(x, y, n, f, seed) { for (let i = 0; i < n; i++) { const k = hash(i, seed) < 0.4 ? "man" : hash(i, seed) < 0.75 ? "woman" : "elder"; const p = personHero(k, i, (f + i) % 3); const b = p.scale(1); b.draw(ctx, x + i * 13 + hash(i, seed + 1) * 6, y - b.h + (i % 2) * 2, P); } }

  CARD.marah = (f, t) => { // the bitter pool, foreground, dark; a man throwing the branch; people turning away
    landscape({ region: "sinai", t: 0.5, horizon: 64 });
    const pool = new Bmp(170, 30); pool.ellipse(85, 15, 84, 13, "#2a4a44"); pool.ellipse(60, 18, 50, 9, "#355a52"); pool.ellipse(120, 13, 40, 7, "#355a52"); for (let i = 0; i < 40; i++) { const rx = 10 + hash(i, 2) * 150, ry = 6 + hash(i, 3) * 18; if (pool.get(rx, ry)) pool.rect(rx, ry, 3 + (i % 3), 1, (i + Math.floor(T * 2)) % 3 ? "#5a8a7a" : "#8ab0a0"); } pool.outline("#8a7a4a"); pool.draw(ctx, 55, 88, P);
    for (let i = 0; i < 12; i++) { const x = 60 + hash(i, 5) * 160, y = 86 + hash(i, 6) * 2; px(x, y, "#c9b99a"); } // salt crust at the rim
    const m = personHero("man", 0, 0, { staff: true }); m.draw(ctx, 24, 96 - m.h, P);
    for (let k = 0; k < 14; k++) { const bx = 46 + k * 3, by = 70 - Math.sin(k / 13 * Math.PI) * 14; rect(bx, by, 3, 2, "#8a6a3a"); if (k % 4 === 0) px(bx + 1, by - 1, "#3f8a3a"); } // the branch in the air
    crowd(196, 90, 4, f, 7);
    const w = personHero("woman", 1, 0, { jar: true }); w.draw(ctx, 236, 118 - w.h, P);
    label("MARAH");
  };
  CARD.elim = (f, t) => { // twelve springs under seventy palms
    landscape({ region: "sinai", t: 0.35, horizon: 62 });
    for (let i = 0; i < 14; i++) palm(-6 + i * 22 + hash(i, 1) * 8, 66 + hash(i, 2) * 10, true);
    for (let i = 0; i < 12; i++) { const sx = 10 + (i % 6) * 44 + hash(i, 4) * 10, sy = 96 + Math.floor(i / 6) * 12; const b = new Bmp(22, 9); b.ellipse(11, 4, 10, 3.5, "#2f6fa8"); b.ellipse(9, 3, 6, 1.5, "#5aa0d8"); b.px(6 + Math.floor(T * 4 + i) % 8, 4, "#a9d8f2"); b.rect(2, 8, 18, 1, "#7f8a4a"); b.outline("#8a7a4a"); b.draw(ctx, sx, sy, P); }
    crowd(120, 110, 3, f, 9); tent(20, 118, 0); tent(240, 116, 1);
    label("ELIM");
  };
  CARD.manna = (f, t) => { // dawn, ground white like frost, baskets
    landscape({ region: "sinai", t: 0.06, horizon: 68 });
    for (let i = 0; i < 400; i++) { const x = hash(i, 11) * W, y = 70 + hash(i, 12) * 50; if (hash(i, 13) < 0.7) px(x, y, "#ffffff"); else rect(x, y, 2, 1, "#f0f4ff"); }
    for (let i = 0; i < 5; i++) tent(10 + i * 30, 78 - (i % 2) * 4, i);
    const w = personHero("woman", 1, 0); w.draw(ctx, 110, 112 - w.h, P); const k = kidHero(4, 1); k.draw(ctx, 134, 112 - k.h, P); const m = personHero("man", 0, 1); m.draw(ctx, 180, 110 - m.h, P);
    // baskets
    [[126, 108], [172, 106], [200, 110]].forEach(([bx, by]) => { const b = new Bmp(12, 8); b.poly([[0, 1], [11, 1], [9, 7], [2, 7]], "#c98a2e"); b.rect(2, 3, 8, 1, "#8a6a3a"); b.rect(0, 0, 12, 1, "#ffffff"); b.outline(INK); b.draw(ctx, bx, by - 8, P); });
    label("THE WILDERNESS OF SIN");
  };
  CARD.rephidim = (f, t, o, St) => { // the rock at Horeb: dry until it is struck, then a river across the whole foreground
    const struck = (o && o.struck) || (St && St.flags && St.flags.rock_struck);
    landscape({ region: "sinai", t: 0.4, horizon: 66, bigMountain: true });
    const rk = new Bmp(60, 44); rk.poly([[4, 43], [10, 14], [22, 2], [40, 6], [56, 20], [59, 43]], "#6e4245"); rk.poly([[12, 30], [20, 10], [36, 8], [48, 22], [50, 43], [12, 43]], "#8a5a5e"); for (let i = 0; i < 40; i++) rk.px(8 + hash(i, 1) * 48, 10 + hash(i, 2) * 30, "#5a3438"); rk.outline(INK); rk.draw(ctx, 110, 56, P);
    if (struck) { // gushing water
      for (let j = 0; j < 40; j++) { const w = 3 + j * 0.3; rect(140 - w / 2 + Math.sin(j * 0.5 + T * 8) * 1, 72 + j, w, 1, j % 2 ? "#8ac6ee" : "#5aa0d8"); }
      rect(0, 104, W, 16, "#2f6fa8"); for (let i = 0; i < W; i += 2) if ((i + Math.floor(T * 8)) % 9 < 3) px(i, 106 + (i % 5) * 2, "#8ac6ee"); rect(0, 104, W, 1, "#a9d8f2");
    } else { // dry wadi floor: cracked ground, an empty waterskin, people looking at the rock
      for (let i = 0; i < 40; i++) { const x = hash(i, 21) * W, y = 100 + hash(i, 22) * 18; rect(x, y, 3 + hash(i, 23) * 6, 1, "#b8955a"); px(x + 2, y + 1, "#b8955a"); }
      const sk = new Bmp(10, 6); sk.ellipse(5, 3, 4, 2, "#a86e42"); sk.rect(8, 1, 2, 2, "#6b4a2a"); sk.outline(INK); sk.draw(ctx, 168, 110, P);
    }
    const mo = personHero("elder", 2, 0); mo.draw(ctx, 96, 72 - mo.h, P); if (!struck) rect(112, 44, 1, 14, PEOPLE.staff); // the staff raised
    crowd(20, 104, 3, f, 3); crowd(190, 104, 3, f, 5);
    label("REPHIDIM");
  };
  CARD.kadesh = (f, t) => { // the spies return with the cluster on a pole
    landscape({ region: "paran", t: 0.6, horizon: 66 });
    for (let i = 0; i < 6; i++) tent(4 + i * 26, 80 - (i % 2) * 4, i);
    const a = personHero("man", 0, 1), b2 = personHero("man", 3, 2); a.draw(ctx, 120, 116 - a.h, P); b2.draw(ctx, 164, 116 - b2.h, P);
    rect(126, 84, 46, 2, "#8a6a3a"); // the pole on their shoulders
    const cl = new Bmp(22, 22); for (let i = 0; i < 26; i++) { const x = 6 + hash(i, 1) * 10, y = 2 + hash(i, 2) * 16; cl.ellipse(x, y, 2.5, 2.5, i % 3 ? "#5a2a6a" : "#7a4f9e"); cl.px(x - 1, y - 1, "#a88ac0"); } cl.rect(10, 0, 2, 4, "#3f8a3a"); cl.outline(INK); cl.draw(ctx, 138, 86, P);
    crowd(20, 112, 4, f, 11); crowd(210, 112, 3, f, 13);
    label("KADESH-BARNEA");
  };
  CARD.serpent = (f, t) => { // the bronze serpent, foreground-large
    landscape({ region: "arabah", t: 0.45, horizon: 66 });
    rect(138, 20, 4, 96, "#8a6a3a"); rect(138, 20, 1, 96, "#6b4a2a"); rect(130, 22, 20, 3, "#8a6a3a");
    const s = new Bmp(30, 40); s.line(15, 2, 4, 12, "#d08a2a", 4); s.line(4, 12, 26, 22, "#d08a2a", 4); s.line(26, 22, 6, 34, "#d08a2a", 4); s.line(6, 34, 16, 38, "#d08a2a", 3);
    s.line(15, 2, 4, 12, "#ffd23f", 1); s.line(4, 12, 26, 22, "#ffd23f", 1); s.ellipse(17, 2, 4, 3, "#d08a2a"); s.px(19, 1, INK); s.px(21, 3, "#ff5a1f"); s.outline(INK); s.draw(ctx, 125, 18, P);
    if (Math.floor(T * 3) % 2) { px(150, 20, "#ffffff"); px(129, 30, "#ffffff"); }
    crowd(10, 114, 5, f, 15); const w = personHero("woman", 1, 0); w.draw(ctx, 190, 114 - w.h, P);
    // someone bitten, on the ground, looking up
    const ly = new Bmp(24, 10); ly.rect(0, 4, 20, 5, PEOPLE.robes[2]); ly.ellipse(21, 5, 3, 3, PEOPLE.skin); ly.rect(2, 2, 6, 3, PEOPLE.skin); ly.outline(INK); ly.draw(ctx, 210, 108, P);
    label("THE ARABAH");
  };
  CARD.jordan = (f, t) => { // the ark in the riverbed; water heaped upstream
    landscape({ region: "moab", t: 0.3, horizon: 60 });
    rect(0, 84, W, 36, "#2f6fa8"); rect(0, 84, W, 1, "#a9d8f2");
    // heaped wall of water on the left
    for (let j = 0; j < 40; j++) { const w = 60 + j * 0.4; rect(0, 80 - j, w - j * 0.6, 1, j % 2 ? "#3f86d6" : "#5aa0d8"); if (j % 3 === 0) rect(w - j * 0.6 - 2, 80 - j, 2, 1, "#ffffff"); }
    rect(70, 84, 210, 36, "#b09a6a"); for (let i = 0; i < 80; i++) px(70 + hash(i, 1) * 210, 86 + hash(i, 2) * 34, "#8a7a52"); // dry bed
    // the ark on the priests' shoulders
    const ark = new Bmp(24, 16); ark.rect(2, 6, 20, 8, "#e6b422"); ark.rect(2, 6, 20, 1, "#fff3b0"); ark.rect(0, 12, 24, 2, "#8a6a3a"); ark.poly([[6, 6], [8, 1], [11, 5]], "#e6b422"); ark.poly([[13, 5], [16, 1], [18, 6]], "#e6b422"); ark.outline(INK); ark.draw(ctx, 118, 78, P);
    const p1 = personHero("man", 4, 1), p2 = personHero("man", 5, 2); p1.draw(ctx, 108, 112 - p1.h, P); p2.draw(ctx, 136, 112 - p2.h, P);
    crowd(190, 116, 5, f, 17);
    label("THE JORDAN");
  };
  CARD.hazeroth = (f, t) => { // Miriam outside the camp, seven days
    landscape({ region: "paran", t: 0.75, horizon: 66 });
    for (let i = 0; i < 8; i++) tent(120 + i * 22 - (i % 2) * 6, 96 - (i % 2) * 8, i);
    rect(100, 70, 1, 48, "#8a6a3a"); // the camp's edge, a boundary pole
    const mir = personHero("woman", 1, 0); mir.draw(ctx, 40, 114 - mir.h, P);
    const mo = personHero("elder", 2, 0); mo.draw(ctx, 112, 114 - mo.h, P);
    nightShade(0.75); label("HAZEROTH");
  };
  CARD.hor = (f, t) => { // Mount Hor — three go up, two come down
    landscape({ region: "arabah", t: 0.4, horizon: 70, bigMountain: true, clouds: false });
    const path = [[60, 110], [90, 90], [120, 70], [150, 48], [170, 30]]; for (let i = 0; i < path.length - 1; i++) { const a = path[i], b = path[i + 1]; for (let k = 0; k < 20; k++) px(a[0] + (b[0] - a[0]) * k / 20, a[1] + (b[1] - a[1]) * k / 20, "#d3924f"); }
    const e = personHero("elder", 2, 0), m1 = personHero("man", 0, 1, { staff: true }), m2 = personHero("man", 3, 2); e.draw(ctx, 160, 32 - e.h, P); m1.draw(ctx, 140, 52 - m1.h, P); m2.draw(ctx, 118, 72 - m2.h, P);
    crowd(10, 116, 4, f, 19); for (let i = 0; i < 4; i++) tent(200 + i * 20, 118 - (i % 2) * 4, i);
    label("MOUNT HOR");
  };
  CARD.jericho = (f, t, o) => { // walls that dominate the frame
    landscape({ region: "moab", t: 0.35, horizon: 62, flat: true });
    const wl = new Bmp(150, 70); wl.rect(0, 20, 150, 50, "#b8a07a"); for (let j = 20; j < 70; j += 5) for (let i = 0; i < 150; i += 10) wl.rect(i + (j % 10 ? 5 : 0), j, 9, 4, (j / 5) % 2 ? "#c9b08a" : "#a8906a");
    for (let i = 0; i < 150; i += 10) wl.rect(i, 15, 5, 5, "#b8a07a"); wl.rect(56, 0, 24, 24, "#a8906a"); wl.rect(56, 0, 24, 1, "#e8ddc0"); wl.rect(64, 8, 8, 10, "#3a2a1a"); wl.rect(120, 42, 10, 14, "#3a2a1a"); wl.rect(118, 36, 14, 2, "#a63d2f");
    if (o && o.fallen) { wl.d.fill(null); for (let i = 0; i < 90; i++) { const bx = 4 + hash(i, 4) * 140, by = 54 + hash(i, 5) * 14; wl.rect(bx, by, 3 + hash(i, 6) * 6, 3, i % 2 ? "#b8a07a" : "#a8906a"); } wl.rect(118, 30, 12, 40, "#b8a07a"); wl.rect(118, 30, 12, 1, "#e8ddc0"); wl.rect(121, 40, 6, 4, "#a63d2f"); wl.outline(INK); wl.draw(ctx, 110, 44, P); for (let i = 0; i < 16; i++) { ctx.save(); ctx.globalAlpha = 0.5; px(120 + hash(i, 8) * 140, 60 - ((T * 10 + i * 4) % 40), "#e8ddc0"); ctx.restore(); } }
    else { wl.outline(INK); wl.draw(ctx, 110, 44, P); }
    const ark = new Bmp(24, 16); ark.rect(2, 6, 20, 8, "#e6b422"); ark.rect(0, 12, 24, 2, "#8a6a3a"); ark.outline(INK); ark.draw(ctx, 70, 96, P);
    crowd(4, 118, 6, f, 21);
    label("JERICHO");
  };

  // THE SPOILS — the market on the far shore: awnings, pens of sheep and donkeys, water-skins, jars, the traders of the mixed multitude
  function awning(x, y, w, c1, c2) { const b = new Bmp(w + 2, 30); for (let i = 0; i < w; i += 4) b.rect(1 + i, 0, 4, 5, (i / 4) % 2 ? c1 : c2); for (let i = 1; i < w; i += 4) b.px(i + 1, 5, c1); b.rect(0, 0, 1, 26, "#8a6a3a"); b.rect(w, 0, 1, 26, "#8a6a3a"); b.rect(2, 16, w - 3, 8, "#8a6a3a"); b.rect(2, 16, w - 3, 1, "#b08a4a"); b.outline(INK); b.draw(ctx, x, y - 30, P); return b; }
  function jar(x, y, c) { const b = new Bmp(8, 12); b.ellipse(4, 7, 3.5, 4.5, c); b.rect(2, 0, 4, 3, c); b.rect(1, 1, 6, 1, shade(c, 1.2)); b.px(2, 5, shade(c, 1.25)); b.outline(INK); b.draw(ctx, x, y - 12, P); }
  function waterskin(x, y) { const b = new Bmp(8, 12); b.ellipse(4, 7, 3.5, 4, "#a86e42"); b.rect(3, 0, 2, 4, "#6b4a2a"); b.px(3, 6, "#c98c5a"); b.outline(INK); b.draw(ctx, x, y - 12, P); }
  function fence(x, y, w) { for (let i = 0; i <= w; i += 8) { rect(x + i, y - 9, 1, 9, "#8a6a3a"); rect(x + i, y - 9, 1, 1, INK); } rect(x, y - 7, w, 1, "#b08a4a"); rect(x, y - 3, w, 1, "#b08a4a"); }
  CARD.store = (f, t, o, St) => {
    landscape({ region: "sinai", t: 0.3, horizon: 60, water: { y: 52, h: 8 }, flat: true });
    rect(0, 60, W, 60, REGION.sinai.sand); for (let y = 62; y < H; y += 2) for (let x = 0; x < W; x++) if (hash(x, y) < 0.12) px(x, y, REGION.sinai.sand2);
    // Egyptian chariots and spears washed up on the shore, far back
    for (let i = 0; i < 6; i++) { const x = 20 + i * 46 + hash(i, 3) * 20; rect(x, 57, 6, 2, "#5a4a3a"); rect(x + 2, 53, 1, 5, "#c9b99a"); if (i % 2) { rect(x + 8, 56, 3, 3, "#6b5a48"); px(x + 9, 55, "#e6b422"); } }
    // three stalls under striped awnings
    awning(6, 92, 70, "#a63d2f", "#e8d9b5");  // cloth & silver
    awning(104, 92, 72, "#3d6aa6", "#e8d9b5"); // provisions
    awning(204, 92, 70, "#c98a2e", "#e8d9b5"); // skins & sandals
    // stall 1: bolts of cloth, a scale with silver, gold jewelry
    [["#a63d2f", 10], ["#7a4f9e", 16], ["#3f8a5a", 22], ["#c98a2e", 28]].forEach(([c, dx]) => { rect(dx, 70, 5, 6, c); rect(dx, 70, 5, 1, shade(c, 1.25)); });
    rect(44, 66, 1, 10, "#6b4a2a"); rect(38, 66, 13, 1, "#6b4a2a"); rect(37, 70, 5, 1, "#e6b422"); rect(47, 71, 5, 1, "#e6b422"); for (let i = 0; i < 5; i++) px(38 + i, 69, "#dfe6ff"); // scale
    for (let i = 0; i < 8; i++) px(56 + (i % 4) * 2, 72 + Math.floor(i / 4) * 2, i % 2 ? "#e6b422" : "#fff3b0"); // gold
    // stall 2: sacks of flour, strings of figs, dried fish
    for (let i = 0; i < 3; i++) { const b = new Bmp(10, 9); b.ellipse(5, 5, 4.5, 4, "#d9c9a8"); b.rect(3, 0, 4, 2, "#b09a6a"); b.outline(INK); b.draw(ctx, 108 + i * 11, 68, P); }
    for (let i = 0; i < 12; i++) px(142 + i, 66 + (i % 2), "#7a4f9e"); for (let i = 0; i < 3; i++) { rect(144 + i * 4, 68, 2, 3, "#5a2a6a"); }
    for (let i = 0; i < 4; i++) { rect(156 + i * 5, 64, 4, 2, "#8ab0c0"); px(159 + i * 5, 64, "#dfe6ff"); rect(157 + i * 5, 66, 2, 1, "#8ab0c0"); }
    jar(120, 78, "#b8794a"); jar(130, 78, "#8a6a3a"); jar(164, 78, "#b8794a");
    // stall 3: water-skins hanging from the beam, sandals, coiled rope
    for (let i = 0; i < 5; i++) waterskin(208 + i * 10, 76);
    for (let i = 0; i < 3; i++) { rect(258 + (i % 2) * 6, 70 + Math.floor(i / 2) * 4, 5, 2, "#6b4a2a"); px(260 + (i % 2) * 6, 69 + Math.floor(i / 2) * 4, "#c98a2e"); }
    const rope = new Bmp(10, 6); rope.ellipse(5, 3, 4.5, 2.5, "#c9b99a"); rope.ellipse(5, 3, 2, 1, REGION.sinai.sand); rope.outline("#8a7a62"); rope.draw(ctx, 236, 82, P);
    // traders behind the counters
    personHero("man", 1, 0).draw(ctx, 28, 84 - 30 + 4, P); personHero("woman", 4, 0, { jar: false }).draw(ctx, 138, 84 - 30 + 4, P); personHero("elder", 5, 0).draw(ctx, 236, 84 - 30 + 4, P);
    // pens in the foreground: sheep left, donkeys right, a camel tethered between
    fence(4, 118, 96); for (let i = 0; i < 8; i++) { const sh = sheepHero(f + i); sh.draw(ctx, 8 + (i % 4) * 22 + (Math.floor(i / 4) * 6), 118 - sh.h - (i < 4 ? 8 : 0), P); }
    fence(180, 118, 96); for (let i = 0; i < 3; i++) { const d = donkeyHero((f + i) % 3, {}); d.draw(ctx, 184 + i * 30, 116 - d.h + (i % 2) * 2, P); }
    const cam = camelHero(0, { saddle: false }); cam.draw(ctx, 112, 118 - cam.h, P); rect(108, 100, 1, 18, "#6b4a2a"); for (let i = 0; i < 6; i++) px(109 + i, 104 + Math.floor(i / 3), "#8a6a3a");
    // the buyers — your household, small, at the counter
    kidHero(4, f).draw(ctx, 172, 100 - 20, P);
    label("THE SPOILS OF EGYPT");
  };
  CARD.sin = CARD.manna; CARD.punon = CARD.serpent;
  // vignettes by event id (others fall back to the travel scene with the group halted)
  const VIG_FOR = { sick: "illness", predator: "wolves", dispute: "quarrel", grumble_tent: "quarrel", cistern: "well", raiders: "thief" };

  /* ============================================================
     EVENT VIGNETTES — travel landscape, the group stopped, one added object
     ============================================================ */
  const VIG = {};
  function stoppedGroup(x, y) { const e = personHero("elder", 2, 0), m = personHero("man", 0, 0, { staff: true }), w = personHero("woman", 1, 0); m.draw(ctx, x, y - m.h, P); w.draw(ctx, x - 20, y - w.h, P); e.draw(ctx, x - 44, y - e.h, P); const d = donkeyHero(0, { pack: true }); d.draw(ctx, x - 80, y - d.h, P); }
  VIG.illness = (f) => { landscape({ region: "paran", t: 0.9, horizon: 70, clouds: false }); tent(20, 116, 1); tent(230, 118, 2); const tb = new Bmp(80, 40); tb.poly([[0, 39], [40, 0], [79, 39]], "#8a6a4a"); tb.poly([[14, 39], [40, 10], [66, 39]], "#3a2a1a"); tb.rect(40, 0, 1, 4, INK); tb.outline(INK); tb.draw(ctx, 110, 78, P); const ly = new Bmp(40, 14); ly.rect(4, 6, 30, 7, PEOPLE.robes[1]); ly.rect(4, 6, 30, 1, PEOPLE.veil); ly.ellipse(35, 8, 4, 4, PEOPLE.skin); ly.rect(31, 5, 8, 2, PEOPLE.veil2); ly.px(36, 7, INK); ly.outline(INK); ly.draw(ctx, 128, 104, P); rect(172, 96, 2, 5, "#ffd23f"); rect(171, 101, 4, 2, "#8a6a3a"); ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = "#ffb347"; ctx.beginPath(); ctx.arc(173 * P, 100 * P, 20 * P, 0, 7); ctx.fill(); ctx.restore(); const w = personHero("woman", 1, 0); w.draw(ctx, 178, 118 - w.h, P); nightShade(0.9); label("THE FEVER"); };
  VIG.serpent = (f) => { landscape({ region: "arabah", t: 0.45, horizon: 70 }); stoppedGroup(200, 116); const s = new Bmp(30, 12); s.line(2, 8, 10, 3, "#d08a2a", 3); s.line(10, 3, 18, 8, "#d08a2a", 3); s.line(18, 8, 26, 4, "#d08a2a", 3); s.ellipse(27, 4, 3, 2, "#d08a2a"); s.px(29, 3, INK); for (let i = 3; i < 26; i += 4) s.px(i, 6, "#5a3418"); s.outline(INK); s.draw(ctx, 60, 108, P); const k = kidHero(4, 0); k.draw(ctx, 96, 118 - k.h, P); text("!", 100, 92, "#a63d2f", 10); label("FIERY SERPENTS"); };
  VIG.wolves = (f) => { landscape({ region: "paran", t: 0.88, horizon: 70, clouds: false }); for (let i = 0; i < 5; i++) { const s = sheepHero(i); s.draw(ctx, 150 + i * 16, 116 - s.h, P); } for (let i = 0; i < 3; i++) { const w = new Bmp(22, 12); w.ellipse(10, 7, 8, 3, "#5a4a3a"); w.rect(16, 3, 6, 4, "#5a4a3a"); w.rect(20, 5, 3, 2, "#3a2a1a"); w.px(19, 4, "#ffd23f"); w.rect(3, 9, 2, 3, "#3a2a1a"); w.rect(14, 9, 2, 3, "#3a2a1a"); w.line(2, 6, -2, 3, "#5a4a3a", 2); w.outline(INK); w.draw(ctx, 20 + i * 30, 112 - w.h + (i % 2) * 3, P); } const m = personHero("man", 0, 1, { staff: true }); m.draw(ctx, 120, 118 - m.h, P); nightShade(0.88); label("WOLVES AT THE FLOCK"); };
  VIG.quarrel = (f) => { landscape({ region: "sinai", t: 0.5, horizon: 70 }); const a = personHero("man", 0, 0, { staff: true }), b2 = personHero("man", 3, 0, { staff: true }).flip(); a.draw(ctx, 100, 116 - a.h, P); b2.draw(ctx, 130, 116 - b2.h, P); text("!", 106, 80, "#a63d2f", 10); text("!", 138, 80, "#a63d2f", 10); crowd(180, 118, 3, f, 23); const w = personHero("woman", 1, 0); w.draw(ctx, 60, 118 - w.h, P); label("A QUARREL IN THE CAMP"); };
  VIG.well = (f) => { landscape({ region: "paran", t: 0.5, horizon: 70 }); const wl = new Bmp(44, 30); wl.rect(6, 16, 32, 12, "#a89272"); for (let j = 16; j < 28; j += 4) for (let i = 6; i < 38; i += 8) wl.rect(i + (j % 8 ? 4 : 0), j, 7, 3, j % 8 ? "#8a7a62" : "#b8a88a"); wl.ellipse(22, 16, 16, 3, "#3a2a1a"); wl.rect(4, 2, 3, 16, "#8a6a3a"); wl.rect(37, 2, 3, 16, "#8a6a3a"); wl.rect(4, 1, 36, 2, "#8a6a3a"); wl.rect(21, 3, 1, 12, "#6b4a2a"); wl.rect(18, 12, 7, 5, "#8a6a3a"); wl.rect(19, 13, 5, 1, "#6b4a2a"); wl.outline(INK); wl.draw(ctx, 120, 90, P); stoppedGroup(100, 118); const m = personHero("man", 3, 0).flip(); m.draw(ctx, 164, 116 - m.h, P); label("THE WELL IS DRY"); };
  VIG.thief = (f) => { landscape({ region: "sinai", t: 0.95, horizon: 70, clouds: false }); for (let i = 0; i < 4; i++) tent(20 + i * 40, 118 - (i % 2) * 6, i); const d = donkeyHero(0, { pack: true }); d.draw(ctx, 170, 118 - d.h, P); const th = new Bmp(18, 30); th.poly([[6, 9], [11, 9], [13, 23], [4, 23]], "#2a2a3a"); th.rect(6, 23, 2, 5, "#2a2a3a"); th.rect(9, 23, 2, 5, "#2a2a3a"); th.ellipse(8.5, 5, 3, 3.5, PEOPLE.skin2); th.poly([[5, 2], [12, 2], [13, 9], [4, 9]], "#2a2a3a"); th.rect(6, 5, 5, 2, PEOPLE.skin2); th.px(9, 5, "#ffffff"); th.rect(12, 12, 6, 2, "#2a2a3a"); th.rect(16, 8, 6, 6, DONKEY.pack); th.outline("#000000"); th.draw(ctx, 200, 118 - th.h, P); nightShade(0.95); ctx.save(); ctx.globalAlpha = 0.35; rect(0, 0, W, H, "#000"); ctx.restore(); label("RAIDERS IN THE NIGHT"); };

  /* ---------- named grave ---------- */
  function grave(name, cause, year, look) {
    if (look === "classic") { rect(0, 0, W, 96, "#000"); for (let i = 0; i < 40; i++) px(hash(i, 3) * W, hash(i, 7) * 40, "#ffffff"); const pts = [[0, 70], [40, 50], [100, 30], [160, 56], [220, 40], [280, 70]]; for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < 40; k++) px(pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k / 40, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k / 40, "#33ff33"); rect(0, 70, W, 1, "#33ff33"); rect(110, 30, 60, 40, "#000"); rect(110, 30, 60, 1, "#fff"); rect(110, 30, 1, 40, "#fff"); rect(169, 30, 1, 40, "#fff"); for (let i = 0; i < 10; i++) rect(100 + i * 8, 68 + (i % 2), 6, 3, "#33ff33"); text(name.toUpperCase(), 116, 42, "#ffffff", 6); text(cause.toUpperCase(), 116, 52, "#1a7a1a", 5); text("YEAR " + year, 116, 62, "#1a7a1a", 5); return; }
    landscape({ region: "paran", t: 0.86, horizon: 70, clouds: false });
    const st = new Bmp(70, 56); st.poly([[6, 55], [4, 12], [12, 2], [58, 2], [66, 12], [64, 55]], "#a8987f"); st.poly([[10, 52], [8, 14], [14, 6], [56, 6], [62, 14], [60, 52]], "#c9b99a"); st.outline(INK); st.draw(ctx, 105, 60, P);
    for (let i = 0; i < 16; i++) { const b = new Bmp(8, 5); b.ellipse(4, 2, 4, 2.5, i % 2 ? "#9a8a78" : "#8a7a68"); b.outline(INK); b.draw(ctx, 88 + (i % 8) * 13, 112 - Math.floor(i / 8) * 4, P); }
    text(name.toUpperCase(), 118, 76, "#3a2a1a", 7); text(cause.toUpperCase(), 118, 88, "#5a4a3a", 5); text("YEAR " + year, 118, 98, "#5a4a3a", 5);
    const w = personHero("woman", 1, 0); w.draw(ctx, 60, 116 - w.h, P); const k = kidHero(4, 0); k.draw(ctx, 200, 116 - k.h, P);
    nightShade(0.86);
  }

  /* ---------- parchment map ---------- */
  const MAPW = 280, MAPH = 192;
  const LON0 = 31.4, LON1 = 36.6, LAT0 = 27.55, LAT1 = 33.25;
  const MX = lon => (lon - LON0) / (LON1 - LON0) * MAPW, MY = lat => (LAT1 - lat) / (LAT1 - LAT0) * MAPH;
  const MED = [[31.4, 31.55], [32.3, 31.35], [32.9, 31.15], [33.5, 31.1], [34.2, 31.3], [34.5, 31.5], [34.75, 32.0], [34.85, 32.5], [35.0, 32.8], [35.1, 33.25], [31.4, 33.25]];
  const SUEZ = [[32.55, 29.98], [32.45, 29.6], [32.6, 29.1], [33.0, 28.5], [33.5, 27.95], [33.9, 27.55], [34.3, 27.55], [34.25, 27.75], [33.9, 28.1], [33.6, 28.55], [33.2, 29.05], [32.9, 29.5], [32.7, 29.98]];
  const AQABA = [[34.95, 29.55], [34.7, 29.1], [34.55, 28.6], [34.45, 28.2], [34.3, 27.55], [34.75, 27.55], [34.85, 28.1], [35.0, 28.7], [35.05, 29.2], [35.03, 29.55]];
  const REDSEA = [[33.85, 27.55], [36.6, 27.55], [36.6, 27.62], [34.9, 27.7], [34.35, 27.85], [34.0, 27.7]];
  const DEAD = [[35.42, 31.78], [35.56, 31.78], [35.62, 31.4], [35.52, 31.02], [35.4, 31.1], [35.36, 31.45]];
  const GALILEE = [[35.53, 32.9], [35.65, 32.87], [35.62, 32.7], [35.5, 32.75]];
  const JORDAN = [[35.6, 32.7], [35.55, 32.4], [35.58, 32.1], [35.52, 31.8]];
  const NILE = [[31.4, 29.7], [31.7, 30.2], [32.0, 30.7], [32.3, 31.35]];
  function parchmentMap(S) {
    const B = new Bmp(MAPW, MAPH);
    // parchment ground with fibres and a scorched edge
    for (let y = 0; y < MAPH; y++) for (let x = 0; x < MAPW; x++) { const e = Math.min(x, y, MAPW - 1 - x, MAPH - 1 - y); const base = hash(x, y) < 0.08 ? "#d9c7a0" : "#e8d9b5"; B.px(x, y, e < 6 ? mix("#8a6a3a", base, e / 6) : base); }
    const polyM = (pts, c) => B.poly(pts.map(p => [MX(p[0]), MY(p[1])]), c);
    const strokeM = (pts, c, dash) => { for (let i = 0; i < pts.length - 1; i++) { const a = [MX(pts[i][0]), MY(pts[i][1])], b = [MX(pts[i + 1][0]), MY(pts[i + 1][1])]; const n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])); for (let k = 0; k <= n; k++) if (!dash || Math.floor(k / dash) % 2 === 0) B.px(a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n, c); } };
    [MED, REDSEA, SUEZ, AQABA, DEAD, GALILEE].forEach(w => { polyM(w, "#7fa9c9"); });
    // water hatching + shoreline ink
    for (let y = 0; y < MAPH; y++) for (let x = 0; x < MAPW; x++) if (B.get(x, y) === "#7fa9c9" && (x + y * 2) % 7 === 0) B.px(x, y, "#5f8fb3");
    const src = B.d.slice(); for (let y = 1; y < MAPH - 1; y++) for (let x = 1; x < MAPW - 1; x++) { const c = src[y * MAPW + x]; if (c === "#7fa9c9" || c === "#5f8fb3") { const n = [src[y * MAPW + x - 1], src[y * MAPW + x + 1], src[(y - 1) * MAPW + x], src[(y + 1) * MAPW + x]]; if (n.some(v => v !== "#7fa9c9" && v !== "#5f8fb3")) B.px(x, y, "#3a4a6a"); } }
    strokeM(JORDAN, "#3a4a6a"); strokeM(NILE, "#3a4a6a");
    // mountains as little hachures for Sinai and Edom
    [[33.9, 28.6], [34.1, 28.9], [33.6, 28.9], [34.3, 28.4], [35.5, 30.2], [35.6, 30.6], [35.4, 29.9], [34.0, 29.2]].forEach(([lo, la]) => { const x = MX(lo), y = MY(la); B.line(x - 3, y + 2, x, y - 3, "#6b4a2a"); B.line(x, y - 3, x + 3, y + 2, "#6b4a2a"); B.px(x, y - 3, "#e8ddc0"); });
    // route
    const stops = SINAI.STOPS, pts = stops.map(s => [s.lon, s.lat]);
    strokeM(pts.slice(0, 10), "#a63d2f", 2); strokeM([[34.42, 30.65], [34.9, 29.7], [35.2, 29.95], [34.8, 30.1]], "#a63d2f", 2); strokeM(pts.slice(9), "#a63d2f", 2);
    stops.forEach((s, i) => { const x = MX(s.lon), y = MY(s.lat), seen = S && S.visited.includes(s.id); // glyphs: tent for camps, spring for water, mountain for peaks
      if (/sinai|hor|nebo/i.test(s.id)) { B.poly([[x - 3, y + 2], [x, y - 3], [x + 3, y + 2]], seen ? "#3a2a1a" : "#8a6a3a"); }
      else if (/elim|marah|kadesh|jordan|sea/i.test(s.id)) { B.ellipse(x, y, 2, 1.5, seen ? "#3a4a6a" : "#7fa9c9"); B.px(x, y, seen ? "#3a2a1a" : "#3a4a6a"); }
      else { B.poly([[x - 3, y + 2], [x, y - 2], [x + 3, y + 2]], seen ? "#3a2a1a" : "#8a6a3a"); B.px(x, y + 1, "#e8d9b5"); } });
    B.draw(ctx, 0, 0, P);
    // labels in VT323-ish hand lettering (game font stands in here)
    const lab = (s, lo, la, c, size) => { ctx.fillStyle = c; ctx.font = (size || 7) + "px 'Press Start 2P', monospace"; ctx.fillText(s, MX(lo) * P, MY(la) * P); };
    lab("GREAT SEA", 32.3, 32.3, "#3a4a6a"); lab("EGYPT", 31.9, 29.3, "#3a2a1a"); lab("GOSHEN", 31.75, 30.55, "#6b4a2a", 6);
    lab("SEA OF REEDS", 32.55, 28.25, "#3a4a6a", 5); lab("WILDERNESS OF PARAN", 33.3, 29.75, "#6b4a2a", 5); lab("NEGEV", 34.65, 31.0, "#6b4a2a", 6); lab("ZIN", 34.9, 30.5, "#6b4a2a", 6);
    lab("EDOM", 35.65, 30.35, "#3a2a1a", 6); lab("MOAB", 35.85, 31.3, "#3a2a1a", 6); lab("AMMON", 35.95, 31.95, "#3a2a1a", 6); lab("CANAAN", 34.95, 32.35, "#3a2a1a", 7); lab("SALT SEA", 35.66, 31.5, "#3a4a6a", 4);
    stops.forEach((s, i) => { if (i % 2 === 0) lab((s.short || s.name).toUpperCase(), s.lon + 0.1, s.lat + (i % 4 ? -0.1 : 0.14), "#3a2a1a", 5); });
    // you are here: the pillar
    if (S) { const i = S.stopIdx, a = stops[Math.max(0, i - 1)], b = stops[i]; const t = b.miles > 0 ? 1 - Math.max(0, S.miles) / b.miles : 1; const x = MX(a.lon + (b.lon - a.lon) * t), y = MY(a.lat + (b.lat - a.lat) * t); for (let j = 0; j < 10; j++) { const w = 2 + (1 - j / 10) * 3; rect(x - w / 2 + Math.sin(j + T * 3) * 0.6, y - 12 + j, w, 1, j % 2 ? "#ffffff" : "#e6ebf2"); } rect(x - 1, y - 2, 3, 3, INK); }
    // compass rose + cartouche
    const cx = 250, cy = 165; for (let a = 0; a < 4; a++) { const dx = [0, 1, 0, -1][a] * 10, dy = [-1, 0, 1, 0][a] * 10; ctx.fillStyle = "#3a2a1a"; ctx.beginPath(); ctx.moveTo(cx * P, cy * P); ctx.lineTo((cx + dx) * P, (cy + dy) * P); ctx.lineTo((cx + dy * 0.3) * P, (cy - dx * 0.3) * P); ctx.fill(); } text("N", 247, 150, "#3a2a1a", 6);
    rect(8, 172, 90, 14, "#e8d9b5"); rect(8, 172, 90, 1, "#8a6a3a"); rect(8, 185, 90, 1, "#8a6a3a"); rect(8, 172, 1, 14, "#8a6a3a"); rect(97, 172, 1, 14, "#8a6a3a"); text("THE WAY OF THE WILDERNESS", 11, 181, "#3a2a1a", 4);
  }

  /* ---------- outline demo on the CURRENT sprites ---------- */
  const OLD_MAN_TOP = ["..vvv..", ".vvvvv.", ".vsssv.", "..sss..", ".rrrrr.", "rrrrrrr", "r.rrr.r", "s.rrr.s", "..rrr..", "..bbb..", "..rrr.."], OLD_LEGS = ["..s.s..", "..s.s..", "..k.k.."], OLD_SHEEP = [".wwwwww.", "wwwwwwwk", "wwwwwwkk", ".k.ww.k.", ".k....k."];
  function outlineDemo(x, y, withOutline) {
    const pal = { v: PEOPLE.veil, s: "#d9a066", r: PEOPLE.robes[0], b: PEOPLE.belt, k: "#3a2a1a", w: "#f2ecd8" };
    const b = new Bmp(40, 16); b.art(OLD_MAN_TOP, 0, 0, pal); b.art(OLD_LEGS, 0, 11, pal); b.art(OLD_SHEEP, 12, 9, pal); b.art(OLD_MAN_TOP, 24, 0, Object.assign({}, pal, { r: PEOPLE.robes[1], s: withOutline ? PEOPLE.skin : "#d9a066" })); b.art(OLD_LEGS, 24, 11, pal);
    if (withOutline) b.outline(INK); b.draw(ctx, x, y, P);
  }

  /* ============================================================
     COVER ART — poster, 300 x 400 logical at P=2 (600 x 800)
     ============================================================ */
  function cover(c, tSec) {
    const CW = 300, CH = 400, CP = 2; const saved = ctx; ctx = c; T = tSec || 0;
    const R = (x, y, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(x * CP, y * CP, w * CP, h * CP); };
    const X = (x, y, col) => R(x, y, 1, 1, col);
    // sky: dusk over the sea, a great sweep from deep violet to burning orange
    for (let y = 0; y < 230; y++) R(0, y, CW, 1, mix("#1a1740", y < 120 ? mix("#1a1740", "#7a3a5a", y / 120) : mix("#7a3a5a", "#ff9a3d", (y - 120) / 110), 1));
    // ordered dither between bands to give the 1992 VGA grain
    for (let i = 0; i < 90; i++) X(hash(i, 3) * CW, hash(i, 9) * 90, i % 5 ? "#dfe6ff" : "#ffffff");
    // setting sun, huge, half behind the far range
    ctx.save(); ctx.fillStyle = "#ffd36a"; ctx.beginPath(); ctx.arc(200 * CP, 178 * CP, 34 * CP, 0, 7); ctx.fill(); ctx.fillStyle = "#fff3b0"; ctx.beginPath(); ctx.arc(200 * CP, 178 * CP, 26 * CP, 0, 7); ctx.fill(); ctx.restore();
    // far range (Sinai granite), then a nearer range
    const ridge = (base, amp, freq, seed, col, jag) => { for (let x = 0; x < CW; x++) { let h = Math.sin(x * freq) * 0.5 + Math.sin(x * freq * 2.3 + seed) * 0.3 + Math.sin(x * freq * 0.37 + seed * 2) * 0.6 + (vnoise(x / 6, seed) - 0.5) * jag; const y = Math.round(base - amp * (0.5 + 0.5 * h)); R(x, y, 1, CH - y, col); if (x > 0) { R(x, y, 1, 3, shade(col, 1.15)); } } };
    ridge(200, 70, 0.02, 3, "#4a2a4a", 0.5); ridge(212, 50, 0.03, 8, "#6e3a48", 0.6);
    // Mount Sinai itself: one big dark peak with cloud and lightning, off-centre left
    ctx.fillStyle = "#3a2030"; ctx.beginPath(); ctx.moveTo(0, 230 * CP); ctx.lineTo(50 * CP, 60 * CP); ctx.lineTo(80 * CP, 90 * CP); ctx.lineTo(130 * CP, 230 * CP); ctx.fill();
    ctx.fillStyle = "#5a3040"; ctx.beginPath(); ctx.moveTo(20 * CP, 230 * CP); ctx.lineTo(52 * CP, 70 * CP); ctx.lineTo(70 * CP, 120 * CP); ctx.lineTo(90 * CP, 230 * CP); ctx.fill();
    ctx.save(); ctx.globalAlpha = 0.92; ctx.fillStyle = "#e1e6ee"; [[52, 62, 34, 14], [30, 70, 26, 10], [76, 68, 24, 9], [52, 56, 18, 8]].forEach(([cx, cy, rx, ry]) => { ctx.beginPath(); ctx.ellipse(cx * CP, cy * CP, rx * CP, ry * CP, 0, 0, 7); ctx.fill(); }); ctx.fillStyle = "#ffffff"; [[48, 58, 22, 8], [70, 64, 14, 6]].forEach(([cx, cy, rx, ry]) => { ctx.beginPath(); ctx.ellipse(cx * CP, cy * CP, rx * CP, ry * CP, 0, 0, 7); ctx.fill(); }); ctx.restore();
    R(52, 66, 1, 14, "#ffffff"); R(53, 74, 1, 10, "#fff3b0"); R(50, 84, 1, 6, "#ffffff");
    // the sea, far right, with the wall of water still standing (the road out of Egypt)
    R(150, 214, 150, 16, "#2f4f8a"); for (let i = 150; i < CW; i += 2) if ((i + 3) % 9 < 3) X(i, 216 + (i % 5) * 2, "#6a9ad0"); R(150, 214, 150, 1, "#a9d8f2");
    // ground: a long sweep of sand down to the foreground
    for (let y = 230; y < CH; y++) R(0, y, CW, 1, mix("#c9a26a", "#8a6a3a", (y - 230) / 170));
    for (let y = 232; y < CH; y += 2) for (let x = 0; x < CW; x++) if (hash(x, y) < 0.1) X(x, y, "#a8824a");
    // dunes
    for (let x = 0; x < CW; x++) { const y = 262 - 8 * (0.5 + 0.5 * Math.sin(x * 0.03) * Math.cos(x * 0.011 + 1)); R(x, y, 1, 30, "#d6b27a"); if (Math.cos(x * 0.03) > 0.2) X(x, y, "#e6c98f"); }
    // the nation: a great winding column from the sea to the horizon, tiny figures
    for (let k = 0; k < 900; k++) { const u = k / 900; const x = 300 - u * 260 + Math.sin(u * 9) * 30, y = 214 + u * 60 + Math.sin(u * 5) * 6; const s = 1 + Math.floor(u * 3); R(x + hash(k, 1) * 6, y - s, 1 + Math.floor(u), s, k % 5 ? "#3a2a20" : PEOPLE.robes[k % 6]); }
    ctx.save(); ctx.globalAlpha = 0.35; for (let x = 0; x < CW; x++) R(x, 240 + Math.sin(x * 0.05) * 6, 1, 14, "#e9d8b0"); ctx.restore();
    // the pillar of cloud, going before them — tall, centre-right, fire at its heart because it is dusk
    const savedP = ctx; { const Pp = CP; for (let j = 0; j < 250; j++) { const k = j / 250; const w = 6 + (1 - k) * (1 - k) * 30 + Math.sin(j * 0.15) * 2 + Math.sin(j * 0.05) * 4; const wob = Math.sin(j * 0.08) * (3 + (1 - k) * 6); const x0 = 232 - w / 2 + wob; R(x0, j + 10, w, 1, "#e6ebf2"); R(x0 + w * 0.3, j + 10, w * 0.4, 1, "#ffffff"); if (k > 0.55) { R(x0 + w * 0.4, j + 10, w * 0.2, 1, k > 0.8 ? "#ffd23f" : "#ffb347"); } } }
    ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = "#ffb347"; ctx.beginPath(); ctx.arc(232 * CP, 262 * CP, 50 * CP, 0, 7); ctx.fill(); ctx.restore();
    // HERO GROUP, large, walking toward us and to the right across the foreground
    const drawB = (b, x, y, k) => b.scale(k).draw(ctx, x, y - b.h * k, CP);
    const base = 322;
    drawB(donkeyHero(0, { pack: true }), 8, base + 4, 2);
    drawB(personHero("elder", 2, 2), 66, base + 2, 2);
    drawB(donkeyHero(2, { blanket: true, i: 4 }), 100, base + 6, 2); drawB(kidRider(4), 120, base + 6 - 48 + 26, 2);
    drawB(camelHero(1, { bags: true }), 160, base, 2); drawB(riderHero("man", 0), 198, base - 72 + 30, 2); drawB(riderHero("woman", 1), 180, base - 72 + 34, 2);
    drawB(personHero("man", 0, 1, { staff: true }), 258, base + 4, 2);
    for (let i = 0; i < 6; i++) drawB(sheepHero(i), 230 + (i % 3) * 22, base - 30 + Math.floor(i / 3) * 10, 1);
    // vignette for the printed-box feel
    const g = ctx.createRadialGradient(150 * CP, 200 * CP, 120 * CP, 150 * CP, 200 * CP, 330 * CP); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(20,10,5,.55)"); ctx.fillStyle = g; ctx.fillRect(0, 0, CW * CP, CH * CP);
    // TITLE: engraved serif on a dark band, the way the 90s boxes did it
    ctx.save(); ctx.globalAlpha = 0.8; R(0, 334, CW, 58, "#1a0e06"); ctx.globalAlpha = 0.55; R(0, 321, CW, 13, "#1a0e06"); ctx.restore(); R(0, 334, CW, 1, "#e6b422"); R(0, 391, CW, 1, "#e6b422");
    const title = (s, y, size, col, font) => { ctx.font = `${size}px ${font}`; ctx.textAlign = "center"; ctx.fillStyle = "#000"; ctx.fillText(s, CW * CP / 2 + 3, y * CP + 3); ctx.fillStyle = col; ctx.fillText(s, CW * CP / 2, y * CP); ctx.textAlign = "left"; };
    title("THE", 352, 24, "#f5e9cf", "'Cinzel', 'Times New Roman', serif");
    title("EXODUS TRAIL", 380, 52, "#ffd86a", "'Cinzel', 'Times New Roman', serif");
    ctx.font = "13px 'Press Start 2P', monospace"; ctx.textAlign = "center"; ctx.fillStyle = "#f5e9cf"; ctx.fillText("FROM THE SEA OF REEDS TO JERICHO", CW * CP / 2, 331 * CP); ctx.textAlign = "left";
    R(0, 0, CW, 8, "#1a0e06"); R(0, CH - 8, CW, 8, "#1a0e06"); ctx.font = "10px 'Press Start 2P', monospace"; ctx.fillStyle = "#e6b422"; ctx.fillText("A FREE BROWSER GAME", 12, 6 * CP + 8); ctx.textAlign = "right"; ctx.fillText("EXODUS 15 → JOSHUA 6", CW * CP - 12, 6 * CP + 8); ctx.textAlign = "left";
    ctx = saved;
  }

  SINAI.ArtV06 = {
    W, H, P, Bmp, PEOPLE, INK,
    setCtx(c, t) { ctx = c; T = t || 0; ctx.imageSmoothingEnabled = false; },
    personHero, kidHero, riderHero, kidRider, camelHero, donkeyHero, oxCartHero, sheepHero,
    heroGroup, heroGroupFor, VIG_FOR, LAYOUT, landscape, pillar, nationSilhouette, portrait, portraitClassic, portraitStrip, CARD, VIG, grave, parchmentMap, outlineDemo, cover, nightShade, rect, text, textC
  };
})();
