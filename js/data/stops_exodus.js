/* ============================================================
   STOPS — Exodus 15–40 (Red Sea shore → Mount Sinai)
   Each stop: { id, name, book, miles (from previous stop), lon, lat,
                scene, water, run: async (g) => {...} }
   g = engine context (see engine.js: page, choose, insight, trust,
       grumble, water, food, flock, silver, hurt, heal, kill, sick,
       flag, has, alive, count, log, days, setDate, name, rand, pick)
   ============================================================ */
SINAI.STOPS = SINAI.STOPS || [];

SINAI.STOPS.push({
  id: "sea", short: "Sea of Reeds", name: "The far shore of the Sea of Reeds", book: "Exodus 14-15",
  miles: 0, lon: 32.60, lat: 29.90, scene: "sea", water: "none",
  async run(g) {
    await g.page("The 21st day of Aviv, in the first year.\n\nBehind you the water has closed. The chariots of Pharaoh are gone; the bodies of the Egyptians lie on the shore (Ex 14:30). Around you, more people than you have ever seen in one place — six hundred thousand men on foot, their wives, their children, a mixed multitude, and the flocks and herds bawling in the wind (Ex 12:37-38).\n\nOn your donkeys: the silver and gold jewelry and the clothing the Egyptians handed you as you left (Ex 12:35-36). In your bag: the last of the unleavened dough.", { title: "THE FAR SHORE" });
    await g.page("Moses begins to sing, and the people sing with him:\n\n  'I will sing to the LORD, for He is highly exalted.\n   Horse and rider He has hurled into the sea...\n   Who among the gods is like You, O LORD?...\n   The LORD reigns for ever and ever.' (Ex 15:1-18)\n\nMiriam takes a tambourine and the women follow her, dancing. For the first time the people call Him ADONAI with their own mouths.");
    const c = await g.choose("The whole camp is singing. Your household may:", [
      "Sing and dance with Miriam — rest here a day",
      "Sort the baggage and prepare the donkeys",
      "Pick the Egyptian dead for weapons and gold"
    ]);
    if (c === 0) {
      g.trust(6); g.heal(6); g.days(1);
      g.log("Sang the Song of the Sea");
      await g.page("You sing until your voice is gone. Your children learn the words. That night, for the first time since the brick-pits, everyone in your tent sleeps.\n\n'The saving act finishes there — not when they get through the sea, but when they have rejoiced and given thanks.'\n\nFAITH rises. Health improves.");
    } else if (c === 1) {
      g.flag("sorted"); g.log("Prepared the baggage at the shore");
      await g.page("Sensible. You re-lash the loads, count the skins, and notice that the unleavened dough will last perhaps four days. The song goes on without you.\n\nA rabbi would say: 'We have to teach our children how to dance.' But you have donkeys to see to.");
    } else {
      g.silver(60); g.flag("plundered_dead"); g.trust(-5); g.log("Stripped the Egyptian dead");
      await g.page("You wade among the drowned and come back with a bronze sword, two rings and a purse. +60 shekels.\n\nNobody stops you. But the text says the LORD 'fought for you while you kept silent' (Ex 14:14), and you have begun the journey by taking. FAITH falls slightly. Remember this at Jericho.");
    }
    await g.insight("BEMA 20 · 'With All Your Heart'",
      "The word does not mean Red Sea. YAM SUPH is the Sea of Reeds. God led them SOUTH into a dead end — Pharaoh behind, mountains beside, water in front — so that the lesson of the day was 'stand and watch.' And the very next verse is: 'Why are you crying out to Me? Tell the Israelites to move on.'\n\nNow He is taking them to the desert, because 'He's got to get Egypt out of them.'");
    await g.insight("BibleProject · 'God Tests His Chosen Ones'",
      "'In any test we see only options that look like death, and Yahweh provides another way that leads to life.' YESHUA — 'salvation' — appears in the Bible for the first time at Ex 14:13. It will later be a man's name.");
    {
      const c = await g.choose("The shore is quiet now. The water is full of fish stunned by the sea's return — the same fish you ate in Egypt 'at no cost' (Num 11:5). The children are already wading in.", ["Fish for an hour before the cloud lifts", "Leave them. Pack the donkeys"]);
      if (c === 0) {
        const r = await g.minigame("fishing", { title: "THE SHORE", text: "Move the hook up and down to a fish; tap or press SPACE when it is on the hook. ENTER when you are done." });
        g.food(r.food); g.S.egyptFish += r.caught;
        await g.page(r.caught ? `${r.caught} fish, ${r.food} lbs, cleaned and dried on the rocks. Everyone eats well tonight.\n\nThe children will remember this meal for a long time.` : "Nothing bites. The children remember the fish of Egypt anyway.");
      } else { g.trust(1); await g.page("You pack. The fish of Egypt stay behind with Egypt."); }
    }
    await g.page("You turn your back on the sea. Ahead is the Wilderness of Shur: three days, and no water in it.\n\nThe pillar of cloud moves out in front of the camp. The march begins.");
  }
});

