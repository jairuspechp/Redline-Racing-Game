/* Personal records: the last 50 games, saved in this browser (localStorage). */
window.Race = window.Race || {};
Race.records = {
  KEY: "redline.records",
  LV: ["Easy", "Medium", "Hard", "Insane"],

  all() {
    try { return JSON.parse(localStorage.getItem(Race.records.KEY)) || []; }
    catch (e) { return []; }
  },
  best() { return Race.records.all().reduce((m, r) => Math.max(m, r.wpm), 0); },

  summary() {
    const a = Race.records.all();
    const sum = a.reduce((t, r) => t + r.wpm, 0);
    return { count: a.length, best: Race.records.best(), avg: a.length ? Math.round(sum / a.length) : 0 };
  },

  /* Saves one game. isBest is true when it beats an earlier record. */
  add(r) {
    const prev = Race.records.best();
    r.t = Date.now();
    const a = [r].concat(Race.records.all()).slice(0, 50);
    try { localStorage.setItem(Race.records.KEY, JSON.stringify(a)); } catch (e) {}
    return { isBest: prev > 0 && r.wpm > prev };
  },

  clear() { try { localStorage.removeItem(Race.records.KEY); } catch (e) {} },

  label(r) {
    if (r.mode === "solo") return "Solo practice";
    const lv = Race.records.LV[r.lvl] || "";
    return "vs bots, " + lv + (r.done ? ", " + r.place + (r.place === 1 ? "st" : r.place === 2 ? "nd" : r.place === 3 ? "rd" : "th") : ", DNF");
  }
};