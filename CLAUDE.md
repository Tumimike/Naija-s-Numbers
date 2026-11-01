# Naija's Numbers

Daily Lagos number-guessing game (inspired by Wordle / Krillion). Plain HTML/CSS/JS, no build step, no framework. The owner is not a coder: explain changes simply.

## Files
- `questions.js` – question bank (`QUESTIONS` array: `q`, `answer`, `unit`, `source`). Current entries are PLACEHOLDERS with made-up numbers.
- `game.js` – all game logic. Tunable settings are at the top.
- `index.html` – page structure. `style.css` – styling.

## Rules (as built)
- 5 rounds a day. Puzzle #1 = 1 Nov 2026. Day rolls over at midnight Lagos time (UTC+1). Day N uses questions starting at index (N-1)*5, wrapping.
- Each question has a unit hint (hundreds/thousands/millions/billions). Input accepts `2500000`, `2,500,000`, `2.5m`, `2.5 million`, `2500k`; a bare small number uses the hint unit (`2.5` on millions = 2,500,000).
- Points per round by % off the answer: ≤1% 350, ≤2.5% 250, ≤5% 150, ≤10% 100, ≤25% 75, ≤40% 50, half-to-double 20, else 0.
- Shared clock: each question adds 18s; unused time carries over. Clock pauses on the answer screen. Refreshing doesn't reset it. On timeout, whatever is typed is scored and the carried time resets to 0.
- Time bonus at the end, from seconds left: ≥60s 50, ≥45s 35, ≥30s 20, else 0.
- Max daily score 1,800.
- Progress and stats (played, streak, best streak, best score, average) are saved in `localStorage` (`nn_today`, `nn_stats`).

## Owner's instructions
- Focus on core mechanics; don't change the page design unless asked.
- Hosting not set up yet.