SINAI.STOPS.push({
  id: "marah", short: "Marah", name: "Marah", book: "Exodus 15:22-26",
  miles: 32, lon: 32.85, lat: 29.30, scene: "marah", water: "bitter",
  async run(g) {
    await g.page("Three days in the Wilderness of Shur. The cliff walls give back the heat like an oven door. Your water-skins went slack yesterday; the children have stopped complaining, which is worse than complaining.\n\nThen the shout goes down the line: WATER. A pool, a real pool, at a place the Bedouin call Marah.\n\nThe first ones to reach it spit it out. It is bitter — brackish, salt, undrinkable. The word for bitter is MARAH. So is the word for rebel.", { title: "MARAH" });
    const c = await g.choose("The people are grumbling against Moses: 'What are we to drink?' (Ex 15:24). You:", [
      "Grumble with them — 'Did he bring us out here to die?'",
      "Keep your household quiet and wait on Moses",
      "Drink the bitter water anyway"
    ]);
    if (c === 0) {
      const n = g.grumble("Marah");
      await g.page("Your voice joins the roar. 'If we were honest,' says one teacher, 'I think we'd hear an awful lot of our own voices in these verses'. Still — the LORD hears it, and He counts.\n\nGRUMBLES: " + n + " of 10.");
    } else if (c === 1) {
      g.trust(4);
      await g.page("You hold your tongue and hold your children's hands. Moses cries out to the LORD. FAITH rises.");
    } else {
      const who = g.sick("dysentery");
      await g.page("You drink. Within the hour " + who + " is doubled over with cramps. Brackish water is a slow poison. " + who + " has DYSENTERY.");
    }
    await g.page("The LORD shows Moses a piece of wood — the Hebrew says A stick, not THE stick, just some random branch — and he throws it into the water. The water turns sweet.\n\nThen the text says something odd: 'There the LORD made for them a statute and a rule, and there He tested them' (Ex 15:25). But no statute is written down.\n\nThe rabbis say the unwritten rule was this: at the one sweet well, THE WEAK GO FIRST.");
    const d = await g.choose("The whole camp is pressing toward one pool. Your household stands near the front. You:", [
      "Push in — your children have not drunk in two days",
      "Step aside and send the elderly, the sick and the small ones ahead of you",
      "Fill every skin you own before the crowd arrives"
    ]);
    if (d === 1) {
      g.trust(8); g.flag("marah_weak_first"); g.log("Let the weak drink first at Marah");
      await g.page("You stand in the sun while old women, a boy with a fever and a mother with twins drink before you. It takes an hour. When your turn comes there is still water; there is always still water.\n\n'A test is always about two things: what you give and what you get. Every test is an opportunity to show God and to grow in God.'\n\nFAITH rises. You have passed the TEST OF THE HEART.");
      g.water(4);
    } else if (d === 0) {
      g.water(4); g.trust(-3);
      await g.page("You get your water. So does everyone who can shove. Behind you an old man is carried away from the pool, not having reached it.\n\n'You will always know whether you're looking at a community of Shalom or a community of Empire based on where you find the weak and the marginalized.'");
    } else {
      g.water(8); g.trust(-8); g.flag("hoarder");
      await g.page("You fill eight skins and lead your donkeys away while the line is still forming. A woman curses you. You have plenty of water — and the elders have noticed your name.\n\nFAITH falls. Egypt, it seems, came with you.");
    }
    await g.insight("BEMA 20 · the test of the heart",
      "'God doesn't test you just to see if you're going to pass. He tests you because He wants to live life together with you.' The word is YADA — to know by experience. 'You get to give Him receipts.'\n\nThe first of three tests on the road to Sinai — heart, soul, and strength — maps onto the Shema: love the LORD with all your LEV (heart), your NEPHESH (soul), your MEOD (strength — literally your 'very,' your 'much').");
    await g.insight("BibleProject · 'Israel Tests Yahweh'",
      "'Three days' in the Bible almost always signals a test and a confrontation with death. Here Israel is back at a tree: a piece of wood makes deadly water into life, and Moses is holding a staff that was once a snake. Every symbol of Genesis 3 is being reversed.");
  }
});

