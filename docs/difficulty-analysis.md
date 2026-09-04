# Exodus Trail — Difficulty Analysis (suggestions only, no changes made)

*4 September 2026. Compares the win/lose math of the original Oregon Trail (1978 BASIC and 1985 Apple II) with the current Exodus Trail v0.2 travel model, and proposes how to make Exodus Trail equally challenging.*

---

## 1. How the original Oregon Trail decides who lives

### 1978 BASIC (the mainframe / Creative Computing listing)

The whole game is a loop of fourteen-day turns. Each turn the party advances `M = M + 200 + (A − 220)/5 + 10·RND` miles, where `A` is the $200–300 spent on oxen — so a well-equipped wagon does about 210–230 miles a fortnight and needs roughly nine or ten turns to cover the 2,040 miles to Oregon. Food falls by `8 + 5·E` per turn (E = eating level 1–3), and the illness check each turn is a single roll against the eating level: the chance of *staying* healthy is `10 + 35·(E − 1)` percent, so eating poorly gives an 80 % chance of trouble, eating well 20 %. Trouble is then split into mild illness (lose 2 turns' worth of miles, some food), bad illness, or serious injury; a second illness with no medicine, or hitting zero food, kills you. Random events are picked by comparing one roll against a fixed table (about sixteen events, several of them with mileage or supply penalties, a couple potentially fatal). The design intent is visible in the numbers: the dominant lever is *how well you eat*, and the game punishes running out of anything.

### 1985 Apple II (Bouchard's redesign — the one Exodus Trail imitates)

Bouchard replaced the turn roll with a continuous *hidden health score*. A reverse-engineering write-up of the disk gives the daily update as

```
H = 0.9·H + ZT + ZC + ZF + ZP + FS + H0 + HR
```

where H runs 0–139 (0–34 "good", 35–69 "fair", 70–104 "poor", 105–139 "very poor"). The terms are small daily "misery" amounts: ZT for weather away from warm/cool, ZC for too little clothing per person in cold weather (`5 − 2W − clothes/people`, floored at 0), ZF for rations (`2·(R − 1)`, or 8 if the food is gone), ZP for pace (`P + P` plus weather penalties), FS a starvation term that *compounds* (`FS += 0.8` while starving, halves otherwise), and HR one-off hardships (10 for rough terrain, 20 when someone dies, a 20 % chance of 20 for bad water). Food burns at `people × (4 − R)` lb a day, i.e. 3/2/1 lb per person for filling/meager/bare-bones.

Three properties of that formula explain why the game *feels* the way it does:

1. **It is exponential smoothing with a ten-day memory.** The 0.9 factor means health settles toward `10 × (daily misery)`. Steady pace, filling rations and mild weather hold H in the "good" band; add a strenuous pace and meager rations and the equilibrium drifts up into "poor", where the illness rolls start to land. Nothing kills you in one day; everything kills you in three weeks. Players learn the model because the status line ("Health: fair") is a lagging readout of their last ten days of decisions.
2. **Illness is a symptom, not the disease.** Sickness rolls are drawn against H, so the cure is never the medicine — it is resting, eating more, slowing down, so H can decay back toward zero. A sick party member is a *signal* to change strategy, not a die roll to survive.
3. **Every resource is time.** Miles per day (about 40 max before Fort Laramie, 24 after; steady = 50 %, strenuous = 75 %, grueling = 100 %), food per day and money for the forts all trade against the calendar. Leave in March and dawdle and the snow gets you; go grueling and H climbs. The whole tension is the pace/health/calendar triangle.

The professions (banker $1,600 / carpenter $800 / farmer $400, score ×1 / ×2 / ×3) don't change any of those rules; they only change how much slack you buy at Matt's store. Even so, players who read a FAQ can win nearly every time (grueling pace, bare-bones rations, hunt, rest only in emergencies), and a blog author who replayed the 1984/85 version on the hardest setting "did not once fail to reach Oregon". The classic is *not* brutally hard — it is *legible*: you always know why you are losing.

---

## 2. What Exodus Trail's math does today (v0.2)

I ported the travel loop (`Game.tick`, pace, weather, water, the seventeen random events and their choices) to a Monte Carlo model and ran 3,000 journeys per policy. Stop scripts were left out except for the things they set (manna after Sin, the 38-year reset at the Wandering, water refills). Numbers are approximate but the shape is robust.

| Policy | avg. deaths | no deaths | 3+ deaths | whole household lost |
|---|---|---|---|---|
| Follow the cloud, one omer, wise event choices, **never rest** | 0.19 | 83 % | 0 % | 0 % |
| Same, but rest when someone is ill / weak | 0.84 | 77 % | 16 % | 12 % |
| Same, but only 10 days of water and 1 donkey | 3.0 | 34 % | 61 % | 53 % |
| Push ahead of the cloud, wise choices | 0.64 | 62 % | 6 % | 3 % |
| Ahead + half rations + never rest | 4.5 | 5 % | 89 % | 88 % |
| Lag with the stragglers, wise choices | 4.5 | 3 % | 90 % | 83 % |
| Reckless event choices, cloud pace | 0.96 | 72 % | 18 % | 13 % |

What the model exposes:

**The wilderness itself is almost harmless.** With cloud pace the daily HP change is +0.5, minus 2 on the ~20 % of days that are scorching: net ≈ +0.1 HP/day. Water only ticks down 1 day per day and springs refill 30, so with a normal purchase the longest dry stretch (Meribah → Mount Hor, 115 miles, ~10 days) never bites. There is no equivalent of the H score: no lagging health that reflects the last ten days of choices. Health only ever moves in jumps.

**Deaths come from three "cliffs", not a slope.** (a) Instant, choice-gated kills — the calf, Korah, Peor, the wadi floor, the raiders at lag/ahead pace, the Amorite baggage, Achan. Every scripted `g.kill` in the stops is behind an obviously-wrong option, so a careful reader never sees one, and a curious player who picks "make us a god" loses a family member on the spot. (b) One illness roll is close to a death sentence while walking: `sick()` takes 25 HP and then 4 HP a day with only a 6 % daily cure chance — an expected ~17 days and ~93 HP in total. (c) Lag pace and low water each trigger a spiral (raider kills; −7 HP/day + thirst illness) that the player is not warned about.

**Resting is a hidden trap.** The one Oregon-Trail remedy — stop and rest — costs a day of water per day in a game where you are usually between springs, and resting only raises the cure chance to 14 % while the illness keeps doing 4 HP damage. The "rest when ill" row above is *worse* than never resting, and the "10 days of water" row collapses for the same reason. In the original, resting is the great equaliser; in ours, it drains the water-skins toward the −7 HP/day thirst penalty.

**Emunah (trust) and grumbles don't touch survival.** Trust feeds the score and a few event branches; the ten-grumble sentence deals a one-off −20 HP only after Kadesh. So the game's distinctive currency is invisible in the win/lose math — the opposite of what the text teaches (the wilderness generation died of unbelief, not of dysentery).

**The calendar is decorative.** Stops set the date by fiat (Sinai on 1 Sivan, Kadesh in year 2, Jordan in year 41), so nothing is gained or lost by arriving early or late. Oregon Trail's whole pace/health trade-off exists because the winter is coming; ours has no winter.

**Roles don't differentiate.** Judah/Levi/Dan only change starting silver (1,600/800/400) and the score multiplier, but because the store sells nothing that matters after Elim (manna, springs), Dan's 400 shekels buys the same 30 days of water and 2 donkeys as Judah's 1,600 — the ×3 multiplier is nearly free.

---

## 3. How to make it *equally* challenging (suggestions)

The target is the 1985 feel: **a slow, legible health slope that the player can read and reverse, with a real clock, where the theological choices are the strongest lever.** In rough priority order:

### 3.1 Give the household a hidden health score — and make Emunah part of it
Replace the per-day HP nudges with an Oregon-style daily "hardship" accumulator, H = 0.9·H + (misery), where misery is the sum of small terms: weather away from cool/clear (+1 to +3), pace (+0 cloud, +2 ahead, +1 lag), rations (+0 omer, +2 half, +1 double — the maggots), no water (+8, compounding), no manna/food (+8), one-off hardships (+10 rough wadi, +20 a death in the tent) **and a trust term: +(60 − Emunah)/20 when trust is below 60, −1 when above 80.** Map H to the status words (good/fair/poor/very poor) and draw illness rolls from H (e.g. daily P(illness) ≈ (H/140)² × 0.15). Individual HP then only moves when someone is actually ill or starving. This single change gives the game the "why am I dying?" legibility of the original and makes Emunah *the* survival stat the text says it is — a low-trust household in the same desert genuinely does worse.

### 3.2 Make illness survivable *and* costly, like the original
Halve the illness impact (−10 HP on onset, −2/day) but make recovery depend on behaviour rather than a flat 6 %: cure chance per day = 4 % walking, 12 % resting, +10 % if Emunah > 70 ("the LORD who heals you", Ex 15:26, the Marah promise made mechanical), and 0 % while pushing ahead of the cloud. Then resting is the right answer again — and add a second illness ceiling: a member who falls ill twice without a full recovery dies (the 1978 rule).

### 3.3 Make water the desert's clock
Water should be per-person-per-day (a household of five drinks five "days" of skins a day; buying 30 days really buys 6), springs should refill fully but wells only partially and *bitter/none* stops not at all, and the Meribah → Hor → Punon stretch should be tuned so that a household that skipped Edom's water (Deut 2:6) arrives at Punon on its last skin. Show water as "days for your household" so the danger is visible. This restores the resource-vs-distance tension without adding any new mechanic — and it turns the "buy water from Edom" and cistern choices into real decisions.

### 3.4 Put a real calendar on the trail
Give the route soft deadlines that cost H rather than hard fail states: Rephidim before the Amalekite raiding season (arrive late → raids doubled), Sinai by 1 Sivan (the wedding — late arrival: −Emunah), Kadesh before the grapes are ripe (Num 13:20 — the spies' report is worse if you're late), the Jordan in the harvest flood (Josh 3:15 — cross too early and it's a ford, too late and the flood is at its height). Then pace matters: pushing ahead of the cloud buys days at the cost of H, exactly like grueling pace, and lagging is safe for health but loses the calendar.

### 3.5 Turn the instant kills into slopes with a warning
Keep the scripted deaths (they *are* the story) but make them consequences of accumulated state, not of one menu pick: the calf branch should be far more tempting when Emunah is low (offered as the only "safe" looking option), Korah's petition should cost a family member only if grumbles ≥ 6, the plague at Peor should scale with how long you feasted, and the wadi-floor flood should kill only if the weather term already said rain. Oregon Trail never killed anyone for one keystroke; every death was foreshadowed by "Health: poor" for a week.

### 3.6 Make grumbling a survival mechanic, not a counter
Each grumble should add +5 to H immediately (the body follows the heart) and the tenth grumble after Kadesh should trigger the wilderness sentence over the *next thirty days* — H rises 2/day until someone dies — rather than a one-off −20. This gives the "You have tested me ten times" moment the same dread as watching health slide from fair to poor.

### 3.7 Differentiate the roles the way Oregon Trail's professions differentiate *slack*
Judah: most silver, but marches first — takes the raider/flood events at the front, no Emunah bonus. Levi: carries the holy things — pace locked to the cloud (can't push ahead), but +1 cure chance and immunity to the calf temptation costing a life; silver 800. Dan: rear-guard — raiders target Dan unless the weak were placed in the middle (the Rephidim choice), least silver, so water is genuinely scarce; ×3 score. Now each role has a different *failure mode*, which is what the banker/farmer split actually does.

### 3.8 Recalibrate the score to survivors × health, like the original
Oregon scores 500/400/300/200 per survivor by final health band plus small item bonuses; ours gives 100 + HP per survivor plus 150 per flag, so a dead-but-pious household can outscore a living impious one. Suggest 500/400/300/200 per survivor by band × role multiplier, then flags as ±100 — so keeping the family alive is always worth more than any single stone of witness.

### 3.9 Make the store matter after Elim
Right now nothing you buy at the shore is needed past stop 2. Suggestions: sandals wear out (1 pair per 100 miles per person until Moab, where "your sandals did not wear out" is revealed as the reward for trust), donkeys die of thirst before people do (losing one raises everyone's misery term), spare skins fail on the sandstorm/skin-split events at a rate tied to how many you bought. Then Dan's 400 shekels is a real constraint and Judah's 1,600 is real slack.

### 3.10 Add the missing "rest days" balance
Let resting at a spring/well cost nothing and heal H by 10/day; resting in the open cost a day of water per person and heal only 4. Show it in the rest menu ("Rest here: 3 days, −15 skins"). The player then has the classic Oregon Trail dilemma — rest now and risk the water, or push to the next spring and risk the sick child.

### 3.11 A target difficulty curve
Aim for the 1985 profile: a careful first-time player who reads the screens should lose one or two household members and arrive; an inattentive player should lose three or four; a FAQ-optimised player should be able to arrive with everyone alive but *not* trivially. In the model above that means moving the "wise, never rests" row from 83 % no-deaths to about 35–45 %, and the "wise, rests when ill" row from 12 % wipes to about 3 % — i.e. make careful play a little harder and make the sensible remedy (rest) actually work. A difficulty menu (Follow the cloud / Test the LORD / Ten times) could scale the H multiplier 0.8 / 1.0 / 1.3 if we want the Oregon-style choice without touching content.

---

## 4. Order of work if you approve

1. Hidden H score + trust term + status words (3.1) — the foundation; everything else hangs on it.
2. Illness rework (3.2) and per-person water (3.3) — the two things that fix the "rest is a trap" inversion.
3. Score rebalance (3.8) — small, but it changes what players optimise for.
4. Calendar deadlines (3.4) and role failure modes (3.7).
5. Convert the instant kills to warned slopes (3.5, 3.6).
6. Store relevance (3.9), rest balance (3.10), difficulty menu (3.11).

Each step can be verified with the Monte Carlo model (`analysis/sim.py`) before it touches the game, and with the existing Playwright auto-play afterwards.

---

*Sources for the original game's math: R. Philip Bouchard's design notes (philipbouchard.com/oregon-trail); the "Waiting for Oregon" reverse-engineering study (moral.net.au, Jan 2025) for the 1985 health formula; the GameFAQs Apple II guide (ASchultz) for pace, rations, prices and scoring; Data Driven Gamer's replay of the 1984–85 version for the observed difficulty; the published 1978 Creative Computing BASIC listing for the turn-based formulas.*

---

## 5. Implemented (v0.3, 4 Sep 2026)

Applied to both looks (shared engine): hidden hardship score H with the Emunah term (3.1), illness rework with behaviour-based cure and the weak-member rule (3.2), per-person water with a 16-day cap and partial wells (3.3), grumbles add +5 H and the tenth grumble after Kadesh becomes a +2/day sentence until a death (3.6), role failure modes — Levi pace-locked to the cloud with +4 % cure, Judah takes raids harder, Dan unchanged but poorer (3.7), Oregon scoring (3.8), sandal wear unless Emunah ≥ 60 (3.9), rest free at water / costs water in the open with the cost shown in the menu (3.10), difficulty menu ×0.8 / 1 / 1.3 (3.11). Not yet done: calendar deadlines (3.4) and converting the scripted instant kills into warned slopes (3.5) — both are content rewrites in the stop scripts.

Final constants (tuned with `sim_v03.py`, 2,000 runs per policy): march misery 6 + weather; pace cloud −1 / lag 0 / ahead +4; camp days 0.5 × weather, −3 beside water; illness P = 0.2·(H/140)²; onset −20, −4/day (+1 when H ≥ 70); cure 3 % walking / 15 % resting / +10 % Emunah > 70 / +5 % at water / +4 % Levite / 0 pushing ahead; weak threshold 50 HP; H ≥ 70 everyone −0.5/day, H ≥ 105 −2/day; water cap 16 days × people, wells +4 days.

| Policy (model) | avg. deaths | no deaths | 1–2 | 3+ | wiped |
|---|---|---|---|---|---|
| Wise, rests beside water | 0.38 | 79 % | 17 % | 4 % | 1 % |
| Careful first-timer (rests only when poor) | 1.27 | 41 % | 40 % | 19 % | 5 % |
| First-timer who never rests | 1.88 | 26 % | 41 % | 33 % | 11 % |
| Ahead of the cloud, wise | 0.37 | 71 % | 28 % | 1 % | 0 % |
| Ahead + half rations + never rests | 1.30 | 33 % | 50 % | 17 % | 3 % |
| Lag with the stragglers | 3.9 | 3 % | 17 % | 81 % | 55 % |
| Reckless choices, cloud | 2.7 | 21 % | 25 % | 54 % | 34 % |
| Reckless + never rests | 4.8 | 0 % | 2 % | 98 % | 86 % |
| Hard (×1.3), wise | 0.61 | 71 % | 20 % | 9 % | 3 % |

Live-game check (Playwright bots, 12 full runs, both looks): no JS errors; H climbs to the 40s–60s on the Kadesh and Arabah legs and water reaches 3–6 skins at Kadesh, so the long dry legs finally bite; low-trust bots ended with H 99–123 and fever deaths, high-trust bots arrived with H near 0.

## 6. Playstyle re-tune (v0.4, 4 Sep 2026) — "not too punishing, except on the highest difficulty"

Changes: water cap 16 → 18 days, wells +4 → +5 days; lag pace now −1 misery like the cloud (easy on the body — its danger is water and raiders); raiders at lag pace 25 % lethal (was 50 %); difficulty now also moves the cure rate (+5 % gentle / −2 % hard) and the weak-member threshold (40 / 50 / 55 HP). Model results (2,000 runs per row):

| Policy | NORMAL: deaths / clean / 3+ / wiped | GENTLE (×0.7) | HARD (×1.35) |
|---|---|---|---|
| Wise, rests beside water | 0.19 / 88 % / 2 % / 0.4 % | 0.15 / 89 % / 1 % / 0.1 % | 0.38 / 81 % / 5 % / 2.4 % |
| Careful first-timer | 0.67 / 65 % / 8 % / 2.4 % | 0.40 / 77 % / 4 % / 0.4 % | 1.26 / 49 % / 20 % / 9.5 % |
| First-timer who never rests | 0.46 / 74 % / 6 % / 1.3 % | 0.18 / 87 % / 1 % / 0.1 % | 1.17 / 48 % / 17 % / 7.5 % |
| Dan-poor (6 days water, 1 donkey) | 1.59 / 39 % / 28 % / 12 % | 0.71 / 63 % / 9 % / 2.4 % | 1.62 / 46 % / 29 % / 17.5 % |
| Ahead of the cloud, wise | 0.23 / 81 % / 1 % / 0.1 % | 0.17 / 85 % / 0 % / 0 % | 0.40 / 71 % / 2 % / 0.7 % |
| Ahead + half rations + never rests | 1.18 / 38 % / 14 % / 2.2 % | 0.39 / 70 % / 2 % / 0.1 % | 3.49 / 4 % / 73 % / 36 % |
| Lag with the stragglers | 3.3 / 7 % / 65 % / 39 % | 2.35 / 18 % / 43 % / 20 % | 3.55 / 11 % / 71 % / 54 % |
| Reckless choices, rests | 2.15 / 30 % / 40 % / 22 % | 0.34 / 79 % / 3 % / 0.9 % | 4.96 / 0 % / 100 % / 97 % |
| Reckless + never rests | 3.7 / 3 % / 78 % / 46 % | 2.14 / 22 % / 39 % / 16 % | 4.83 / 0 % / 99 % / 90 % |

Reading: on NORMAL a careful first-timer arrives with everyone two times in three and almost never loses the household; only genuinely bad play (lagging across the 110-mile Kadesh leg on 8 miles a day, or reckless choices with no rest) is punished hard. GENTLE forgives even reckless choices if you rest. HARD is where the desert of the text lives: half the careful players bury someone, and reckless play is fatal. Lagging remains the one "innocent-looking" trap on every setting — the pace description now warns that 8 miles a day outlasts the water-skins on the long legs.

Mini-games are not in the model; in play they add a small food bonus (fishing), a flock-loss risk (the sling) and the manna judgement — gathering short raises H by 2 + the shortfall and costs 2 HP; gathering long costs 3 Emunah, +3 H and the maggots; exact gives +1 Emunah.
