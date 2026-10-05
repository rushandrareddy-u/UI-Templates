# LEARNOS — Learning Progress OS

A premium, interactive learning-progress dashboard built with **plain HTML, CSS and JavaScript**.

## Features

- Premium dark/light responsive UI
- Dashboard overview with progress, topics, time and streak
- Interactive Learning Galaxy
- Subject management with dynamic **Add Subject**
- Learning Journey roadmap with topic progress
- Topic mastery levels: Familiar, Learning, Practicing, Strong, Mastered
- Interactive Knowledge Map
- Skill radar and progress trend charts using Canvas
- Weak-area detection and recommendations
- "What should I learn next?" recommendation
- Learning streak and weekly activity
- Learning-hours chart with persistent activity
- Goals with create/update/delete
- Achievements
- Quiz performance
- Student profile editor
- Global search with `Ctrl/⌘ + K`
- Notifications panel
- Light/dark theme
- LocalStorage persistence — refresh the browser and your changes remain

## Run

No framework or build step is required.

### Option 1
Open `index.html` directly in a modern browser.

### Option 2 — recommended
Run a local server:

```bash
python3 -m http.server 8000
```

Then open:

`http://localhost:8000`

## Files

- `index.html` — application structure
- `style.css` — complete responsive visual system
- `app.js` — state, UI rendering, interactions and LocalStorage
- `README.md` — project documentation

## Data

All demo data is stored in browser LocalStorage under `learnos_v1`.

Use the browser's developer tools → Application/Storage → Local Storage to inspect or reset the data.

## Design direction

LEARNOS is intentionally designed as a **personal learning OS**, rather than a generic school dashboard:
glass-like panels, subtle grid textures, neon gradients, knowledge nodes, animated progress, premium typography and responsive layouts.
