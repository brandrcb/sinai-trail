/* ============================================================
   THE SINAI TRAIL — engine
   Screens, state, travel loop, events, scoring.
   ============================================================ */
(function () {
  const $ = id => document.getElementById(id);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const rnd = () => Math.random();

  /* ---------- UI layer ---------- */
  const UI = {
    canvas: null, ctx: null, frame: 0, anim: null,
    pending: null,          // resolver for current page/choice
    options: [],            // current option list
    interrupt: false,
    init() {
      this.canvas = $("scene"); this.ctx = this.canvas.getContext("2d");
      this.ctx.imageSmoothingEnabled = false;
      document.addEventListener("keydown", e => this.key(e));
      $("menu").addEventListener("click", e => {
        const li = e.target.closest("li"); if (li) this.select(+li.dataset.i);
      });
      $("text").addEventListener("click", () => { if (this.pending && !this.options.length) this.select(0); });
      $("mapbtn").addEventListener("click", () => SINAI.Map.toggle(Game.S));
      $("sndbtn").addEventListener("click", () => SINAI.Audio.toggle());
      $("map").addEventListener("click", () => SINAI.Map.hide());
    },
    key(e) {
      if (e.key === "m" || e.key === "M") { if (Game.S) SINAI.Map.toggle(Game.S); return; }
      if (e.key === "s" || e.key === "S") { SINAI.Audio.toggle(); return; }
      if (SINAI.Map.visible) { if (e.key === "Escape" || e.key === "Enter") SINAI.Map.hide(); return; }
      if (this.textInput) return; // typing a name
      if (!this.pending) { if (e.key === "Enter" || e.key === " ") this.interrupt = true; return; }
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
    setScene(name, opts) { this.sceneName = name; this.sceneOpts = opts || {}; this.paint(); },
    paint() {
      if (!this.sceneName) return;
      SINAI.Scenes.draw(this.ctx, this.sceneName, this.frame, Game.S, this.sceneOpts);
    },
    startAnim() { if (this.anim) return; this.anim = setInterval(() => { this.frame++; this.paint(); }, 160); },
    stopAnim() { clearInterval(this.anim); this.anim = null; },
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
      const st = $("status");
      if (!S) { st.innerHTML = ""; return; }
      const alive = S.party.filter(p => p.alive);
      const avg = alive.length ? alive.reduce((a, p) => a + p.hp, 0) / alive.length : 0;
      const h = avg > 75 ? "good" : avg > 50 ? "fair" : avg > 25 ? "poor" : "very poor";
      st.innerHTML =
        `<span>Date: ${Game.dateStr()}</span><span>Weather: ${S.weather}</span><span>Health: ${h}</span>` +
        `<span>Pace: ${S.pace === "cloud" ? "with the cloud" : S.pace === "ahead" ? "ahead of the cloud" : "lagging"}</span><span>Manna: ${S.manna ? SINAI.RATIONS[S.rations].name.split(",")[0].toLowerCase() : (S.visited.includes("jordan") ? "ended" : "none yet")}</span>` +
        `<span>Water: ${Math.max(0, Math.round(S.water))} days</span><span>Food: ${Math.max(0, Math.round(S.food))} lbs</span>` +
        `<span>Emunah: ${Math.round(S.trust)}</span><span>Grumbles: ${S.grumbles}/10</span>`;
    }
  };

  /* ---------- Game ---------- */
  const Game = {
    S: null,
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
        insight: (src, t) => UI.page(t, { title: "SCROLL OF INSIGHT  —  " + src, scene: "scroll" }),
        trust: n => { S.trust = Math.max(0, Math.min(100, S.trust + n)); UI.status(S); },
        grumble: why => { S.grumbles++; S.trust = Math.max(0, S.trust - 3); S.log.push("Grumbled at " + why); if (S.grumbles >= 10 && S.visited.includes("kadesh")) { S.party.forEach(p => { if (p.alive) p.hp = Math.max(1, p.hp - 20); }); S.trust = Math.max(0, S.trust - 5); } UI.status(S); return S.grumbles; },
        water: n => { S.water = Math.max(0, Math.min(40, S.water + n)); UI.status(S); },
        food: n => { S.food = Math.max(0, S.food + n); UI.status(S); },
        flock: n => { S.flock = Math.max(0, S.flock + n); },
        silver: n => { S.silver = Math.max(0, S.silver + n); },
        hurt: (n, who) => { S.party.forEach(p => { if (p.alive && (!who || p.name === who)) p.hp = Math.max(0, p.hp - n); }); UI.status(S); },
        heal: (n, who) => { S.party.forEach(p => { if (p.alive && (!who || p.name === who)) p.hp = Math.min(100, p.hp + n); }); UI.status(S); },
        alive: () => S.party.filter(p => p.alive),
        count: () => S.party.filter(p => p.alive).length,
        weakest: () => { const a = S.party.filter(p => p.alive).sort((x, y) => x.hp - y.hp); return a.length ? a[0].name : "someone"; },
        sick: ill => { const a = S.party.filter(p => p.alive && !p.ill); if (!a.length) return g.weakest(); const p = g.pick(a); p.ill = ill; p.hp = Math.max(1, p.hp - 25); UI.status(S); return p.name; },
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

    whereStr() {
      const s = SINAI.STOPS[this.S.stopIdx];
      return this.S.miles > 0 && this.S.stopIdx > 0 ? "on the road to " + s.name : s.name;
    },

    /* advance one calendar day (no travel) */
    tick(travelling) {
      const S = this.S;
      S.day++; S.dow = (S.dow + 1) % 7;
      S.d++; if (S.d > 30) { S.d = 1; S.m++; if (S.m > 12) { S.m = 1; S.y++; } }
      // weather
      const r = rnd();
      S.weather = r < 0.45 ? "clear" : r < 0.65 ? "scorching" : r < 0.78 ? "hot" : r < 0.86 ? "wind" : r < 0.93 ? "cool" : r < 0.98 ? "rain" : "storm";
      // consumption
      const n = S.party.filter(p => p.alive).length;
      if (!S.manna) { S.food -= n * 1.5; if (S.food < 0) { S.food = 0; this.hurtAll(4); } }
      else if (S.rations === "half") this.hurtAll(2);
      const atStop = S.miles <= 0 && SINAI.STOPS[S.stopIdx].water !== "none";
      if (atStop) { if (SINAI.STOPS[S.stopIdx].water === "spring") S.water = Math.min(40, S.water + 5); }
      else { S.water -= 1; if (S.water < 0) { S.water = 0; this.hurtAll(7); S.party.forEach(p => { if (p.alive && !p.ill && rnd() < 0.15) p.ill = "thirst"; }); } }
      if (S.weather === "scorching" && travelling) this.hurtAll(2);
      // illness
      S.party.forEach(p => {
        if (!p.alive) return;
        if (p.ill) { p.hp -= (p.ill === "snakebite" ? 12 : p.ill === "thirst" ? 6 : 4); if (rnd() < (travelling ? 0.06 : 0.14) && p.ill !== "snakebite") p.ill = null; }
        else if (!travelling) p.hp = Math.min(100, p.hp + 3);
        else if (S.pace === "cloud") p.hp = Math.min(100, p.hp + 0.5);
        p.hp = Math.max(0, p.hp);
      });
    },
    hurtAll(n) { this.S.party.forEach(p => { if (p.alive) p.hp = Math.max(0, Math.min(100, p.hp - n)); }); },

    async checkDeaths() {
      const S = this.S;
      for (const p of S.party) {
        if (p.alive && p.hp <= 0) {
          p.alive = false; p.cause = p.ill || (S.water <= 0 ? "thirst" : S.food <= 0 && !S.manna ? "hunger" : "the wilderness");
          if (p.cause === "hunger") p.cause = "the wilderness";
          S.deaths.push({ name: p.name, cause: p.cause, where: this.whereStr() });
          await UI.page(`${p.name} HAS DIED of ${p.cause}.\n\nYou bury ${p.name} in the wilderness and pile stones on the grave. The cloud is moving. There is no time.`, { scene: "grave", title: "" });
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
      await UI.page("A new household stands where yours stood:\n\n" + S.party.map(p => `  ${p.name}, ${p.age}${p.age > 60 ? " (of the first generation)" : ""}`).join("\n") + "\n\n'God has no grandchildren.' (Pawson) This generation must enter the covenant itself.\n\nThe flock has multiplied. The silver is what it was. The manna still comes.", { scene: "camp" });
      S.flock += 20; S.water = 20; S.grumbles = 0; S.trust = Math.max(S.trust, 55);
      UI.status(S);
    },

    /* ---------- screens ---------- */
    async titleScreen() {
      this.S = null; UI.status(null); UI.title(""); UI.setScene("title");
      UI.startAnim();
      while (true) {
        const c = await UI.choose("THE SINAI TRAIL\n\nYou may:", [
          "Travel the trail", "Learn about the trail", "See the Stones of Witness (top ten)", "Turn sound " + (SINAI.Audio.on ? "off" : "on"), "About this game"
        ], { title: "" });
        if (c === 0) return;
        if (c === 1) for (const [t, b] of SINAI.LEARN) await UI.page(b, { title: t, scene: "scroll" });
        if (c === 2) await this.topTen();
        if (c === 3) SINAI.Audio.toggle();
        if (c === 4) await UI.page("THE SINAI TRAIL — a free, browser-playable Oregon Trail in the style of the 1985 Apple II original, retelling Exodus 15 to Joshua 6.\n\nTeaching drawn from BEMA Discipleship (Marty Solomon, Brent Billings, Reed Dent, Elle Grover Fricks), David Pawson's 'Unlocking the Old Testament', and BibleProject (Tim Mackie, Jon Collins). Scripture quotations are paraphrased from the NIV/ESV.\n\nMusic: original chiptune (or your own royalty-free track — see js/audio.js). No images; every scene is drawn in code.\n\nKeys: number keys choose, ENTER continues, M = map, S = sound.", { title: "ABOUT", scene: "scroll" });
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
      await UI.page(`Loaded on ${S.donkeys} donkey(s): ${Math.round(S.water)} days of water, ${S.food} lbs of provisions, ${S.skins} spare skins, ${S.sandals} pairs of sandals. Flock: ${S.flock} head. Silver: ${S.silver} shekels. Gold: ${S.gold}.\n\n${S.donkeys < 2 ? "One donkey. Your family will carry the rest on their backs. Pace suffers.\n\n" : ""}The cloud is lifting.`, { title: "" });
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
        UI.setScene("travel"); UI.title(""); UI.startAnim();
        let paused = false;
        while (S.miles > 0 && !paused) {
          if (S.dow === 6 && S.manna) { // Sabbath
            await this.sabbath(); if (this.over) return; continue;
          }
          $("menu").innerHTML = "";
          UI.interrupt = false;
          const rate = SINAI.PACES[S.pace].miles * S.paceMod * (S.weather === "wind" ? 0.5 : S.weather === "scorching" ? 0.85 : 1);
          this.tick(true);
          S.miles -= rate; S.traveled += rate;
          UI.text(`${this.dateStr()}\n\n${next.name}: ${Math.max(0, Math.round(S.miles))} miles.\nTraveled: ${Math.round(S.traveled)} miles.\n\n(Press ENTER to size up the situation. M for map.)`);
          this.hurtAll(-SINAI.PACES[S.pace].hp); // negative hp value = damage
          if (S.rations === "double" && S.manna && rnd() < 0.3) { S.trust = Math.max(0, S.trust - 1); }
          UI.status(S);
          for (let i = 0; i < 6 && !UI.interrupt; i++) await sleep(150);
          if (await this.checkDeaths()) { await this.gameOver(); return; }
          if (UI.interrupt) { UI.interrupt = false; paused = true; break; }
          if (rnd() < 0.2 && S.miles > 0) { await this.randomEvent(); if (await this.checkDeaths()) { await this.gameOver(); return; } UI.setScene("travel"); UI.title(""); }
        }
        if (paused) { UI.stopAnim(); await this.situation(); }
      }
    },

    async sabbath() {
      const S = this.S;
      UI.stopAnim();
      const c = await UI.choose(`${this.dateStr()} — the seventh day. SABBATH.\n\nThe camp does not move. Yesterday's double portion is in the jar.\n\nYou may:`, ["Rest, as commanded", "Go out and gather anyway — 'just in case'"], { scene: "camp", title: "SABBATH" });
      this.tick(false);
      if (c === 0) { S.party.forEach(p => { if (p.alive) p.hp = Math.min(100, p.hp + 4); }); S.trust = Math.min(100, S.trust + 1); }
      else { S.trust = Math.max(0, S.trust - 4); S.flags.sabbath_broken = true; await UI.page("Nothing. 'How long will you refuse to keep My commands?' (Ex 16:28)"); }
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
        if (c === 1) await UI.page(`Water: ${Math.round(S.water)} days\nProvisions: ${Math.round(S.food)} lbs${S.manna ? " (manna falls daily)" : ""}\nFlock: ${S.flock} head\nDonkeys: ${S.donkeys}\nSpare skins: ${S.skins}\nSandals: ${S.sandals} pairs\nSilver: ${S.silver} shekels\nEgyptian gold: ${S.gold} shekels' weight\nEmunah (trust): ${Math.round(S.trust)}\nGrumbles counted: ${S.grumbles} of 10`, { title: "SUPPLIES" });
        if (c === 2) { SINAI.Map.show(S); await new Promise(r => { const t = setInterval(() => { if (!SINAI.Map.visible) { clearInterval(t); r(); } }, 100); }); }
        if (c === 3) { const p = await UI.choose("The pace:", Object.values(SINAI.PACES).map(p => p.name + " — " + p.desc)); S.pace = Object.keys(SINAI.PACES)[p]; }
        if (c === 4) { if (!S.manna) await UI.page("There is no manna yet. You eat what you carry."); else { const r = await UI.choose("Gathering manna:", Object.values(SINAI.RATIONS).map(r => r.name + " — " + r.desc)); S.rations = Object.keys(SINAI.RATIONS)[r]; if (S.rations === "double") { S.flags.hoarded = true; await UI.page("In the morning the extra is full of maggots. Every morning. EMUNAH will leak away while you hoard."); } } }
        if (c === 5) { const d = await UI.choose("Rest how long?", ["1 day", "3 days", "7 days"]); const n = [1, 3, 7][d]; for (let i = 0; i < n; i++) this.tick(false); await UI.page(`You rest ${n} day(s). Health improves.`); if (await this.checkDeaths()) { await this.gameOver(); return; } }
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
      UI.stopAnim(); this.curScene = "event";
      await ev.run(this.ctx());
      UI.status(S); UI.startAnim();
    },

    async arrive() {
      const S = this.S; const stop = SINAI.STOPS[S.stopIdx];
      UI.stopAnim(); this.curScene = stop.scene; UI.setScene(stop.scene); UI.startAnim();
      S.visited.push(stop.id); S.miles = 0;
      if (stop.date) { S.y = stop.date[0]; S.m = stop.date[1]; S.d = stop.date[2]; }
      if (S.stopIdx > 0) await UI.page(`You have reached ${stop.name.toUpperCase()}.\n${stop.book}\n\n${this.dateStr()}`, { title: stop.name.toUpperCase() });
      if (stop.water === "spring" || stop.water === "well") S.water = Math.min(40, S.water + (stop.water === "spring" ? 30 : 8));
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
      const S = this.S; let s = 0;
      S.party.forEach(p => { if (p.alive) s += 100 + p.hp; });
      s += S.flock * 2 + Math.round(S.silver / 4) + S.trust * 3;
      const good = ["marah_weak_first", "refused_calf", "gave_all", "caleb", "looked", "rahab_oath", "clean_hands", "chose_life", "weak_in_middle", "crossed_with_ark"];
      const bad = ["calf", "kept_gold", "korah", "peor", "achan", "hoarded", "sabbath_broken", "plundered_dead"];
      good.forEach(f => { if (S.flags[f]) s += 150; }); bad.forEach(f => { if (S.flags[f]) s -= 150; });
      return Math.max(0, s) * S.mult;
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
        await UI.page(`STONES OF WITNESS\n\n${S.log.length ? S.log.map(l => "  • " + l).join("\n") : "  (none recorded)"}\n\n'A standing stone doesn't do anything if there's nobody there to tell the story.' (BEMA 34)\n\nSCORE: ${sc}  (x${S.mult} for ${SINAI.ROLES.find(r => r.id === S.role).name})`, { title: "" });
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
  window.Game = Game;
  window.addEventListener("load", () => Game.main());
})();
