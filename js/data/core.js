/* ============================================================
   THE EXODUS TRAIL — core content: roles, glossary, learn pages,
   epitaphs, month names.  All story stops live in stops_*.js,
   random events in events.js.  Engine is js/engine.js.
   ============================================================ */
window.SINAI = window.SINAI || {};
const SINAI = window.SINAI;
SINAI.DAY_MS = 5000; // length of one travel day's animation, ms (SPACE hurries it)

SINAI.MONTHS = ["Aviv", "Ziv", "Sivan", "Tammuz", "Av", "Elul",
  "Ethanim", "Bul", "Kislev", "Tevet", "Shevat", "Adar"];

SINAI.ROLES = [
  {
    id: "judah", name: "an elder of JUDAH",
    blurb: "Judah camps east of the Tent and marches first when the cloud lifts (Num 2:3, 10:14). Your household is well supplied with the silver of Egypt — but the front of the column meets every raid and every flood first.",
    silver: 1600, mult: 1
  },
  {
    id: "levi", name: "a LEVITE of the clan of Kohath",
    blurb: "You will carry the holy things on your shoulders (Num 7:9). Less silver, more responsibility; a Levite receives no land. You cannot run ahead of the cloud — and the priests' knowledge of the plants means your sick recover a little faster.",
    silver: 800, mult: 2
  },
  {
    id: "dan", name: "a rear-guard of DAN",
    blurb: "Dan brings up the rear of the whole camp (Num 10:25) so the weak, the sick and the slow walk in the middle. Least silver — water and donkeys will be tight. Amalek attacks from behind, but the rear guard knows how to meet them.",
    silver: 400, mult: 3
  }
];

SINAI.DEFAULT_NAMES = ["Elishama", "Tirzah", "Hur", "Noa", "Ithamar"];

/* Store — "Dividing the spoils of Egypt" */
SINAI.STORE = [
  { id: "donkeys", name: "Donkeys", unit: "head", price: 40, min: 1, max: 6,
    help: "Each donkey carries your tent, skins and grain. Fewer than two and your household walks slowly under its own load." },
  { id: "flock", name: "Sheep & goats", unit: "head", price: 8, min: 0, max: 60,
    help: "Milk, wool, and animals for the offerings. Also the thing you will be tempted to slaughter when you crave meat." },
  { id: "food", name: "Provisions (flour, dried figs, fish)", unit: "lbs", price: 0.5, min: 0, max: 1200,
    help: "The unleavened dough you carried out of Egypt is nearly gone. Bread will be a problem until the LORD solves it." },
  { id: "water", name: "Water-skins (filled)", unit: "days", price: 14, min: 3, max: 16,
    help: "One day = a skin for every person in your household. Springs refill you completely; wells only partly. Every day of rest in the open drinks a day." },
  { id: "skins", name: "Spare skins & ropes", unit: "sets", price: 12, min: 0, max: 6,
    help: "Skins split, ropes fray, tent-pegs snap in rocky ground." },
  { id: "sandals", name: "Sandals", unit: "pairs", price: 5, min: 0, max: 12,
    help: "The rock of Sinai eats leather. Or so everyone says." }
];

/* Pace & rations */
SINAI.PACES = {
  cloud: { name: "Follow the cloud", miles: 12, hp: 0, desc: "March when the cloud lifts, camp when it settles (Num 9:17-23). The cloud is a covering; the whole nation moves as one." },
  ahead: { name: "Push ahead of the cloud", miles: 16, hp: -2, desc: "Faster — fewer days of water. But the sun, the raiders and sickness find the ones who run ahead, and the sick do not recover on the run." },
  lag:   { name: "Lag with the stragglers", miles: 8, hp: 1, desc: "Easy on the body — but 8 miles a day means the long legs (Kadesh is 110 miles) outlast your water-skins, and the rear is where Amalek 'cut off all who were lagging behind' (Deut 25:18)." }
};
SINAI.RATIONS = {
  omer:   { name: "One omer each, as commanded", desc: "'Gather as much as each person needs' (Ex 16:16). Enough. Exactly enough." },
  double: { name: "Gather double, to be safe", desc: "Just in case tomorrow it doesn't come. Moses said not to keep any till morning." },
  half:   { name: "Half an omer each", desc: "Eat less, move faster. Your family grows weak." }
};

/* Illness table */
SINAI.ILLS = {
  thirst: "thirst", heat: "heat-stroke", fever: "the fever", dysentery: "dysentery",
  scorpion: "a scorpion sting", snake: "snakebite", plague: "the plague", wound: "a raider's wound",
  broken: "a broken leg", grief: "a broken heart"
};

