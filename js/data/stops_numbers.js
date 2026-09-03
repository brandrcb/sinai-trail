/* ============================================================
   STOPS — Numbers 11 – Deuteronomy 34 (Sinai → Mount Nebo)
   ============================================================ */

SINAI.STOPS.push({
  id: "taberah", short: "Taberah", name: "Taberah & Kibroth-hattaavah", book: "Numbers 11",
  miles: 30, lon: 34.30, lat: 29.00, scene: "fire", water: "well",
  async run(g) {
    await g.page("Three days out from the mountain. The honeymoon is three days old.\n\n'Now the people complained about their hardships in the hearing of the LORD, and when He heard them His anger burned hot. Then fire from the LORD burned among them and consumed some of the OUTSKIRTS of the camp' (Num 11:1).\n\nThe place is named TABERAH — 'burning.'", { title: "TABERAH" });
    if (g.has("edge_of_camp")) {
      const who = g.kill("the plague");
      g.trust(-3);
      await g.page("You pitched on the edge of the camp for the grazing." + (who ? " The fire reaches your tents.\n\n" + who + " HAS DIED in the fire at Taberah." : " The fire stops two tents short of yours. Your neighbors' goats are gone."));
    } else {
      await g.page("The fire stays at the edges. Moses prays and it dies down. From your tent in the middle of the camp you smell it all night.");
    }
    await g.page("Then the rabble among them — the mixed multitude — begin to CRAVE. 'If only we had meat to eat! We remember the fish we ate in Egypt at no cost — also the cucumbers, melons, leeks, onions and garlic. But now we have lost our appetite; we never see anything but this manna!' (Num 11:4-6)\n\nAt no cost. In Egypt. Where you made bricks without straw.\n\nMoses, who has had enough: 'Where can I get meat for all these people? If this is how You are going to treat me, please go ahead and kill me' (Num 11:15).", { title: "KIBROTH-HATTAAVAH" });
    const c = await g.choose("The tents around you are weeping for garlic. Your household:", [
      "Weeps with them — you DO miss the fish",
      "Slaughters a lamb quietly for your own family",
      "Eats the manna and says the blessing over it"
    ]);
    if (c === 0) {
      const n = g.grumble("Kibroth-hattaavah"); g.flag("craved");
      await g.page("'Nostalgia for Egypt is a lie your hunger tells you.' (BibleProject)\n\nGRUMBLES: " + n + " of 10.");
    } else if (c === 1) { g.flock(-1); g.trust(-2); await g.page("A quiet meal. A smaller flock. A neighbor who saw the smoke."); }
    else { g.trust(5); await g.page("'Blessed are You, LORD our God, King of the universe, who brings forth bread from the earth' — or in this case, from the sky. Seventy blessings a day, the rabbis say. (BEMA 24)"); }
    await g.page("The LORD: 'You will eat meat. Not one day, or two, or five, or ten or twenty — but a WHOLE MONTH, until it comes out of your nostrils and you loathe it, because you have rejected the LORD who is among you' (Num 11:19-20).\n\nA wind drives quail in from the sea and drops them around the camp, a day's walk in every direction, three feet deep. The people gather quail all day, all night, and all the next day. Nobody gathers less than sixty bushels.");
    const q = await g.choose("Quail lie three feet deep around your tent. You:", [
      "Gather all you can and gorge — a whole month of meat",
      "Take one day's meat, give thanks, and stop",
      "Take none. 'He put to death the sturdiest among them' (Ps 78:31)"
    ]);
    if (q === 0) {
      const who = g.kill("the plague"); g.trust(-6); g.food(120);
      await g.page("'While the meat was still between their teeth and before it could be consumed, the anger of the LORD burned against the people, and He struck them with a severe plague' (Num 11:33)." + (who ? "\n\n" + who + " HAS DIED of the plague, mouth full of quail." : "\n\nYour household is sick for a week.") + "\n\nThe place is named KIBROTH-HATTAAVAH — 'the graves of craving.'\n\n'Don't complain to God. He might give you what you want.' (Pawson)");
    } else if (q === 1) { g.food(30); g.trust(4); await g.page("A feast, a blessing, and a full night's sleep. Around you the gorging goes on. In the morning the burying begins. The place is named 'the graves of craving.'"); }
    else { g.trust(6); await g.page("You eat manna while the camp eats quail. In the morning the camp buries its strongest. The place is named 'the graves of craving.' Psalm 78 will remember it: 'They willfully put God to the test by demanding the food they craved.'"); }
    await g.insight("Pawson · part 13",
      "'They grumbled in their tents and thought nobody heard. But somebody did. They thought because He was in the Tabernacle He didn't know what they said when they went to their tent. What a big mistake.'\n\n'Discontent probably does more damage to the people of God than any other sin — and it's not a sin the church usually disciplines people over.'");
    await g.insight("BibleProject · 'God's Hot Nose'",
      "The Hebrew for anger is a nose burning hot. God is EREK APPAYIM — long-nosed, slow to burn — and His anger 'is never a spontaneous outburst but a reaction occasioned by the conduct of humans' (Heschel). 'A God moved to compassion but never to anger is a God who is uncaring or disengaged — not a God in real relationship.'");
  }
});

