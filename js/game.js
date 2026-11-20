/* Game state and flow: start, countdown, typing, finish. */
Race.state = {
  
  lvl: 1, text: "", pos: 0, errs: 0, keys: 0,
  running: false, t0: 0, bots: [], finished: [], tick: null,
  timeLimit: 120000,   
  timerId: null,
  done: false,         
  playerMs: 0,         
  shown: 0, 
  raceLvl: 1, 
  ending: false,
  raceId: 0, 
  saved: false,
  recRes: null          
};

Race.game = {
  newRound() {
    const s = Race.state;
    s.text = Race.makeText();
    Race.rollBots();
    Race.game.resetRound();
  },

  resetRound() {
    const s = Race.state;
    s.timeLimit = Race.isShort ? 60000 : 120000;   
    s.pos = 0; s.errs = 0; s.keys = 0; s.finished = [];
    s.done = false; s.playerMs = 0; s.shown = 0;
    s.saved = false; s.recRes = null;
    Race.ui.buildTrack();
    Race.ui.renderText();
    Race.ui.fitText();
    Race.ui.updateStats();
    Race.game.renderTimer(s.timeLimit);
    for (let i = 0; i <= Race.BOTS.length; i++) Race.ui.setProgress(i, 0);
  },

  renderTimer(ms) {
    const el = Race.ui.ensureTimer();
    const secs = Math.ceil(Math.max(0, ms) / 1000);
    el.textContent = Math.floor(secs / 60) + ":" + String(secs % 60).padStart(2, "0");
    el.style.color = secs <= 10 ? "#e63946" : "";
  },

  tickTimer() {
    const s = Race.state;
    if (!s.running) return;
    const left = s.t0 + s.timeLimit - performance.now();
    if (left <= 0) {
      Race.game.renderTimer(0);
      Race.game.end(true);
      return;
    }
    Race.game.renderTimer(left);
    Race.game.checkAllDone();
    if (s.running && s.done && s.finished.length !== s.shown) {
      const t = Race.$("rtable");
        if (t) { t.innerHTML = Race.game.tableHtml(false); s.shown = s.finished.length; }
     }
  },

  finishSoon() {
  const s = Race.state;
  if (s.ending) return;
  s.ending = true;
  const id = s.raceId;
  setTimeout(() => {
    if (s.running && s.raceId === id) Race.game.end(false);
  }, 1500);
},

  checkAllDone() {
  const s = Race.state;
  if (s.running && s.done && !s.ending && s.finished.length >= Race.BOTS.length + 1) {
    Race.game.finishSoon();
  }
},

  start() {
    const s = Race.state;
    if (s.running) return;
    Race.ui.raceControls(true);
    if (!s.text) Race.game.newRound();   
    else Race.game.resetRound();         
    let n = 3;
    Race.ui.showOverlay(`<div id="cd">3</div>`);
    const c = setInterval(() => {
      n--;
      if (n > 0) Race.$("cd").textContent = n;
      else if (n === 0) Race.$("cd").textContent = "GO";
      else { clearInterval(c); Race.ui.hideOverlay(); Race.game.go(); }
    }, 800);
  },

  go() {
    const s = Race.state;
    s.running = true;
    s.raceLvl = s.lvl;  
    s.t0 = performance.now();
    Race.ui.setRacing(true);
    Race.$("inp").focus();
    s.bots = Race.bots.spawn();
    s.tick = setInterval(Race.ui.updateStats, 200);
    Race.game.renderTimer(s.timeLimit);
    clearInterval(s.timerId);
    s.timerId = setInterval(Race.game.tickTimer, 100);
  },

  typed(ch) {
    const s = Race.state;
    if (!s.running || s.done) return;
    s.keys++;
    if (ch === s.text[s.pos]) {
      s.pos++;
      Race.ui.setProgress(0, s.pos / s.text.length);
      Race.ui.renderText();
      if (s.pos >= s.text.length) Race.game.playerFinish();
    } else {
      s.errs++;
      Race.ui.flashWrong();
    }
    Race.ui.updateStats();
  },

  playerFinish() {
    const s = Race.state;
    s.done = true;
    s.playerMs = performance.now() - s.t0;
    s.finished.push("You");
    Race.game.saveResult();
    Race.ui.updateStats();
    if (s.finished.length >= Race.BOTS.length + 1) Race.game.finishSoon();
      else Race.game.showResults(false);   
  },

  saveResult() {
  const s = Race.state;
  if (s.saved || s.pos < 1) return;
  s.saved = true;
  try {
    const ms = s.done ? s.playerMs : s.timeLimit;
    s.recRes = Race.records.add({
      wpm: Math.round(s.pos / 5 / (ms / 60000)),
      acc: s.keys ? Math.round((s.keys - s.errs) / s.keys * 100) : 100,
      mode: Race.mode, lvl: s.raceLvl, done: s.done,
      place: s.done ? s.finished.indexOf("You") + 1 : 0
    });
    Race.ui.updateBest();
  } catch (err) {
    console.error("Could not save record:", err);
  } 
  }, 

  setMode(m) {
  if (Race.state.running || Race.mode === m) return;
  Race.ui.applyMode(m);
  Race.game.newRound();
  },

  abort() {
    const s = Race.state;
    s.running = false;
    clearInterval(s.tick);
    clearInterval(s.timerId);
    Race.bots.stopAll();
    Race.ui.setRacing(false);
    s.raceId++;
    s.ending = false;
  },

  tableHtml(final) {
    const s = Race.state;
    const rows = s.finished.map((n, i) => [i + 1, n]);
    Race.BOTS.forEach(b => {
      if (!s.finished.includes(b.n)) rows.push(["–", b.n + (final ? " (DNF)" : " …")]);
    });
    if (!s.done) rows.push(["–", final ? "You (DNF)" : "You …"]);
    return rows.map(r =>
      `<tr${r[1].startsWith("You") ? ' class="me-row"' : ""}><td>${r[0]}</td><td>${r[1]}</td></tr>`).join("");
  },

  startMode(m) {
  Race.game.abort();
  Race.ui.hideOverlay();
  Race.ui.applyMode(m);
  Race.game.newRound();
  Race.game.start();
},

/* Practice mode: "Practice again" asks what to do next. */
chooseNext(fromRace) {
  Race.ui.showOverlay(
    `<h2>What next?</h2>
     <div style="color:var(--mute);margin-bottom:14px">Pick your next match.</div>
     <button class="go" id="nxSolo">Practice again</button>
     <button class="ghost" id="nxBots">Fight bots</button>
     <button class="ghost" id="nxBack">${fromRace ? "Cancel" : "Back to results"}</button>`);
  Race.$("nxSolo").onclick = () => Race.game.startMode("solo");
  Race.$("nxBots").onclick = () => Race.game.startMode("bots");
  Race.$("nxBack").onclick = () => {
    if (fromRace) { Race.ui.hideOverlay(); Race.$("inp").focus(); }
    else Race.game.showResults(true);
  };  
  Race.$("nxSolo").focus();
},
  
  showResults(final) {
    const s = Race.state;
    const ms = s.done ? s.playerMs : final ? s.timeLimit : performance.now() - s.t0;
    const wpm = Math.round(s.pos / 5 / (ms / 60000));
    const acc = s.keys ? Math.round((s.keys - s.errs) / s.keys * 100) : 100;

    let title;
        if (s.done) {
          const place = s.finished.indexOf("You") + 1;
          const sfx = (place % 100 >= 11 && place % 100 <= 13) ? "th" : ({1: "st", 2: "nd", 3: "rd"}[place % 10] || "th");
          title = Race.mode === "solo" ? "Finished!" : place === 1 ? "You win!" : place + sfx + " place";
          } else { title = "Time's up!";}

    s.shown = s.finished.length;
    Race.ui.showOverlay(
      `<h2>${title}</h2>
     <div style="color:var(--mute)">${wpm} WPM, ${acc}% accuracy, ${Race.LEVELS[s.raceLvl].n}</div>
     ${s.recRes && s.recRes.isBest ? '<div class="pb">New personal best!</div>' : ""}
     <div style="color:var(--mute);font-size:.85rem;margin-top:4px">Best: ${Race.records.best()} WPM</div>
     <div style="color:var(--mute);font-size:.85rem;margin-top:6px">${final ? "" : "Bots are still racing…"}</div>
     <table id="rtable">${Race.game.tableHtml(final)}</table>
     <div class="lvlpick">
       <button id="lvlDown">− Easier</button>
       <span>Next race: <b id="lvlName"></b></span>
       <button id="lvlUp">Harder +</button>
     </div>
     <button class="go" id="again">${Race.mode === "solo" ? "Practice again" : "Race again"}</button>
     <a class="menu" href="index.html">Back to menu</a>`, !final);

     const syncLevel = () => {
    Race.$("lvlName").textContent = Race.LEVELS[s.lvl].n;
    Race.$("lvlDown").disabled = s.lvl <= 0;
    Race.$("lvlUp").disabled = s.lvl >= Race.LEVELS.length - 1;
    Race.ui.levelButtons();            // keep the top level buttons in sync
  };

  Race.$("lvlDown").onclick = () => { if (s.lvl > 0) { s.lvl--; syncLevel(); } };
  Race.$("lvlUp").onclick   = () => { if (s.lvl < Race.LEVELS.length - 1) { s.lvl++; syncLevel(); } };
  syncLevel();

        Race.$("again").onclick = () => {
      if (Race.mode === "solo") { Race.game.chooseNext(); return; }   // practice: ask first
      Race.game.abort();
      Race.ui.hideOverlay();
      Race.game.newRound();
      Race.game.start();
    };

    if (s.done || final) Race.$("again").focus();
    else Race.$("inp").focus();
    if (s.done) Race.$("swpm").textContent = wpm;
  },

  end(timedOut = false) {
    const s = Race.state;
    if (!s.running) return;
    Race.game.abort();
    Race.game.saveResult();
    Race.ui.raceControls(false);
    Race.ui.updateStats();
    Race.game.showResults(true);
  }
};
