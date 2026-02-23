# ✦ Meridian — The Ultimate Life Planner

> *Plan beautifully. Live intentionally.*

A full-featured personal productivity app with daily timeline, week/month calendar views, habit tracking, goal management, routines, and notes — all in one warm, minimal, editorial-aesthetic workspace.

---

## 🚀 Quick Start

### Option 1: Netlify (Recommended)

```bash
# Deploy to Netlify
npm install -g netlify-cli
netlify deploy --prod --dir=frontend
```

Or connect this repo to [Netlify](https://netlify.com) and it will auto-deploy from the `frontend/` folder.

### Option 2: Local

```bash
# Just open the file directly
open frontend/index.html
```

### Option 3: Docker (optional)

```bash
docker compose up --build
open http://localhost
```

**Demo login:** `demo@meridian.app` / `demo` — or create your own account!

---

## ✨ Features

### 🔐 User Accounts
- **Registration** with name, email, password
- **Login** with email/password
- **Demo account** with pre-loaded sample data
- Per-user data isolation (localStorage)
- Auto-login on return

### 📅 Planning Views
| View | Description |
|------|-------------|
| **Dashboard** | Stats, weekly chart, habit summary, goal progress, upcoming tasks & events |
| **Today** | Timeline view with drag-and-drop scheduling (6am–10pm), events, backlog sidebar |
| **Week** | 7-day grid with events row, drag tasks between days and hours |
| **Month** | Full calendar with task/event pills, click to jump to day |

### ✅ Task Management
- Create tasks with date, time, duration, priority, category, color, notes
- Drag-and-drop between time slots and days
- Filter by category, status, date
- Backlog for unscheduled tasks

### 📅 Events
- Create events with start/end dates, times, location, notes
- Events appear in **Dashboard** (upcoming section)
- Events appear in **Today** view (events panel at top)
- Events appear in **Week** view (dedicated events row)
- Events appear in **Month** view (calendar pills with 📅 icon)
- Events appear in **Mini Calendar** (dot indicators)
- Edit and delete events from any view

### ⟳ Habit Tracker
- 28-day heatmap visualization
- Streak tracking (current + best)
- Toggle past days, daily/weekly schedules
- Reminder times

### ◇ Goals
- Milestone-based progress tracking
- Automatic progress % from milestones
- Deadline tracking with urgency indicators
- Category & color coding

### ⬡ Routines
- Step-by-step daily sequences
- Morning / Evening / Weekly routines
- Scheduled with day/time

### ✦ Notes
- Colorful sticky-note style cards
- Pinnable notes, full textarea editing
- Sort by pinned first, then most recent
- Quick edit inline

---

## 🏗 Architecture

```
meridian-planner/
├── frontend/          # Single-file SPA (HTML/CSS/JS)
│   ├── index.html     # Complete app — zero backend needed
│   ├── nginx.conf     # For Docker deployment
│   └── Dockerfile     # For Docker deployment
├── backend/           # (Legacy — not needed for Netlify)
│   ├── app.py
│   ├── requirements.txt
│   └── Dockerfile
├── netlify.toml       # Netlify configuration
├── docker-compose.yml # Docker deployment (optional)
└── README.md
```

**Design system:** Warm paper tones, Fraunces serif + Geist sans, editorial layout, ink on paper aesthetic

**Stack:** Vanilla JS SPA · localStorage · No backend required · Deployable anywhere

**Data persistence:** All data stored in browser localStorage, isolated per user account

---

## 🌐 Deployment on Netlify

1. Push this repo to GitHub
2. Go to [netlify.com](https://netlify.com) → New Site → Import from Git
3. Set **Publish directory** to `frontend`
4. Click Deploy
5. Done! Your app is live ✦

The `netlify.toml` file is already configured:
```toml
[build]
  publish = "frontend"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Quick add task |
| `Esc` | Close modal |
| `Enter` | Submit login/register form |

---

## 🔧 Notes

- All data persists in `localStorage` — clearing browser data will reset everything
- Each user account has isolated data
- The demo account seeds sample data on first login
- For production with real persistence, add a backend with a database
- The Docker setup still works but is optional — the app runs as a pure static site

---

Built with craft. No frameworks. No nonsense. Pure intent.