SINAI.STOPS.push({
  id: "hazeroth", short: "Hazeroth", name: "Hazeroth", book: "Numbers 12",
  miles: 16, lon: 34.50, lat: 29.15, scene: "camp", water: "well",
  async run(g) {
    await g.page("Hazeroth — 'enclosures.' A cluster of springs and stone sheep-folds.\n\nHere the rebellion moves inward, from the edge of the camp to Moses' own tent. Miriam and Aaron begin to talk against Moses 'because of his Cushite wife.' Then the real complaint: 'Has the LORD spoken only through Moses? Hasn't He also spoken through us?' (Num 12:1-2)\n\n'Jealousy will always find an excuse.' (Pawson, part 13)", { title: "HAZEROTH" });
    await g.page("The text pauses to say: 'Now Moses was a very humble man, more humble than anyone else on the face of the earth' (Num 12:3). Meekness, says Pawson, 'is not weakness — it is not trying to defend yourself. He let the LORD defend him.'\n\nMiriam is the prophetess who sang at the sea. Aaron is the high priest. They are Moses' older sister and brother, and they are talking in tents.");
    const c = await g.choose("The talk reaches your fire: 'Miriam has a point. Who made him king over us?' You:", [
      "Agree — 'Moses has grown proud since the mountain'",
      "Say nothing; let the LORD sort out His own prophets",
      "Defend Moses openly"
    ]);
    if (c === 0) { const n = g.grumble("Hazeroth"); g.trust(-4); await g.page("'Whoever speaks against a leader God appointed is speaking against God's choice.' GRUMBLES: " + n + " of 10."); }
    else if (c === 1) { g.trust(2); await g.page("Wise. Meekness is catching."); }
    else { g.trust(4); g.flag("defended_moses"); await g.page("Some at the fire nod. Some remember your name for later — Korah, for one."); }
    await g.page("The LORD calls the three of them to the Tent of Meeting and comes down in the pillar of cloud: 'When there is a prophet among you I reveal Myself in visions, I speak in dreams. But this is not true of My servant Moses. With him I speak FACE TO FACE.' (Num 12:6-8)\n\nWhen the cloud lifts, Miriam is leprous, white as snow. Aaron begs. Moses cries out, 'Please, God, heal her!' — five words in Hebrew, the shortest prayer in the Bible.\n\nMiriam is shut outside the camp for seven days, and the whole nation waits for her (Num 12:15).");
    g.days(7);
    await g.page("Seven days. Two million people do not move because one woman is outside the camp. Deuteronomy will say: 'Remember what the LORD your God did to Miriam along the way' (Deut 24:9).\n\nThen the cloud lifts, and the camp turns north across the wilderness of Paran toward the edge of the land.");
  }
});

