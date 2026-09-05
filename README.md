# The Exodus Trail

A free, browser-playable Oregon Trail retelling Exodus 15 → Joshua 6.

**Two looks, switchable any time (L key, LOOK button, or the title menu):** CLASSIC — the 1985 Apple II green screen; DELUXE — a 1990-colour-edition style with parallax desert, day/night cycle, weather and your own household walking behind the pillar of cloud (`js/scenes_deluxe.js`, all drawn in code, no image files). Open `index.html#deluxe` or `#classic` to force one.

**Play:** open `index.html` (any static host works — GitHub Pages, Netlify, a plain folder). No build step, no dependencies.

**Keys:** number keys choose · ENTER continues / pauses travel · SPACE hurries the travel days (each day is a 5-second sunrise-to-night pass, `SINAI.DAY_MS` in `js/data/core.js`) · L = look · M = map · S = sound.

**Saving:** the game autosaves to the browser's localStorage (`sinai_save`) every travel day and at the start and end of every stop; the title menu offers *Continue your journey* when a save exists (a stop interrupted mid-way replays from its start). One slot per browser/device; cleared on any ending.

**Music:** an original chiptune plays by default. To use a royalty-free track (e.g. pixabay.com/music), drop the .mp3 in `assets/music/` and set `MUSIC_URL` at the top of `js/audio.js`.

**Difficulty model (v0.3):** the household has a hidden hardship score `S.H` (0–139) updated daily Oregon-Trail-style — `H = 0.9·H + misery` — where misery is 6 for a day's march plus weather, pace (cloud −1 / lag 0 / ahead +4), rations, no water or food (+8, compounding), low Faith (Emunah), barefoot, and grumbling (+5 each). H maps to good/fair/poor/very poor and drives the daily illness roll (`0.2·(H/140)²`). Illness: −20 on onset, −4/day, cure 3 %/day walking, 15 % resting, +10 % if Faith > 70, 0 while pushing ahead; someone below 50 HP does not survive a new illness. Water is one skin per person per day (cap 16 days, wells refill 4 days, springs fill). Score: 500/400/300/200 per survivor by health band × role, flags ±100. Difficulty (title menu) scales misery and illness ×0.8 / 1 / 1.3. `analysis/sim.py` is the Monte Carlo model used to tune it.

**Mini-games (v0.4, `js/minigames.js`, both looks, keyboard + touch):** FISHING at the three shores — the Sea of Reeds, Ezion-geber on the Gulf of Aqaba, and the Jordan after the manna stops (skill bonus food; the first two quietly feed the craving for Egypt at Kibroth-hattaavah). THE SLING — wolves, a lion or Amalekite scouts at the flock; hold to draw, release to land the stone in the band; misses cost sheep. First seen at Elim, then as a random event. GATHERING MANNA — a basket, flakes like frost, a rising sun that melts them, and no instructions: one omer a head, double on the sixth day (the only reminder is 'tomorrow is the Sabbath'), nothing on the Sabbath. Too little = hunger; too much = maggots and Emunah leaks.

**Content lives in** `js/data/` — every stop is an `async run(g)` function; every random event is in `events.js`. Teachings keep a source tag in the data files (the first argument of `g.insight(src, text)`) for our own reference; nothing in the in-game text names a teacher, podcast or brand.

See `../PLAN.md` for the full design and roadmap.