SINAI.STOPS.push({
  id: "elim", short: "Elim", name: "Elim", book: "Exodus 15:27",
  miles: 8, lon: 32.95, lat: 29.10, scene: "elim", water: "spring",
  async run(g) {
    g.water(30); g.heal(10); g.days(2);
    await g.page("You walk around one bend of the wadi and stop.\n\nTwelve springs. Seventy palm trees. Shade and the sound of running water, a day's walk from the bitter pool.\n\nElim was here the whole time. 'There was enough for everybody if they just would have waited on the word'. Moses, who kept Jethro's flocks in these deserts for forty years, may well have known.\n\nWater-skins FULL. Health restored. You camp here two days.", { title: "ELIM" });
    if (g.has("hoarder")) {
      await g.page("Your eight skins of Marah water sit in the shade, warm and faintly brackish, next to twelve cold springs. Your children look at you.");
    }
    if (g.S.flock > 0) {
      await g.page("Night under the seventy palms. The flocks of the whole camp are folded between the springs, and the smell of them carries. Something out in the dark is answering.\n\nYou take the sling every shepherd boy in Goshen learned with — a leather pouch, two cords, a smooth stone from the wadi.", { title: "ELIM — NIGHT" });
      const r = await g.minigame("slingshot", { kind: "wolf", sheep: Math.min(8, g.S.flock), title: "WOLVES", text: "Hold SPACE (or press the screen) to draw the sling; release to let the stone fly. Land it in the white band on the meter — nearer means less power. Stones are free. Sheep are not." });
      g.flock(-r.lost);
      if (r.lost === 0) { g.trust(2); g.log("Drove the wolves off the flock at Elim"); await g.page("Three stones, three yelps, and the dark goes quiet. The flock is whole.\n\n'The LORD is my shepherd' was written by a man who had done this."); }
      else await g.page(`The wolves take ${r.lost} of the flock into the dark. The rest are bleating till dawn.\n\nFlock: ${g.S.flock}. You will see them again — the wolves, and the sling.`);
    }
    await g.insight("BEMA 20",
      "Twelve is the number of the people of God; seventy is the number of the community, of the elders. A SPRING is better than a well — nobody dug it; it 'issues forth.' Not merely not bitter: 'super abundant.'\n\n'When it was all right, well, they didn't have a miracle, they just had water.' Ordinary provision is still provision.");
  }
});

