// ============================================================
//  NAIJA'S NUMBERS — GAME LOGIC
// ============================================================

// ---- Settings you might want to change ----
const ROUNDS = 5;
const LAUNCH_DATE = Date.UTC(2026, 10, 1); // 1 Nov 2026 = puzzle #1 (months start at 0)
const LAGOS_OFFSET_MS = 60 * 60 * 1000;    // Lagos is UTC+1 all year

// Points bands. "within" is how many times bigger/smaller the guess can be.
// 1.05 = within 5%, 2 = anywhere from half to double. Being too high and
// too low by the same factor scores the same.
const BANDS = [
  { within: 1.05, points: 100, emoji: "🎯" },
  { within: 1.10, points: 80,  emoji: "🟩" },
  { within: 1.25, points: 60,  emoji: "🟨" },
  { within: 1.50, points: 40,  emoji: "🟧" },
  { within: 2.00, points: 20,  emoji: "🟥" },
];
const MISS = { points: 0, emoji: "⬛" };

const UNIT_SIZE = {
  hundreds: 100,
  thousands: 1_000,
  millions: 1_000_000,
  billions: 1_000_000_000,
};

// ============================================================
//  Dates — everyone in Lagos gets the same puzzle each day
// ============================================================
const DAY_MS = 24 * 60 * 60 * 1000;
function lagosDayIndex(now = Date.now()) {
  return Math.floor((now + LAGOS_OFFSET_MS) / DAY_MS);
}
const TODAY = lagosDayIndex();
const PUZZLE_NO = TODAY - Math.floor(LAUNCH_DATE / DAY_MS) + 1;

function todaysQuestions() {
  const list = [];
  const start = ((PUZZLE_NO - 1) * ROUNDS) % QUESTIONS.length;
  for (let i = 0; i < ROUNDS; i++) {
    list.push(QUESTIONS[(start + i) % QUESTIONS.length]);
  }
  return list;
}
const TODAY_QS = todaysQuestions();

// ============================================================
//  Saving progress in the player's browser
// ============================================================
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage blocked — game still works */ }
}

let today = load("nn_today", null);
if (!today || today.day !== TODAY) {
  today = { day: TODAY, guesses: [], scores: [] };
}
let stats = load("nn_stats", { played: 0, streak: 0, maxStreak: 0, best: 0, total: 0, lastDay: null });

// ============================================================
//  Reading what the player typed
//  Accepts: 2500000, 2,500,000, 2.5m, 2.5 million, 2500k, 3bn …
//  If there's no letter and the number is small, the hint unit is used:
//  "2.5" on a "millions" question means 2,500,000.
// ============================================================
const SUFFIXES = {
  h: 100, hundred: 100, hundreds: 100,
  k: 1e3, thousand: 1e3, thousands: 1e3,
  m: 1e6, mil: 1e6, mill: 1e6, million: 1e6, millions: 1e6,
  b: 1e9, bn: 1e9, billion: 1e9, billions: 1e9,
  t: 1e12, tn: 1e12, trillion: 1e12, trillions: 1e12,
};

function parseGuess(raw, unit) {
  const s = raw.toLowerCase().replace(/[₦,\s]/g, "").replace(/naira$/, "");
  const match = s.match(/^(\d+(?:\.\d+)?|\.\d+)([a-z]*)$/);
  if (!match) return null;

  const n = parseFloat(match[1]);
  const suffix = match[2];
  if (suffix) {
    if (!(suffix in SUFFIXES)) return null;
    return Math.round(n * SUFFIXES[suffix]);
  }
  const size = UNIT_SIZE[unit] || 1;
  return Math.round(n < size ? n * size : n);
}

// ============================================================
//  Scoring
// ============================================================
function scoreGuess(guess, answer) {
  const off = Math.abs(guess - answer) / answer;
  const ratio = Math.max(guess, answer) / Math.min(guess, answer);
  for (const band of BANDS) {
    if (ratio <= band.within) return { ...band, off };
  }
  return { ...MISS, off };
}

function emojiFor(points) {
  const band = BANDS.find(b => b.points === points);
  return band ? band.emoji : MISS.emoji;
}

// ============================================================
//  Number formatting
// ============================================================
function full(n) {
  return n.toLocaleString("en-NG");
}
function short(n) {
  const units = [[1e12, " trillion"], [1e9, " billion"], [1e6, " million"], [1e3, "k"]];
  for (const [size, label] of units) {
    if (n >= size) return +(n / size).toFixed(2) + label;
  }
  return String(n);
}

// ============================================================
//  Screens
// ============================================================
const $ = id => document.getElementById(id);
const screens = ["intro", "round", "reveal", "done"];
function show(name) {
  screens.forEach(s => $(s).classList.toggle("hidden", s !== name));
}

function currentRound() {
  return today.guesses.length; // 0-based index of the next question
}

function renderProgress() {
  const r = currentRound();
  $("progress").innerHTML = TODAY_QS
    .map((_, i) => `<span class="${i < r ? "done" : i === r ? "now" : ""}"></span>`)
    .join("");
}

function showQuestion() {
  const r = currentRound();
  const q = TODAY_QS[r];
  renderProgress();
  $("roundLabel").textContent = `Round ${r + 1} of ${ROUNDS}`;
  $("questionText").textContent = q.q;
  $("hintText").textContent = `Answer is in the ${q.unit}`;
  $("guessInput").value = "";
  $("preview").textContent = "";
  $("error").textContent = "";
  show("round");
  $("guessInput").focus();
}

