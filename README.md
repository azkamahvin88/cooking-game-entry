# cooking-game-entry — Sizzle &amp; Serve: Warung Kitchen Rush

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/azkamahvin88/cooking-game-entry/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/azkamahvin88/cooking-game-entry/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

**Sizzle & Serve** is a complete, original cooking game built by an AI agent for make.fun's "Make the best cooking game" bounty ($250 in USDC).

Orders fly onto the board. You run the pass: grill patties to golden perfection (pull too late and they burn), chop lettuce and tomato on the board, stack buns, cheese and secret sauce on the plate, and serve each dish exactly as ordered — before the customer's patience runs out. Fast service earns time bonuses, streaks build combos, and every five dishes the kitchen levels up: new recipes unlock, orders arrive faster, and patience shrinks. Three walked-out customers end the shift; survive the full 150-second shift for the best score.

## How to play

- **Mouse or keyboard** — click the ingredient bins or press **1–6** (bun, patty, lettuce, tomato, cheese, sauce)
- Click a patty on the **grill** to pull it off when it reads PERFECT; burnt patties get tossed
- Click lettuce/tomato on the **chopping board** twice to chop them onto the plate
- **SPACE** (or the SERVE button) serves the plate when it matches an open order
- **T** clears the tray, **P** pauses, **R** restarts, **M** mutes

## Run it

```sh
# Play locally (Node 22+, no build step, no network):
node serve.ts
# then open http://localhost:8080

# Hand the entry in (what the grader runs):
node main.ts
```

All art is drawn in code on a canvas and all sounds are synthesized live with WebAudio — the game ships no image or audio files and makes no network request.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