SINAI.STOPS.push({
  id: "sin", short: "Wild. of Sin", date: [1, 2, 15], name: "The Wilderness of Sin", book: "Exodus 16",
  miles: 26, lon: 33.20, lat: 28.80, scene: "desert", water: "well",
  async run(g) {
    g.setDate(1, 2, 15);
    await g.page("The 15th day of the second month. One month out of Egypt (Ex 16:1).\n\nThe unleavened dough is gone. The flour is nearly gone. Between Elim and Sinai there is nothing to eat that a goat would not fight you for.\n\nThe whole community grumbles: 'If only we had died by the LORD's hand in Egypt! There we sat around pots of meat and ate all the food we wanted' (Ex 16:3).\n\nNobody sat around pots of meat in Egypt. Hunger has a good memory and a bad one.", { title: "THE WILDERNESS OF SIN" });
    const c = await g.choose("Your household's provisions: " + Math.round(g.S.food) + " lbs. You:", [
      "Grumble — 'Moses brought us out here to starve'",
      "Slaughter part of the flock for meat now",
      "Wait. Ask. See what the LORD does"
    ]);
    if (c === 0) { const n = g.grumble("the Wilderness of Sin"); await g.page("The LORD hears. Interestingly, He does not answer with fire. He answers, 'I will rain bread from heaven for you' (Ex 16:4).\n\nGRUMBLES: " + n + " of 10."); }
    else if (c === 1) { g.flock(-6); g.food(60); g.trust(-2); await g.page("Six animals. Your family eats meat for two days and the smell draws neighbors you must turn away. The flock is smaller for the offerings to come."); }
    else { g.trust(5); await g.page("You wait. FAITH rises."); }
    await g.page("That evening quail come up and cover the camp. In the morning, when the dew lifts, the desert floor is covered with thin flakes like frost.\n\n'MAN HU?' the people say — 'What is it?' — and the name sticks: MANNA. 'It was white like coriander seed and tasted like wafers made with honey' (Ex 16:31).\n\nMoses: 'Gather as much as each person needs — an omer per person. No one is to keep any of it until morning.'\n\nAn omer is somewhere between a cup and a liter. Not a bushel. A cup.");
    g.S.manna = true;
    const d = await g.choose("You have never seen food fall from the sky. Tomorrow it may not. You gather:", [
      "One omer for each person, as commanded",
      "Two omers each — and hide the extra in a jar",
      "As much as you can carry"
    ]);
    if (d === 0) {
      g.trust(6); g.log("Gathered manna as commanded");
      await g.page("Everyone eats. In the morning it is there again. And the next morning. 'The one who gathered much did not have too much, and the one who gathered little did not have too little' (Ex 16:18).\n\nThe rabbis say this was not magic: the strong gathered for the ones who could not — the Marah lesson, applied.");
    } else {
      g.trust(-5); g.flag("hoarded"); g.S.rations = "double";
      await g.page("In the morning the jar is full of maggots and the tent stinks. Moses is angry with you (Ex 16:20).\n\n'I would have been one of those anxiety-ridden worry-warts: But what if it doesn't come tomorrow? That's being a good steward. And it would have been all full of maggots.'");
      const w = g.sick("dysentery");
      await g.page(w + " ate from the jar before you noticed. " + w + " has DYSENTERY.");
    }
    await g.page("On the sixth day, a double portion appears, and it does NOT rot overnight. Moses: 'Tomorrow is a day of rest, a holy Sabbath to the LORD. Bake what you want to bake... six days you are to gather it, but on the seventh day, the Sabbath, there will not be any' (Ex 16:23-26).\n\nSome of the people go out on the seventh day anyway. They find nothing. 'How long will you refuse to keep my commands?' (Ex 16:28)\n\nFrom now on, EVERY SEVENTH DAY the camp rests.");
    const e = await g.choose("It is the first Sabbath. It has worked one way for five days; there is no reason to think today is different. You:", [
      "Rest. Eat yesterday's bread. Sit with your family",
      "Go out at dawn 'just to check'"
    ]);
    if (e === 0) { g.trust(6); g.heal(5); await g.page("You rest. It is the first full day your household has not walked, dug, hauled or fled in a year. The bread from yesterday is fine.\n\n'The Sabbath is a sign between Me and you.' The rabbis call it the wedding ring."); }
    else { g.trust(-6); g.flag("sabbath_broken"); await g.page("You find nothing but sand and a very long walk back in the heat. 'How long will you refuse?' FAITH falls."); }
    await g.insight("BibleProject · 'Israel Tests Yahweh'",
      "'For the third time in the Torah, rain falls. First the flood. Then fire on Sodom. Now the skies rain bread — but there's a test: will Israel trust that when they rest instead of gathering, Yahweh will have given them enough?'");
    await g.insight("Pawson · Unlocking the OT part 9",
      "'They lived on WHAT IS IT for forty years.' What's for breakfast? What is it. What's for lunch? What is it. Not again. By one estimate the nation needed two million gallons of water a day. And a warning: 'Don't complain to God — He might give you what you want.'");
    await g.insight("BEMA 26 · Deuteronomy 8:3",
      "'He humbled you, causing you to hunger and then feeding you with manna... to teach you that man does not live on bread alone.' You didn't learn to be comfortable because you got all your shopping done. You learned to wait on the daily.");
  }
});

