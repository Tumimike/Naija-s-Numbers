# Naija's Numbers

Daily Lagos number-guessing game (inspired by Wordle / Krillion). Plain HTML/CSS/JS, no build step, no framework. The owner is not a coder: explain changes simply.

## Files
- `questions.js` – question bank (`QUESTIONS` array: `cat`, `q`, `answer`, `type` ("year" for year answers), `unit`, `cur` ("₦" for naira), `source`). Categories: culture (Culture, music & sport), money, transport (Transport & traffic), places (Places & landmarks), market (Market data). Target 90 per category (450 = 90 days); first 50 written and fact-checked Nov 2026.
- `game.js` – game logic plus the pixel-art "go-slow" background. Near the top: `COPY` (all on-screen wording), game settings (scoring bands, timer, vehicle odds `ODDS`), then the art. Billboard text is in `BOARDS`.
- `index.html` – page structure (scene canvas, HUD, answer panel, summary). `style.css` – styling; colours and fonts are tokens at the top.

## Rules (as built)
- 5 rounds a day. Puzzle #1 = 1 Nov 2026. Day rolls over at midnight Lagos time (UTC+1). Day N takes the Nth question of each of the 5 categories (looping per category), shown in a day-seeded random order (`pickToday()`).
- Questions appear in a box in the middle of the screen: category, then the question with its hint in brackets. The hint is only the size of the answer: (thousands), (₦ trillions), (year). No written clues. The answer box stays docked at the bottom.
- Number questions have a unit (hundreds/thousands/millions/billions/trillions). Input accepts `2500000`, `2,500,000`, `2.5m`, `2.5 million`, `2500k`; a bare small number uses the hint unit (`2.5` on millions = 2,500,000).
- Points per round by % off the answer: ≤1% 350, ≤2.5% 250, ≤5% 150, ≤10% 100, ≤25% 75, ≤40% 50, half-to-double 20, else 0.
- Year questions (`type:"year"`) score by years off instead (`YEAR_LIMITS`): exact 350, 1 year 250, 2 years 150, 5 years 100, 10 years 75, 20 years 50, 40 years 20, else 0. Same colours/emoji as the % bands.
- Each question has its own 18s timer; nothing carries over. On timeout, whatever is typed is scored. Refreshing doesn't reset the timer.
- Time bonus per round, from seconds left when the guess is locked in (only if the round scored >0): ≥10s 30, ≥8s 25, ≥5s 20, else 0. No bonus on timeout.
- Max daily score 1,900 (5 × 350 + 5 × 30).
- Progress and stats (played, streak, best streak, best score, average) are saved in `localStorage` (`nn_today`, `nn_stats`). `nn_today` also keeps each round's band, vehicle and traffic slot so a refresh puts the player back where they were.

## Design (done, Nov 2026)
- Flat pixel-art traffic jam crossing four city groups (Lagos Island, Lagos Mainland, Abuja, Port Harcourt). Each day starts the route at a different group. After each answer the camera pans along the traffic by points (accuracy + time bonus) and lands on a vehicle picked from `ODDS` by accuracy band. Full brief: the "background-design-brief" doc in the claude.ai project.
- Each city's weather is fetched live from Open-Meteo (no key). Falls back to sample weather if blocked.
- Night falls after a random round (same for everyone that day); the DAY/NIGHT button toggles it.
- The Bugatti, Porsche, Cybertruck and McLaren sprites are the owner's friend's pixel art, used with permission (embedded as `FRIEND_ART`).
- Only real, named places are labelled in the HUD.
- Start screen: pixel logo ("NAIJA'S" green-white-green, "NUMBERS" black with a faint white outline) in a box, gently bobbing, with the start button centred under it. Drawn by `drawLogo()` in `game.js`.
- After each round a chip in the middle of the screen shows the accuracy band and points.

## Owner's instructions
- Core mechanics are done and tested. Don't change scoring or timer rules unless asked.
- Current phase: question design (real questions and sources for `questions.js`). Question rules from the owner: clear, neutral, simple wording most people can follow; the only hint is the answer's size in brackets, with ₦ for naira; year answers are allowed (like the "How Nigerian Are You?" cards); only use numbers with one clear, citable answer, and put the year in anything that changes over time. The visual design is done; don't restyle without asking.
- Keep element IDs in `index.html` that `game.js` relies on, or update `game.js` to match.
- Hosting: GitHub Pages from `main` (https://tumimike.github.io/naija-s-numbers/) once the owner turns it on.
