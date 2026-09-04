/* ============================================================
   MINI-GAMES — fishing, the slingshot, gathering manna.
   Drawn on the scene canvas in either look (classic green / deluxe
   colour). Keyboard: arrows/WASD move, SPACE acts, ENTER finishes.
   Pointer: move = steer, press/hold/release = act. Phone-friendly.
   Each game returns a Promise resolving to a result object.
   ============================================================ */
(function () {
  const hash = (x, y) => { const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return n - Math.floor(n); };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const PALS = {
    classic: { bg: "#000", sky: "#000", ground: "#1a7a1a", groundDot: "#33ff33", water: "#3aa0ff", waterDark: "#0a2a4a", fish: "#ffffff", bigfish: "#ff7a1a", person: "#33ff33", line: "#ffffff", text: "#33ff33", bright: "#ffffff", warn: "#ff7a1a", sheep: "#ffffff", wolf: "#ff7a1a", scout: "#d35cff", stone: "#ffffff", meter: "#1a7a1a", meterFill: "#33ff33", target: "#ffffff", manna: "#ffffff", basket: "#ff7a1a", sun: "#ff7a1a", dim: "#1a7a1a", star: "#ffffff" },
    deluxe: { bg: "#000", sky: "#8fc3ee", ground: "#dcb97e", groundDot: "#c79b5f", water: "#2f6fa8", waterDark: "#1d4f80", fish: "#cfd8dc", bigfish: "#e6b422", person: "#a63d2f", line: "#f5e9cf", text: "#f5e9cf", bright: "#ffffff", warn: "#ffb347", sheep: "#f2ecd8", wolf: "#5a4a3a", scout: "#4a4a5a", stone: "#e8ddc0", meter: "#4a3220", meterFill: "#ffd23f", target: "#ffffff", manna: "#ffffff", basket: "#8a6a3a", sun: "#fff3b0", dim: "#8a7a62", star: "#ffffff" }
  };
  let ctx, W = 280, H = 96, P = 2, pal, look, T0 = 0;
  const px = (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x) * P, Math.round(y) * P, P, P); };
  const rect = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x) * P, Math.round(y) * P, Math.round(w) * P, Math.round(h) * P); };
  const text = (s, x, y, c, size) => { ctx.fillStyle = c || pal.text; ctx.font = (size || 8) + "px 'Press Start 2P', monospace"; ctx.fillText(s, x * P, y * P); };
  const textR = (s, x, y, c, size) => { ctx.font = (size || 8) + "px 'Press Start 2P', monospace"; const w = ctx.measureText(s).width; ctx.fillStyle = c || pal.text; ctx.fillText(s, x * P - w, y * P); };
  const sprite = (art, x, y, cols) => { for (let j = 0; j < art.length; j++) for (let i = 0; i < art[j].length; i++) { const ch = art[j][i]; if (ch === "." || ch === " ") continue; const c = cols[ch]; if (c) px(x + i, y + j, c); } };
  const alpha = (a, fn) => { ctx.save(); ctx.globalAlpha = a; fn(); ctx.restore(); };
  const now = () => performance.now() / 1000;

  /* ---- art ---- */
  const FISHER = ["..hhh..", ".hhhhh.", ".hsssh.", "..sss..", ".rrrrr.", "rrrrrrr", "r.rrr.r", "s.rrr.s", "..rrr..", "..bbb..", "..rrr..", "..r.r..", "..r.r..", ".kk.kk."];
  const FISH = [["..ff..", ".ffff.", "ffffef", ".ffff.", "..ff..", "f....."], [".fff..", "ffffef", "ffffff", ".fff..", "f....."]];
  const BIGFISH = ["...ffff....", "..ffffff...", ".ffffffffe.", "fffffffffff", ".fffffffff.", "..ffffff...", "f..ff......", "ff........."];
  const SHEEP = [".wwwwww.", "wwwwwwwk", "wwwwwwkk", ".k.ww.k.", ".k....k."];
  const WOLF = [["..........kk", "kk.......kek", "kkkkkkkkkkk.", ".kkkkkkkkk..", ".kk.....kk..", ".k.......k.."], ["..........kk", "kk.......kek", "kkkkkkkkkkk.", ".kkkkkkkkk..", "..kk...kk...", ".k.......k.."]];
  const LION = [["............kk.", "kk..........kek", "k.kkkkkkkkkkkk.", ".kkkkkkkkkkkk..", ".kkkkkkkkkkk...", ".kk..kk..kk....", ".k....k...k...."], ["............kk.", "kk..........kek", "k.kkkkkkkkkkkk.", ".kkkkkkkkkkkk..", ".kkkkkkkkkkk...", "..kk.kk.kk.....", ".k....k...k...."]];
  const SCOUT = [["..kkk..", ".kkkkk.", ".ksssk.", "..sss..", ".ggggg.", "ggggggg", "g.ggg.g", "s.ggg.s", "..ggg..", "..ggg..", "..g.g..", "..g.g..", ".kk.kk."], ["..kkk..", ".kkkkk.", ".ksssk.", "..sss..", ".ggggg.", "ggggggg", "g.ggg.g", "s.ggg.s", "..ggg..", "..ggg..", ".g...g.", ".g...g.", "kk...kk"]];
  const BASKET = [".b.....b.", "..b...b..", "bbbbbbbbb", "b.b.b.b.b", "bbbbbbbbb", ".bbbbbbb."];
  const personCols = () => look === "deluxe" ? { h: "#eadbc0", s: "#d9a066", r: "#a63d2f", b: "#4a2f1a", k: "#3a2a1a" } : { h: pal.person, s: pal.person, r: pal.person, b: pal.bright, k: pal.person };

  /* ---- input plumbing ---- */
  const input = { keys: {}, down: false, px: null, py: null, pressedAt: 0, releasedAt: 0, tapped: false, enter: false, handlers: null };
  function attach(canvas) {
    const toLogical = e => { const r = canvas.getBoundingClientRect(); const t = e.touches && e.touches[0] || e.changedTouches && e.changedTouches[0] || e; return [(t.clientX - r.left) / r.width * W, (t.clientY - r.top) / r.height * H]; };
    const h = {
      key: e => {
        if (e.type === "keydown") { if (!input.keys[e.key] && (e.key === " " || e.key === "ArrowUp")) { input.down = true; input.pressedAt = now(); input.tapped = true; } input.keys[e.key] = true; if (e.key === "Enter") input.enter = true; }
        else { if (e.key === " " || e.key === "ArrowUp") { input.down = false; input.releasedAt = now(); } input.keys[e.key] = false; }
        if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
      },
      pdown: e => { const [x, y] = toLogical(e); input.px = x; input.py = y; input.down = true; input.pressedAt = now(); input.tapped = true; e.preventDefault(); },
      pmove: e => { const [x, y] = toLogical(e); input.px = x; input.py = y; if (e.touches) e.preventDefault(); },
      pup: e => { input.down = false; input.releasedAt = now(); e.preventDefault(); }
    };
    document.addEventListener("keydown", h.key); document.addEventListener("keyup", h.key);
    canvas.addEventListener("mousedown", h.pdown); canvas.addEventListener("mousemove", h.pmove); window.addEventListener("mouseup", h.pup);
    canvas.addEventListener("touchstart", h.pdown, { passive: false }); canvas.addEventListener("touchmove", h.pmove, { passive: false }); canvas.addEventListener("touchend", h.pup, { passive: false });
    input.handlers = h; input.keys = {}; input.down = false; input.px = input.py = null; input.tapped = false; input.enter = false;
    return () => {
      document.removeEventListener("keydown", h.key); document.removeEventListener("keyup", h.key);
      canvas.removeEventListener("mousedown", h.pdown); canvas.removeEventListener("mousemove", h.pmove); window.removeEventListener("mouseup", h.pup);
      canvas.removeEventListener("touchstart", h.pdown); canvas.removeEventListener("touchmove", h.pmove); canvas.removeEventListener("touchend", h.pup);
    };
  }
  const axis = () => (input.keys.ArrowRight || input.keys.d ? 1 : 0) - (input.keys.ArrowLeft || input.keys.a ? 1 : 0);
  const vaxis = () => (input.keys.ArrowDown || input.keys.s ? 1 : 0) - (input.keys.ArrowUp || input.keys.w ? 1 : 0);

  /* ---- shared frame runner ---- */
  function run(canvas, opts, game) {
    return new Promise(res => {
      ctx = canvas.getContext("2d"); look = opts.look === "deluxe" ? "deluxe" : "classic"; pal = PALS[look];
      H = canvas.height / P; W = canvas.width / P; T0 = now();
      const detach = attach(canvas);
      let last = now(), done = false;
      const st = game.init(); window.__mg = st;
      const step = () => {
        if (done) return;
        const t = now(), dt = Math.min(0.05, t - last); last = t;
        const r = game.update(st, dt, t - T0);
        game.draw(st, t - T0);
        input.tapped = false; input.enter = false;
        if (r) { done = true; game.draw(st, t - T0, r); setTimeout(() => { detach(); res(r); }, 900); return; }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }
  function ground(y, dots) { rect(0, y, W, H - y, look === "deluxe" ? pal.ground : pal.bg); if (look === "classic") rect(0, y, W, 1, pal.groundDot); for (let i = 0; i < (dots || 40); i++) px(hash(i, 1) * W, y + 2 + hash(i, 2) * (H - y - 3), pal.groundDot); }
  function sky(t) { if (look === "deluxe") { for (let y = 0; y < H; y++) rect(0, y, W, 1, `rgb(${Math.round(70 + y * 0.9)},${Math.round(130 + y * 0.8)},${Math.round(200 + y * 0.3)})`); } else rect(0, 0, W, H, pal.bg); }
  function hud(l, r) { rect(0, 0, W, 10, look === "deluxe" ? "rgba(0,0,0,.45)" : pal.bg); text(l, 2, 8, pal.text, 7); if (r) textR(r, W - 2, 8, pal.bright, 7); }
  function banner(s, c) { const y = Math.round(H / 2) - 8; rect(20, y - 4, W - 40, 18, look === "deluxe" ? "rgba(0,0,0,.6)" : pal.bg); if (look === "classic") { rect(20, y - 4, W - 40, 1, pal.text); rect(20, y + 13, W - 40, 1, pal.text); } ctx.font = "9px 'Press Start 2P', monospace"; const w = ctx.measureText(s).width; ctx.fillStyle = c || pal.bright; ctx.fillText(s, (W * P - w) / 2, (y + 8) * P); }

  /* ============================ FISHING ============================ */
  const Fishing = {
    init() {
      const waterY = Math.round(H * 0.42);
      const fish = []; for (let i = 0; i < 7; i++) { const big = Math.random() < 0.22; fish.push({ x: Math.random() * W, y: waterY + 6 + Math.random() * (H - waterY - 12), dir: Math.random() < 0.5 ? 1 : -1, sp: (big ? 26 : 14) + Math.random() * 14, big, wob: Math.random() * 6 }); }
      return { waterY, fish, hookY: waterY + 12, hookX: 60, caught: 0, food: 0, timeLeft: (this.opts && this.opts.seconds) || 35, msg: "", msgT: 0, splash: 0, rodBend: 0 };
    },
    update(st, dt, t) {
      st.timeLeft -= dt; if (st.msgT > 0) st.msgT -= dt; if (st.splash > 0) st.splash -= dt; st.rodBend *= 0.9;
      // hook follows pointer y or arrows
      if (input.py !== null) st.hookY += (clamp(input.py, st.waterY + 3, H - 4) - st.hookY) * Math.min(1, dt * 10);
      st.hookY = clamp(st.hookY + vaxis() * 60 * dt, st.waterY + 3, H - 4);
      for (const f of st.fish) {
        f.x += f.dir * f.sp * dt; f.y += Math.sin(t * 2 + f.wob) * 4 * dt;
        if (f.x < -16 || f.x > W + 16) { const big = Math.random() < 0.22; f.dir = -f.dir; f.x = f.dir > 0 ? -12 : W + 12; f.big = big; f.sp = (big ? 26 : 14) + Math.random() * 14; f.y = st.waterY + 6 + Math.random() * (H - st.waterY - 12); }
      }
      // strike
      if (input.tapped) {
        st.rodBend = 1; st.splash = 0.4;
        const hit = st.fish.find(f => Math.abs((f.x + (f.big ? 5 : 3)) - st.hookX) < (f.big ? 7 : 5) && Math.abs((f.y + 2) - st.hookY) < (f.big ? 5 : 4));
        if (hit) { st.caught++; const lbs = hit.big ? 8 + Math.floor(Math.random() * 6) : 2 + Math.floor(Math.random() * 3); st.food += lbs; st.msg = (hit.big ? "A BIG ONE! +" : "Caught one. +") + lbs + " lbs"; st.msgT = 1.6; hit.x = hit.dir > 0 ? -14 : W + 14; hit.y = st.waterY + 6 + Math.random() * (H - st.waterY - 12); }
        else { st.msg = "Missed."; st.msgT = 0.7; }
      }
      if (st.timeLeft <= 0 || input.enter) return { caught: st.caught, food: st.food };
    },
    draw(st, t, result) {
      sky(t);
      // shore and water
      const wy = st.waterY;
      rect(0, wy, W, H - wy, pal.water);
      for (let j = 0; j < H - wy; j++) for (let i = 0; i < W; i += 2) if ((i + j * 3 + Math.floor(t * 5)) % 9 < 2) px(i, wy + j, look === "deluxe" ? "#5aa0d8" : pal.waterDark);
      rect(0, wy, 50, H - wy, look === "deluxe" ? pal.ground : pal.bg); if (look === "classic") { rect(0, wy, 50, 1, pal.groundDot); rect(50, wy, 1, H - wy, pal.groundDot); }
      for (let i = 0; i < 14; i++) px(hash(i, 5) * 48, wy + 3 + hash(i, 6) * (H - wy - 4), pal.groundDot);
      // fisher
      sprite(FISHER, 22, wy - 14, personCols());
      const tipX = 42 + Math.round(st.rodBend * 2), tipY = wy - 18 + Math.round(st.rodBend * 4);
      ctx.strokeStyle = look === "deluxe" ? "#8a6a3a" : pal.person; ctx.lineWidth = P; ctx.beginPath(); ctx.moveTo(28 * P, (wy - 6) * P); ctx.lineTo(tipX * P, tipY * P); ctx.stroke();
      ctx.strokeStyle = pal.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tipX * P, tipY * P); ctx.lineTo(st.hookX * P, st.hookY * P); ctx.stroke();
      px(st.hookX, st.hookY, pal.bright); px(st.hookX - 1, st.hookY + 1, pal.bright); px(st.hookX, st.hookY + 1, pal.bright);
      if (st.splash > 0) for (let i = 0; i < 5; i++) px(st.hookX - 3 + i * 1.5, st.hookY - 2 - st.splash * 6 * hash(i, 9), pal.bright);
      // fish
      for (const f of st.fish) {
        const art = f.big ? BIGFISH : FISH[Math.floor(t * 4 + f.wob) % 2];
        const a = f.dir > 0 ? art.map(r => r.split("").reverse().join("")) : art;
        sprite(a, f.x, f.y, { f: f.big ? pal.bigfish : pal.fish, e: pal.bg });
      }
      hud("FISHING  " + Math.max(0, Math.ceil(st.timeLeft)) + "s", "Caught: " + st.caught + "  (" + st.food + " lbs)");
      if (st.msgT > 0 && !result) text(st.msg, 56, wy - 4, pal.warn, 7);
      if (!result) textR("move: hook   tap/SPACE: strike   ENTER: done", W - 2, H - 2, pal.dim, 5);
      if (result) banner(result.caught ? result.caught + " FISH — " + result.food + " LBS" : "NOTHING BITING");
    }
  };

  /* ============================ SLINGSHOT ============================ */
  const Slingshot = {
    init() {
      const kind = (this.opts && this.opts.kind) || "wolf";
      const n = kind === "lion" ? 2 : 3;
      const preds = []; for (let i = 0; i < n; i++) preds.push({ kind, x: W + 20 + i * 90, y: 0, sp: (kind === "lion" ? 22 : kind === "scout" ? 18 : 16) + i * 4, alive: true, fled: false, hitT: 0 });
      const gy = Math.round(H * 0.72);
      return { kind, preds, gy, flockX: 70, sheep: this.opts && this.opts.sheep || 6, lost: 0, hits: 0, drawing: false, power: 0, stone: null, msg: "", msgT: 0, endT: 0, t: 0 };
    },
    update(st, dt, t) {
      st.t = t; if (st.msgT > 0) st.msgT -= dt;
      // draw the sling while held; release fires
      if (input.down && !st.stone) { st.drawing = true; st.power = clamp((now() - input.pressedAt) / 1.1, 0, 1); }
      else if (st.drawing && !input.down) {
        st.drawing = false;
        const target = st.preds.find(p => p.alive && !p.fled);
        if (target) {
          // needed power = distance from the shepherd to the predator, as a fraction of the field
          const need = clamp((target.x - (st.flockX + 20)) / (W - st.flockX - 20), 0.05, 1);
          const hit = Math.abs(st.power - need) < 0.09;
          st.stone = { x: st.flockX + 22, y: st.gy - 10, vx: 120 * (0.4 + st.power), vy: -70 * (0.3 + st.power), t: 0, hit, target, land: st.flockX + 22 + (W - st.flockX - 20) * st.power };
        }
        st.power = 0;
      }
      if (st.stone) {
        const s = st.stone; s.t += dt; s.x += s.vx * dt; s.vy += 160 * dt; s.y += s.vy * dt;
        if (s.hit && s.x >= s.target.x - 2) { s.target.fled = true; s.target.hitT = 0.01; st.hits++; st.msg = "HIT! It runs."; st.msgT = 1.2; st.stone = null; }
        else if (s.y >= st.gy - 1 || s.x > W) { if (!s.hit) { st.msg = s.land < (s.target.x - 6) ? "Short." : "Over."; st.msgT = 0.8; } st.stone = null; }
      }
      for (const p of st.preds) {
        if (p.fled) { p.hitT += dt; p.x += (p.sp + 40) * dt; if (p.x > W + 30) p.alive = false; continue; }
        if (!p.alive) continue;
        p.x -= p.sp * dt;
        if (p.x <= st.flockX + 24) { // reaches the flock
          const take = p.kind === "lion" ? 2 : 1; st.lost += take; st.sheep = Math.max(0, st.sheep - take); p.fled = true; st.msg = p.kind === "scout" ? "He drives off a sheep!" : "It takes " + (take > 1 ? "two sheep!" : "a sheep!"); st.msgT = 1.4;
        }
      }
      if (st.preds.every(p => !p.alive) || t > 45) { st.endT += dt; if (st.endT > 0.6 || t > 45) return { hits: st.hits, lost: st.lost, kind: st.kind }; }
    },
    draw(st, t, result) {
      sky(t);
      if (look === "deluxe") { alpha(0.55, () => rect(0, 0, W, H, "#2a2657")); } // dusk
      for (let i = 0; i < 18; i++) px(hash(i, 3) * W, hash(i, 7) * (st.gy - 20), pal.star);
      ground(st.gy, 30);
      // flock
      for (let i = 0; i < st.sheep; i++) sprite(SHEEP, 10 + (i % 4) * 12, st.gy - 7 - Math.floor(i / 4) * 5, { w: pal.sheep, k: look === "deluxe" ? "#3a2a1a" : pal.bg });
      // shepherd with sling
      sprite(FISHER, st.flockX + 10, st.gy - 14, personCols());
      const draw = st.drawing ? st.power : 0;
      ctx.strokeStyle = pal.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo((st.flockX + 16) * P, (st.gy - 8) * P); ctx.lineTo((st.flockX + 20 - draw * 6) * P, (st.gy - 12 + draw * 3) * P); ctx.stroke();
      // predators
      for (const p of st.preds) {
        if (!p.alive) continue;
        const f = Math.floor(t * 6) % 2;
        if (p.kind === "wolf") sprite(WOLF[f], p.x, st.gy - 6, { k: pal.wolf, e: pal.bright });
        else if (p.kind === "lion") sprite(LION[f], p.x, st.gy - 7, { k: look === "deluxe" ? "#c98a2e" : pal.wolf, e: pal.bright });
        else sprite(SCOUT[f], p.x, st.gy - 13, { k: pal.scout, s: look === "deluxe" ? "#d9a066" : pal.scout, g: pal.scout });
        if (p.fled && p.hitT < 0.5) text("!", p.x + 4, st.gy - 14, pal.warn, 8);
      }
      if (st.stone) { px(st.stone.x, st.stone.y, pal.stone); px(st.stone.x - 1, st.stone.y, pal.stone); }
      // power meter with target band
      const mx = 80, my = H - 8, mw = W - 160;
      rect(mx, my, mw, 4, pal.meter);
      const target = st.preds.find(p => p.alive && !p.fled);
      if (target) { const need = clamp((target.x - (st.flockX + 20)) / (W - st.flockX - 20), 0.05, 1); rect(mx + (need - 0.09) * mw, my - 1, 0.18 * mw, 6, pal.target); rect(mx + (need - 0.09) * mw + 1, my, 0.18 * mw - 2, 4, pal.meter); }
      rect(mx, my, st.power * mw, 4, pal.meterFill);
      hud((st.kind === "wolf" ? "WOLVES" : st.kind === "lion" ? "A LION" : "AMALEKITE SCOUTS") + " AT THE FLOCK", "Sheep: " + st.sheep + "  Lost: " + st.lost);
      if (st.msgT > 0 && !result) text(st.msg, st.flockX + 30, st.gy - 22, pal.warn, 7);
      if (!result) text("hold SPACE / press: draw   release: sling   land the stone in the white band", 4, H - 1, pal.dim, 5);
      if (result) banner(result.lost ? "LOST " + result.lost + " OF THE FLOCK" : "THE FLOCK IS SAFE");
    }
  };

  /* ============================ MANNA ============================ */
  const Manna = {
    init() {
      const o = this.opts || {};
      const gy = Math.round(H * 0.38);
      const flakes = [];
      if (!o.empty) for (let i = 0; i < 90; i++) flakes.push({ x: 4 + Math.random() * (W - 8), y: gy + 3 + Math.random() * (H - gy - 8), alive: true, melt: 0 });
      return { gy, flakes, bx: W / 2, by: gy + 20, omers: 0, sunT: 0, done: false, empty: !!o.empty, sixth: !!o.sixth, endT: 0, melted: 0 };
    },
    update(st, dt, t) {
      // basket follows pointer or arrows
      if (input.px !== null) { st.bx += (clamp(input.px, 4, W - 4) - st.bx) * Math.min(1, dt * 9); st.by += (clamp(input.py, st.gy + 3, H - 4) - st.by) * Math.min(1, dt * 9); }
      st.bx = clamp(st.bx + axis() * 70 * dt, 4, W - 4); st.by = clamp(st.by + vaxis() * 60 * dt, st.gy + 3, H - 4);
      for (const f of st.flakes) {
        if (!f.alive) continue;
        if (Math.abs(f.x - st.bx) < 5 && Math.abs(f.y - (st.by + 2)) < 4) { f.alive = false; st.omers += 0.25; }
      }
      // the sun climbs; from 8 s the manna melts, all gone by 22 s
      if (t > 8) { const rate = (t - 8) / 14; for (const f of st.flakes) if (f.alive && Math.random() < rate * dt * 0.9) { f.alive = false; st.melted++; } }
      const left = st.flakes.filter(f => f.alive).length;
      if (input.enter || (input.tapped && input.px !== null && input.px > W - 44 && input.py < 12)) st.done = true;
      if (st.empty && t > 5) st.done = true;
      if (left === 0 && !st.empty && t > 3) st.done = true;
      if (st.done || t > 40) { st.endT += dt; if (st.endT > 0.3) return { omers: Math.round(st.omers * 4) / 4, empty: st.empty }; }
    },
    draw(st, t, result) {
      // dawn sky with a rising sun
      if (look === "deluxe") { const k = clamp(t / 20, 0, 1); for (let y = 0; y < st.gy; y++) rect(0, y, W, 1, `rgb(${Math.round(90 + k * 60 + y)},${Math.round(80 + k * 100 + y)},${Math.round(140 + k * 80)})`); } else rect(0, 0, W, H, pal.bg);
      const sx = 30 + clamp(t / 22, 0, 1) * 200, sy = st.gy - 4 - Math.sin(clamp(t / 22, 0, 1) * Math.PI) * (st.gy - 12);
      rect(sx - 3, sy - 1, 7, 3, pal.sun); rect(sx - 1, sy - 3, 3, 7, pal.sun); rect(sx - 2, sy - 2, 5, 5, pal.sun);
      // far tents
      for (let i = 0; i < 7; i++) { const x = 10 + i * 40; for (let j = 0; j < 5; j++) rect(x + 4 - j, st.gy - 1 - (4 - j), 1 + j * 2, 1, look === "deluxe" ? "#6b5a48" : pal.dim); }
      // ground with the manna "like frost"
      ground(st.gy, look === "deluxe" ? 40 : 10);
      if (look === "deluxe") alpha(0.25, () => rect(0, st.gy, W, H - st.gy, "#ffffff"));
      for (const f of st.flakes) if (f.alive) { if (look === "deluxe") px(f.x + 1, f.y + 1, "#b8955a"); px(f.x, f.y, pal.manna); if (hash(f.x, f.y) < 0.5) px(f.x + 1, f.y, pal.manna); }
      if (st.empty) for (let i = 0; i < 30; i++) alpha(0.3, () => px(hash(i, 4) * W, st.gy + 3 + hash(i, 5) * (H - st.gy - 5), pal.bright)); // just dew
      // basket
      sprite(BASKET, st.bx - 4, st.by - 3, { b: pal.basket });
      hud(st.sixth ? "THE SIXTH DAY. TOMORROW IS THE SABBATH." : "GATHERING MANNA"); textR("Omers: " + (Math.round(st.omers * 4) / 4).toFixed(2), W - 48, 8, pal.bright, 7);
      // done button
      rect(W - 42, 1, 40, 9, look === "deluxe" ? "rgba(0,0,0,.5)" : pal.bg); if (look === "classic") { rect(W - 42, 1, 40, 1, pal.text); rect(W - 42, 9, 40, 1, pal.text); } text("DONE", W - 34, 8, pal.bright, 7);
      if (!result) text("move the basket over the flakes   ENTER or DONE when you have enough", 4, H - 1, pal.dim, 5);
      if (st.empty && t > 1.5 && !result) banner("NOTHING. ONLY DEW.");
      if (result && !result.empty) banner("GATHERED " + result.omers.toFixed(2) + " OMERS");
    }
  };

  SINAI.Minigames = {
    /* opts: { canvas, look, kind, sheep, empty, sixth } */
    fishing(opts) { return run(opts.canvas, opts, Object.assign(Object.create(Fishing), { opts })); },
    slingshot(opts) { return run(opts.canvas, opts, Object.assign(Object.create(Slingshot), { opts })); },
    manna(opts) { return run(opts.canvas, opts, Object.assign(Object.create(Manna), { opts })); }
  };
})();