SINAI.STOPS.push({
  id: "rephidim", short: "Rephidim", name: "Rephidim", book: "Exodus 17-18",
  miles: 34, lon: 33.60, lat: 28.70, scene: "rock", water: "none",
  async run(g) {
    await g.page("Rephidim. The mountains here rise like walls straight out of the ground. The camp is pitched in a wide wadi and there is not one drop of water in it.\n\nThis is not Marah. At Marah they asked. Here they QUARREL. 'Give us water to drink!' They are, Moses tells the LORD, 'almost ready to stone me' (Ex 17:4) — and the word he uses, TSA'AQAH, is the cry of the oppressed. He means it.", { title: "REPHIDIM" });
    const c = await g.choose("The men of your tribe are gathering stones. What do you say?", [
      "'Is the LORD among us or not? Prove it — or we go no further'",
      "'LORD, we are thirsty. Help us. Help our unbelief'",
      "Say nothing and stand between the crowd and Moses"
    ]);
    if (c === 0) { const n = g.grumble("Rephidim (Massah)"); g.trust(-4); await g.page("The place gets two names for what you just did: MASSAH (testing) and MERIBAH (quarreling).\n\n'The issue is not that they asked for water. The issue is that they demanded it, as if Yahweh didn't intend to provide.'\n\nGRUMBLES: " + n + " of 10."); }
    else if (c === 1) { g.trust(5); await g.page("Asking is not testing. Gideon asked for a fleece and was not counted a rebel. 'Help me in my unbelief' is not the same as 'unless you do X, I won't move.' FAITH rises."); }
    else { g.trust(3); g.flag("shielded_moses"); await g.page("Moses sees you. The elders see you. Nothing comes of it today. Something may."); }
    g.flag("rock_struck");
    await g.page("The LORD to Moses: 'Walk on ahead of the people. Take some elders. Take the staff. I will STAND THERE BEFORE YOU by the rock at Horeb. Strike the rock, and water will come out of it' (Ex 17:5-6).\n\nThe word for strike is NAKAH — to smite, to strike in order to kill. The same word used of the Egyptian beating the slave. And the LORD stands PANIYM — in front of the face of — the rock.\n\nMoses strikes. Water pours out of the mountain. The elders have just watched a God who steps in front of the blow.");
    g.water(20);
    await g.insight("BEMA 21 · 'With All Your Soul'",
      "'Does God have you, or does God only have you when He meets your demands? That's the test of the NEPHESH.' God's answer to Moses' fear is 'Go out in front of the people' — Moses' own test. 'I am a God that will take the blow on your behalf. And all the elders get to see this.'");
    /* ---- AMALEK ---- */
    await g.page("Then the Amalekites come.\n\nDeuteronomy remembers exactly how: 'When you were weary and worn out, they met you on your journey and attacked all who were LAGGING BEHIND' (Deut 25:18). Desert raiders. They do not attack the front of the column. They cut off the sick, the old, the slow — the back of the line.", { title: "AMALEK" });
    const order = await g.choose("Word comes to form for battle and set the marching order. Where are the weak and slow in YOUR household's line?", [
      "In the middle, with your strongest walking at the rear",
      "At the rear — they slow everyone down",
      "Leave the sick behind; catch up later"
    ]);
    if (order === 0) {
      g.trust(8); g.flag("weak_in_middle"); g.log("Put the weak in the middle against Amalek");
      await g.page("Your strongest take the rear. The raiders hit the back of the column and find spears instead of the sick. Nobody in your household falls.\n\nLater, in Numbers, the LORD will assign the tribe of DAN to bring up the rear of the whole nation for exactly this reason.");
      if (g.S.role === "dan") { g.trust(4); await g.page("You are of Dan. This is the job you will hold for forty years. FAITH rises."); }
    } else {
      const who = g.kill("a raider's wound");
      g.trust(-6);
      await g.page(who ? "The raiders take the rear of the line. " + who + " is cut down before the men of Judah can turn.\n\n" + who + " HAS DIED of a raider's wound." : "The raiders take the rear of the line. Your household is lucky. Others are not.");
    }
    await g.page("Joshua leads the fighting men. Moses climbs the hill with the staff of God, and as long as his hands are up Israel prevails; when they fall, Amalek prevails.\n\nHis arms tire. Aaron and Hur sit him on a stone and hold his hands up, one on each side, until sunset. The Hebrew says his hands were EMET — steady, faithful. The battle is won.\n\nMoses builds an altar: ADONAI NISSI — 'The LORD is my banner.'");
    const arms = await g.choose("Two of your household are near the hilltop. Who holds up the leader's arms?", [
      "Send your two strongest, even though the flock needs them",
      "Keep them with the flock; others will do it"
    ]);
    if (arms === 0) { g.trust(5); g.flock(-2); await g.page("Two goats wander off while your sons hold up a tired old man's hands. 'It's about how we help other people.' That is the test of the MEOD — your 'very,' your resources, spent on someone else."); }
    else { g.trust(-2); await g.page("Others hold his arms. Your goats are safe. The banner on the hill was never about the flock."); }
    await g.insight("BEMA 21 · the banner",
      "Egyptian city-gates had banners sixty feet tall. Sailing into harbor you saw the banner first — and right behind the banner is where the god resides. The banner always points past itself. 'If you looked up and saw Moses, you saw the banner — but you weren't looking at Moses. You were looking at what lay beyond Moses, which was God.'");
    /* ---- JETHRO ---- */
    await g.page("At Rephidim a Midianite priest arrives with Moses' wife and two sons: JETHRO, Moses' father-in-law. He hears everything the LORD has done and says, 'Now I know that the LORD is greater than all other gods.' He brings a sacrifice and eats bread with Aaron and the elders 'in the presence of God' (Ex 18:11-12).\n\nAmalek attacked in fear. Jethro sat down at the table. Same God, two responses.", { title: "JETHRO" });
    await g.page("The next day Jethro watches Moses judge disputes from morning till evening — two million people, one judge. 'What you are doing is not good. You will wear yourself out.' He tells Moses to appoint capable men over thousands, hundreds, fifties and tens.\n\n'Moses' father-in-law was a good deal more sensible than Moses, though he was not one of God's people.'");
    const j = await g.choose("The elders of your tribe are choosing judges over tens. You are asked to serve. You:", [
      "Accept — it is a burden, but a shared one",
      "Decline — your household needs you"
    ]);
    if (j === 0) { g.flag("judge"); g.trust(3); await g.page("You will spend an hour of most evenings settling quarrels over goats. Disputes in your part of the camp become rarer. (Fewer 'dispute' events on the trail.)"); }
    else { await g.page("Someone else takes it. The quarrels over goats go on."); }
    await g.page("Rephidim to the mountain of God is eleven, perhaps seventeen miles. The cloud lifts.");
  }
});

