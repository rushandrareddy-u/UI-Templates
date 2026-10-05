# PROJECT UNIVERSE — Four Projects, One Experience

A cinematic animated launcher for four independent web projects.

## Included
1. AI MIRROR — See What the Model Sees
2. AttendX — Student Attendance Copilot
3. AIRWRITE — Write Without Touching
4. LEARNOS — Learning Progress OS

## Run
Because some projects use browser APIs/CDN assets, the safest approach is a local server:

```bash
cd AI-Project-Universe
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## How it works
The root `index.html` is the showcase. Clicking a project poster opens its original `index.html` inside a cinematic preview modal. **OPEN FULL PROJECT** opens it in a new tab.

Each project remains independent and its original HTML/CSS/JS is preserved.

## Structure

```text
AI-Project-Universe/
├── index.html
├── style.css
├── script.js
├── ai-mirror/
├── attendx/
├── airwrite/
└── learnos/
```