SINAI.STOPS.push({
  id: "kadesh", short: "Kadesh", name: "Kadesh-barnea", book: "Numbers 13-14",
  miles: 110, lon: 34.42, lat: 30.65, scene: "oasis", water: "spring",
  async run(g) {
    g.water(30);
    await g.page("KADESH-BARNEA. Eleven days' walk from Horeb by the Mount Seir road (Deut 1:2). The most beautiful oasis in the Negev, sixty-six miles south-west of the Dead Sea, still flowing today. The southern edge of the land.\n\nKADESH is spelled with the same letters as KADOSH — holy. The spies are sent out from the holy place.\n\nMoses chooses one leader from each tribe: 'Go up and see what the land is like... Is it GOOD or BAD? Do your best to bring back some of the fruit' (Num 13:17-20). Good or bad. The question from the garden.", { title: "KADESH-BARNEA" });
    await g.page("Forty days. They come back from the valley of Eshcol carrying a single cluster of grapes on a pole between two men, and pomegranates and figs.\n\n'We went into the land, and it DOES flow with milk and honey! Here is its fruit. BUT the people are powerful, the cities are fortified and very large, and we saw the descendants of Anak there' (Num 13:27-28).\n\nCaleb silences them: 'We should go up and take possession of the land, for we can certainly do it.'\n\nThe ten: 'We can't. They are stronger than we are. We seemed like grasshoppers in our own eyes, and we looked the same to them.'");
    await g.page("'That night all the members of the community raised their voices and wept aloud... If only we had died in Egypt! Or in this wilderness! Wouldn't it be better for us to go back to Egypt? Let us choose a leader and go back' (Num 14:1-4).\n\nJoshua and Caleb tear their clothes: 'The land is exceedingly good. If the LORD is pleased with us He will lead us into it. Do not be afraid of the people of the land — their protection is gone, but the LORD is WITH US.'\n\nThe whole assembly talks of stoning them.");
    const c = await g.choose("Your tribe is voting. Pawson: 'They were thoroughly democratic — they took the majority verdict.' You stand:", [
      "With the ten — 'we are not able'",
      "With Caleb and Joshua — 'the LORD is with us'",
      "Undecided; you will go whichever way the crowd goes"
    ]);
    if (c === 1) {
      g.trust(15); g.flag("caleb"); g.log("Stood with Caleb and Joshua at Kadesh");
      await g.page("You stand with the two. Stones are in hands. Then the glory of the LORD appears at the Tent of Meeting and everyone stops.\n\nYou will be remembered with Caleb, who 'has a different spirit and follows Me wholeheartedly' (Num 14:24). It will not save the nation's vote. It may save YOU.");
    } else {
      const n = g.grumble("Kadesh (the tenth test)"); g.trust(-10); g.flag("voted_no"); g.log("Voted with the ten spies");
      g.S.grumbles = Math.max(g.S.grumbles, 10);
      await g.page("You vote with the ten. Stones are in hands. Then the glory of the LORD appears at the Tent of Meeting and everyone stops.\n\nGRUMBLES: " + g.S.grumbles + " of 10.");
    }
    await g.page("The LORD to Moses: 'How long will these people treat Me with contempt? How long will they refuse to believe in Me, in spite of all the signs I have performed among them? I will strike them down with a plague and make YOU into a nation greater than they.'\n\nAnd Moses — for the second time — reminds God of God: 'The LORD is slow to anger, abounding in love, forgiving sin... In accordance with Your great love, forgive.' Ex 34:6-7, quoted back to its author (Num 14:17-19).\n\n'I have forgiven them, as you asked. NEVERTHELESS...'");
    await g.page("'...not one of those who saw My glory and the signs I performed in Egypt and in the wilderness, but who disobeyed Me and TESTED ME TEN TIMES — not one of them will ever see the land I promised.\n\nIn this wilderness your bodies will fall — every one of you twenty years old or more who was counted in the census and who has grumbled against Me. Not one of you will enter the land, except Caleb and Joshua.\n\nFor FORTY YEARS — one year for each of the forty days you explored the land — you will suffer for your sins and know what it is like to have Me against you' (Num 14:22-34).\n\nThe ten spies die of plague that day.", { title: "THE SENTENCE" });
    const up = await g.choose("In the morning the people say: 'We have sinned. We will go up to the place the LORD promised.' Moses: 'Do not go up. The LORD is not with you.' Your tribe's men are arming. You:", [
      "Go up with them — 'we can fix this'",
      "Stay in the camp"
    ]);
    if (up === 0) {
      const who = g.kill("a raider's wound"); g.hurt(20); g.trust(-5);
      await g.page("The Amalekites and Canaanites come down from the hill country and beat you back all the way to Hormah (Num 14:45). The ark did not leave the camp. Neither did Moses." + (who ? "\n\n" + who + " HAS DIED in the rout at Hormah." : "\n\nYour household comes back bloodied."));
    } else { await g.page("You watch them go up. You watch them come back. The ark did not move. 'It's too late, don't go up' — and then they still try. (BEMA 30)"); }
    await g.insight("BibleProject · 'Twelve Spies and the Promised Land'",
      "'A story about God's chosen ones facing a test with fruit trees in a beautiful garden — sounds like Genesis 3, right?' Ten spies vote no 'all while holding in their hands incredible fruit they harvested from the land, replaying the sin of Adam and Eve.' And still: 'Yahweh's mercy triumphs over Israel's failures.'");
    await g.insight("Pawson · parts 12 & 15",
      "'This is the hinge of the book of Numbers. The rest need never have been written.' Instead of eleven days it took 13,780 days. 'Some opportunities in life, if you miss them, you can never have them again. When God says move, move.'\n\n'It's not those who start off — it's those who get there.'");
  }
});