SINAI.STOPS.push({
  id: "sinai", short: "Mt Sinai", date: [1, 3, 1], name: "Mount Sinai", book: "Exodus 19 - Numbers 10",
  miles: 15, lon: 33.97, lat: 28.54, scene: "sinai", water: "spring",
  async run(g) {
    g.setDate(1, 3, 1); g.water(30);
    await g.page("The first day of the third month (Ex 19:1). The mountain rises sheer from the desert floor like a cliff; you can walk up and lay your hand on it. That is why Moses fences it.\n\nIsrael camps NEGED the mountain — 'opposite,' 'in front of,' the same word used when Eve is made as a helper KENEGDO, 'opposite him.' The rabbis say they camped UNDER the mountain. On purpose. Under a canopy.\n\nA CHUPPAH.", { title: "MOUNT SINAI" });
    await g.page("The LORD to Moses: 'You yourselves have seen what I did to Egypt, and how I carried you on eagles' wings and brought you to MYSELF. Now if you obey Me fully and keep My covenant, then out of all nations you will be My SEGULAH — treasured possession. You will be for Me a KINGDOM OF PRIESTS and a holy nation' (Ex 19:4-6).\n\nSEGULAH is wedding language. Still used at Jewish weddings today.\n\nThe people answer: 'We will do everything the LORD has said.'");
    await g.page("Consecrate yourselves. Wash your clothes — the bride's MIKVAH. On the third day: thunder, lightning, a thick cloud on the mountain, and a very loud SHOFAR blast. The mountain smokes like a furnace; the whole camp trembles.\n\nMoses leads the people out of the camp to meet God and they stand at the foot of the mountain. And God speaks TEN WORDS.");
    await g.page("One teacher's paraphrase of the ten words as a KETUBAH, a marriage covenant:\n\n 1. I am your husband.\n 2. You are to have no other lovers. Don't even keep pictures of other lovers.\n 3. Honor our family name.\n 4. Set aside a date night, once a week, just for us.\n 5. Don't wish to be somebody else.\n 6. Recognize your own worth.\n 7. Protect your sexuality.\n 8. Don't take away from your own needs.\n 9. Tell the truth about yourself.\n10. Be satisfied with what we have together.\n\nTwo tablets: two copies. The bride and the groom each keep one.");
    const up = await g.choose("The people hear the voice and are terrified: 'Speak to us yourself, and we will listen. But do not have God speak to us or we will die' (Ex 20:19). You:", [
      "Stay at the foot of the mountain with the people",
      "Go up as far as the fence — 'I want to hear Him myself'"
    ]);
    if (up === 0) await g.page("You stay below. Was that reverence, or a failure to accept the invitation? Teachers disagree. Some say refusing to go up was a failed test. Others say staying below was the RIGHT answer — proper reverence.\n\n'The Bible is designed to be meditation literature. We are not meant to understand everything on the first read.'");
    else { g.flag("went_up"); await g.page("You climb as far as the boundary and stand there while the mountain smokes and the shofar grows louder and louder. The people below have backed away. You have not. Two teachers disagree about whether that was right."); }
    await g.page("The people say 'We will do everything the LORD has said; we will obey.' Moses sprinkles blood on the altar and on the people: 'This is the blood of the covenant' (Ex 24:8). Then Moses, Aaron, Nadab, Abihu and seventy elders go up the mountain, and they SEE the God of Israel, and they eat and drink (Ex 24:11).\n\nA wedding feast. Then Moses goes up into the cloud for the ketubah in stone. Forty days.");
    /* ---- THE CALF ---- */
    await g.page("Day 10. Day 20. Day 30.\n\nNo Moses. The mountain still smokes. The people gather around Aaron: 'Come, make us gods who will go before us. As for this fellow Moses who brought us up out of Egypt, we don't know what has happened to him' (Ex 32:1).\n\nAaron: 'Take off the gold earrings that your wives, your sons and your daughters are wearing, and bring them to me.'\n\nYour household has " + g.S.gold + " shekels' weight of Egyptian gold on the donkeys.", { title: "FORTY DAYS" });
    const calf = await g.choose("Aaron's men are going tent to tent with a basket. You:", [
      "Give your gold — 'we need something we can SEE'",
      "Refuse, and keep your household inside the tent",
      "Refuse, and go tent to tent telling others to refuse"
    ]);
    if (calf === 0) {
      g.flag("calf"); g.S.gold = 0; g.trust(-20); g.log("Gave gold to the golden calf");
      await g.page("The earrings go into the fire and out comes a calf — an Egyptian bull, the sign of strength and fertility and money. 'These are your gods, O Israel, who brought you up out of Egypt!' Aaron builds an altar and announces a festival TO THE LORD. The people eat, drink, and 'rise up to play.'\n\nThey are calling the calf YAHWEH. 'Trying to domesticate God to worship Him on their own terms.'");
    } else {
      g.trust(10); g.flag("refused_calf"); g.log("Refused the golden calf");
      await g.page("You keep the tent flap shut and the gold on the donkey. Outside, the singing starts. It goes on all night.\n\n" + (calf === 2 ? "Some of your neighbors listen to you. Most do not." : ""));
    }
    await g.page("Moses comes down with the two tablets, sees the calf and the dancing, and smashes the tablets at the foot of the mountain. 'You're not worthy of this.'\n\nHe burns the calf, grinds it to powder, scatters it on the water, and makes the Israelites DRINK it — the ordeal of the unfaithful wife from Numbers 5, enacted on a whole nation.\n\n'It's like the groom turns around to grab the ketubah under the chuppah, and as he turns back, the bride is committing adultery.'");
    if (g.has("calf")) {
      const who = g.kill("the golden calf");
      await g.page("'Whoever is for the LORD, come to me!' The Levites gather to Moses and go through the camp with swords. About THREE THOUSAND die that day (Ex 32:28)." + (who ? "\n\n" + who + " is among them.\n\n" + who + " HAS DIED at the golden calf." : "\n\nYour household is passed over. You drink the gold-water and are sick for a day.") + "\n\nThen a plague (Ex 32:35).");
      if (g.S.role === "levi") { g.trust(5); await g.page("You are a Levite. You were among the swords. You will not forget it."); }
    } else {
      await g.page("The Levites go through the camp with swords. About three thousand die (Ex 32:28). Your tent is passed over.\n\n'Under the law given at Pentecost, 3,000 die. Under the Spirit given at Pentecost, 3,000 live.'");
    }
    await g.page("Moses goes back up the mountain: 'Oh, what a great sin these people have committed! But now, please forgive their sin — but if not, then blot ME out of the book You have written' (Ex 32:32).\n\nHe is doing the job of a priest: 'fighting for any loophole he can possibly think of to get them in.'\n\nAnd the LORD says: 'Chisel out two stone tablets like the first ones.'\n\n'It's like God goes: OK — now, where were we?'");
    await g.insight("BibleProject · Exodus 34:6-7",
      "The LORD passes in front of Moses proclaiming: 'YAHWEH, YAHWEH, a God compassionate and gracious, SLOW TO ANGER, abounding in loyal love (CHESED) and faithfulness (EMET)... forgiving iniquity, transgression and sin, yet not leaving the guilty unpunished.'\n\n'Slow to anger' is EREK APPAYIM — 'long of nostrils.' It takes a long time for His nose to burn hot. This is the most quoted verse in the Old Testament, and it is God's own commentary on the golden calf.");
    /* ---- TABERNACLE OFFERING ---- */
    await g.page("Now the LORD says: 'Have them make a sanctuary for Me, and I will DWELL among them' (Ex 25:8). Not a temple on a mountain; a tent, in the middle of the camp, that a people on the move can carry.\n\nThe instructions take more chapters than the creation of the world. Acacia wood. Gold. Blue, purple and scarlet yarn. Fine linen. Cherubim on the curtain — the same guardians that stood at the gate of Eden.\n\n'Everyone who is willing is to bring an offering' (Ex 35:5).", { title: "THE TENT" });
    const gold = g.S.gold;
    const give = await g.choose("Your household holds " + gold + " shekels' weight of Egyptian gold" + (gold === 0 ? " — none; it went into the calf." : "") + ". You bring:", gold > 0 ? [
      "All of it, and the blue yarn and the goat hair besides",
      "Six grams each — the same as everyone",
      "Nothing. Gold is for emergencies"
    ] : ["Goat hair, acacia wood and your labor — it is all you have"]);
    if (gold === 0) { g.trust(6); await g.page("You spin goat hair for the outer tent and cut acacia in the wadi. The Tent is built by what you have, not what you had."); }
    else if (give === 0) { g.S.gold = 0; g.trust(12); g.flag("gave_all"); g.log("Gave all your Egyptian gold to the Tent"); await g.page("You bring everything. So does everyone. The craftsmen come to Moses: 'The people are bringing MORE than enough.' Moses orders the camp to STOP giving (Ex 36:6-7).\n\n'They gave spontaneously, thoughtfully, regularly and generously — they had to be stopped.' About one ton of gold in all.\n\nYou keep the silver. FAITH rises greatly."); }
    else if (give === 1) { g.S.gold = Math.max(0, gold - Math.round(gold * 0.3)); g.trust(4); await g.page("A fair share. The Tent goes up. You still have gold on the donkey."); }
    else { g.trust(-8); g.flag("kept_gold"); g.log("Kept back your gold from the Tent"); await g.page("You keep it all. Nobody checks. The Tent goes up without you.\n\nGold you would not give to God has a way of finding another use. Remember this."); }
    await g.page("On the first day of the first month of the second year the Tent is finished. 'So Moses finished the work' — the words used of God at creation. The cloud covers the Tent of Meeting and the glory of the LORD fills it, and Moses CANNOT ENTER (Ex 40:34-35).\n\nA mobile Genesis 1-3 you carry through the desert. And an unresolved question: how can a holy God live with a rebellious people?");
    g.setDate(2, 1, 1);
    await g.page("The next month is LEVITICUS — 'the owner's manual in the glove box of the tabernacle'. Aaron is robed; fire comes out from the LORD and consumes the offering, and the people shout for joy and fall face down (Lev 9:24).\n\n'They weren't afraid. They had gotten to know this God in the desert well enough that they fall on their faces with JOY.'\n\nThen Nadab and Abihu bring their own fire, their own liturgy, and the same fire eats them (Lev 10). 'God's presence is good — it sustains life — and it is dangerous.'");
    /* ---- CAMP ORDER ---- */
    await g.page("Numbers begins with a census: 603,550 men of fighting age. The camp is laid out like an Egyptian army camp, which Moses may have trained in: the Tent in the center, the Levites around it as a buffer, then the twelve tribes on four sides — JUDAH at the entrance, to the east.\n\nWhen the camp moves it 'unpeels like an orange', each tribe in order, each piece of furniture in order, the people a thousand paces from the ark.", { title: "THE CAMP" });
    const place = await g.choose("Where does your household pitch its tent?", [
      "In your tribe's assigned place, facing the Tent",
      "Closer to the Tent than assigned — for the shade",
      "On the edge of the camp, for privacy and grazing"
    ]);
    if (place === 0) { g.trust(4); await g.page("Order in the camp is reverence made visible. 'Casualness doesn't have a place in God's camp.'"); }
    else if (place === 1) { g.trust(-5); g.hurt(10); await g.page("A Levite guard moves you back — after a night in which two of your household fall ill. 'Anyone else who approaches the sanctuary is to be put to death' (Num 1:51). The buffer is there for your protection."); }
    else { g.flag("edge_of_camp"); await g.page("Better grazing. Fewer neighbors. But the edge of the camp is where fire fell at Taberah (Num 11:1), and it is where the raiders come first."); }
    await g.page("Before you leave, Aaron lifts his hands over the people:\n\n  The LORD bless you and keep you;\n  the LORD make His face shine upon you\n     and be gracious to you;\n  the LORD lift up His face toward you\n     and give you SHALOM. (Num 6:24-26)\n\nOn the 20th day of the second month of the second year, the cloud lifts from the Tent (Num 10:11). Eleven months at the mountain. The wedding is over. The honeymoon is the desert.");
    g.setDate(2, 2, 20); g.flock(6); g.heal(10);
    await g.insight("BEMA 22 · 'Under the Chuppah'",
      "'The book of God's people at Mount Sinai is, without a doubt, a wedding.' Betrothal (Genesis 15), the groom gone to prepare a place (Egypt), the bride's mikvah, the shofar, the chuppah, the ketubah, the wedding gifts — 'the law is my wedding gift' — and the honeymoon in the desert, which is Numbers. 'The Sabbath is our wedding ring.'");
    await g.insight("Pawson · part 12",
      "'All the legislation was given while they were camped; all the stories of their travels show how they broke it. When they were still, God spoke to them. When they got up to move — that's when they got into trouble.' Sinai to Kadesh is eleven days on foot.");
  }
});
