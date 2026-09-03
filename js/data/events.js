/* ============================================================
   RANDOM TRAVEL EVENTS.  Each: { id, w (weight), when(S) -> bool,
   run: async (g) }.  S.stopIdx = index of the NEXT stop.
   ============================================================ */
SINAI.EVENTS = [
  {
    id: "flood", w: 4, when: S => S.weather === "rain" || S.weather === "storm",
    async run(g) {
      const c = await g.choose("Clouds over the mountains to the east. The wadi floor is flat and shaded and the best place to pitch a tent for miles. Where do you camp tonight?", [
        "On the wadi floor — it's flat and out of the wind",
        "Up on the rock shelf — hot, exposed, and a hard climb with the donkeys"
      ]);
      if (c === 0) {
        const who = g.kill("the flood"); g.S.donkeys = Math.max(1, g.S.donkeys - 1); g.water(-3); g.food(-40);
        await g.page("In the night, a sound like a train.\n\nYou have forty seconds to two minutes. The water comes down the canyon chest-high, black, full of stones and trees." + (who ? " " + who + " does not get up the bank in time.\n\n" + who + " HAS DIED in the flood." : " Everyone gets up the bank. The tent, a donkey and half the food do not.") + "\n\n'I am the number one killer in the desert.' (BEMA 29)");
      } else {
        g.hurt(3);
        await g.page("In the night, a sound like a train. Below your ledge the wadi fills chest-deep with black water and boulders. You lose a night's sleep and nothing else.\n\n'Which part of the wadi is he building his house in? At the bottom.' (BEMA 29, on Matthew 7)");
      }
    }
  },
  {
    id: "cistern", w: 5, when: S => S.water < 6,
    async run(g) {
      const c = await g.choose("Water is low. A shepherd boy points out an old cistern cut in the rock — a covered pit of last winter's rain. It is dank, dark and full of things.", [
        "Lower a skin and drink. Water is water",
        "Send someone down to fill every skin",
        "Walk on and pray for a spring"
      ]);
      if (c === 0) { g.water(3); const w = g.rand() < 0.4 ? g.sick("dysentery") : null; await g.page("Stagnant, warm, tasting of goat." + (w ? " By evening " + w + " is sick. " + w + " has DYSENTERY." : " Nobody is sick. Yet.") + "\n\n'Living water' — MAIM CHAIM — is only a spring or rain. Cisterns are 'broken cisterns' (Jer 2:13)."); }
      else if (c === 1) { g.water(8); const w = g.rand() < 0.5 ? g.sick("a scorpion sting") : null; await g.page("Eight skins." + (w ? " And " + w + ", at the bottom of the pit, puts a hand on a scorpion. " + w + " is STUNG." : " The one at the bottom comes up shaking; there was a scorpion on the wall.") + "\n\n'That same cistern has had a scorpion in it more than once.' (BEMA 29)"); }
      else { if (g.rand() < 0.5) { g.water(6); await g.page("Two hours on, around a bend: a trickle out of the rock into a pool the size of a table. Living water. 'Let's see what the Lord provides around the next bend.' (BEMA 29)"); } else { g.hurt(4); await g.page("No spring. A long, dry, quiet afternoon. Everyone is a little weaker."); } }
    }
  },
  {
    id: "rotem", w: 4, when: S => S.weather === "scorching",
    async run(g) {
      const weakest = g.weakest();
      const c = await g.choose("Noon. No wind. The rock walls radiate heat 'like baking in an oven.' The only shade in a mile is a ROTEM — a broom bush three feet high, room for exactly one person under it. " + weakest + " is swaying. Who goes under?", [
        weakest + " — the weakest",
        "You — you have to lead tomorrow",
        "Nobody. Keep walking"
      ]);
      if (c === 0) { g.trust(4); g.heal(3, weakest); await g.page(weakest + " sleeps an hour in the one piece of shade in the wadi. 'Just enough shade.' Elijah lay under one to die and woke to bread. (BEMA 27)\n\n'God is our shade — and God asks us to be that for other people.'"); }
      else if (c === 1) { g.hurt(8, weakest); await g.page("You rest. " + weakest + " sits in the sun and is worse by evening."); }
      else { g.hurt(6); const w = g.rand() < 0.3 ? g.sick("heat-stroke") : null; await g.page("You walk." + (w ? " An hour later " + w + " goes down face first. " + w + " has HEAT-STROKE." : " Everyone is dizzy by the time the sun drops.")); }
    }
  },
  {
    id: "acacia", w: 3, when: S => S.stopIdx > 5,
    async run(g) {
      const c = await g.choose("At the mouth of the wadi, where the floods spread out, stands a grey tree that looks entirely dead — an ACACIA. The Bedouin call it the gift of the desert. Your donkeys are eyeing it.", [
        "Stop and harvest: wood, pods, sap",
        "It's dead. Keep moving"
      ]);
      if (c === 0) { g.days(1); g.food(40); g.flock(2); g.heal(2); await g.page("Hard wood for the tent poles. Pods, boiled, that 'will feed a camel for a month.' Sap for wounds. Fuel that burns longer and hotter. The flock fattens.\n\n'Can sit dormant for a decade with no water, and look dead — then springs to life when the rain comes.' The tree of Psalm 1, 'planted by streams of rushing water.' (BEMA 27)"); }
      else await g.page("You pass it. Two days later, on the far side of the ridge, it rains, and behind you the dead tree is green.");
    }
  },
  {
    id: "arar", w: 3, when: S => S.stopIdx > 5 && S.food < 80 && !S.manna,
    async run(g) {
      const c = await g.choose("A bright green bush with a yellowish trunk and fat, showy fruit — the only green thing in the canyon. The children are already reaching.", [
        "Eat it — the only green thing for miles",
        "Don't touch it"
      ]);
      if (c === 0) { const w = g.sick("the fever"); await g.page("The fruit pops open EMPTY — cobwebby, hollow — and its milky coating burns the skin. " + w + " ate first. " + w + " has THE FEVER.\n\nAR'AR. The pun is ARUR — cursed. 'Cursed is the one who trusts in man; he will be like a bush in the wastelands' (Jer 17:5-6). Looks great outside; toxic inside. (BEMA 28)"); }
      else { g.trust(2); await g.page("Good. AR'AR: the fruit is hollow and the sap is poison. The acacia looks dead and is rich; the ar'ar looks alive and is empty. Jeremiah 17 puts them side by side. (BEMA 28)"); }
    }
  },
  {
    id: "lost", w: 4, when: S => true,
    async run(g) {
      const c = await g.choose("The wadi forks. The guide's voice went LEFT, down the narrower, darker branch. The right-hand branch is wider, brighter, and looks like it goes where you're going.", [
        "Follow the voice — left",
        "Take the obvious route — right"
      ]);
      if (c === 0) { g.trust(2); await g.page("Two bends on, the left branch opens into the main valley. The right branch, you learn that night, ends in a dry cliff. 'People of the ears, not people of the eyes.' (BEMA 26)"); }
      else { g.S.miles += 7; g.hurt(3); g.water(-1); await g.page("A dead end at a cliff. An extra SEVEN MILES back and around — 'more like Antelope Canyon than the Sahara; you can't see two hundred yards in front of you.' (BEMA 29)"); }
    }
  },
  {
    id: "raiders", w: 4, when: S => S.stopIdx <= 5 || (S.stopIdx >= 9 && S.stopIdx <= 12),
    async run(g) {
      const rear = g.S.pace === "lag" || g.S.role !== "dan";
      await g.page("AMALEKITES. Desert raiders on camels, hitting the rear of the column at dusk, where the sick and the slow walk.", { title: "RAIDERS" });
      if (g.S.pace === "lag" || g.S.pace === "ahead") {
        const who = g.kill("a raider's wound"); g.flock(-6); g.silver(-20);
        await g.page((g.S.pace === "lag" ? "You were lagging at the back. " : "You were out ahead of the camp, alone. ") + (who ? who + " is cut down before anyone can turn.\n\n" + who + " HAS DIED of a raider's wound." : "They take six animals and a purse and vanish.") + "\n\n'They met you on your journey and attacked all who were lagging behind' (Deut 25:18).");
      } else if (g.S.role === "dan" || g.has("weak_in_middle")) {
        g.trust(4); g.flock(-1);
        await g.page("The rear guard turns and meets them with spears. They take one goat and leave a camel. 'Choose men who will fight FOR US.' (BEMA 21)");
      } else {
        g.flock(-4); g.hurt(5);
        await g.page("They cut four animals out of the flock and wound a neighbor before the men of Dan drive them off. The weak were in the middle. It helped.");
      }
    }
  },
  {
    id: "dispute", w: 4, when: S => !S.flags.judge,
    async run(g) {
      const c = await g.choose("A neighbor's goat has eaten your tent-rope; your donkey has trampled his grain. Voices are raised. It is going to the judges — a day's wait. Or:", [
        "Blame him loudly; it was his goat",
        "Confess your donkey's part and repay the grain",
        "Wait a day for the judges"
      ]);
      if (c === 0) { g.trust(-2); g.days(1); await g.page("The judges rule against both of you. Everyone loses a day. 'Confess instead of blame — it's the only thing that stops the Genesis 3 cycle.' (BibleProject)"); }
      else if (c === 1) { g.trust(3); g.food(-10); await g.page("Ten pounds of grain. A rope. A handshake. Numbers 5:7: 'confess the sin and make full restitution.' No day lost."); }
      else { g.days(1); await g.page("A day lost. The judges split it fairly. If you had accepted Jethro's post at Rephidim you would be hearing cases like this yourself."); }
    }
  },
  {
    id: "sick", w: 5, when: S => true,
    async run(g) {
      const w = g.sick(g.pick(["the fever", "dysentery"]));
      await g.page(w + " is sick. " + w + " has " + g.S.party.find(p => p.name === w).ill.toUpperCase() + ".\n\nRest, water and time. Or push on and hope.");
    }
  },
  {
    id: "cloud_stays", w: 3, when: S => true,
    async run(g) {
      const d = 2 + Math.floor(g.rand() * 4);
      g.days(d); g.heal(3 * d);
      await g.page("The cloud does not lift. Not today, not tomorrow. 'Whether the cloud stayed over the tabernacle for two days or a month or a year, the Israelites would remain in camp and not set out' (Num 9:22).\n\n" + d + " days of rest. Health improves. Nothing else happens. That is the point.");
    }
  },
  {
    id: "quail", w: 2, when: S => S.manna,
    async run(g) {
      const c = await g.choose("A wind off the sea. Quail — exhausted from the crossing — drop into the camp by the hundred.", ["Take a day's meat and give thanks", "Fill every basket"]);
      if (c === 0) { g.food(20); g.trust(2); await g.page("Roast quail. A blessing. Enough."); }
      else { g.food(60); g.trust(-3); g.hurt(4); await g.page("Sixty pounds of quail in the sun. By the third day half of it is bad and everyone who ate it is sick. Psalm 78: 'they demanded the food they craved.'"); }
    }
  },
  {
    id: "caravan", w: 3, when: S => S.stopIdx > 1,
    async run(g) {
      const price = 4 + Math.floor(g.rand() * 3);
      const c = await g.choose("A Midianite caravan — camels, copper, incense — camps beside you for a night. They will sell water at " + price + " shekels a day and trade a donkey for 45 shekels. You have " + g.S.silver + " shekels.", [
        "Buy 5 days of water (" + price * 5 + ")", "Buy a donkey (45)", "Sell 5 sheep for 40 shekels", "Just talk"
      ]);
      if (c === 0 && g.S.silver >= price * 5) { g.silver(-price * 5); g.water(5); await g.page("Five skins."); }
      else if (c === 1 && g.S.silver >= 45) { g.silver(-45); g.S.donkeys++; await g.page("A donkey with one ear."); }
      else if (c === 2 && g.S.flock >= 5) { g.flock(-5); g.silver(40); await g.page("Forty shekels. The sheep go north."); }
      else if (c === 3) { await g.page("They have heard of your God. Everyone between the two seas has heard of your God. They ask whether it's true about the bread."); }
      else await g.page("You cannot afford it.");
    }
  },
  {
    id: "sandstorm", w: 3, when: S => S.weather === "wind",
    async run(g) {
      g.days(1); g.hurt(3); g.water(-1);
      await g.page("The wind turns yellow. A sandstorm — HAMSIN — flattens the tents and you spend a day with wet cloths over the children's faces. No travel. Water lost from split skins.");
    }
  },
  {
    id: "skin_split", w: 4, when: S => true,
    async run(g) {
      if (g.S.skins > 0) { g.S.skins--; await g.page("A water-skin splits on the rocks. You have a spare. Spares left: " + g.S.skins + "."); }
      else { g.water(-3); await g.page("A water-skin splits on the rocks. You have no spare. Three days of water soak into the sand."); }
    }
  },
  {
    id: "fall", w: 2, when: S => true,
    async run(g) {
      const w = g.sick("a broken leg");
      await g.page(w + " slips on the scree at the wadi wall and goes down hard. " + w + " has a BROKEN LEG and must ride the donkey.");
      g.S.paceMod = 0.8;
    }
  },
  {
    id: "tamarisk", w: 2, when: S => S.stopIdx > 6,
    async run(g) {
      const c = await g.choose("A trader sells tamarisk seedlings — a tree that takes eighty years to mature. Abraham planted one at Beersheba. 'You plant a tamarisk for your grandchildren.' Two shekels.", ["Buy one and plant it here", "Save the two shekels"]);
      if (c === 0) { g.silver(-2); g.flag("tamarisk"); g.trust(2); await g.page("You plant it in the wadi mouth. You will never sit in its shade. 'How many tamarisk trees did you plant today?' (BEMA 28)"); }
      else await g.page("Two shekels saved.");
    }
  },
  {
    id: "grumble_tent", w: 3, when: S => S.trust < 50,
    async run(g) {
      const c = await g.choose("Night. Inside the tent, with the flap shut, someone in your household says what everyone is thinking: 'In Egypt at least we had a roof.' Nobody outside can hear. You:", ["Agree, quietly. It's just talk", "Say: 'He hears the tents. Let's not.'"]);
      if (c === 0) { const n = g.grumble("in the tent"); await g.page("'They grumbled in their tents and thought nobody heard. But somebody did.' (Pawson) GRUMBLES: " + n + " of 10."); }
      else { g.trust(2); await g.page("Silence in the tent. Then someone laughs. Then someone sleeps."); }
    }
  }
];