SINAI.STOPS.push({
  id: "wander", short: "Paran/Zin", name: "The Wilderness of Paran & Zin", book: "Numbers 15-19",
  miles: 60, lon: 34.80, lat: 30.10, scene: "wander", water: "well",
  async run(g) {
    await g.page("The cloud turns SOUTH. Back toward the Red Sea road.\n\n'It was not the terrain. It was the fact that God didn't move — He only moved a little at a time and stayed a very long time in each place, and they didn't dare move if God didn't.' (Pawson, part 12)\n\n'How would you like to be told: you are now redundant until you die?'\n\nThe years begin.", { title: "THE WANDERING" });
    /* ---- KORAH ---- */
    await g.page("In the second year of the sentence a Levite named Korah, with Dathan and Abiram of Reuben and 250 well-known community leaders, comes to Moses and Aaron:\n\n'You have gone too far! The WHOLE community is holy, every one of them, and the LORD is with them. Why then do you set yourselves above the LORD's assembly?' (Num 16:3)\n\nIt is true, on some level. The whole community IS holy. But the LORD chose Aaron. And Korah wants the priesthood.", { title: "KORAH" });
    const c = await g.choose("Korah's men come to your tent with a petition — 250 names already on it. 'You didn't elect Moses. He has failed to bring us into the land. Sign.' You:", [
      "Sign it",
      "Refuse, and move your tent away from Korah's",
      "Refuse, and warn your neighbors to move too"
    ]);
    if (c === 0) {
      g.flag("korah"); g.trust(-10);
      await g.page("'It's amazing how one malcontent somehow instinctively finds the others.' (Pawson)\n\nMoses: 'Tomorrow morning the LORD will show who belongs to Him. You, Korah, and all your followers: take censers and put fire and incense in them before the LORD.'");
      const who = g.kill("the earth");
      await g.page("The ground under Korah, Dathan and Abiram splits open and swallows them, their households, and everything they own. Fire comes out from the LORD and consumes the 250 with censers in their hands (Num 16:31-35)." + (who ? "\n\n" + who + " was standing with Korah's men.\n\n" + who + " HAS DIED, swallowed by the earth." : "\n\nYour name was on the paper, but you were at your tent. You will never be quite sure why you are alive."));
    } else {
      g.trust(6); if (c === 2) g.flag("warned_korah");
      await g.page("Moses: 'Move back from the tents of these wicked men! Do not touch anything belonging to them!'\n\nThe ground splits open and swallows Korah, Dathan and Abiram and their households. Fire consumes the 250 with censers in their hands (Num 16:31-35). You watch from a distance you chose.");
    }
    await g.page("The next day the whole community grumbles: 'YOU have killed the LORD's people!' A plague begins. Moses to Aaron: 'Take your censer, put incense in it, hurry to the assembly and make atonement for them!'\n\nAaron runs into the middle of the dying and 'stood between the living and the dead, and the plague stopped.' 14,700 dead, besides Korah's men (Num 16:46-49).\n\nThe 250 bronze censers are hammered into a covering for the altar: a sign, like the rainbow, of judgment turned into mercy (BibleProject).");
    await g.page("To settle the matter of priesthood, twelve staffs — one per tribe — are left in the Tent overnight. In the morning Aaron's staff, a dead stick of almond, has sprouted, budded, blossomed, and produced almonds (Num 17:8). It is kept in the ark.\n\n'God appoints. The crowd doesn't elect.' (Pawson) And Korah's sons? They did not follow their father. They wrote Psalms.");
    /* ---- THE YEARS ---- */
    await g.page("And then the years, thirty-eight of them, in two chapters. The text records almost nothing, because almost nothing happened that God wanted written down.\n\nThe camp moves. The camp stops. Manna every morning. Sabbath every seventh day. Sandals, strangely, do not wear out. And every day, funerals.\n\nSix hundred thousand men over twenty. Forty years. About forty-one funerals a day, every day, for a generation.", { title: "THIRTY-EIGHT YEARS" });
    await g.generation();
    await g.page("The second census, taken at the end, will count 601,730 — almost exactly the first. 'Where God blesses, people multiply. The flat total shows God was NOT blessing them.' (Pawson, part 12)\n\nNot one adult from the first census remains, except two.\n\nThe fortieth year begins. The cloud moves north again, toward Kadesh. Toward the place it all went wrong.");
    g.setDate(40, 1, 1);
    await g.insight("BEMA 26-29 · images of the desert",
      "What did the desert teach in thirty-eight years? The shepherd who leads with his voice, not his staff. Pasture that is 'one tuft of grass in the rocks — just one M&M, and it's a brown one.' Shade under a broom bush three feet high with room for one. An acacia that looks dead for a decade and then blooms.\n\n'The desert teaches you to trust. It teaches you to just worry about the next step.'");
  }
});

