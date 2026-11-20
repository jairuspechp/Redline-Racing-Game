/* Everything that touches the DOM: track, passage, stats, overlay. */
Race.$ = id => document.getElementById(id);

Race.ui = {
raceControls(on) {
  const ui = Race.ui;
  ["modeSw", "lenSw" , "hist"].forEach(id => { const e = Race.$(id); if (e) e.style.display = on ? "none" : ""; });
  if (!ui._start) ui._start = Race.$("start");
  if (!ui._start) return;

  let box = Race.$("another");
  if (!box) {
    box = document.createElement("div");
    box.id = "another";
    box.className = "another";
    box.innerHTML =
      `<button id="anDown">− Easier</button>
       <span>Level: <b id="anLvl"></b></span>
       <button id="anUp">Harder +</button>
       <button class="go" id="anGo">Start another race</button>`;
    ui._start.parentNode.insertBefore(box, ui._start.nextSibling);

    Race.$("anDown").onclick = () => {
      if (Race.state.lvl > 0) { Race.state.lvl--; ui.levelButtons(); ui.syncAnother(); }
    };
    Race.$("anUp").onclick = () => {
      if (Race.state.lvl < Race.LEVELS.length - 1) { Race.state.lvl++; ui.levelButtons(); ui.syncAnother(); }
    };
    Race.$("anGo").onclick = () => {
      if (Race.mode === "solo") { Race.game.chooseNext(true); return; }
      Race.game.abort();
      Race.ui.hideOverlay();
      Race.game.newRound();   
      Race.game.start();
    };
  }

  ui._start.style.display = on ? "none" : "";
  box.style.display = on ? "flex" : "none";
  Race.$("anGo").textContent = Race.mode === "solo" ? "Start again practice" : "Start another race";
  if (on) ui.syncAnother();
},

syncAnother() {
  const l = Race.state.lvl;
  if (!Race.$("anLvl")) return;
  Race.$("anLvl").textContent = Race.LEVELS[l].n;
  Race.$("anDown").disabled = l <= 0;
  Race.$("anUp").disabled = l >= Race.LEVELS.length - 1;
},

  ensureTimer() {
    let el = Race.$("timer");
    if (el) return el;
    el = document.createElement("div");
    el.id = "timer";
    el.style.cssText =
      "text-align:center;font:700 28px/1.2 monospace;margin:6px 0;" +
      "font-variant-numeric:tabular-nums";
    const track = Race.$("track");
    track.parentNode.insertBefore(el, track);
    return el;
  },

  buildTrack() {
    Race.ui.ensureTimer();
const n = Race.BOTS.length + 1;                     
const base = Math.min(74, Math.max(44, innerHeight * 0.09));
const lane = Math.max(28, Math.min(base, Math.floor(innerHeight * 0.42 / n)));

Race.$("track").style.setProperty("--lane", lane + "px");
    const all = [{n:"You", c:"#ff9f1c", me:1}, ...Race.BOTS];
    Race.$("track").innerHTML = all.map((r, i) =>
      `<div class="lane ${r.me ? "me" : ""}">
        <div class="name"><b>${r.n}</b><span class="typo" id="t${i}">typo</span></div>
        <div class="fin"></div>
        <div class="bike" id="b${i}">${Race.bikeSvg(r.c, i)}</div>
      </div>`).join("");
  },

  setProgress(i, p) {
  const b = Race.$("b" + i);
  b.style.setProperty("--p", p);
  b.parentNode.style.setProperty("--p", p); },
  setTypo(i, on)    { Race.$("t" + i).classList.toggle("show", on); },
  setRacing(on)     { Race.$("track").classList.toggle("racing", on); },

  renderText() {
  const { text, pos } = Race.state;
  const cls = i => (i < pos ? "d" : i === pos ? "c" : "n");
  const esc = c => (c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c);
  let h = "", i = 0;
  while (i < text.length) {
    if (text[i] === " ") {                       // space = a wrap opportunity
      h += `<span data-i="${i}" class="${cls(i)}"> </span>`;
      i++;
      continue;
    }
    h += '<span class="wd">';                    // a whole word, never split
    while (i < text.length && text[i] !== " ") {
      h += `<span data-i="${i}" class="${cls(i)}">${esc(text[i])}</span>`;
      i++;
    }
    h += "</span>";
  }
  Race.$("text").innerHTML = h;
},

flashWrong() {
  const s = Race.$("text").querySelector(`[data-i="${Race.state.pos}"]`);
  if (!s) return;
  s.className = "w";
  setTimeout(() => { if (s.className === "w") s.className = "c"; }, 140);
},

  /* Largest font size (11-30px) at which the whole passage fits its box. */
  fitText() {
    const el = Race.$("text");
    let lo = 11, hi = 30;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      el.style.fontSize = mid + "px";
      if (el.scrollHeight <= el.clientHeight) lo = mid; else hi = mid - 1;
    }
    el.style.fontSize = lo + "px";
  },

  updateStats() {
    const s = Race.state;
    const ms = s.done ? s.playerMs
           : s.running ? performance.now() - s.t0
           : s.timeLimit;
    const m = ms / 60000;
    Race.$("swpm").textContent  = s.running && m > 0.01 ? Math.round(s.pos / 5 / m) : 0;
    Race.$("sacc").textContent  = s.keys ? Math.round((s.keys - s.errs) / s.keys * 100) + "%" : "100%";
    Race.$("sprog").textContent = s.text.length ? Math.round(s.pos / s.text.length * 100) + "%" : "0%";
  },

  levelButtons() {
    Race.$("diff").innerHTML = Race.LEVELS.map((l, i) =>
      `<button class="${i === Race.state.lvl ? "on" : ""}" data-i="${i}">${l.n}<small>bots ~${l.wpm} WPM</small></button>`).join("");
  },

  showOverlay(html, live) {
  Race.$("box").innerHTML = html;
  Race.$("ov").classList.toggle("live", !!live);
  Race.$("ov").classList.add("on");
  },

  updateBest() { Race.$("sbest").textContent = Race.records.best(); },

  applyMode(m) {
  Race.mode = m;
  document.body.classList.toggle("solo", m === "solo");
  Race.$("start").textContent = m === "solo" ? "Start practice" : "Start race";
  document.querySelector(".sub").textContent = m === "solo"
    ? "Practice mode: beat your own speed and accuracy."
    : "Type the passage faster than the other riders.";
  document.querySelectorAll("#modeSw button").forEach(b => b.classList.toggle("on", b.dataset.m === m));
  try { const u = new URL(location.href); u.searchParams.set("mode", m); history.replaceState(null, "", u); } catch (e) {}
},

