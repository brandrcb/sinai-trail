/* ============================================================
   THE EXODUS TRAIL — engine
   Screens, state, travel loop, events, scoring.
   ============================================================ */
(function () {
  const $ = id => document.getElementById(id);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const rnd = () => Math.random();

  /* ---------- UI layer ---------- */
  const UI = {
    canvas: null, ctx: null, frame: 0, anim: null, t0: 0, T: 0,
    pending: null,          // resolver for current page/choice
    options: [],            // current option list
    interrupt: false,
    fast: false,            // travel fast-forward (SPACE)
    look: "classic",        // "classic" (1985 green screen) or "deluxe" (1990-style colour)
    travel: { progress: 0, scroll: 0 },
    init() {
      this.canvas = $("scene"); this.ctx = this.canvas.getContext("2d");
      this.ctx.imageSmoothingEnabled = false;
      let look = "classic"; try { look = localStorage.getItem("sinai_look") || "classic"; } catch (e) { }
      if (location.hash === "#deluxe") look = "deluxe"; if (location.hash === "#classic") look = "classic";
      this.setLook(look, true);
      $("lookbtn").addEventListener("click", () => this.setLook(this.look === "classic" ? "deluxe" : "classic"));
      this.canvas.addEventListener("click", () => { if (!this.pending && !this.busy) this.fast = !this.fast; });
      document.addEventListener("keydown", e => this.key(e));
      $("menu").addEventListener("click", e => {
        const li = e.target.closest("li"); if (li) this.select(+li.dataset.i);
      });
      $("text").addEventListener("click", () => { if (this.pending && !this.options.length) this.select(0); });
      $("mapbtn").addEventListener("click", () => SINAI.Map.toggle(Game.S));
      $("sndbtn").addEventListener("click", () => SINAI.Audio.toggle());
      $("map").addEventListener("click", () => SINAI.Map.hide());
    },
    setLook(mode, silent) {
      this.look = mode === "deluxe" ? "deluxe" : "classic";
      document.body.classList.toggle("deluxe", this.look === "deluxe");
      this.canvas.height = this.look === "deluxe" ? SINAI.ScenesDeluxe.H * SINAI.ScenesDeluxe.P : 192;
      $("lookbtn").textContent = this.look === "deluxe" ? "LOOK: DELUXE (L)" : "LOOK: CLASSIC (L)";
      if (Game.S) this.status(Game.S);
      try { localStorage.setItem("sinai_look", this.look); } catch (e) { }
      if (!silent) { this.frame = 0; this.paint(); }
    },
    key(e) {
      if (this.busy) return;
      if (this.textInput) { if (e.key === "Escape") return; }
      if (e.key === "m" || e.key === "M") { if (Game.S) SINAI.Map.toggle(Game.S); return; }
      if (e.key === "s" || e.key === "S") { SINAI.Audio.toggle(); return; }
      if ((e.key === "l" || e.key === "L") && !this.textInput) { this.setLook(this.look === "classic" ? "deluxe" : "classic"); return; }
      if (SINAI.Map.visible) { if (e.key === "Escape" || e.key === "Enter") SINAI.Map.hide(); return; }
      if (this.textInput) return; // typing a name
      if (!this.pending) { if (e.key === "Enter") this.interrupt = true; else if (e.key === " ") { this.fast = !this.fast; e.preventDefault(); } return; }
      if (this.options.length) {
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= this.options.length) { this.select(n - 1); e.preventDefault(); }
        else if (e.key === "Enter" && this.options.length === 1) this.select(0);
      } else if (e.key === "Enter" || e.key === " ") { this.select(0); e.preventDefault(); }
    },
    select(i) {
      if (!this.pending) return;
      SINAI.Audio.click();
      const r = this.pending; this.pending = null; this.options = [];
      $("menu").innerHTML = ""; r(i);
    },
    setScene(name, opts) { if (name !== this.sceneName) { this.t0 = performance.now(); this.T = 0; this.frame = 0; } this.sceneName = name; this.sceneOpts = opts || {}; this.paint(); },
    paint() {
      if (!this.sceneName) return;
      if (this.look === "deluxe") SINAI.ScenesDeluxe.draw(this.ctx, this.sceneName, this.T, Game.S, this.sceneOpts, this.travel);
      else SINAI.Scenes.draw(this.ctx, this.sceneName, this.frame, Game.S, this.sceneOpts);
    },
    startAnim() {
      if (this.anim) return;
      let last = performance.now();
      const step = now => {
        if (!this.anim) return;
        const dt = Math.min(0.1, (now - last) / 1000); last = now;
        this.T = Math.max(0, (now - this.t0) / 1000);
        if (this.sceneName === "travel") this.travel.scroll += dt * (this.fast ? 90 : 26) * (Game.S && Game.S.pace === "ahead" ? 1.3 : Game.S && Game.S.pace === "lag" ? 0.7 : 1);
        if (this.look === "deluxe") this.paint();
        else { const f = Math.floor(this.T / (this.fast && this.sceneName === "travel" ? 0.06 : 0.16)); if (f !== this.frame) { this.frame = f; this.paint(); } }
        this.anim = requestAnimationFrame(step);
      };
      this.anim = requestAnimationFrame(step);
    },
    stopAnim() { if (this.anim) cancelAnimationFrame(this.anim); this.anim = null; },
    title(t) { $("title").textContent = t || ""; },
    text(t) { $("text").textContent = t || ""; $("text").scrollTop = 0; },
    page(text, opts) {
      opts = opts || {};
      if (opts.scene) this.setScene(opts.scene, opts);
      if (opts.title !== undefined) this.title(opts.title);
      this.text(text);
      $("menu").innerHTML = '<li data-i="0" class="cont">Press ENTER to continue</li>';
      this.options = []; // page has no numbered options
      return new Promise(res => { this.pending = res; });
    },
    choose(prompt, options, opts) {
      opts = opts || {};
      if (opts.scene) this.setScene(opts.scene, opts);
      if (opts.title !== undefined) this.title(opts.title);
      this.text(prompt);
      $("menu").innerHTML = options.map((o, i) => `<li data-i="${i}"><span class="k">${i + 1}.</span> ${o}</li>`).join("");
      this.options = options;
      return new Promise(res => { this.pending = res; });
    },
    async input(prompt, def) {
      this.text(prompt);
      $("menu").innerHTML = `<li class="inp"><input id="inp" maxlength="14" value="${def || ""}"> <span class="k">(ENTER)</span></li>`;
      const inp = $("inp"); inp.focus(); inp.select();
      this.textInput = true;
      return new Promise(res => {
        inp.addEventListener("keydown", e => { if (e.key === "Enter") { this.textInput = false; const v = inp.value.trim() || def; $("menu").innerHTML = ""; res(v); } });
      });
    },
    status(S) {
      const st = $("status"); const pc = $("party");
      if (!S) { st.innerHTML = ""; if (pc) pc.hidden = true; return; }
      if (pc) { pc.hidden = false; const c = pc.getContext("2d"); c.imageSmoothingEnabled = false; c.fillStyle = this.look === "deluxe" ? "#e9dcb9" : "#000"; c.fillRect(0, 0, pc.width, pc.height); SINAI.ArtV06.setCtx(c, 0); SINAI.ArtV06.portraitStrip(4, 2, S.party, this.look); }
      const h = Game.band(S.H) + (S.party.some(p => p.alive && p.ill) ? " (illness)" : "");
      st.innerHTML =
        `<span>Date: ${Game.dateStr()}</span><span>Weather: ${S.weather}</span><span>Health: ${h}</span>` +
        `<span>Pace: ${S.pace === "cloud" ? "with the cloud" : S.pace === "ahead" ? "ahead of the cloud" : "lagging"}</span><span>Manna: ${S.manna ? SINAI.RATIONS[S.rations].name.split(",")[0].toLowerCase() : (S.visited.includes("jordan") ? "ended" : "none yet")}</span>` +
        `<span>Water: ${Math.max(0, Math.floor(Game.waterDays()))} days</span><span>Food: ${Math.max(0, Math.round(S.food))} lbs</span>` +
        `<span>Emunah: ${Math.round(S.trust)}</span><span>Grumbles: ${S.grumbles}/10</span>`;
    }
  };

  /* ---------- Game ---------- */
  const Game = {
    S: null,
    difficulty() { let d = 1; try { d = parseFloat(localStorage.getItem("sinai_diff") || "1") || 1; } catch (e) { } return d; },
    setDifficulty(d) { try { localStorage.setItem("sinai_diff", String(d)); } catch (e) { } if (this.S) this.S.diff = d; },
    diffName(d) { return d < 1 ? "FOLLOW THE CLOUD (gentle)" : d > 1 ? "TEN TIMES (hard)" : "TEST THE LORD (normal)"; },
    /* hidden hardship score H (0-139), Oregon-style: good / fair / poor / very poor */
    band(H) { return H < 35 ? "good" : H < 70 ? "fair" : H < 105 ? "poor" : "very poor"; },
    count() { return this.S.party.filter(p => p.alive).length; },
    waterCap() { return 18 * Math.max(1, this.count()); },   // 18 days of skins for the household
    waterDays() { return this.S.water / Math.max(1, this.count()); },
    atWater() { const S = this.S; return S.miles <= 0 && ["spring", "well", "bought"].includes(SINAI.STOPS[S.stopIdx].water); },
    dateStr() {
      const S = this.S; return `${S.d} ${SINAI.MONTHS[S.m - 1]}, year ${S.y}`;
    },
    newState(role, names) {
      const R = SINAI.ROLES.find(r => r.id === role);
      return {
        role, mult: R.mult, silver: R.silver, gold: 120,
        party: names.map((n, i) => ({ name: n, hp: 100, alive: true, ill: null, cause: null, age: [35, 31, 63, 12, 8][i] })),
        water: 0, food: 0, flock: 0, donkeys: 0, skins: 0, sandals: 0, sandalsBought: 0,
        manna: false, trust: 55, grumbles: 0, flags: {},
        H: 10, FS: 0, diff: Game.difficulty(), sandalMiles: 0, illToday: null, egyptFish: 0,
        y: 1, m: 1, d: 21, day: 0, dow: 0,
        stopIdx: 0, miles: 0, traveled: 0, pace: "cloud", rations: "omer", paceMod: 1,
        weather: "clear", log: [], visited: [], deaths: [], generation: 1
      };
    },

    /* ----- context passed to content ----- */
    ctx() {
      const S = this.S, G = this;
      const g = {
        S, rand: rnd, pick: a => a[Math.floor(rnd() * a.length)],
        page: (t, o) => UI.page(t, Object.assign({ scene: o && o.scene || G.curScene }, o || {})),
        choose: (p, o, x) => UI.choose(p, o, Object.assign({ scene: x && x.scene || G.curScene }, x || {})),
        insight: (src, t) => UI.page(t, { title: "SCROLL OF INSIGHT", scene: "scroll" }),
        minigame: (name, opts) => G.minigame(name, opts),
        trust: n => { S.trust = Math.max(0, Math.min(100, S.trust + n)); UI.status(S); },
        grumble: why => { S.grumbles++; S.trust = Math.max(0, S.trust - 3); S.H = Math.min(139, S.H + 5); S.log.push("Grumbled at " + why); if (S.grumbles >= 10 && S.visited.includes("kadesh") && !S.flags.sentence) { S.flags.sentence = true; S.trust = Math.max(0, S.trust - 5); } UI.status(S); return S.grumbles; },
        water: n => { S.water = Math.max(0, Math.min(G.waterCap(), S.water + n * Math.max(1, G.count()))); UI.status(S); },
        food: n => { S.food = Math.max(0, S.food + n); UI.status(S); },
        flock: n => { S.flock = Math.max(0, S.flock + n); },
        silver: n => { S.silver = Math.max(0, S.silver + n); },
        hurt: (n, who) => { S.party.forEach(p => { if (p.alive && (!who || p.name === who)) p.hp = Math.max(0, p.hp - n); }); UI.status(S); },
        heal: (n, who) => { S.party.forEach(p => { if (p.alive && (!who || p.name === who)) p.hp = Math.min(100, p.hp + n); }); UI.status(S); },
        alive: () => S.party.filter(p => p.alive),
        count: () => S.party.filter(p => p.alive).length,
        weakest: () => { const a = S.party.filter(p => p.alive).sort((x, y) => x.hp - y.hp); return a.length ? a[0].name : "someone"; },
        sick: ill => { const a = S.party.filter(p => p.alive && !p.ill); if (!a.length) return g.weakest(); const p = g.pick(a); G.fallIll(p, ill, true); UI.status(S); return p.name; },
        cure: name => { const p = S.party.find(p => p.name === name); if (p) { p.ill = null; p.hp = Math.min(100, p.hp + 20); } },
        kill: (cause, name) => {
          const a = S.party.filter(p => p.alive && (p !== S.party[0] || name));
          const p = name ? S.party.find(x => x.name === name && x.alive) : (a.length ? g.pick(a) : null);
          if (!p) return null; p.alive = false; p.hp = 0; p.cause = cause; S.deaths.push({ name: p.name, cause, where: G.whereStr() }); return p.name;
        },
        flag: (k, v) => { S.flags[k] = v === undefined ? true : v; },
        has: k => !!S.flags[k],
        log: t => S.log.push(t),
        days: n => { for (let i = 0; i < n; i++) G.tick(false); UI.status(S); },
        setDate: (y, m, d) => { S.y = y; S.m = m; S.d = d; UI.status(S); },
        name: i => S.party[i].name,
        generation: () => G.generation(g)
      };
      return g;
    },

    /* ---------- mini-games ---------- */
    async minigame(name, opts) {
      opts = opts || {};
      UI.stopAnim(); UI.busy = true; UI.pending = null; UI.options = []; $("menu").innerHTML = "";
      if (opts.title !== undefined) UI.title(opts.title);
      UI.text(opts.text || "");
      let r = null;
      try { r = await SINAI.Minigames[name](Object.assign({ canvas: UI.canvas, look: UI.look }, opts)); }
      catch (e) { console.error(e); r = { caught: 0, food: 0, hits: 0, lost: 0, omers: 0, empty: !!opts.empty }; }
      UI.busy = false;
      return r;
    },
    /* The manna morning. Nobody tells you how much. One omer a head; double on the sixth day; nothing on the Sabbath. */
    async mannaMorning(sixth) {
      const S = this.S, n = this.count();
      const r = await this.minigame("manna", { sixth, title: "", text: sixth ? "Dawn on the sixth day. Tomorrow is the Sabbath.\n\nThe ground is white. Move the basket over the flakes; press ENTER (or DONE) when you have gathered what your household needs." : "Dawn. 'When the dew was gone, thin flakes like frost on the ground appeared on the desert floor' (Ex 16:14).\n\nMove the basket over the flakes; press ENTER (or DONE) when you have gathered what your household needs." });
      const need = n * (sixth ? 2 : 1), got = r.omers;
      UI.setScene("travel"); UI.title("");
      if (got < need - 0.3) {
        const short = need - got; S.H = Math.min(139, S.H + 2 + short); this.hurtAll(2); const w = S.party.filter(p => p.alive).sort((a, b) => a.hp - b.hp)[0]; if (w) w.hp = Math.max(1, w.hp - 3);
        S.flags.manna_short = (S.flags.manna_short || 0) + 1;
        await UI.page(`${got.toFixed(2)} omers for ${n} people${sixth ? ", and tomorrow is the Sabbath" : ""}.\n\nNot enough. ${w ? w.name + " eats least and says nothing." : "Everyone eats less."}${sixth ? " Tomorrow there will be nothing on the ground, and the jar is thin." : ""}`, { title: "" });
        if (sixth) S.flags.sabbath_hungry = true;
      } else if (got > need + 0.5) {
        S.trust = Math.max(0, S.trust - 3); S.H = Math.min(139, S.H + 3); S.flags.hoarded = true; S.flags.manna_extra = (S.flags.manna_extra || 0) + 1;
        S.pendingMaggots = sixth ? null : true;
        if (sixth) await UI.page(`${got.toFixed(2)} omers — more than two a head. The extra bakes into hard cakes that nobody wants, and a neighbour's family has less. EMUNAH slips.`, { title: "" });
        else await UI.page(`${got.toFixed(2)} omers for ${n} people. More than an omer a head. You put the extra in a jar, just in case.`, { title: "" });
      } else {
        S.trust = Math.min(100, S.trust + 1); S.flags.manna_exact = (S.flags.manna_exact || 0) + 1;
        if (sixth) await UI.page(`${got.toFixed(2)} omers — two a head. Enough for today and for the Sabbath. The extra does not rot.\n\n'Each one gathered as much as they needed' (Ex 16:18).`, { title: "" });
        else if (S.flags.manna_exact <= 2) await UI.page(`${got.toFixed(2)} omers for ${n} people. Enough. Exactly enough.`, { title: "" });
      }
      UI.status(S); UI.startAnim();
    },
    whereStr() {
      const s = SINAI.STOPS[this.S.stopIdx];
      return this.S.miles > 0 && this.S.stopIdx > 0 ? "on the road to " + s.name : s.name;
    },

    /* Someone falls ill. Onset costs 20 HP; a member already weak (HP < 50) does not survive the onset. */
    fallIll(p, ill, scripted) {
      const S = this.S;
      if (p.hp < 50 + (S.diff > 1 ? 5 : S.diff < 1 ? -10 : 0) && !scripted) { p.alive = false; p.hp = 0; p.cause = ill; S.deaths.push({ name: p.name, cause: ill, where: this.whereStr() }); S.H = Math.min(139, S.H + 20); S.pendingDeath = p; return; }
      p.ill = ill; p.hp = Math.max(1, p.hp - 20); p.strikes = (p.strikes || 0) + 1;
    },

    /* advance one calendar day.  travelling=true: on the road.  false: camped (rest, Sabbath, event days). */
    tick(travelling) {
      const S = this.S;
      S.day++; S.dow = (S.dow + 1) % 7;
      S.d++; if (S.d > 30) { S.d = 1; S.m++; if (S.m > 12) { S.m = 1; S.y++; } }
      // weather
      const r = rnd();
      S.weather = r < 0.45 ? "clear" : r < 0.65 ? "scorching" : r < 0.78 ? "hot" : r < 0.86 ? "wind" : r < 0.93 ? "cool" : r < 0.98 ? "rain" : "storm";
      const n = this.count(), atWater = this.atWater();
      // ---- daily misery (the Oregon Trail health model: H = 0.9H + misery) ----
      // the desert itself is hardship: 6 a day on the march (Oregon's constant was 5); in camp only the weather counts, halved
      const wm = { clear: 0, cool: 0, hot: 1, scorching: 3, wind: 2, rain: 1, storm: 2 };
      let m = travelling ? 6 + (wm[S.weather] || 0) : 0.5 * (wm[S.weather] || 0);
      if (travelling) m += S.pace === "ahead" ? 4 : -1;   // the cloud is a covering (Ps 105:39); lagging is easy on the body, hard on the water
      if (S.donkeys < 2 && travelling) m += 1;
      // food / manna
      let starving = false;
      if (!S.manna) { S.food -= n * 1.5; if (S.food <= 0) { S.food = 0; starving = true; m += 8; this.hurtAll(3); } }
      else m += S.rations === "half" ? 2 : S.rations === "double" ? 1 : 0;
      // water: one skin per person per day unless camped at water
      if (atWater) { S.water = this.waterCap(); }
      else {
        S.water -= n;
        if (S.water <= 0) { S.water = 0; starving = true; m += 8; this.hurtAll(4); S.party.forEach(p => { if (p.alive && !p.ill && rnd() < 0.10) this.fallIll(p, "thirst"); }); }
      }
      // starvation compounds, Oregon-style
      S.FS = starving ? S.FS + 0.8 : S.FS * 0.5; m += S.FS;
      // trust: emunah is a survival stat
      if (S.trust < 60) m += (60 - S.trust) / 10; else if (S.trust > 80) m -= 1;
      // sandals
      if (S.sandals <= 0 && S.stopIdx < 15 && travelling) m += 1;
      // the sentence: "you have tested me ten times"
      if (S.flags.sentence) m += 2;
      // camp days: H decays by a tenth a day anyway; beside water a little faster
      if (!travelling && atWater) m -= 3;
      S.H = Math.max(0, Math.min(139, 0.9 * S.H + (m > 0 ? m * S.diff : m)));
      // ---- individuals ----
      const ill = S.party.filter(p => p.alive && p.ill).length;
      S.party.forEach(p => {
        if (!p.alive) return;
        if (p.ill) {
          p.hp -= (p.ill === "snakebite" ? 8 : p.ill === "thirst" ? 5 : 4) + (S.H >= 70 ? 1 : 0);
          let cure = (travelling ? 0.03 : 0.15) + (S.diff < 1 ? 0.05 : S.diff > 1 ? -0.02 : 0); if (S.trust > 70) cure += 0.10; if (S.pace === "ahead" && travelling) cure = 0; if (!travelling && atWater) cure += 0.05; if (S.role === "levi") cure += 0.04;
          if (p.ill !== "snakebite" && rnd() < cure) { p.ill = null; }
        }
        else if (!travelling) p.hp = Math.min(100, p.hp + (atWater ? 4 : 2));
        else if (S.H < 70) p.hp = Math.min(100, p.hp + 0.5);
        if (S.H >= 105) p.hp -= 2; else if (S.H >= 70) p.hp -= 0.5;   // poor / very poor: everyone wastes away
        p.hp = Math.max(0, p.hp);
      });
      // ---- illness roll from H: P = 0.15 * (H/140)^2 per day, one per day at most ----
      const pIll = 0.2 * Math.pow(S.H / 140, 2) * S.diff;
      if (rnd() < pIll) { const a = S.party.filter(p => p.alive && !p.ill); if (a.length) { const p = a[Math.floor(rnd() * a.length)]; const kind = S.weather === "scorching" ? "heat-stroke" : rnd() < 0.5 ? "the fever" : "dysentery"; this.fallIll(p, kind); S.illToday = p.alive ? p.name + " has " + kind + "." : null; } }
    },
    hurtAll(n) { this.S.party.forEach(p => { if (p.alive) p.hp = Math.max(0, Math.min(100, p.hp - n)); }); },

    async checkDeaths() {
      const S = this.S;
      if (S.illToday) { const t = S.illToday; S.illToday = null; UI.stopAnim(); await UI.page(`${t}\n\nHealth of the household: ${this.band(S.H).toUpperCase()}.\n\n${S.H >= 70 ? "The household is worn down. Rest at water, keep to the cloud, and trust — or this will not be the last." : "Rest helps. Rest beside water helps most."}`, { title: "ILLNESS" }); UI.startAnim(); }
      for (const p of S.party) {
        if (p.alive && p.hp <= 0) {
          p.alive = false; p.cause = p.ill || (S.water <= 0 ? "thirst" : S.food <= 0 && !S.manna ? "hunger" : "the wilderness");
          if (p.cause === "hunger") p.cause = "the wilderness";
          S.deaths.push({ name: p.name, cause: p.cause, where: this.whereStr() });
          S.H = Math.min(139, S.H + 20); S.pendingDeath = p;
        }
        if (S.pendingDeath === p) {
          S.pendingDeath = null; UI.stopAnim();
          await UI.page(`${p.name} HAS DIED of ${p.cause}.\n\nYou bury ${p.name} in the wilderness and pile stones on the grave. The cloud is moving. There is no time.`, { scene: "grave", title: "" });
          if (S.flags.sentence) S.flags.sentence = false;
          if (p === S.party[0]) return true;
        }
      }
      return !S.party.some(p => p.alive);
    },

    /* The 38-year time-skip. */
    async generation(g) {
      const S = this.S;
      const caleb = S.flags.caleb;
      const dying = S.party.filter(p => p.alive && p.age >= 20);
      const kids = S.party.filter(p => p.alive && p.age < 20);
      const lines = [];
      for (const p of dying) {
        if (p === S.party[0] && caleb) continue;
        p.alive = false; p.cause = p.age >= 55 ? "old age" : "the wilderness";
        S.deaths.push({ name: p.name, cause: p.cause, where: "the Wilderness of Paran" });
        lines.push(`${p.name} — ${p.cause === "old age" ? "gathered to their people in year " + (2 + Math.floor(rnd() * 10)) : "died in the wilderness in year " + (5 + Math.floor(rnd() * 30)) + ", as the LORD had sworn"}`);
      }
      S.party.forEach(p => { p.age += 38; });
      await UI.page("THE YEARS PASS.\n\n" + (lines.length ? lines.join("\n") + "\n\n" : "") + (caleb ? "You stood with Caleb. Like Caleb, you are still alive — old, and still walking, and still 'following the LORD wholeheartedly.'" : "The household passes to the children."), { scene: "grave", title: "THIRTY-EIGHT YEARS" });
      // rebuild household: survivors + new generation
      const survivors = S.party.filter(p => p.alive);
      const newNames = ["Nun", "Achsah", "Othniel", "Hoglah", "Jair", "Milcah"].filter(n => !S.party.some(p => p.name === n));
      const fresh = [];
      while (survivors.length + fresh.length < 5 && newNames.length) {
        fresh.push({ name: newNames.shift(), hp: 100, alive: true, ill: null, cause: null, age: 10 + Math.floor(rnd() * 15) });
      }
      if (!caleb && kids.length === 0 && survivors.length === 0) {
        // nobody left — a grandchild inherits
        fresh[0].age = 25;
      }
      S.party = survivors.concat(fresh);
      S.party.forEach(p => { p.hp = 100; p.ill = null; });
      S.generation = 2;
      await UI.page("A new household stands where yours stood:\n\n" + S.party.map(p => `  ${p.name}, ${p.age}${p.age > 60 ? " (of the first generation)" : ""}`).join("\n") + "\n\n'God has no grandchildren.' This generation must enter the covenant itself.\n\nThe flock has multiplied. The silver is what it was. The manna still comes.", { scene: "camp" });
      S.flock += 20; S.water = this.waterCap(); S.grumbles = 0; S.trust = Math.max(S.trust, 55); S.H = 10; S.FS = 0; S.flags.sentence = false;
      UI.status(S);
    },

    /* ---------- screens ---------- */
    async titleScreen() {
      this.S = null; UI.status(null); UI.title(""); UI.setScene("title");
      UI.startAnim();
      while (true) {
        const c = await UI.choose("THE EXODUS TRAIL\n\nYou may:", [
          "Travel the trail", "Learn about the trail", "See the Stones of Witness (top ten)",
          "Graphics: " + (UI.look === "deluxe" ? "DELUXE (1990 colour)  →  switch to Classic" : "CLASSIC (1985 green screen)  →  switch to Deluxe"),
          "Difficulty: " + this.diffName(this.difficulty()),
          "Turn sound " + (SINAI.Audio.on ? "off" : "on"), "About this game"
        ], { title: "" });
        if (c === 0) return;
        if (c === 1) for (const [t, b] of SINAI.LEARN) await UI.page(b, { title: t, scene: "scroll" });
        if (c === 2) await this.topTen();
        if (c === 3) UI.setLook(UI.look === "deluxe" ? "classic" : "deluxe");
        if (c === 4) { const d = await UI.choose("How hard should the desert be?", ["FOLLOW THE CLOUD — gentle. Less hardship, quicker recovery. Score x0.75", "TEST THE LORD — normal. The desert of the text: a careful household usually arrives; a careless one buries someone.", "TEN TIMES — hard. More hardship, slower recovery, the weak die sooner. Score x1.5"], { title: "DIFFICULTY" }); this.setDifficulty([0.7, 1, 1.35][d]); }
        if (c === 5) SINAI.Audio.toggle();
        if (c === 6) await UI.page("THE EXODUS TRAIL — a free, browser-playable Oregon Trail retelling Exodus 15 to Joshua 6.\n\nTwo looks, switchable any time with L: CLASSIC, in the style of the 1985 Apple II original, and DELUXE, in the style of the 1990 colour edition — parallax desert, a day/night cycle, weather, and your own household walking behind the pillar of cloud.\n\nScripture quotations are paraphrased from the NIV/ESV.\n\nMusic: original chiptune (or your own royalty-free track — see js/audio.js). No images; every scene is drawn in code.\n\nKeys: number keys choose, ENTER continues, SPACE hurries the travel days, M = map, S = sound, L = look.", { title: "ABOUT", scene: "scroll" });
      }
    },

    async setup() {
      UI.title("");
      const rc = await UI.choose("Many kinds of people walked out of Egypt. In the great camp, you will be:", SINAI.ROLES.map(r => r.name), { scene: "camp" });
      const R = SINAI.ROLES[rc];
      await UI.page(R.blurb + "\n\nYour household begins with " + R.silver + " shekels of silver and the gold jewelry of Egypt. Score multiplier: x" + R.mult + ".", { scene: "camp" });
      const names = [];
      const labels = ["What is your name? (head of the household)", "The name of your spouse?", "The name of your aged mother or father?", "The name of your elder child?", "The name of your younger child?"];
      for (let i = 0; i < 5; i++) names.push(await UI.input(labels[i], SINAI.DEFAULT_NAMES[i]));
      this.S = this.newState(R.id, names);
      UI.status(this.S);
      await UI.page("Your household:\n\n" + this.S.party.map((p, i) => `  ${i + 1}. ${p.name}, ${p.age}`).join("\n") + "\n\nIt is the 21st day of Aviv, the first month, in the first year after the LORD brought you out of Egypt. You are standing on the far shore of the Sea of Reeds.", { scene: "sea" });
      await this.store();
    },

    async store() {
      const S = this.S; UI.setScene("store");
      await UI.page("DIVIDING THE SPOILS OF EGYPT\n\nThe Egyptians 'gave them what they asked for; so they plundered the Egyptians' (Ex 12:36). On the shore the elders are sorting silver, gold, cloth and animals among the households, and the mixed multitude are trading.\n\nYou have " + S.silver + " shekels of silver to spend. Your gold (" + S.gold + " shekels' weight of jewelry) is kept back. You will need water most, donkeys second.", { title: "THE SPOILS" });
      for (const item of SINAI.STORE) {
        while (true) {
          const q = await UI.input(`${item.name}  —  ${item.price} shekels per ${item.unit}.\n${item.help}\n\nSilver left: ${S.silver} shekels (enough for ${Math.min(item.max, Math.floor(S.silver / item.price))} ${item.unit}).  How many ${item.unit}?`, String(item.min));
          const n = Math.max(0, parseInt(q, 10) || 0);
          if (n < item.min) { await UI.page(`You need at least ${item.min} ${item.unit}.`); continue; }
          if (n > item.max) { await UI.page(`The elders will not allot more than ${item.max} ${item.unit} to one household.`); continue; }
          if (n * item.price > S.silver) { await UI.page("You do not have enough silver for that."); continue; }
          S.silver -= n * item.price;
          if (item.id === "sandals") { S.sandals = n; S.sandalsBought = n; } else S[item.id] = (S[item.id] || 0) + n;
          break;
        }
        UI.status(S);
      }
      S.silver = Math.round(S.silver);
      S.water = Math.min(this.waterCap(), S.water * this.count());
      await UI.page(`Loaded on ${S.donkeys} donkey(s): ${Math.round(this.waterDays())} days of water for the household, ${S.food} lbs of provisions, ${S.skins} spare skins, ${S.sandals} pairs of sandals. Flock: ${S.flock} head. Silver: ${S.silver} shekels. Gold: ${S.gold}.\n\n${S.donkeys < 2 ? "One donkey. Your family will carry the rest on their backs. Pace suffers.\n\n" : ""}The cloud is lifting.`, { title: "" });
      if (S.donkeys < 2) S.paceMod = 0.75;
    },

    /* ---------- main travel loop ---------- */
    async play() {
      const S = this.S;
      // stop 0 runs immediately
      await this.arrive();
      while (true) {
        const next = SINAI.STOPS[S.stopIdx];
        if (S.miles <= 0) { await this.arrive(); if (this.over) return; continue; }
        // travelling
        this.curScene = "travel";
        UI.setScene("travel"); UI.title(""); UI.startAnim(); UI.fast = false;
        let paused = false;
        while (S.miles > 0 && !paused) {
          if (S.dow === 6 && S.manna) { // Sabbath
            await this.sabbath(); if (this.over) return; continue;
          }
          $("menu").innerHTML = "";
          UI.interrupt = false;
          if (S.manna) {
            if (S.pendingMaggots) { S.pendingMaggots = null; UI.stopAnim(); await UI.page("Morning. The jar from yesterday is full of maggots and the tent stinks. 'Moses was angry with them' (Ex 16:20).\n\nEMUNAH leaks. You gather again.", { title: "", scene: "camp" }); UI.setScene("travel"); UI.startAnim(); }
            if (S.dow === 5 || !S.flags.manna_first || (rnd() < 0.15 && !UI.fast)) { S.flags.manna_first = true; UI.fast = false; await this.mannaMorning(S.dow === 5); }
            else if (S.dow === 5) { /* unreachable */ }
          }
          const rate = SINAI.PACES[S.pace].miles * S.paceMod * (S.weather === "wind" ? 0.5 : S.weather === "scorching" ? 0.85 : 1);
          this.tick(true);
          S.miles -= rate; S.traveled += rate;
          if (S.rations === "double" && S.manna && rnd() < 0.3) { S.trust = Math.max(0, S.trust - 1); }
          // sandals: the rock eats leather — unless you walk in trust (Deut 29:5, revealed at Moab)
          S.sandalMiles += rate; if (S.sandalMiles >= 120) { S.sandalMiles = 0; if (S.trust < 60 && S.sandals > 0) S.sandals--; }
          UI.status(S);
          // one travel day = a slow sunrise-to-sunset pass (5 s), or a quick one when fast-forwarding
          const flavour = this.flavour(S, next);
          const start = performance.now(); let el = 0;
          while (true) {
            const dayMs = UI.fast ? 600 : SINAI.DAY_MS;
            el = performance.now() - start; UI.travel.progress = Math.min(1, el / dayMs);
            UI.text(`${this.dateStr()}${UI.travel.progress > 0.86 ? "  —  night" : UI.travel.progress < 0.1 ? "  —  dawn" : UI.travel.progress > 0.72 ? "  —  evening" : ""}\n\n${next.name}: ${Math.max(0, Math.round(S.miles))} miles.\nTraveled: ${Math.round(S.traveled)} miles.   Weather: ${S.weather}.\n\n${flavour}\n\n(ENTER: size up the situation.  SPACE: ${UI.fast ? "slow down" : "hurry the days along"}.  M: map.)`);
            if (el >= dayMs || UI.interrupt) break;
            await sleep(50);
          }
          if (await this.checkDeaths()) { await this.gameOver(); return; }
          if (UI.interrupt) { UI.interrupt = false; paused = true; break; }
          if (rnd() < 0.2 && S.miles > 0) { UI.fast = false; await this.randomEvent(); if (await this.checkDeaths()) { await this.gameOver(); return; } UI.setScene("travel"); UI.title(""); }
        }
        UI.fast = false;
        if (paused) { UI.stopAnim(); await this.situation(); }
      }
    },

    /* a line of colour for each travel day */
    flavour(S, next) {
      const alive = S.party.filter(p => p.alive), kid = alive.find(p => p.age < 18), old = alive.find(p => p.age >= 55);
      const w = S.weather, L = [];
      if (w === "scorching") L.push("The rocks radiate heat like the mouth of an oven. Nobody speaks.", "Heat shimmers off the wadi floor. The donkeys' ears droop.");
      if (w === "hot") L.push("Hot. The water-skins are checked, and checked again.");
      if (w === "wind") L.push("Sand in your teeth, your ears, your bread. You walk with your head down.", "The wind hides the front of the column. You follow the sound of the flocks.");
      if (w === "cool") L.push("A cool day. The children run ahead and are called back.", "Cool and clear. You can see the cloud from miles behind.");
      if (w === "rain" || w === "storm") L.push("Rain in the desert. The elders look uneasily at the wadi walls.", "Thunder over the mountains. Everyone camps high tonight.");
      if (w === "clear") L.push("Clear. The pillar of cloud moves steadily ahead of the tribes.", "A hawk circles. The flocks graze on nothing you can see.", "You pass a broom bush with shade for exactly one person.");
      if (kid) L.push(`${kid.name} counts the sheep again. Still ${S.flock}.`, `${kid.name} asks how much farther. ${Math.max(0, Math.round(S.miles))} miles.`);
      if (old) L.push(`${old.name} walks slowly, leaning on the staff, and will not be carried.`);
      if (S.manna && S.egyptFish) L.push("Someone mentions the fish. The fish you caught yourselves. Nobody answers.", "The children ask if there are fish where you are going.");
      if (S.manna) L.push("At dawn the ground was white with manna. It is gone by the time the sun is high.", "You gathered your omer at first light. It tasted of honey wafers.");
      else L.push("Provisions from Egypt, eaten cold. The bread is nearly gone.");
      if (S.pace === "ahead") L.push("You push ahead of the cloud. The stragglers are far behind you now.");
      if (S.pace === "lag") L.push("You lag at the rear with the weak. The desert behind you is empty — or seems to be.");
      if (S.water < 4) L.push("The water-skins are nearly flat. You measure every mouthful.");
      L.push(`Somewhere ahead: ${next.name}.`, "Two million people walk in tribal order, banner behind banner, dust to the horizon.");
      const line = L[Math.floor(rnd() * L.length)];
      if (line.indexOf("fish") >= 0) S.H = Math.min(139, S.H + 1);
      return line;
    },

    async sabbath() {
      const S = this.S;
      UI.stopAnim();
      const hungry = S.flags.sabbath_hungry; S.flags.sabbath_hungry = false;
      const c = await UI.choose(`${this.dateStr()} — the seventh day. SABBATH.\n\nThe camp does not move. ${hungry ? "The jar is nearly empty; yesterday you gathered too little." : "Yesterday's double portion is in the jar."}\n\nYou may:`, ["Rest, as commanded", "Go out and gather anyway — 'just in case'"], { scene: "camp", title: "SABBATH" });
      this.tick(false);
      if (c === 0) { if (hungry) { this.hurtAll(3); S.H = Math.min(139, S.H + 3); await UI.page("A hungry Sabbath. Nobody goes out. The children are quiet.", { scene: "camp" }); } else { S.party.forEach(p => { if (p.alive) p.hp = Math.min(100, p.hp + 4); }); S.trust = Math.min(100, S.trust + 1); } }
      else { await this.minigame("manna", { empty: true, title: "", text: "Dawn on the seventh day. You go out to the field." }); S.trust = Math.max(0, S.trust - 4); S.flags.sabbath_broken = true; if (hungry) { this.hurtAll(3); S.H = Math.min(139, S.H + 3); } await UI.page("Nothing. Only dew. 'How long will you refuse to keep My commands?' (Ex 16:28)", { scene: "camp" }); }
      UI.status(S); UI.setScene("travel"); UI.title(""); UI.startAnim();
      if (await this.checkDeaths()) { await this.gameOver(); }
    },

    async situation() {
      const S = this.S;
      while (true) {
        const c = await UI.choose(`${this.dateStr()}\nYou may:`, [
          "Continue on the trail", "Check supplies", "Look at the map", "Change pace", "Change manna-gathering", "Stop to rest", "See your household", "Read the trail log"
        ], { scene: "travel", title: "" });
        if (c === 0) return;
        if (c === 1) await UI.page(`Health of the household: ${this.band(S.H)}\nWater: ${Math.floor(this.waterDays())} days for ${this.count()} people\nProvisions: ${Math.round(S.food)} lbs${S.manna ? " (manna falls daily)" : ""}\nFlock: ${S.flock} head\nDonkeys: ${S.donkeys}\nSpare skins: ${S.skins}\nSandals: ${S.sandals} pairs\nSilver: ${S.silver} shekels\nEgyptian gold: ${S.gold} shekels' weight\nEmunah (trust): ${Math.round(S.trust)}\nGrumbles counted: ${S.grumbles} of 10`, { title: "SUPPLIES" });
        if (c === 2) { SINAI.Map.show(S); await new Promise(r => { const t = setInterval(() => { if (!SINAI.Map.visible) { clearInterval(t); r(); } }, 100); }); }
        if (c === 3) { const keys = Object.keys(SINAI.PACES).filter(k => !(S.role === "levi" && k === "ahead")); const p = await UI.choose(S.role === "levi" ? "The pace (a Levite carrying the holy things cannot run ahead of the cloud):" : "The pace:", keys.map(k => SINAI.PACES[k].name + " — " + SINAI.PACES[k].desc)); S.pace = keys[p]; }
        if (c === 4) { if (!S.manna) await UI.page("There is no manna yet. You eat what you carry."); else { const r = await UI.choose("Gathering manna:", Object.values(SINAI.RATIONS).map(r => r.name + " — " + r.desc)); S.rations = Object.keys(SINAI.RATIONS)[r]; if (S.rations === "double") { S.flags.hoarded = true; await UI.page("In the morning the extra is full of maggots. Every morning. EMUNAH will leak away while you hoard."); } } }
        if (c === 5) { const aw = this.atWater(); const d = await UI.choose(aw ? "You are camped beside water. Rest costs nothing here and heals well. Rest how long?" : `You are in the open. Every day of rest drinks a day of water (${this.count()} skins) and heals slowly. Water left: ${Math.floor(this.waterDays())} days. Rest how long?`, ["1 day", "3 days", "7 days", "No — keep moving"]); if (d < 3) { const n = [1, 3, 7][d]; for (let i = 0; i < n; i++) this.tick(false); await UI.page(`You rest ${n} day(s). Health of the household: ${this.band(S.H)}.`); if (await this.checkDeaths()) { await this.gameOver(); return; } } }
        if (c === 6) await UI.page(S.party.map(p => `${p.name}, ${p.age}: ${p.alive ? (p.hp > 75 ? "good" : p.hp > 50 ? "fair" : p.hp > 25 ? "poor" : "very poor") + (p.ill ? " — " + p.ill : "") : "dead (" + p.cause + ")"}`).join("\n"), { title: "HOUSEHOLD" });
        if (c === 7) await UI.page(S.log.length ? S.log.map((l, i) => `${i + 1}. ${l}`).join("\n") : "Nothing yet.", { title: "TRAIL LOG" });
        UI.status(S);
      }
    },

    async randomEvent() {
      const S = this.S;
      const pool = SINAI.EVENTS.filter(e => e.when(S) && !(S.lastEvent === e.id));
      let tot = pool.reduce((a, e) => a + e.w, 0), r = rnd() * tot, ev = pool[0];
      for (const e of pool) { r -= e.w; if (r <= 0) { ev = e; break; } }
      S.lastEvent = ev.id;
      UI.stopAnim(); this.curScene = SINAI.ArtV06.VIG_FOR[ev.id] ? "event:" + ev.id : "event";
      await ev.run(this.ctx());
      UI.status(S); UI.startAnim();
    },

    async arrive() {
      const S = this.S; const stop = SINAI.STOPS[S.stopIdx];
      UI.stopAnim(); this.curScene = SINAI.ArtV06.CARD[stop.id] ? "card:" + stop.id : stop.scene; UI.setScene(this.curScene); UI.startAnim();
      S.visited.push(stop.id); S.miles = 0;
      if (stop.date) { S.y = stop.date[0]; S.m = stop.date[1]; S.d = stop.date[2]; }
      if (S.stopIdx > 0) await UI.page(`You have reached ${stop.name.toUpperCase()}.\n${stop.book}\n\n${this.dateStr()}`, { title: stop.name.toUpperCase() });
      if (stop.water === "spring") S.water = this.waterCap(); else if (stop.water === "well") S.water = Math.min(this.waterCap(), S.water + 5 * this.count());
      await stop.run(this.ctx());
      UI.status(S);
      if (await this.checkDeaths()) { await this.gameOver(); this.over = true; return; }
      if (S.flags.dead_leader) { await this.ending(); this.over = true; return; }
      if (stop.final) { await this.ending(); this.over = true; return; }
      S.stopIdx++; S.miles = SINAI.STOPS[S.stopIdx].miles;
      await UI.page(`The cloud lifts. The next stop: ${SINAI.STOPS[S.stopIdx].name}, about ${SINAI.STOPS[S.stopIdx].miles} miles.`, { title: "" });
    },

    /* ---------- endings & score ---------- */
    score() {
      // Oregon Trail scoring: 500 / 400 / 300 / 200 per survivor by health band, small bonuses, flags ±100, x role multiplier
      const S = this.S; let s = 0;
      const per = { good: 500, fair: 400, poor: 300, "very poor": 200 }[this.band(S.H)];
      S.party.forEach(p => { if (p.alive) s += per + (p.hp > 75 ? 50 : 0); });
      s += S.flock * 2 + Math.round(S.silver / 5) + Math.round(S.trust * 2);
      const good = ["marah_weak_first", "refused_calf", "gave_all", "caleb", "looked", "rahab_oath", "clean_hands", "chose_life", "weak_in_middle", "crossed_with_ark"];
      const bad = ["calf", "kept_gold", "korah", "peor", "achan", "hoarded", "sabbath_broken", "plundered_dead"];
      good.forEach(f => { if (S.flags[f]) s += 100; }); bad.forEach(f => { if (S.flags[f]) s -= 100; });
      return Math.round(Math.max(0, s) * S.mult * (S.diff > 1 ? 1.5 : S.diff < 1 ? 0.75 : 1));
    },
    async ending() {
      const S = this.S; UI.stopAnim();
      const alive = S.party.filter(p => p.alive);
      const sc = this.score();
      if (S.flags.dead_leader) {
        UI.setScene("grave");
        await UI.page(`Here lies ${S.party[0].name}, ${SINAI.EPITAPHS["the devoted things"]}.\n\nThe Valley of Achor — 'trouble' — is named for what happened here. Your household enters the land without you.\n\nScore: ${sc} stones of witness.`, { title: "THE VALLEY OF ACHOR" });
      } else {
        UI.setScene("promised");
        await UI.page(`YOU HAVE ENTERED THE LAND.\n\n${alive.length} of your household stand in the land the LORD swore to Abraham, Isaac and Jacob.\n\n${alive.map(p => "  " + p.name + ", " + p.age).join("\n")}\n\nDead on the trail: ${S.deaths.length}.\nGrumbles counted: ${S.grumbles}.\nEmunah: ${Math.round(S.trust)}.\nFlock: ${S.flock}. Silver: ${S.silver}.`, { title: "THE LAND" });
        await UI.page(`STONES OF WITNESS\n\n${S.log.length ? S.log.map(l => "  • " + l).join("\n") : "  (none recorded)"}\n\n'A standing stone doesn't do anything if there's nobody there to tell the story.'\n\nSCORE: ${sc}  (x${S.mult} for ${SINAI.ROLES.find(r => r.id === S.role).name})`, { title: "" });
        await UI.page("'Now fear the LORD and serve Him with all faithfulness. Throw away the gods your ancestors worshiped beyond the Euphrates and in Egypt... But as for me and my household, we will serve the LORD.' (Joshua 24:14-15)\n\nThe land is not a fortress. It is a crossroads. Go and be a blessing.", { title: "" });
      }
      await this.recordScore(sc);
    },
    async gameOver() {
      const S = this.S; UI.stopAnim(); UI.setScene("grave");
      const dead = S.party[0].alive ? S.party.filter(p => !p.alive).slice(-1)[0] : S.party[0];
      const ep = SINAI.EPITAPHS[dead.cause] || "who died in the wilderness";
      const who = S.party[0].alive ? "Your whole household is gone." : "";
      const epi = await UI.input(`Here lies ${dead.name},\n${ep},\n${this.whereStr()}, in the year ${S.y}.\n\n${who}\n\nWrite an epitaph:`, "Remember where you came from");
      await UI.page(`HERE LIES ${dead.name.toUpperCase()}\n${ep}\n\n"${epi}"\n\n${this.dateStr()}\n\nScore: ${this.score()} stones of witness.\n\n'Not one of you will enter the land, except Caleb and Joshua.' (Num 14:30)\n\nYour children may try again.`, { title: "" });
      await this.recordScore(this.score());
      this.over = true;
    },
    async recordScore(sc) {
      let list = []; try { list = JSON.parse(localStorage.getItem("sinai_top") || "[]"); } catch (e) { }
      list.push({ name: this.S.party[0].name, score: sc, role: this.S.role, alive: this.S.party.filter(p => p.alive).length, date: new Date().toISOString().slice(0, 10) });
      list.sort((a, b) => b.score - a.score); list = list.slice(0, 10);
      try { localStorage.setItem("sinai_top", JSON.stringify(list)); } catch (e) { }
      await this.topTen();
    },
    async topTen() {
      let list = []; try { list = JSON.parse(localStorage.getItem("sinai_top") || "[]"); } catch (e) { }
      const rows = list.length ? list.map((r, i) => `${String(i + 1).padStart(2)}. ${r.name.padEnd(14)} ${String(r.score).padStart(6)}  ${r.alive} alive  ${r.role}`).join("\n") : "No stones yet. Twelve were set up at Gilgal.";
      await UI.page("THE STONES OF WITNESS — TOP TEN\n\n" + rows, { title: "", scene: "stones" });
    },

    async main() {
      UI.init(); SINAI.Map.init();
      while (true) {
        this.over = false;
        await this.titleScreen();
        SINAI.Audio.start();
        await this.setup();
        await this.play();
        UI.stopAnim();
      }
    }
  };
  window.Game = Game; window.UI = UI;
  window.addEventListener("load", () => Game.main());
})();