SINAI.STOPS.push({
  id: "meribah", short: "Meribah", date: [40, 1, 1], name: "Kadesh again — Meribah", book: "Numbers 20:1-21",
  miles: 60, lon: 34.42, lat: 30.60, scene: "oasis", water: "none",
  async run(g) {
    await g.page("The first month of the fortieth year. The whole community arrives at the Desert of Zin and stays at Kadesh (Num 20:1).\n\n'There Miriam died and was buried.'\n\nOne sentence. No mourning is recorded. Aaron will get thirty days; Moses will get thirty days; Miriam, who sang at the sea, gets nine words. And in the very next verse: 'Now there was no water for the community.'\n\nThe rabbis noticed. They said a rock had followed them through the desert for Miriam's sake, and when she died, it stopped. (BEMA 30)", { title: "MERIBAH" });
    await g.page("The people gather against Moses and Aaron — the CHILDREN of the people who did this at Rephidim, saying the same words: 'If only we had died when our brothers fell! Why did you bring us up out of Egypt to this terrible place? No grain, no figs, no grapevines, no pomegranates, and no water!' (Num 20:3-5)\n\nThe LORD to Moses: 'Take the staff, and you and your brother Aaron gather the assembly together. SPEAK to that rock before their eyes and it will pour out its water.'\n\nSpeak. Not strike. This time, the voice.");
    const c = await g.choose("You are among the elders standing PANIYM — before the face of — the rock. Moses, grieving his sister, raises the staff and shouts 'Listen, you rebels, must WE bring you water out of this rock?' If you were Moses:", [
      "Strike it — it worked last time, and these people deserve the stick",
      "Speak to it, as He said"
    ]);
    if (c === 0) { g.flag("struck_rock"); g.trust(-5); await g.page("Moses strikes the rock. Twice. NAKAH — the strike-to-kill. Water gushes out anyway; the people and their livestock drink.\n\nBut the LORD says: 'Because you did not trust in Me enough to honor Me as HOLY in the sight of the Israelites, you will not bring this community into the land I give them' (Num 20:12).\n\n'You made Me look like all the other gods.' 'That's what Empire would do. That's what Pharaoh would do, Moses. I need you to use your voice.' (BEMA 30)"); }
    else { g.trust(6); await g.page("You would have spoken. Moses did not. He struck the rock, twice, with the strike-to-kill, and water gushed out anyway.\n\nAnd the LORD said: 'Because you did not trust in Me enough to honor Me as HOLY in the sight of the Israelites, you will not bring this community into the land' (Num 20:12).\n\n'I led like Pharaoh. I didn't lead like a shepherd.' (BEMA 30)"); }
    g.water(20);
    await g.page("The word Moses shouted — 'you REBELS' — is MARAH. The bitter water of the first test, forty years on, in the mouth of the leader.\n\nEDOM. Moses sends messengers to the king of Edom, the descendants of Esau: 'Let us pass through your country. We will not go through any field or vineyard or drink water from any well. We will travel along the King's Highway.' Edom answers with an army (Num 20:14-21). Israel turns away. Around Edom is a long, hot, bad road.");
    await g.insight("BibleProject · 'Why Couldn't Moses Enter the Promised Land?'",
      "'Not only does Moses do something other than what God told him to do, he suggests that he and Aaron are responsible for producing the water. Moses dishonors God by putting himself in God's place.' The point is not that God punishes small mistakes. 'It's about Moses' intentional choice to ignore God's word.'");
    await g.insight("Pawson · part 13",
      "'He was so impatient with the people that he didn't listen to God carefully. Purely because he was angry with the people. A leader who is impatient with his followers is likely to get into trouble.' He put up with two million grumbling people for forty years — and the last thing he did wrong was done in anger.");
  }
});

SINAI.STOPS.push({
  id: "hor", short: "Mt Hor", date: [40, 5, 1], name: "Mount Hor", book: "Numbers 20:22-29",
  miles: 55, lon: 35.40, lat: 30.32, scene: "mountain", water: "well",
  async run(g) {
    g.setDate(40, 5, 1);
    await g.page("Mount Hor, on the border of Edom. The first day of the fifth month of the fortieth year (Num 33:38).\n\nThe LORD: 'Aaron will be gathered to his people. He will not enter the land, because both of you rebelled against My command at the waters of Meribah.'\n\nMoses, Aaron and Aaron's son Eleazar climb the mountain in the sight of the whole community. Moses takes the high priest's garments off his brother and puts them on Eleazar. And Aaron dies there on the top of the mountain, aged one hundred and twenty-three.", { title: "MOUNT HOR" });
    g.days(30); g.heal(8);
    await g.page("Thirty days of mourning. The camp does not move.\n\nThe man who made the calf, who ran into the plague with a censer, who wore the twelve stones over his heart. 'The Aaronic priesthood became the heart of the worship.' (Pawson) Eleazar wears the robes now.\n\nWhen the cloud lifts it points AWAY from the land — south, down toward the Red Sea, to go around Edom. The people's hearts fail them on the road.");
  }
});

