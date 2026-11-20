/* Passage generator: readable sentences, plus quotes and sayings. */
Race.makeText = function () {
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const cap  = s => s[0].toUpperCase() + s.slice(1);
  const clean = s => s.replace(/\s+/g, " ").trim();

  const W = {
    names: ["Maria", "Daniel", "Sofia", "Miguel", "Anna", "Carlos", "Lea", "Jonas", "Elena", "Pedro",
            "Nina", "Tomas", "Rosa", "Luis", "Clara", "Mateo", "Isabel", "Diego", "Marta", "Andres"],
    det:   ["the", "our", "that", "this", "a", "one", "each", "every"],
    adj:   ["old", "quiet", "bright", "tired", "clever", "small", "friendly", "busy", "gentle", "brave",
            "curious", "happy", "sad", "lonely", "strong", "kind", "honest", "sleepy", "proud", "patient",
            "cheerful", "careful", "nervous", "wise", "tall", "calm", "restless", "generous", "stubborn", "humble"],
    noun:  ["farmer", "teacher", "driver", "baker", "neighbor", "fisherman", "student", "traveler", "dog", "cat",
            "bird", "child", "friend", "stranger", "artist", "sailor", "singer", "gardener", "doctor", "writer",
            "mechanic", "shopkeeper", "musician", "builder", "pilot", "cook", "painter", "postman"],
    thing: ["basket", "letter", "lantern", "map", "painting", "bicycle", "umbrella", "book", "key", "hat",
            "coat", "shoe", "glove", "watch", "ticket", "camera", "blanket", "violin", "clock", "sandwich",
            "notebook", "backpack", "kite", "bottle", "mirror", "toolbox", "guitar", "compass"],
    place: ["market", "river", "garden", "station", "village", "library", "bridge", "harbor", "farm", "hill",
            "forest", "school", "square", "beach", "tower", "valley", "bakery", "workshop", "lake", "orchard"],
    verbI: ["walked", "waited", "rested", "smiled", "worked", "laughed", "slept", "sang", "danced", "shouted",
            "jumped", "listened", "watched", "traveled", "hoped", "paused", "wandered", "whistled", "paced", "hummed"],
    verbT: ["found", "carried", "painted", "fixed", "dropped", "borrowed", "cleaned", "forgot", "opened", "kept",
            "helped", "visited", "greeted", "followed", "chased", "remembered", "lost", "shared", "polished", "delivered"],
    prep:  ["near", "behind", "beside", "across", "toward", "inside", "outside", "under", "over", "between",
            "through", "around", "beyond", "along"],
    time:  ["breakfast", "lunch", "dinner", "sunrise", "sunset", "the long meeting", "the rain stopped",
            "the storm passed", "the train arrived", "the sun set", "night fell", "the bell rang"],
    event: ["the rain stopped", "the sun set", "the train arrived", "the storm passed", "night fell",
            "the bell rang", "the wind grew cold", "the crowd went home", "the music started", "the lights came on"],
    adv:   ["slowly", "carefully", "happily", "quietly", "quickly", "calmly", "eagerly", "gracefully", "suddenly", "bravely",
            "gently", "proudly", "patiently", "cheerfully"],
    why:   ["it was getting late", "the weather was nice", "nobody else was around", "the road was long",
            "it felt like the right thing to do", "they were curious", "they wanted to help",
            "it was a tradition", "the view was beautiful", "they had nothing else to do",
            "the air was fresh", "the day was young"]
  };

  /* Quotes: [author, text]. Straight quote marks only, so they are easy to type. */
  const QUOTES = [
    ["Benjamin Franklin", "Well done is better than well said."],
    ["Benjamin Franklin", "An investment in knowledge pays the best interest."],
    ["Benjamin Franklin", "Lost time is never found again."],
    ["William Shakespeare", "All that glitters is not gold."],
    ["William Shakespeare", "To thine own self be true."],
    ["William Shakespeare", "Better three hours too soon than a minute too late."],
    ["Confucius", "It does not matter how slowly you go as long as you do not stop."],
    ["Lao Tzu", "A journey of a thousand miles begins with a single step."],
    ["Aesop", "Slow and steady wins the race."],
    ["Aesop", "United we stand, divided we fall."],
    ["Aesop", "It is easy to be brave from a safe distance."],
    ["Thomas Edison", "Genius is one percent inspiration and ninety-nine percent perspiration."],
    ["Mark Twain", "Courage is resistance to fear, mastery of fear, not absence of fear."],
    ["Ralph Waldo Emerson", "Nothing great was ever achieved without enthusiasm."],
    ["Abraham Lincoln", "Whatever you are, be a good one."]
  ];

  /* Sayings: no author. */
  const SAYINGS = [
    "Actions speak louder than words.", "A stitch in time saves nine.", "Practice makes perfect.",
    "The early bird catches the worm.", "Rome was not built in a day.", "Every cloud has a silver lining.",
    "Fortune favors the bold.", "Where there is a will, there is a way.", "Better late than never.",
    "Look before you leap.", "Two heads are better than one.", "Honesty is the best policy.",
    "Patience is a virtue.", "Many hands make light work.", "The pen is mightier than the sword.",
    "Birds of a feather flock together.", "A rolling stone gathers no moss.", "Fast fingers win races, but steady hands win seasons.",
    "Every champion was once a beginner.", "The road to speed is paved with practice."
  ];

  // Noun phrase with the right article: "a old" -> "an old".
  const np = (adjs, nouns) => {
    const d = pick(W.det), a = pick(adjs), n = pick(nouns);
    const art = d === "a" && /^([aeiou]|honest|hour)/.test(a) ? "an" : d;
    return `${art} ${a} ${n}`;
  };
  const subj  = () => np(W.adj, W.noun);
  const obj   = () => np(W.adj, W.thing);
  const name  = () => pick(W.names);
  const other = n => { let m; do { m = name(); } while (m === n); return m; };
  const pair  = () => { const a = name(); return `${a} and ${other(a)}`; };
  const place = () => `${pick(["the", "our", "that", "this"])} ${pick(W.place)}`;
  const where = () => `${pick(W.prep)} ${place()}`;

  const templates = [
    () => `${subj()} ${pick(W.verbI)} ${where()}.`,
    () => `${name()} ${pick(W.verbT)} ${obj()} ${where()}.`,
    () => `After ${pick(W.time)}, ${name()} ${pick(W.verbI)} ${pick(W.adv)}.`,
    () => `${pair()} ${pick(W.verbT)} ${obj()} ${pick(W.adv)}.`,
    () => `${subj()} ${pick(W.verbT)} ${obj()} because ${pick(W.why)}.`,
    () => `${name()} ${pick(W.verbI)} ${where()} because ${pick(W.why)}.`,
    () => `When ${pick(W.event)}, ${subj()} ${pick(W.verbI)}.`,
    () => `Before ${pick(W.time)}, ${name()} ${pick(W.verbT)} ${obj()}.`,
    () => `${name()} ${pick(W.verbI)} ${pick(W.adv)} ${where()}.`,
    () => `Although ${pick(W.why)}, ${name()} ${pick(W.verbI)} ${pick(W.adv)}.`,
    () => `${name()} ${pick(W.verbT)} ${obj()} and then ${pick(W.verbI)} ${pick(W.adv)}.`,
    () => `${pair()} ${pick(W.verbI)} together ${where()}.`,
    () => `Every morning, ${subj()} ${pick(W.verbT)} ${obj()} ${where()}.`,
    () => `${name()} said that ${subj()} ${pick(W.verbT)} ${obj()}.`,
    () => `While ${name()} ${pick(W.verbI)}, ${subj()} ${pick(W.verbT)} ${obj()}.`,
    () => `${subj()} ${pick(W.verbT)} ${obj()} and ${pick(W.verbI)} ${pick(W.adv)}.`,
    () => `Without a word, ${name()} ${pick(W.verbT)} ${obj()}.`,
    () => `${name()} wondered why ${subj()} ${pick(W.verbI)} ${where()}.`,
    () => `Later that day, ${pair()} ${pick(W.verbI)} ${where()}.`,
    () => `${name()} knew that ${subj()} ${pick(W.verbT)} ${obj()} ${pick(W.adv)}.`,
    () => `Even though ${pick(W.why)}, ${subj()} ${pick(W.verbI)}.`,
    () => `Just before ${pick(W.time)}, ${subj()} ${pick(W.verbT)} ${obj()}.`,
    () => `${pair()} were ${pick(W.adj)} when ${pick(W.event)}.`,
    () => { const n = name(); return `${n} was ${pick(W.adj)} because ${pick(W.why)}.`; },
    () => `Every ${pick(W.noun)} in ${place()} ${pick(W.verbI)} when ${pick(W.event)}.`,
    () => `On the way to ${place()}, ${name()} ${pick(W.verbT)} ${obj()}.`,
    () => { const n = name(); return `${n} ${pick(W.verbT)} ${obj()} for ${other(n)}.`; },
    () => `Not far from here, ${subj()} ${pick(W.verbI)} ${pick(W.adv)}.`
  ];

  /* A quote or a saying, never the same one twice in a passage. */
  const used = new Set();
  const quote = () => {
    const total = QUOTES.length + SAYINGS.length;
    let k, tries = 0;
    do { k = Math.floor(Math.random() * total); tries++; } while (used.has(k) && tries < 30);
    used.add(k);
    if (k < QUOTES.length) {
      const [author, text] = QUOTES[k];
      return `${author} once said, "${text}"`;
    }
    const t = SAYINGS[k - QUOTES.length];
    return pick([
      () => t,
      () => `As the saying goes, "${t}"`,
      () => `${name()} liked to say, "${t}"`,
      () => `Remember this: ${t}`
    ])();
  };

  /* Each match is randomly short (1-2 sentences) or long (4 + level). */
  const isShort = Math.random() < 0.5;          // 50/50, change 0.5 for other odds
  Race.isShort = isShort;                       // game.js uses this for the time limit
  const count = isShort
    ? 1 + Math.floor(Math.random() * 2)
    : 4 + Race.state.lvl;

  const QUOTE_CHANCE = 0.3;                     // about 3 in 10 sentences are quotes or sayings
  const out = [];
  let last = -1;
  for (let i = 0; i < count; i++) {
    if (Math.random() < QUOTE_CHANCE) { out.push(cap(clean(quote()))); continue; }
    let t;
    do { t = Math.floor(Math.random() * templates.length); } while (t === last);
    last = t;
    out.push(cap(clean(templates[t]())));
  }
  return out.join("");
};