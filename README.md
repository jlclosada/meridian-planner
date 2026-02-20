# ✦ Meridian — The Ultimate Life Planner

> *Plan beautifully. Live intentionally.*

A full-featured personal productivity SaaS with daily timeline, week/month calendar views, habit tracking, goal management, routines, and notes — all in one warm, minimal, editorial-aesthetic workspace.

---

## 🚀 Quick Start

```bash
unzip meridian.zip && cd meridian
docker compose up --build
open http://localhost
```

**Demo login:** `demo@meridian.app` + any password

---

## ✨ Features

### 📅 Planning Views
| View | Description |
|------|-------------|
| **Dashboard** | Stats, weekly chart, habit summary, goal progress, upcoming tasks |
| **Today** | Timeline view with drag-and-drop scheduling (6am–10pm), backlog sidebar |
| **Week** | 7-day grid, drag tasks between days and hours |
| **Month** | Full calendar with task/event pills, click to jump to day |

### ✅ Task Management
- Create tasks with date, time, duration, priority, category, color, notes
- Drag-and-drop between time slots and days
- Filter by category, status, date
- Backlog for unscheduled tasks

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
- Pinnable notes, full markdown-friendly textarea
- Quick edit inline

---

## 🏗 Architecture

```
meridian/
├── frontend/          # Single-file SPA (HTML/CSS/JS)
│   ├── index.html     # ~1,800 lines — complete app
│   ├── nginx.conf     # Reverse proxy
│   └── Dockerfile
├── backend/           # Python Flask REST API
│   ├── app.py         # 30+ endpoints
│   ├── requirements.txt
│   └── Dockerfile
└── docker-compose.yml
```

**Design system:** Warm paper tones, Fraunces serif + Geist sans, editorial layout, ink on paper aesthetic

**Stack:** Vanilla JS SPA · Flask · Gunicorn · Nginx · Docker Compose

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Quick add task |
| `Esc` | Close modal |

---

## 🌐 API Reference (30 endpoints)

```
POST  /api/auth/login
GET   /api/auth/me
PATCH /api/auth/me

GET/POST        /api/tasks
GET/PATCH/DEL   /api/tasks/:id
POST            /api/tasks/reorder

GET/POST        /api/habits
PATCH/DEL       /api/habits/:id
POST            /api/habits/:id/toggle

GET/POST        /api/events
PATCH/DEL       /api/events/:id

GET/POST        /api/routines
PATCH/DEL       /api/routines/:id

GET/POST        /api/goals
PATCH/DEL       /api/goals/:id

GET/POST        /api/notes
PATCH/DEL       /api/notes/:id

GET             /api/dashboard
GET             /api/health
```

---

## 🔧 Production

- Replace `SECRET_KEY` in `docker-compose.yml`
- Add PostgreSQL/Redis for persistence
- Add HTTPS via Traefik or Certbot
- Add authentication with JWT expiration

---

Built with craft. No frameworks. No nonsense. Pure intent.