function showReveal(index) {
  const q = TODAY_QS[index];
  const guess = today.guesses[index];
  const result = scoreGuess(guess, q.answer);
  $("revealLabel").textContent = `Round ${index + 1} of ${ROUNDS}`;
  $("revealPoints").textContent = `${result.emoji} +${result.points}`;
  $("revealGuess").textContent = full(guess);
  $("revealAnswer").textContent = full(q.answer);
  const pct = Math.round(result.off * 100);
  $("revealOff").textContent = pct === 0
    ? "Spot on!"
    : `You were ${pct}% ${guess > q.answer ? "too high" : "too low"}`;
  $("revealSource").textContent = q.source ? `Source: ${q.source}` : "";
  $("nextBtn").textContent = index === ROUNDS - 1 ? "See my score" : "Next question";
  show("reveal");
}

function showDone() {
  const total = today.scores.reduce((a, b) => a + b, 0);
  $("totalScore").innerHTML = `${total}<small>/${ROUNDS * 100}</small>`;
  $("squares").textContent = today.scores.map(emojiFor).join("");
  $("summary").innerHTML = TODAY_QS.map((q, i) =>
    `<li>${q.q}<br><strong>${short(q.answer)}</strong> — you said ${short(today.guesses[i])} (${today.scores[i]} pts)</li>`
  ).join("");
  show("done");
  startCountdown();
}

// ============================================================
//  Game flow
// ============================================================
$("startBtn").addEventListener("click", () => {
  if (currentRound() >= ROUNDS) showDone();
  else showQuestion();
});

$("guessInput").addEventListener("input", () => {
  const q = TODAY_QS[currentRound()];
  const val = parseGuess($("guessInput").value, q.unit);
  $("error").textContent = "";
  $("preview").textContent = val !== null && $("guessInput").value.trim()
    ? `= ${full(val)}`
    : "";
});

$("guessForm").addEventListener("submit", e => {
  e.preventDefault();
  const r = currentRound();
  const q = TODAY_QS[r];
  const guess = parseGuess($("guessInput").value, q.unit);
  if (guess === null || guess <= 0) {
    $("error").textContent = "Type a number, e.g. 75000 or 75k";
    return;
  }
  today.guesses.push(guess);
  today.scores.push(scoreGuess(guess, q.answer).points);
  save("nn_today", today);
  if (today.guesses.length === ROUNDS) recordFinish();
  showReveal(r);
});

$("nextBtn").addEventListener("click", () => {
  if (currentRound() >= ROUNDS) showDone();
  else showQuestion();
});

function recordFinish() {
  const total = today.scores.reduce((a, b) => a + b, 0);
  stats.played += 1;
  stats.total += total;
  stats.best = Math.max(stats.best, total);
  stats.streak = stats.lastDay === TODAY - 1 ? stats.streak + 1 : 1;
  stats.maxStreak = Math.max(stats.maxStreak, stats.streak);
  stats.lastDay = TODAY;
  save("nn_stats", stats);
}

// ============================================================
//  Sharing
// ============================================================
$("shareBtn").addEventListener("click", async () => {
  const total = today.scores.reduce((a, b) => a + b, 0);
  const text =
    `Naija's Numbers #${PUZZLE_NO} — ${total}/${ROUNDS * 100}\n` +
    today.scores.map(emojiFor).join("") + "\n" +
    location.href.split("?")[0];
  try {
    if (navigator.share) {
      await navigator.share({ text });
      return;
    }
    await navigator.clipboard.writeText(text);
    $("copied").classList.remove("hidden");
  } catch {
    /* user cancelled share — ignore */
  }
});

// ============================================================
//  Countdown to next puzzle (midnight Lagos time)
// ============================================================
function startCountdown() {
  const tick = () => {
    const nextMidnight = (TODAY + 1) * DAY_MS - LAGOS_OFFSET_MS;
    const ms = Math.max(0, nextMidnight - Date.now());
    if (ms === 0) { location.reload(); return; }
    const h = Math.floor(ms / 3.6e6);
    const m = Math.floor((ms % 3.6e6) / 6e4);
    const s = Math.floor((ms % 6e4) / 1000);
    $("countdown").textContent =
      `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };
  tick();
  setInterval(tick, 1000);
}

// ============================================================
//  Stats popup
// ============================================================
$("statsBtn").addEventListener("click", () => {
  $("stPlayed").textContent = stats.played;
  // Streak is broken if they skipped yesterday and haven't played today
  const liveStreak = stats.lastDay >= TODAY - 1 ? stats.streak : 0;
  $("stStreak").textContent = liveStreak;
  $("stMax").textContent = stats.maxStreak;
  $("stBest").textContent = stats.best;
  $("stAvg").textContent = stats.played ? Math.round(stats.total / stats.played) : 0;
  $("statsDialog").showModal();
});
$("closeStats").addEventListener("click", () => $("statsDialog").close());

// ============================================================
//  Start up
// ============================================================
$("dayLabel").textContent = `Puzzle #${PUZZLE_NO}`;
if (currentRound() >= ROUNDS) {
  showDone();
} else if (currentRound() > 0) {
  $("startBtn").textContent = "Continue today's game";
}
