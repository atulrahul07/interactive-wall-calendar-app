# 🗓️ Interactive Wall Calendar

A polished, animated wall calendar built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Framer Motion** — inspired by the physical wall calendar aesthetic.
Live Link-: [https://interactive-wall-calendar-app.onrender.com](https://interactive-wall-calendar-app.onrender.com) 
## ✨ Features

- **Wall Calendar Aesthetic** — Hero image header with spiral rings, month badge, and paper texture
- **Day Range Selector** — Click start date, click end date; visual states for start/end/in-between
- **Holiday Markers** — Indian & universal holidays with emoji indicators
- **Integrated Notes** — Attach notes to individual dates or date ranges; auto-saved to `localStorage`
- **4 Themes** — Alpine (flame), Ocean, Forest, Dusk — changes hero image and accent colors
- **Page Flip Animation** — Smooth animated transition when navigating months
- **Fully Responsive** — Desktop side-by-side layout; mobile stacked
- **Today Indicator** — Pulsing dot with quick "jump to today" button

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

```bash
# 1. Clone or unzip the project
cd interactive-wall-calendar

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| Next.js 14 | React framework (App Router) |
| TypeScript | Type safety |
| Tailwind CSS | Utility styles + responsiveness |
| date-fns | Date arithmetic |
| lucide-react | Icons |
| localStorage | Client-side note persistence |

## 📁 Project Structure

```
src/
  app/
    globals.css       # Design tokens, animations, calendar styles
    layout.tsx        # Root layout with Google Fonts
    page.tsx          # Entry page
  components/
    WallCalendar.tsx  # Main calendar component (all-in-one)
```

## 📝 Usage

1. **Navigate months** — Use the `‹` / `›` arrows; watch the flip animation
2. **Select a date** — Click any date in the current month
3. **Select a range** — Click a start date, then click an end date
4. **Add a note** — Type in the notes area and click "Save Note"
5. **Switch theme** — Use the theme pills at the top to change the palette + hero image
6. **Clear selection** — Click the × on the date badge in the notes area

## 🎨 Design Decisions

- **Playfair Display** for headings — elegantly editorial, matches the "wall calendar" feel
- **DM Mono** for dates — clean, tabular, and grid-friendly
- **Paper texture** background — reinforces the physical-object metaphor
- **Clip-path month badge** — geometric accent inspired by the reference image
- **Spiral rings** — pure CSS simulation with box-shadow and border-radius tricks
- Notes are stored in `localStorage` — no backend needed per spec