SINAI.STOPS.push({
  id: "punon", short: "Punon", name: "The Arabah — Punon", book: "Numbers 21:4-9; Deut 2:1-8",
  miles: 40, lon: 35.42, lat: 30.62, scene: "arabah", water: "bought",
  async run(g) {
    await g.page("Down into the ARABAH — the Rift Valley, 'the biggest crack in the earth's surface,' the Dead Sea at its bottom hundreds of feet below the ocean. The Bedouin call this stretch the Valley of the Scorpions. Dry. Dark. Snakes everywhere. (Pawson, part 13)\n\nDeuteronomy adds a detail: 'You are to pay the descendants of Esau in SILVER for the food you eat and the water you drink' (Deut 2:6). The desert has a market, and it is not friendly.", { title: "THE ARABAH" });
    const price = 3 + Math.floor(g.rand() * 3);
    const buy = await g.choose("An Edomite trader will sell water at " + price + " shekels a day's supply. You have " + g.S.silver + " shekels and " + Math.round(g.S.water) + " days of water. Buy:", [
      "Ten days of water (" + price * 10 + " shekels)",
      "Five days of water (" + price * 5 + " shekels)",
      "Nothing — the LORD will provide, and Edomites are robbers"
    ]);
    if (buy === 0 && g.S.silver >= price * 10) { g.silver(-price * 10); g.water(10); await g.page("Ten skins, filled from a well you are not allowed to see. The trader counts your silver twice."); }
    else if (buy === 1 && g.S.silver >= price * 5) { g.silver(-price * 5); g.water(5); await g.page("Five skins. The trader shrugs."); }
    else if (buy < 2) { await g.page("You do not have that much silver. The trader laughs and rides on."); }
    else { g.trust(1); await g.page("'The LORD your God has blessed you in all the work of your hands. He has watched over your journey through this vast wilderness. These forty years the LORD your God has been with you, and you have not lacked anything' (Deut 2:7). True. But He also said to PAY for the water."); }
    await g.page("'The people grew impatient on the way; they spoke against God and against Moses: Why have you brought us up out of Egypt to die in the wilderness? There is no bread! There is no water! And we DETEST this miserable food!' (Num 21:4-5)\n\nMiserable food. The bread of heaven.\n\n'Then the LORD sent venomous snakes among them; they bit the people and many Israelites died.'", { title: "THE SERPENTS" });
    const bit = g.sick("snakebite");
    await g.page("The snakes are in the rocks, under the tents, in the water-skins. " + bit + " is bitten in the night. " + bit + " has SNAKEBITE and will die within days.\n\nThe people come to Moses: 'We sinned when we spoke against the LORD and against you. Pray that the LORD will take the snakes away.'\n\nHe does not take the snakes away. He sends a cure.");
    const c = await g.choose("Moses makes a bronze snake and lifts it on a pole above the camp. 'Anyone who is bitten can LOOK at it and live' (Num 21:8). " + bit + " is burning with fever. You:", [
      "Carry " + bit + " out to where the pole can be seen",
      "'That's ridiculous. A statue won't cure a snakebite.' Try herbs and cutting the wound",
      "Look at it yourself first, to be sure"
    ]);
    if (c === 0 || c === 2) { g.cure(bit); g.trust(6); g.flag("looked"); g.log("Looked at the bronze serpent and lived"); await g.page("You carry " + bit + " to the edge of the tents and turn the burning face toward the pole. It takes a moment. Then the fever breaks.\n\n'When they looked, they lived.' (Pawson) 'Even His judgment is transformed into a source of life for those who look to Him.' (BibleProject) 'You're still in danger. But you have to do something to get out of it — and it took faith.'"); }
    else { g.kill("snakebite", bit); g.trust(-6); await g.page("The herbs do nothing. The cutting makes it worse.\n\n" + bit + " HAS DIED of snakebite, three hundred paces from the pole.\n\n'They could have said: that's silly, that won't cure snakebite. And had they said that, they'd have died.' (Pawson)"); }
    await g.page("From the Arabah the road climbs east, around Moab, through wadi after wadi. At Beer the LORD says 'Gather the people and I will give them water' — and for once nobody grumbles. They dig, and they SING: 'Spring up, O well!' (Num 21:16-18)\n\nA generation that sings at a well. Something has changed.");
    g.water(15); g.trust(3);
  }
});

SINAI.STOPS.push({
  id: "jahaz", short: "Jahaz", name: "Jahaz — Sihon & Og", book: "Numbers 21:21-35",
  miles: 70, lon: 35.80, lat: 31.45, scene: "battle", water: "well",
  async run(g) {
    await g.page("North of the Arnon, the land belongs to SIHON, king of the Amorites, in Heshbon. Moses sends the same message he sent to Edom: 'Let us pass through. We will not turn aside into any field or vineyard. We will travel the King's Highway.'\n\nSihon musters his whole army and marches out into the desert to meet Israel at JAHAZ (Num 21:23).", { title: "JAHAZ" });
    const c = await g.choose("Sihon's chariots are in the valley. Your household's fighting men:", [
      "Form up with your tribe, in your assigned place",
      "Hang back — let Judah and Reuben take the first blow",
      "Charge ahead of the line for the plunder"
    ]);
    if (c === 0) { g.trust(5); g.silver(30); g.flock(8); await g.page("Israel breaks Sihon's army. Heshbon and its villages fall. 'We captured all his towns' (Num 21:25). Your share of the spoil: +30 shekels, +8 head of livestock.\n\nThis is the first real battle this generation has fought. They win it. 'They had a number of victories on the way — they were riding high.' (Pawson)"); }
    else if (c === 1) { g.trust(-3); await g.page("Israel breaks Sihon's army without you. No spoil for the household that hung back. The elders noticed."); }
    else { const who = g.kill("a raider's wound"); g.silver(50); g.trust(-4); await g.page("You reach the Amorite baggage first. +50 shekels." + (who ? "\n\nAnd " + who + ", who charged with you, takes a spear in the side.\n\n" + who + " HAS DIED at Jahaz." : "\n\nYou come back with an Amorite arrow in the shield and a shaking hand.")); }
    await g.page("Then OG, king of Bashan, the last of the Rephaim — the giants the spies were afraid of — comes out at Edrei with his whole army. 'Do not be afraid of him,' the LORD says, and Israel strikes him down.\n\nHis bed was iron, thirteen feet long (Deut 3:11). Deuteronomy tells the new generation about the bed on purpose: 'to remind the people they have ALREADY won a battle against a giant king.' (BibleProject)\n\nThe grasshoppers' children have killed a giant.");
    g.silver(20); g.flock(6); g.days(20);
    await g.insight("Pawson · part 13",
      "Victory before Moab set up the fall AT Moab. 'They'd had a victory over Edom and Moab; they were riding high.' The enemy who cannot beat you in battle has another plan.");
  }
});

