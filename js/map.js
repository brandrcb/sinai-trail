/* ============================================================
   MAP — toggle with M.  Egypt / Sinai / Negev / Edom / Moab / Canaan
   drawn in pixel style, with the route, stops and current position.
   ============================================================ */
(function () {
  const LON0 = 31.4, LON1 = 36.6, LAT0 = 27.55, LAT1 = 33.25;
  const W = 280, H = 192, P = 2;
  const C = { g: "#33ff33", w: "#ffffff", o: "#ff7a1a", b: "#3aa0ff", k: "#000", d: "#1a7a1a", p: "#d35cff" };
  let ctx, canvas, visible = false, frame = 0, timer = null;
  const X = lon => (lon - LON0) / (LON1 - LON0) * W, Y = lat => (LAT1 - lat) / (LAT1 - LAT0) * H;
  const px = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x) * P, Math.round(y) * P, P, P); };
  const poly = (pts, c) => { ctx.fillStyle = c; ctx.beginPath(); pts.forEach((p, i) => { const x = X(p[0]) * P, y = Y(p[1]) * P; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.fill(); };
  const stroke = (pts, c, dash) => { ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.setLineDash(dash || []); ctx.beginPath(); pts.forEach((p, i) => { const x = X(p[0]) * P, y = Y(p[1]) * P; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); ctx.setLineDash([]); };
  const label = (s, lon, lat, c, size) => { ctx.fillStyle = c || C.g; ctx.font = (size || 7) + "px 'Press Start 2P', monospace"; ctx.fillText(s, X(lon) * P, Y(lat) * P); };
  const hash = (x, y) => { const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return n - Math.floor(n); };
  const waterFill = (pts) => { poly(pts, "#0a2a4a"); ctx.save(); ctx.beginPath(); pts.forEach((p, i) => { const x = X(p[0]) * P, y = Y(p[1]) * P; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.clip(); for (let y = 0; y < H; y += 2) for (let x = (y / 2 + frame) % 4; x < W; x += 4) px(x, y, C.b); ctx.restore(); stroke(pts.concat([pts[0]]), C.b); };

  const MED = [[31.4, 31.55], [32.3, 31.35], [32.9, 31.15], [33.5, 31.1], [34.2, 31.3], [34.5, 31.5], [34.75, 32.0], [34.85, 32.5], [35.0, 32.8], [35.1, 33.25], [31.4, 33.25]];
  const SUEZ = [[32.55, 29.98], [32.45, 29.6], [32.6, 29.1], [33.0, 28.5], [33.5, 27.95], [33.9, 27.55], [34.3, 27.55], [34.25, 27.75], [33.9, 28.1], [33.6, 28.55], [33.2, 29.05], [32.9, 29.5], [32.7, 29.98]];
  const AQABA = [[34.95, 29.55], [34.7, 29.1], [34.55, 28.6], [34.45, 28.2], [34.3, 27.55], [34.75, 27.55], [34.85, 28.1], [35.0, 28.7], [35.05, 29.2], [35.03, 29.55]];
  const REDSEA = [[33.85, 27.55], [36.6, 27.55], [36.6, 27.62], [34.9, 27.7], [34.35, 27.85], [34.0, 27.7]];
  const DEAD = [[35.42, 31.78], [35.56, 31.78], [35.62, 31.4], [35.52, 31.02], [35.4, 31.1], [35.36, 31.45]];
  const GALILEE = [[35.53, 32.9], [35.65, 32.87], [35.62, 32.7], [35.5, 32.75]];
  const BITTER = [[32.3, 30.42], [32.45, 30.42], [32.42, 30.18], [32.3, 30.2]];
  const JORDAN = [[35.6, 32.7], [35.55, 32.4], [35.58, 32.1], [35.52, 31.8]];
  const NILE = [[31.4, 29.7], [31.7, 30.2], [32.0, 30.7], [32.3, 31.35]];

  function draw(S) {
    if (document.body.classList.contains("deluxe")) { SINAI.ArtV06.setCtx(ctx, frame * 0.4); SINAI.ArtV06.parchmentMap(S); return; }
    ctx.fillStyle = C.k; ctx.fillRect(0, 0, W * P, H * P);
    // land texture
    for (let i = 0; i < 700; i++) px(hash(i, 1) * W, hash(i, 2) * H, "#0b3a0b");
    waterFill(MED); waterFill(REDSEA); waterFill(SUEZ); waterFill(AQABA); waterFill(DEAD); waterFill(GALILEE); waterFill(BITTER);
    stroke(JORDAN, C.b); stroke(NILE, C.b);
    label("GREAT SEA", 32.4, 32.3, C.b); label("EGYPT", 31.9, 29.3, C.w); label("GOSHEN", 31.75, 30.55, C.d, 6);
    label("SEA OF", 32.75, 28.35, C.b, 6); label("REEDS", 32.75, 28.15, C.b, 6);
    label("WILDERNESS", 33.55, 29.85, C.d, 6); label("OF PARAN", 33.7, 29.65, C.d, 6);
    label("NEGEV", 34.65, 31.0, C.d, 6); label("ZIN", 34.9, 30.5, C.d, 6);
    label("EDOM", 35.65, 30.35, C.w, 6); label("MOAB", 35.85, 31.3, C.w, 6); label("AMMON", 35.95, 31.95, C.w, 6);
    label("CANAAN", 34.95, 32.35, C.w, 7); label("SALT", 35.72, 31.5, C.b, 5); label("SEA", 35.72, 31.38, C.b, 5);
    label("GULF OF", 35.2, 28.9, C.b, 5); label("AQABA", 35.2, 28.75, C.b, 5); label("MT SEIR", 35.5, 30.05, C.d, 5);
    label("WAY OF THE", 32.9, 31.05, C.d, 5); label("PHILISTINES", 32.9, 30.92, C.d, 5);
    // route
    const stops = SINAI.STOPS, pts = stops.map(s => [s.lon, s.lat]);
    const loop = [[34.42, 30.65], [34.9, 29.7], [35.2, 29.95], [34.8, 30.1]];
    stroke(pts.slice(0, 10), C.o, [4, 4]); stroke(loop, C.o, [2, 4]); stroke(pts.slice(9), C.o, [4, 4]);
    // stops
    stops.forEach((s, i) => {
      const x = X(s.lon), y = Y(s.lat), seen = S && S.visited.includes(s.id);
      const c = seen ? C.w : C.g;
      px(x, y, c); px(x - 1, y, c); px(x + 1, y, c); px(x, y - 1, c); px(x, y + 1, c);
      if (i % 2 === 0 || seen) label((s.short || s.name).toUpperCase(), s.lon + 0.08, s.lat + (i % 2 ? -0.1 : 0.14), c, 5);
    });
    // current position
    if (S) {
      const i = S.stopIdx, a = stops[Math.max(0, i - 1)], b = stops[i];
      const t = b.miles > 0 ? 1 - Math.max(0, S.miles) / b.miles : 1;
      const lon = a.lon + (b.lon - a.lon) * t, lat = a.lat + (b.lat - a.lat) * t;
      if (frame % 2 === 0) { const x = X(lon), y = Y(lat); for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) if (Math.abs(dx) + Math.abs(dy) <= 2) px(x + dx, y + dy, C.o); }
      label("YOU ARE HERE", lon + 0.15, lat - 0.25, C.o, 5);
    }
    label("M / ESC to close", 31.5, 27.75, C.d, 5);
  }

  SINAI.Map = {
    get visible() { return visible; },
    init() { canvas = document.getElementById("mapc"); ctx = canvas.getContext("2d"); ctx.imageSmoothingEnabled = false; },
    show(S) {
      visible = true; document.getElementById("map").hidden = false;
      const hist = document.getElementById("maplog");
      hist.innerHTML = (S && S.log.length ? S.log.map(l => "<li>" + l + "</li>").join("") : "<li>The journey begins.</li>");
      timer = setInterval(() => { frame++; draw(S); }, 400); draw(S);
    },
    hide() { visible = false; document.getElementById("map").hidden = true; clearInterval(timer); },
    toggle(S) { visible ? this.hide() : this.show(S); }
  };
})();