/* Epitaphs — chosen by cause of death */
SINAI.EPITAPHS = {
  "thirst": "who died of thirst, three days from water",
  "heat-stroke": "who lay down in the sun and did not get up",
  "the fever": "taken by the fever in the Wilderness of Paran",
  "dysentery": "who died of dysentery, as in the old game",
  "a scorpion sting": "stung at the bottom of a broken cistern",
  "snakebite": "who would not look at the bronze serpent",
  "the plague": "who fell in the plague at the tent door",
  "a raider's wound": "cut down at the rear of the camp by Amalek",
  "a broken leg": "who fell in the wadi and could not be carried",
  "a broken heart": "who died of grief in the wilderness",
  "grumbling": "who died of grumbling in the wilderness",
  "the flood": "swept away by the wadi in the night",
  "the wilderness": "who died in the wilderness, as the LORD had sworn",
  "the golden calf": "who fell by the sword at the golden calf",
  "the earth": "swallowed by the earth with Korah",
  "Baal Peor": "who joined himself to Baal of Peor",
  "old age": "gathered to their people, full of years",
  "the devoted things": "who took what was devoted to the LORD"
};

/* Learn-about-the-trail pages (title screen option 2) */
SINAI.LEARN = [
  ["THE EXODUS TRAIL",
   "In the year the LORD brought Israel out of Egypt, about six hundred thousand men on foot, besides women and children, and a mixed multitude, with flocks and herds (Ex 12:37-38), walked into a desert that cannot feed a village.\n\nThis game begins on the far shore of the Sea of Reeds and ends at the walls of Jericho. Between them lie forty years, roughly 550 miles of walking, and ten occasions on which the LORD said, 'You have put me to the test.'"],
  ["HOW TO PLAY",
   "It plays like the old Oregon Trail. You lead one household of five inside the great camp. Keep them alive: water, food, health, and — new in this desert — EMUNAH, trust.\n\nHEALTH is the whole household's: good, fair, poor, very poor. It is a slow thing — the last ten days of heat, pace, thirst, grumbling and trust, added up. When it slides to POOR, people start to fall ill. Someone already weak may not survive a new sickness.\n\nThe cure is not medicine. It is rest — best beside a spring or well, where rest costs no water — a steady pace behind the cloud, a full omer, and trust. Every day of rest in the open drinks a day of water for the whole household.\n\nEvery choice is a choice the text records someone making. Grumbling is counted, and it wears the body down. Hoarded manna rots. Gold kept back from the Tent becomes a calf. What you take at Jericho decides what happens at Ai.\n\nPress ENTER to size up the situation. Press M for the map. Press S for sound."],
  ["THE DESERT",
   "It is not sand dunes. It is deep rock canyons — wadis — where you cannot see two hundred yards ahead, where the walls radiate heat 'like baking in an oven,' and where the number one killer is not thirst but the flash flood: if you hear a sound like a train you have forty seconds to two minutes to climb.\n\nShade is a broom bush three feet high with room for one person. Pasture is a tuft of dry grass in the rocks. The desert teaches 'just enough, just in time.'"],
  ["THE SCROLLS",
   "Along the trail you will be handed SCROLLS OF INSIGHT.\n\nSome look at the Hebrew words, the rabbis, and the desert itself. Some look at the history, the numbers, the logistics of two million people on foot. Some look at the literary design — the tests, the echoes of Eden, the character of God (Ex 34:6-7).\n\nRead them slowly. The desert is the classroom."],
  ["WHAT KILLS YOU",
   "Thirst. Heat. The fever. Dysentery. Scorpions in cisterns. Fiery serpents in the Arabah. Amalek at the rear of the line. The wadi at night.\n\nAnd the things that killed the first generation: the calf (3,000), the craving at Kibroth-hattaavah, the vote at Kadesh (every man over twenty), Korah (250 and 14,700 more), Baal Peor (24,000).\n\n'Behold the goodness and the severity of God.'"]
];

/* Glossary used by the insight boxes */
SINAI.GLOSS = {
  yada: "YADA — to know by experience, intimately; 'Adam knew his wife.' God tests 'to know what is in your heart.'",
  marah: "MARAH — bitter; also rebellious. 'I give you bitter water to see if you are a bitter people.'",
  emunah: "EMUNAH / EMET — steadiness, reliability, 'amen.' Moses' hands were EMET when Aaron and Hur held them.",
  nephesh: "NEPHESH — soul, the whole of you. 'Does God have you, or only when He meets your demands?'",
  meod: "MEOD — 'very,' your 'much': every resource you have. The test of Amalek.",
  segulah: "SEGULAH — treasured possession. Wedding language, still used at Jewish weddings today.",
  midbar: "MIDBAR — wilderness, from DAVAR, 'word': the place of speaking.",
  kadosh: "KADOSH — holy, set apart. KADESH is spelled with the same letters.",
  hotnose: "'HIS NOSE BURNED HOT' — the Hebrew idiom for anger. 'Slow to anger' = EREK APPAYIM, 'long of nostrils.'",
  chesed: "CHESED — loyal love. EMET — faithfulness. Ex 34:6-7, the most quoted verse in the Old Testament.",
  zakar: "ZAKAR — remember (14 times in Deuteronomy). SHAKACH — forget (9 times).",
  chazak: "CHAZAK VE'EMATZ — be strong and courageous; EMATZ has the sense of quick feet.",
  harem: "HAREM — 'devoted': set aside for God, not for you. (Josh 6:17-19)"
};