SINAI.STOPS.push({
  id: "shittim", short: "Shittim", name: "The plains of Moab — Shittim", book: "Numbers 22-25",
  miles: 45, lon: 35.62, lat: 31.85, scene: "moab", water: "spring",
  async run(g) {
    g.water(30);
    await g.page("The plains of Moab, across the Jordan from Jericho. Acacia groves — SHITTIM means acacias — and springs, and across the river, close enough to see, the green of the oasis and the walls of the first city.\n\nBalak, king of Moab, is terrified: 'This horde is going to lick up everything around us, as an ox licks up the grass.' He sends for a famous seer from the Euphrates. A man who likes money. BALAAM.", { title: "SHITTIM" });
    await g.page("Balaam saddles his donkey. On a narrow path between two vineyard walls the donkey sees the angel of the LORD with a drawn sword and stops. Balaam beats her. Three times. Then the donkey speaks: 'What have I done to you to make you beat me these three times?'\n\n'The way of My Kingdom is not a way of Pharaoh's stick.' (BEMA 30) The animal, says Pawson, 'had more sense than Balaam.'");
    await g.page("Three times Balak takes Balaam up a high place overlooking the camp, builds seven altars, and pays him to curse. Three times Balaam opens his mouth and BLESSES:\n\n'How beautiful are your tents, O Jacob, your dwelling places, O Israel!... A star will come out of Jacob; a scepter will rise out of Israel' (Num 24:5, 17).\n\n'Israel is down in the camp grumbling and rebelling — while up in the hills, God is protecting and even blessing them.' (BibleProject) You never see it from the camp.");
    /* ---- BAAL PEOR ---- */
    await g.page("Balak sends Balaam home unpaid. But Balaam leaves advice behind (Num 31:16): you cannot curse them. You can INVITE them.\n\n'While Israel was staying in Shittim, the men began to indulge in sexual immorality with Moabite women, who invited them to the sacrifices to their gods. The people ate the sacrificial meal and bowed down before these gods. So Israel yoked themselves to the BAAL OF PEOR' (Num 25:1-3).\n\n'What can't defeat you in battle will try you in the tent.' (Pawson)", { title: "BAAL PEOR" });
    const c = await g.choose("Moabite women come to the edge of the camp with an invitation to a feast on the hill: meat, wine, music, and the god of the place. The men of your household are 'riding high' after Jahaz. You:", [
      "Go — it's only a meal; you'll keep your own God in your heart",
      "Send the young men; someone should see what the fuss is about",
      "Refuse, and keep your household inside the camp"
    ]);
    if (c < 2) {
      g.flag("peor"); g.trust(-20);
      const who = g.kill("Baal Peor");
      await g.page("The meal is a sacrifice. The wine is a libation. The music ends in the tents of the god. 'Idolatry leads to immorality' (Pawson) — or the other way round; it does not matter which door you came in.\n\nThe LORD's anger burns. A plague breaks out in the camp. TWENTY-FOUR THOUSAND die (Num 25:9)." + (who ? "\n\n" + who + " HAS DIED in the plague of Peor." : "\n\nYour household survives the plague. Barely."));
    } else {
      g.trust(12); g.log("Refused the feast of Baal Peor");
      await g.page("You shut the tent. The singing goes up the hill without you. Then the wailing comes down.\n\nA plague breaks out in the camp. Twenty-four thousand die (Num 25:9). It stops only when Phinehas, Eleazar's son, follows an Israelite man and a Midianite woman into a tent with a spear. 'He was zealous for My honor... he made atonement' (Num 25:11-13).");
    }
    await g.page("This is the last plague of the wilderness. The last funerals of the first generation are dug here. Then the second census: 601,730. Then Zelophehad's five daughters ask why their branch of the family should be cut off from the land 'just because we're women' — and the LORD says: they are right (Num 27:7). The law grows where the text has no law.\n\nThen Moses lays his hands on JOSHUA — Hoshea, renamed YEHOSHUA, 'the LORD saves' — and gives him some of his glory (Num 27:20).");
    await g.insight("BibleProject · 'Five Women and Yahweh's New Law'",
      "Balak's three attempts to curse Israel mirror Pharaoh's three attempts to destroy them at the start of Exodus. The wilderness has purified them, and now they must prepare to receive a new Moses. JOSHUA's name — YEHOSHUA — is the root form of the Hebrew name YESHUA.");
  }
});

