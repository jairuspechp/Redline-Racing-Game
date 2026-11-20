/* Wiring: events and first render. */
(function () {
  const q = new URLSearchParams(location.search);
  const lv = parseInt(q.get("lvl"), 10);
  if (lv >= 0 && lv < Race.LEVELS.length) Race.state.lvl = lv;
  const mode = q.get("mode") === "solo" ? "solo" : "bots";
  if (mode === "solo") Race.BOTS = [];

  /* First render: track, bots, passage. Runs before anything optional. */
  Race.ui.levelButtons();
  Race.state.text = Race.makeText();
  Race.ui.buildTrack();
  Race.ui.renderText();
  Race.ui.fitText();

  /* Attach a click handler only if the element exists. */
  const on = (id, fn) => { const e = Race.$(id); if (e) e.onclick = fn; };

  on("diff", e => {
    const b = e.target.closest("button");
    if (!b || Race.state.running) return;
    Race.state.lvl = +b.dataset.i;
    Race.ui.levelButtons();
  });
  on("modeSw", e => {
    const b = e.target.closest("button");
    if (b) Race.game.setMode(b.dataset.m);
  });
  on("hist", () => { if (!Race.state.running) Race.ui.showRecords(); });
  on("start", Race.game.start);
  on("text", () => Race.$("inp").focus());

  Race.$("inp").addEventListener("input", e => {
    const v = e.target.value;
    e.target.value = "";
    for (const ch of v) Race.game.typed(ch);
  });

  window.addEventListener("resize", Race.ui.fitText);

  if (Race.ui.applyMode) Race.ui.applyMode(mode);
  if (Race.records && Race.ui.updateBest) Race.ui.updateBest();
})();