/* ============================================================
   STOPS — Joshua 1–7 (the Jordan → Jericho → the Ai epilogue)
   ============================================================ */

SINAI.STOPS.push({
  id: "jordan", short: "Jordan", date: [41, 1, 7], name: "The Jordan", book: "Joshua 1-5",
  miles: 12, lon: 35.52, lat: 31.85, scene: "jordan", water: "spring",
  async run(g) {
    g.setDate(41, 1, 7);
    await g.page("The Jordan in the first month is in FLOOD. Snowmelt from Hermon. Twenty feet deep at the fords, no bridges, a brown roar between the acacias.\n\nThis generation has never seen a sea part. 'God's doing it for them again.' (Pawson, part 16)\n\nFirst, Joshua sends two spies — not twelve. Two. 'Perhaps he remembers that the two spies came back with a good report.'", { title: "THE JORDAN" });
    await g.page("The spies lodge in the house of RAHAB, a prostitute whose home is built into the city wall — casemate housing, apartments in the wall itself, with a window on the outside. She hides them under the flax on the roof and tells the king's men they left at dusk.\n\n'I know that the LORD has given you this land. We have heard how the LORD dried up the Red Sea for you... the LORD your God is God in heaven above and on the earth below' (Josh 2:9-11).\n\nForty years later, they are still talking about the sea in Jericho.");
    const oath = await g.choose("Rahab asks for an oath: spare my father, my mother, my brothers and sisters. The spies swear by a SCARLET CORD in her window. You are consulted about whether the oath should bind the army. You say:", [
      "It binds. An oath is an oath, and she chose the LORD",
      "She's a Canaanite and a prostitute. The city is devoted to destruction"
    ]);
    if (oath === 0) { g.trust(6); g.flag("rahab_oath"); g.log("Honored the oath to Rahab"); await g.page("'God can do more with a bad woman who has faith than a good woman who doesn't.' (Pawson) Rahab will be an ancestor of David, and of Jesus (Matt 1:5)."); }
    else { g.trust(-6); await g.page("Joshua overrules you. The oath stands. 'A story of redemption of an outsider finding a place, of somebody choosing to say yes to the thing that God's doing.' (BEMA 34)"); }
    await g.page("Joshua: 'Consecrate yourselves, for tomorrow the LORD will do amazing things among you.'\n\nThe order: the priests carry the ark INTO the river, ahead of everyone, and the people follow a thousand paces behind. The water will not stop until their feet are in it.");
    const cross = await g.choose("The ark is going in. The river has not stopped. Your household:", [
      "Follows the ark, a thousand paces behind, as ordered",
      "Builds rafts from the acacias — safer for the children",
      "Tries the ford upstream while the priests do their thing"
    ]);
    if (cross === 0) {
      g.trust(10); g.flag("crossed_with_ark"); g.log("Crossed the Jordan behind the ark");
      await g.page("'As soon as the priests who carried the ark reached the Jordan and their feet touched the water's edge, the water from upstream stopped flowing. It piled up in a heap a great distance away, at a town called Adam' (Josh 3:15-16).\n\nThe Jordan does this — a flood undercuts a bank at a bend, the bank collapses and dams the river for hours. 'There are so many coincidences in the Bible that statistically it can't be.' (Pawson) It stopped when their FEET touched it.\n\nThe whole nation crosses on dry ground.");
    } else if (cross === 1) {
      g.trust(-5); g.days(2); g.hurt(5);
      await g.page("You spend two days building rafts. Then the river stops and everyone else walks across on dry ground while you drag your rafts out of the mud. The priests watch.");
    } else {
      const who = g.kill("the flood"); g.trust(-8);
      await g.page("The ford is twenty feet under." + (who ? " " + who + " is swept off the donkey and under.\n\n" + who + " HAS DIED in the Jordan, in flood, a hundred paces from where it stopped." : " You lose a donkey and half the tent before you turn back.") + "\n\nThen the river stops, and everyone else walks across.");
      g.S.donkeys = Math.max(1, g.S.donkeys - 1);
    }
    await g.page("The 10th day of the first month (Josh 4:19). One man from each tribe takes a stone from the riverbed, from where the priests' feet stood, and they pile twelve stones at GILGAL.\n\nMATZEVOT — standing stones. Not a stele; no writing. 'A standing stone doesn't do anything if there's nobody there to tell the story. Dad — what happened here?' (BEMA 34)\n\nYou carry one for your household.");
    await g.page("At Gilgal, Joshua circumcises the whole generation born in the wilderness — every fighting man — and the nation lies in camp, helpless, within sight of Jericho's walls, for days. Nobody comes out.\n\nThey keep the Passover on the plains of Jericho. The next day they eat the produce of the land: roasted grain and unleavened bread.\n\n'The manna stopped the day after they ate this food from the land; there was no longer any manna' (Josh 5:12).\n\nForty years of 'What is it?' Over.");
    g.S.manna = false; g.food(400); g.water(30); g.heal(10);
    await g.page("Near Jericho, Joshua looks up and sees a man standing in front of him with a drawn sword.\n\n'Are you for us, or for our enemies?'\n\n'NEITHER. But as commander of the army of the LORD I have now come.'\n\n'The real question is whether Joshua is on God's side.' (BibleProject) A sword-bearer at the entrance to the garden. Joshua takes off his sandals.");
    await g.insight("Pawson · part 17",
      "'Without Him they couldn't have done it. Without them He wouldn't have done it.' Twelve stones for remembrance; circumcision that leaves the army defenseless; manna that stops 'as soon as they crossed — now you've got to feed yourselves.' Obey the order that leaves you defenseless.");
  }
});

