# Place a Task — Human-AI Group 8

One interactive slide for our MGMT 6110 Week 7 presentation on the Map of Human-AI Collaboration. The class calls a quadrant, we click a task card, and the card glides into the quadrant we chose while our reason appears underneath.

The brief this was built from is in `human-ai-group-8-rgogc-prompt.md`.

## Run it locally

```bash
npm install
npm run dev
```

Open the address it prints (usually http://localhost:5173).

## Edit the tasks and reasons

Everything the slide says about the tasks is in `src/tasks.ts`. Each task has a `label` (the card text), a `quadrant`, and a `reason`. The quadrant ids are:

| id | Quadrant |
|---|---|
| `person-leads` | A person leads, AI inside |
| `agents-run` | Agents run it, a person judges |
| `ai-alone` | AI alone, with checks |
| `person-decides` | A person decides, AI alongside |

Add your names to `GROUP_MEMBERS` in the same file and they appear in the footer after "Human-AI Group 8".

The order of `TASKS` is the order of the cards in the tray and the order a clicker places them. Run `npm test` after editing. It fails if a task points at a quadrant that does not exist or two tasks share an id.

## Presenting

- **Clicking a card** lifts it. Click the quadrant the class called and the card lands where we placed it, with a line saying whether the class agreed. Click the lifted card again to reveal it without a call, or press Escape to put it down.
- **Clicking a placed card** shows its reason again. To send a card back, point at it and click the small × in its corner.
- **A presentation clicker works.** Right arrow, Down arrow, Page Down or Space reveals the next card in tray order, without a class call. Left arrow, Up arrow or Page Up sends the most recent card back.
- **Show all** places the remaining cards one after another. **Clear** resets the slide, and once all six are placed it becomes a **Start over ›** link. Reloading the page also resets it.
- **Press D** to switch between the light theme and a dark one for a dim room. Check the projector on the day and pick whichever reads better.
- **Press F** to go full screen, and F or Escape to leave. The slide always keeps its 16:9 shape and scales to fit any window, so nothing ever scrolls. On a phone, turn it sideways.
- **It works offline** once it has loaded, so a flaky classroom Wi-Fi does not matter. For extra safety, run `npm run build && npm run preview` on the presenting laptop.

## Deploy

Live at https://human-ai-group-8.vercel.app. The Vercel project is connected to this GitHub repo, so every push to `main` deploys to production on its own. Pushes to other branches get a preview link.

To deploy straight from the laptop without pushing:

```bash
npx -y vercel@latest deploy --prod --yes --scope mbai3
```

## Project layout

```
src/tasks.ts       the six tasks, quadrants, axis labels and reasons
src/placement.ts   pure placement logic (place, return, next, status line, data checks)
src/App.tsx        the slide, card flight animation and clicker keys
src/index.css      layout and colours, all sized from one 16:9 unit
tests/             node:test specs for placement.ts and the slide data
```

## Next

- Show a running tally of how many calls the class matched.