SINAI.STOPS.push({
  id: "nebo", short: "Nebo", date: [40, 11, 1], name: "Mount Nebo", book: "Deuteronomy",
  miles: 8, lon: 35.73, lat: 31.77, scene: "nebo", water: "spring",
  async run(g) {
    g.setDate(40, 11, 1);
    await g.page("The eleventh month of the fortieth year. Moses is one hundred and twenty. He has one week to live, and he knows it, and he uses it to preach.\n\nDEUTERONOMY — DEVARIM, 'the Words.' It has the exact shape of an ancient treaty between a great king and his people: preamble, history, terms, blessings, curses, witnesses, a successor. 'The LORD is now your king.' (Pawson, part 14)\n\nHe speaks to people who were children, or unborn, at Sinai, as if they had been there: 'It was not with our ancestors that the LORD made this covenant, but with US, all of us who are alive here today' (Deut 5:3).", { title: "MOUNT NEBO" });
    await g.page("'Remember the whole way the LORD your God has led you these forty years in the wilderness, to humble you and TEST you, to know what was in your heart.\n\nHe humbled you, causing you to hunger and then feeding you with manna, which neither you nor your ancestors had known, to teach you that man does not live on bread alone.\n\nYour CLOTHES did not wear out and your FEET did not swell during these forty years' (Deut 8:2-4).\n\nYou look down at your sandals. You bought " + g.S.sandalsBought + " pairs at the sea. You are wearing the first.");
    await g.page("ZAKAR — remember — fourteen times. SHAKACH — forget — nine times. 'Remember that you were slaves in Egypt: THAT is why I command you to do this.'\n\nSo: leave the edges of your field for the foreigner, the fatherless and the widow. Every third year, put the tithe at the town gate for them. Bring them to your feasts. 'When I remember who I was, I see who they are now.' (BEMA 31)\n\nAnd: 'Remember what Amalek did to you — how they attacked all who were lagging behind. Blot out their name' (Deut 25:17-19).");
    await g.page("Blessings, if you listen. Curses, if you do not — and the curses are much longer, because that is how treaties were written, and because Moses is not optimistic: 'I know that after my death you are sure to become utterly corrupt' (Deut 31:29).\n\nAnd then, the strangest promise in the book: even in exile, if you turn, 'the LORD your God will circumcise your HEARTS' (Deut 30:6). Something is wrong with the heart itself. He will fix it Himself. Later.\n\n'See, I set before you today life and prosperity, death and destruction... Now CHOOSE LIFE, so that you and your children may live' (Deut 30:15-19).");
    const c = await g.choose("The whole nation stands on the plain. Moses waits. You:", [
      "Choose life — SHEMA, listen, love, do",
      "Say the words with everyone else and think about the grazing across the river"
    ]);
    if (c === 0) { g.trust(10); g.flag("chose_life"); g.log("Chose life on the plains of Moab"); await g.page("'Listen (SHEMA) appears 91 times in Deuteronomy. It means more than hear. It means respond.' Idols cannot listen. You can. EMUNAH rises."); }
    else { g.trust(-4); await g.page("The words are said. The grazing across the river is very good. Deuteronomy 31:29 was written about someone."); }
    await g.page("Moses sings a song (Deut 32) so long and so honest that God calls it a witness against them: 'You are going to fail. Here is how to make your way back.' He blesses the tribes, one by one. Then he climbs Nebo, alone.\n\nThe LORD shows him the whole land — Gilead to Dan, Naphtali, Ephraim and Manasseh, Judah to the sea, the Negev, the valley of Jericho, the city of palms. 'I have let you see it with your eyes, but you will not cross over.'\n\nAnd Moses dies there, 'by the mouth of the LORD' — the rabbis say, with a kiss. God buries him. No one knows where.", { title: "THE MOUNTAIN" });
    g.days(30); g.heal(6);
    await g.page("'Since then no prophet has risen in Israel like Moses, whom the LORD knew FACE TO FACE' (Deut 34:10).\n\n'I'm just not sure Moses cared that he didn't make it into the Promised Land. I was buried by God Himself. I knew Him face to face.' (Reed Dent, BEMA 31)\n\nThirty days of weeping. Then the LORD speaks to Joshua: 'Moses My servant is dead. Now then, you and all these people, get ready to cross the Jordan. Be strong and courageous. CHAZAK VE'EMATZ.'");
    await g.insight("Pawson · part 14",
      "Two phrases nearly forty times each: 'the land the LORD your God GIVES you' and 'go in and POSSESS it.' Unconditional ownership; conditional occupation. 'Everything you receive from God is a gift — but you've got to go and take it.' And: 'God has no grandchildren.' Every generation enters the covenant itself.");
  }
});
