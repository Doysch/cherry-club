# Cherry Club 🍒🎀

A browser game to help a 9-year-old build fluent recall of the **3, 4, 6, 7 and 12 times tables**,
using the areas a Year 4 school report asked to be strengthened: area, measures, equivalent fractions,
durations, and showing working out.

Built from the same engine as Sparkle Tables, but pitched for a 9-year-old.

## Run it

Double-click `start.command`, or:

```
cd cherry-club
python3 -m http.server 8766
```

then open http://localhost:8766/ . Progress is saved in the browser, so keep using the same
browser and the same address. Both games can run at the same time (Sparkle Tables uses port 8765).

## Plushie pictures

The plushies are original emoji characters. To use your own pictures, drop PNG files into
`images/` named after the plushie id (see `images/README.txt`, e.g. `images/bunny.png`).
The game uses the picture automatically and falls back to the emoji if the file is missing.

## How it teaches (and how it differs from Sparkle Tables)

| Cherry Club (age 9) | Sparkle Tables (age 7) |
|---|---|
| **Derived-fact strategies with the working shown.** ×3 = double plus one lot, ×4 = double-double, ×6 = five lots plus one, ×7 = five lots plus two lots, ×12 = ten lots plus two lots. A new fact is introduced as a worked example with the last line blank. | Counting groups of objects |
| **Area model.** Every fact is also a rectangle of squares, connecting tables to area. | Groups and skip counting |
| **Applied questions from the report:** area in cm², durations in minutes, days in weeks, months in years, dozens, litres, pounds, equivalent fractions, division as sharing and grouping. | Money in 2p/5p/10p coins |
| **Speed is opt-in from day one.** Cherry Dash is a 60-second round with a personal best. Quests stay untimed, with a small "fast" bonus. | Timed mode unlocks late |
| **Cherries and bows.** Earn cherries, adopt plushies for a shelf, dress each one in a bow. Completing a whole table unlocks the golden bow. | Dress-up doll |
| Tone: brief and grown-up ("Solid.", "Mistakes are data"). | Sparkly and effusive |

Shared foundations: spaced retrieval (Leitner boxes with 0/1/2/4/7-session gaps), interleaving in
the Cherry Bowl, commutativity (7 × 8 and 8 × 7), immediate corrective feedback with one retry,
and the 6-second Multiplication Tables Check standard for "fluent".

Suggested order: 3s, 4s, 6s, 12s, then 7s. One 12-question session a day is plenty.

## Grown-ups' corner

Bottom of the home screen, behind the code **1964** (`PARENT_PIN` near the top of `game.js`).
Shows all 60 facts colour-coded, session history, Dash best, sound and read-aloud toggles,
name change, progress export and reset.

## Ideas for later

- A "clock" round for the report target on durations (start time plus minutes, what time is it?).
- Import progress from the exported JSON to move between devices.

## Files

- `index.html` – screens
- `style.css` – look and feel
- `plush.js` – plushie catalogue, bows, shelf
- `game.js` – content, strategies, scheduling, questions, shop
- `images/` – optional PNG overrides for plushies