applyLen(l) {
  Race.len = l;
  document.querySelectorAll("#lenSw button").forEach(b => b.classList.toggle("on", b.dataset.l === l));
  try { const u = new URL(location.href); u.searchParams.set("len", l); history.replaceState(null, "", u); } catch (e) {}
},

showRecords() {
  const sm = Race.records.summary();
  const rows = Race.records.all().slice(0, 10).map(r =>
    `<tr><td>${new Date(r.t).toLocaleDateString()}</td><td>${Race.records.label(r)}</td><td><b>${r.wpm}</b> WPM</td><td>${r.acc}%</td></tr>`).join("");
  Race.ui.showOverlay(
    `<h2>Records</h2>
     <div style="color:var(--mute)">Best ${sm.best} WPM, average ${sm.avg} WPM, ${sm.count} game${sm.count === 1 ? "" : "s"}</div>
     <table>${rows || "<tr><td>No games yet. Finish a race to set a record.</td></tr>"}</table>
     <button class="go" id="recClose">Close</button>
     <button class="ghost" id="recClear">Clear records</button>`);
  Race.$("recClose").onclick = Race.ui.hideOverlay;
  Race.$("recClear").onclick = () => {
    if (confirm("Delete all saved records?")) { Race.records.clear(); Race.ui.updateBest(); Race.ui.showRecords(); }
  };
  Race.$("recClose").focus();
},

  hideOverlay()  { Race.$("ov").classList.remove("on", "live"); }

};