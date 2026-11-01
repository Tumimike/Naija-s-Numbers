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
- Each question has its own 18s timer; nothing carries over. On timeout, whatever is typed is scored. Refreshing doesn't reset the timer.
- Time bonus per round, from seconds left when the guess is locked in (only if the round scored >0): ≥10s 30, ≥8s 25, ≥5s 20, else 0. No bonus on timeout.
- Max daily score 1,900 (5 × 350 + 5 × 30).
- Progress and stats (played, streak, best streak, best score, average) are saved in `localStorage` (`nn_today`, `nn_stats`).

## Owner's instructions
- Core mechanics are done and tested. Don't change scoring or timer rules unless asked.
- Current phase: visual design. The existing look (danfo yellow, black, green) is a placeholder and can be replaced.
- Keep element IDs in `index.html` that `game.js` relies on, or update `game.js` to match.
- Hosting: GitHub Pages from `main` (https://tumimike.github.io/naija-s-numbers/) once the owner turns it on.
