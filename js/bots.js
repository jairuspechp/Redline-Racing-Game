Race.rollBots = function () {
  if (Race.mode === "solo") { Race.BOTS = []; return; }
  const names = ["Rex", "Nova", "Blitz", "Echo", "Vega", "Jett", "Kai", "Zara", "Ollie", "Pixel"];
  const colors = ["#e5383b", "#4cc9f0", "#5fd39a", "#b388ff", "#f72585",
                  "#ffd166", "#06d6a0", "#a0c4ff", "#ff7b54", "#c0c0c0"];
  const count = 1 + Math.floor(Math.random() * 10);   // 1..10

  const pool = names.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  Race.BOTS = pool.slice(0, count).map((n, i) => ({ n, c: colors[i] }));
};

Race.bots = {
  /* One {wpm, err} per bot, spread across the range around the chosen level:
     Easy -> Easy..Medium, Medium -> Easy..Hard, Hard -> Medium..Hard. */
  speeds(count) {
    const L = Race.LEVELS, lvl = Race.state.lvl;
    const lo = L[Math.max(0, lvl - 1)];
    const hi = L[Math.min(L.length - 1, lvl + 1)];

    const out = [];
    for (let i = 0; i < count; i++) {
      const t0 = count === 1 ? 0.5 : i / (count - 1);
      // small random jitter so each round feels different
      const jitter = (Math.random() - 0.5) / (count * 2);
      const t = Math.max(0, Math.min(1, t0 + jitter));
      out.push({
        wpm: lo.wpm + (hi.wpm - lo.wpm) * t,
        err: lo.err + (hi.err - lo.err) * t   // faster bots also follow the range's error rate
      });
    }
    // shuffle so the fastest bot isn't always in the same lane
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  },

  spawn() {
    const sp = Race.bots.speeds(Race.BOTS.length);
    return Race.BOTS.map((b, i) => {
      const o = {
        i: i + 1,
        base: 12 / sp[i].wpm * 1000,
        err: sp[i].err * (0.85 + Math.random() * 0.3),
        pos: 0, wrong: 0, fixing: false, t: 0
      };
      o.t = setTimeout(() => Race.bots.step(o), 600 + Math.random() * 500);
      return o;
    });
  },

  step(b) {
    const s = Race.state;
    if (!s.running) return;
    let d = b.base * (0.55 + Math.random() * 0.9);

    if (b.wrong > 0) {
      if (!b.fixing && b.wrong < 3 && Math.random() < .45) {
        b.wrong++;
      } else {
        if (!b.fixing) { b.fixing = true; d += 250 + Math.random() * 450; }
        b.wrong--; d *= .7;
        if (!b.wrong) b.fixing = false;
      }
    } else if (Math.random() < b.err) {
      b.wrong = 1;
      
    } else {
      b.pos++;
      Race.ui.setProgress(b.i, b.pos / s.text.length);
      if (b.pos >= s.text.length) {
        s.finished.push(Race.BOTS[b.i - 1].n);
        Race.ui.setTypo(b.i, false);
        return;
      }
    }
    Race.ui.setTypo(b.i, b.wrong > 0);
    b.t = setTimeout(() => Race.bots.step(b), d);
  },

  stopAll() { Race.state.bots.forEach(b => clearTimeout(b.t)); }
};