SINAI.STOPS.push({
  id: "jericho", short: "Jericho", name: "Jericho", book: "Joshua 6", final: true,
  miles: 6, lon: 35.44, lat: 31.87, scene: "jericho", water: "spring",
  async run(g) {
    await g.page("JERICHO. The oldest city in the world — a tower and a spiral stair here are ten thousand years old. An oasis of palms and springs at the bottom of the world. Double walls: an outer wall six feet thick, a fifteen-foot gap, an inner wall twelve feet thick and thirty feet high, with houses built across the gap. Rahab's window is in one of them.\n\n'Tightly shut up because of the Israelites. No one went out and no one came in' (Josh 6:1).", { title: "JERICHO" });
    await g.page("The LORD's battle plan, given to Joshua:\n\nMarch around the city once a day for six days. Seven priests with seven trumpets in front of the ark. Armed men in front, the rear guard behind.\n\nAnd: 'DO NOT GIVE A WAR CRY, do not raise your voices, do not say a word until the day I tell you to shout' (Josh 6:10).\n\nSix days of silence. Then, on the seventh day, seven circuits, and a shout.");
    let silent = true;
    for (let day = 1; day <= 6; day++) {
      const opts = ["Walk in silence"];
      if (day === 3) opts.push("Mutter: 'This is absurd. They're laughing at us from the wall'");
      if (day === 5) opts.push("Shout at the wall to see what happens");
      const c = await g.choose("DAY " + day + ". The ark, the trumpets, the walls, the sun. Around once. The people of Jericho watch from the wall. You:", opts);
      if (c === 1) { silent = false; g.grumble("the walls of Jericho"); g.trust(-4); await g.page("Your voice carries in the silence. Heads turn. The Levite beside you says nothing, which is worse.\n\n'After six days of silence I should think that was pretty unnerving for the inhabitants' (Pawson) — for the inhabitants. It was meant to be unnerving for THEM."); }
      else { await g.page(day === 6 ? "Six days. 'Obey the crazy order.' It gives Jericho six days to do what Rahab did. Nobody does." : "Silence. Dust. The trumpets. Back to Gilgal."); }
      g.days(1);
    }
    if (silent) { g.trust(8); g.log("Marched six days around Jericho in silence"); }
    await g.page("The SEVENTH day. At dawn. Seven times around. On the seventh circuit the priests blow the trumpets and Joshua says: 'SHOUT! For the LORD has given you the city!'\n\nThe people shout.\n\nThe wall collapses — outward, down the slope, houses and all. 'A loud sustained noise' on walls overloaded with houses (Pawson). Every part of it, except one house on the wall with a scarlet cord in the window.\n\n'They didn't even have street fighting. They just walked into the city.'", { title: "THE SEVENTH DAY" });
    await g.page("Before the shout, Joshua had said: 'The city and all that is in it are to be DEVOTED to the LORD — HAREM. Only Rahab and those with her in her house shall be spared. Keep away from the devoted things, so that you will not bring about your own destruction by taking any of them. All the silver and gold and the articles of bronze and iron are sacred to the LORD and must go into His treasury' (Josh 6:17-19).\n\nHAREM does not mean 'destroy.' It means consecrated. Set apart. His. (BEMA 34)\n\nJericho is the firstfruits. 'The victory was Mine, not yours.'");
    const c = await g.choose("You are in a fallen house in Jericho. On the floor: a beautiful Babylonian robe, two hundred shekels of silver, and a bar of gold weighing fifty shekels. Nobody is looking. You:", [
      "Carry it to the priests for the treasury",
      "Take it. Your household has bled for forty years",
      "Take only the robe — the silver and gold are 'sacred,' the robe isn't listed"
    ]);
    if (c === 0) {
      g.trust(12); g.flag("clean_hands"); g.log("Gave the devoted things to the LORD's treasury");
      await g.page("You carry it to Eleazar the priest. It goes into the treasury of the LORD. You walk out of Jericho with what you walked in with.\n\n'This isn't their battle, and God isn't their trophy.' (BibleProject)");
    } else {
      g.flag("achan"); g.trust(-25); g.silver(200); g.S.gold += 50; g.log("Took the devoted things from Jericho");
      await g.page("You bury it under the floor of your tent." + (g.has("plundered_dead") ? " As you buried the Egyptian sword at the sea, forty years ago." : "") + "\n\nThe text says a man of Judah named Achan did exactly this — 'a beautiful robe from Babylonia, two hundred shekels of silver and a bar of gold weighing fifty shekels' (Josh 7:21). It says the LORD's anger burned against ALL Israel because of it.\n\n'When Achan snatches some of the plunder for himself, he aligns himself with the Canaanites and, therefore, is treated as a Canaanite.' (BibleProject)");
    }
    await g.page("Rahab and her father's household are brought out alive and settled outside the camp; she 'lives among the Israelites to this day' (Josh 6:25).\n\nThe city burns. Joshua pronounces a curse on anyone who rebuilds it. And 'the LORD was with Joshua, and his fame spread throughout the land.'");
    /* ---- AI EPILOGUE ---- */
    if (g.has("achan")) {
      await g.page("EPILOGUE — AI.\n\nJoshua sends three thousand men against the little town of Ai. 'We don't need many troops for this one.' Overconfidence, and something worse.\n\nThey are routed. Thirty-six dead. 'The hearts of the people melted in fear and became like water' (Josh 7:5).\n\nJoshua on his face before the ark: 'Why did You bring this people across the Jordan?' The LORD: 'Stand up! Israel has sinned. They have taken some of the devoted things. That is why the Israelites cannot stand against their enemies.'", { title: "AI" });
      await g.page("Lots are cast. Tribe by tribe. Clan by clan. Family by family. Man by man.\n\nThe lot falls on your tent.\n\n'One man's sin caused the people of God to fail. It's almost frightening.' (Pawson, part 17)\n\nYou are taken to the Valley of Achor with the robe, the silver and the gold, and everything you own.");
      const who = g.kill("the devoted things", g.S.party[0].name);
      g.flag("dead_leader");
      await g.page((who || "You") + " HAS DIED in the Valley of Achor, stoned by all Israel.\n\n'Even God's own people can act like Canaanites.' (BibleProject)\n\nThe household you led for forty years enters the land without you.");
    } else {
      await g.page("EPILOGUE — AI.\n\nJoshua sends three thousand men against the little town of Ai. They are routed — thirty-six dead — and the reason is a man of Judah named ACHAN with a Babylonian robe and a bar of gold under his tent floor. He is found by lot and dies in the Valley of Achor. Then Ai falls.\n\nYour tent floor is clean. The lot passes you by.\n\nAfterwards, at Shechem, between Mount Ebal and Mount Gerizim, the whole nation shouts the blessings and the curses across the valley and answers AMEN.", { title: "AI" });
    }
    await g.insight("BEMA 35 · 'Crossroads of the Earth'",
      "The land is not a fortress. It sits on the Via Maris, 'the turnstile of the ancient world.' A God who promised to bless ALL nations puts His priests at the crossroads — the tabernacle in the middle of the camp becomes a people in the middle of the world. 'The blessing of the Promised Land is not my blessing. It's the Abrahamic blessing — so that you can bless others.'");
  }
});
