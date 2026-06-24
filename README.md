# Avionics CGPA Panel

A CGPA / semester-GPA calculator built for the BSc in Aeronautical Engineering
(Avionics) curriculum (BSMRAAU). Built with React, Vite, and Tailwind CSS.

- All 8 semesters and ~90 courses are pre-loaded with their official credit hours.
- Pick a letter grade for each course; semester GPA and overall CGPA update live.
- Formula: `CGPA = Σ(credit hours × grade point) ÷ Σ(credit hours)` over every
  graded course.
- Grades are saved automatically to the browser's `localStorage`, so they
  persist between visits on the same device/browser.

## 1. Run it locally

You'll need [Node.js](https://nodejs.org) 18+ installed.

```bash
# from inside the avionics-cgpa-app folder
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## 2. Build for production

```bash
npm run build
```

This outputs a static site into the `dist/` folder — plain HTML/CSS/JS that
can be hosted anywhere.

```bash
npm run preview   # serve the production build locally to double-check it
```

## 3. Deploy

Any static host works. A few easy options:

### Vercel
```bash
npm install -g vercel
vercel
```
Follow the prompts (framework preset: Vite). Vercel auto-detects `npm run build`
and the `dist` output folder.

### Netlify
- Drag-and-drop the `dist/` folder onto https://app.netlify.com/drop, **or**
- Connect your Git repo and set:
  - Build command: `npm run build`
  - Publish directory: `dist`

### GitHub Pages
```bash
npm run build
# push the contents of dist/ to a `gh-pages` branch, or use a tool like
# `gh-pages` / `vite-plugin-gh-pages` to automate it
```

### Any static file host (S3, Cloudflare Pages, Firebase Hosting, etc.)
Just upload the contents of `dist/` after running `npm run build`.

## Project structure

```
avionics-cgpa-app/
├── index.html            # HTML entry point
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .gitignore
└── src/
    ├── main.jsx           # React bootstrap
    ├── App.jsx             # Calculator UI + curriculum data + logic
    └── index.css           # Tailwind imports
```

## Customizing

- **Grading scale**: edit the `GRADE_SCALE` array near the top of `src/App.jsx`.
- **Courses / credit hours**: edit the `SEMESTERS` array in `src/App.jsx`.
- **Electives**: "Elective – I" and "Elective – II" are generic placeholder
  slots (3.00 credits each) since the curriculum offers multiple options —
  rename them to the specific elective a student is taking if you'd like.
- **Colors / theme**: Tailwind utility classes are used throughout `App.jsx`;
  the base palette (deep navy background, cyan/amber/green accents) lives
  inline in the className strings.

## Resetting saved data

Each semester has a "clear this semester" button, and there's a "Clear all
data" button at the bottom of the page. Data lives only in the visiting
browser's `localStorage` — clearing site data/cookies in the browser will
also remove it.
