# The Exodus Trail

A free, browser-playable Oregon Trail (1985 Apple II style) retelling Exodus 15 → Joshua 6.

**Play:** open `index.html` (any static host works — GitHub Pages, Netlify, a plain folder). No build step, no dependencies.

**Keys:** number keys choose · ENTER continues / pauses travel · M = map · S = sound.

**Music:** an original chiptune plays by default. To use a royalty-free track (e.g. pixabay.com/music), drop the .mp3 in `assets/music/` and set `MUSIC_URL` at the top of `js/audio.js`.

**Content lives in** `js/data/` — every stop is an `async run(g)` function; every random event is in `events.js`. Teachings are tagged with their source (BEMA episode / Pawson part / BibleProject episode).

See [`../docs/PLAN.md`](../docs/PLAN.md) for the full design and roadmap. This is the preserved v0.1 release — the current game is [one level up](../index.html).
