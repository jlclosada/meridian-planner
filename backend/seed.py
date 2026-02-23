"""
Meridian Planner — Seed / Demo Data

Populates the in-memory store with demo and admin users + sample data.
Run once at application startup.
"""
from __future__ import annotations

import random
import uuid
from datetime import date, datetime, timedelta

from services.store import store

_today = date.today()


def _ds(offset: int = 0) -> str:
    return (_today + timedelta(days=offset)).isoformat()


def _ts(h: int, m: int = 0) -> str:
    return f"{h:02d}:{m:02d}"


def _id() -> str:
    return str(uuid.uuid4())


# ─── Seed function ────────────────────────────────────────────────────────────


def seed() -> None:
    """Populate store with demo data.  Safe to call multiple times."""
    if store.users:
        return  # already seeded

    _seed_demo_user()
    _seed_admin_user()


# ─── Demo user ────────────────────────────────────────────────────────────────


def _seed_demo_user() -> None:
    uid = "demo-001"
    store.users[uid] = {
        "id": uid,
        "email": "demo@meridian.app",
        "name": "Jordan",
        "avatar": "J",
        "timezone": "Europe/Madrid",
        "created_at": "2024-01-01",
        "theme": "light",
        "week_start": "monday",
        "role": "user",
    }
    store.passwords[uid] = store.hash_password("demo")
    store.init_user_collections(uid)

    # ── Tasks ────────────────────────────────────────────────────────────────
    store.tasks[uid] = [
        {
            "id": _id(), "title": "Review Q1 objectives", "category": "work",
            "priority": "high", "status": "in_progress", "done": False,
            "date": _ds(0), "time": _ts(9), "duration": 30,
            "color": "#3B5EA6", "tags": ["review", "q1"], "notes": "",
            "checklist": [
                {"text": "Gather Q1 data", "done": True},
                {"text": "Write summary", "done": False},
            ],
            "recurring": None, "order": 0,
        },
        {
            "id": _id(), "title": "Team standup", "category": "work",
            "priority": "medium", "status": "todo", "done": False,
            "date": _ds(0), "time": _ts(10), "duration": 15,
            "color": "#3B5EA6", "tags": ["meeting"], "notes": "",
            "checklist": [], "recurring": "daily", "order": 1,
        },
        {
            "id": _id(), "title": "Deep work: product roadmap", "category": "work",
            "priority": "high", "status": "todo", "done": False,
            "date": _ds(0), "time": _ts(11), "duration": 90,
            "color": "#3B5EA6", "tags": ["focus", "product"],
            "notes": "Block time, no interruptions",
            "checklist": [
                {"text": "Draft v1 features", "done": False},
                {"text": "Review with team", "done": False},
                {"text": "Finalize priorities", "done": False},
            ],
            "recurring": None, "order": 2,
        },
        {
            "id": _id(), "title": "Lunch + walk", "category": "health",
            "priority": "low", "status": "completed", "done": True,
            "date": _ds(0), "time": _ts(13), "duration": 60,
            "color": "#5C7A6A", "tags": ["health"], "notes": "",
            "checklist": [], "recurring": "daily", "order": 3,
        },
        {
            "id": _id(), "title": "Read: Atomic Habits ch. 5", "category": "learning",
            "priority": "medium", "status": "in_progress", "done": False,
            "date": _ds(0), "time": _ts(18), "duration": 30,
            "color": "#7B4F8A", "tags": ["reading", "habits"], "notes": "",
            "checklist": [], "recurring": None, "order": 4,
        },
        {
            "id": _id(), "title": "Gym — upper body", "category": "health",
            "priority": "high", "status": "blocked", "done": False,
            "date": _ds(0), "time": _ts(19), "duration": 60,
            "color": "#5C7A6A", "tags": ["gym", "fitness"],
            "notes": "Waiting for gym to open",
            "checklist": [], "recurring": "mon,wed,fri", "order": 5,
        },
        {
            "id": _id(), "title": "Prepare tomorrow's plan", "category": "personal",
            "priority": "medium", "status": "todo", "done": False,
            "date": _ds(0), "time": _ts(21), "duration": 15,
            "color": "#B8860B", "tags": ["planning"], "notes": "",
            "checklist": [], "recurring": "daily", "order": 6,
        },
        {
            "id": _id(), "title": "Weekly review", "category": "work",
            "priority": "high", "status": "todo", "done": False,
            "date": _ds(1), "time": _ts(9), "duration": 45,
            "color": "#3B5EA6", "tags": ["review"], "notes": "",
            "checklist": [], "recurring": None, "order": 0,
        },
        {
            "id": _id(), "title": "Call with client", "category": "work",
            "priority": "high", "status": "todo", "done": False,
            "date": _ds(1), "time": _ts(11), "duration": 60,
            "color": "#3B5EA6", "tags": ["client", "meeting"],
            "notes": "Prepare demo",
            "checklist": [], "recurring": None, "order": 1,
        },
        {
            "id": _id(), "title": "Spanish lesson", "category": "learning",
            "priority": "medium", "status": "todo", "done": False,
            "date": _ds(1), "time": _ts(17), "duration": 30,
            "color": "#7B4F8A", "tags": ["language"], "notes": "",
            "checklist": [], "recurring": "tue,thu", "order": 2,
        },
        {
            "id": _id(), "title": "Doctor appointment", "category": "personal",
            "priority": "high", "status": "todo", "done": False,
            "date": _ds(2), "time": _ts(10, 30), "duration": 45,
            "color": "#C0522A", "tags": ["health", "appointment"],
            "notes": "Bring insurance card",
            "checklist": [], "recurring": None, "order": 0,
        },
        {
            "id": _id(), "title": "Blog post draft", "category": "work",
            "priority": "medium", "status": "todo", "done": False,
            "date": _ds(2), "time": _ts(14), "duration": 90,
            "color": "#3B5EA6", "tags": ["writing", "content"], "notes": "",
            "checklist": [], "recurring": None, "order": 1,
        },
        {
            "id": _id(), "title": "Set up home office", "category": "personal",
            "priority": "low", "status": "todo", "done": False,
            "date": None, "time": None, "duration": 120,
            "color": "#B8860B", "tags": ["home"], "notes": "",
            "checklist": [], "recurring": None, "order": 0,
        },
        {
            "id": _id(), "title": "Research new laptop", "category": "personal",
            "priority": "low", "status": "todo", "done": False,
            "date": None, "time": None, "duration": 60,
            "color": "#B8860B", "tags": ["gear"], "notes": "",
            "checklist": [], "recurring": None, "order": 1,
        },
    ]

    # ── Habits ───────────────────────────────────────────────────────────────
    store.habits[uid] = [
        {
            "id": _id(), "name": "Morning pages", "icon": "✍️",
            "color": "#B8860B", "category": "mindset", "target_days": "daily",
            "completions": [_ds(-i) for i in range(12) if random.random() > 0.2],
            "reminder": "07:00", "streak": 8, "best_streak": 14,
        },
        {
            "id": _id(), "name": "Exercise 30min", "icon": "🏃",
            "color": "#5C7A6A", "category": "health", "target_days": "mon,wed,fri,sat",
            "completions": [_ds(-i) for i in range(21) if random.random() > 0.25],
            "reminder": "07:30", "streak": 5, "best_streak": 21,
        },
        {
            "id": _id(), "name": "Read 20 pages", "icon": "📖",
            "color": "#7B4F8A", "category": "learning", "target_days": "daily",
            "completions": [_ds(-i) for i in range(15) if random.random() > 0.3],
            "reminder": "21:00", "streak": 3, "best_streak": 10,
        },
        {
            "id": _id(), "name": "No phone before 9am", "icon": "📵",
            "color": "#C0522A", "category": "mindset", "target_days": "daily",
            "completions": [_ds(-i) for i in range(10) if random.random() > 0.35],
            "reminder": None, "streak": 2, "best_streak": 7,
        },
        {
            "id": _id(), "name": "Drink 2L water", "icon": "💧",
            "color": "#3B5EA6", "category": "health", "target_days": "daily",
            "completions": [_ds(-i) for i in range(20) if random.random() > 0.2],
            "reminder": "08:00", "streak": 6, "best_streak": 18,
        },
        {
            "id": _id(), "name": "Meditation 10min", "icon": "🧘",
            "color": "#2A7A7A", "category": "mindset", "target_days": "daily",
            "completions": [_ds(-i) for i in range(18) if random.random() > 0.4],
            "reminder": "07:15", "streak": 4, "best_streak": 12,
        },
    ]

    # ── Events ───────────────────────────────────────────────────────────────
    store.events[uid] = [
        {
            "id": _id(), "title": "Team offsite", "category": "work",
            "start_date": _ds(3), "end_date": _ds(4),
            "start_time": None, "end_time": None,
            "color": "#3B5EA6", "all_day": True,
            "notes": "Berlin office", "location": "Berlin",
        },
        {
            "id": _id(), "title": "Birthday: Ana", "category": "personal",
            "start_date": _ds(7), "end_date": _ds(7),
            "start_time": None, "end_time": None,
            "color": "#A84E6A", "all_day": True,
            "notes": "Gift: book", "location": "",
        },
        {
            "id": _id(), "title": "Dentist", "category": "health",
            "start_date": _ds(10), "end_date": _ds(10),
            "start_time": "10:30", "end_time": "11:30",
            "color": "#5C7A6A", "all_day": False,
            "notes": "", "location": "Clinic Av. Principal",
        },
    ]

    # ── Routines ─────────────────────────────────────────────────────────────
    store.routines[uid] = [
        {
            "id": _id(), "name": "Morning Routine", "icon": "🌅",
            "time": "07:00", "days": "daily", "color": "#B8860B",
            "steps": [
                "Wake up & stretch 5min", "Cold shower",
                "Morning pages 15min", "Healthy breakfast",
                "Review today's plan 10min",
            ],
            "duration": 60, "active": True,
        },
        {
            "id": _id(), "name": "Evening Wind-Down", "icon": "🌙",
            "time": "21:30", "days": "daily", "color": "#7B4F8A",
            "steps": [
                "No screens after 21:30", "Tomorrow's plan 10min",
                "Read 20min", "Gratitude journal 5min",
            ],
            "duration": 40, "active": True,
        },
        {
            "id": _id(), "name": "Weekly Review", "icon": "📊",
            "time": "09:00", "days": "sunday", "color": "#3B5EA6",
            "steps": [
                "Review last week's goals", "Celebrate wins",
                "Identify blockers", "Plan next week's priorities",
                "Update goals progress",
            ],
            "duration": 45, "active": True,
        },
    ]

    # ── Goals ────────────────────────────────────────────────────────────────
    store.goals[uid] = [
        {
            "id": _id(), "title": "Launch MVP by Q2", "category": "work",
            "color": "#3B5EA6",
            "target_date": (_today + timedelta(days=45)).isoformat(),
            "progress": 35,
            "milestones": [
                {"text": "Define core features", "done": True},
                {"text": "Design system complete", "done": True},
                {"text": "Backend API done", "done": False},
                {"text": "Beta testing", "done": False},
                {"text": "Public launch", "done": False},
            ],
            "notes": "Focus on core loop first",
        },
        {
            "id": _id(), "title": "Run 5K under 25min", "category": "health",
            "color": "#5C7A6A",
            "target_date": (_today + timedelta(days=60)).isoformat(),
            "progress": 60,
            "milestones": [
                {"text": "Run 5K without stopping", "done": True},
                {"text": "5K under 30min", "done": True},
                {"text": "5K under 27min", "done": True},
                {"text": "5K under 25min", "done": False},
            ],
            "notes": "Train 3x/week",
        },
        {
            "id": _id(), "title": "Read 24 books this year", "category": "learning",
            "color": "#7B4F8A",
            "target_date": _today.replace(month=12, day=31).isoformat(),
            "progress": 37,
            "milestones": [
                {"text": "6 books (Q1)", "done": True},
                {"text": "12 books (Q2)", "done": False},
                {"text": "18 books (Q3)", "done": False},
                {"text": "24 books (Q4)", "done": False},
            ],
            "notes": "Current: book 9",
        },
    ]

    # ── Notes ────────────────────────────────────────────────────────────────
    store.notes[uid] = [
        {
            "id": _id(), "title": "Brain dump",
            "content": (
                "Ideas for the new project:\n- Unified API\n"
                "- Mobile first\n- Offline mode\n- AI suggestions"
            ),
            "color": "#FEF9C3", "pinned": True,
            "created_at": (datetime.now() - timedelta(days=2)).isoformat(),
            "updated_at": datetime.now().isoformat(),
        },
        {
            "id": _id(), "title": "Books to read",
            "content": (
                "- Deep Work (Cal Newport)\n- The ONE Thing\n"
                "- Essentialism\n- 4-Hour Workweek"
            ),
            "color": "#F3E8FF", "pinned": False,
            "created_at": (datetime.now() - timedelta(days=5)).isoformat(),
            "updated_at": (datetime.now() - timedelta(days=1)).isoformat(),
        },
    ]


# ─── Admin user ───────────────────────────────────────────────────────────────


def _seed_admin_user() -> None:
    uid = "admin-jose"
    store.users[uid] = {
        "id": uid,
        "email": "jose@meridian.app",
        "name": "José",
        "avatar": "JC",
        "timezone": "Europe/Madrid",
        "created_at": "2024-01-01",
        "theme": "light",
        "week_start": "monday",
        "role": "admin",
    }
    store.passwords[uid] = store.hash_password("meridian2024")
    store.init_user_collections(uid)

    store.tasks[uid] = [
        {
            "id": _id(), "title": "Review Meridian feature roadmap",
            "category": "work", "priority": "high", "status": "in_progress",
            "done": False, "date": _ds(0), "time": _ts(9), "duration": 60,
            "color": "#3B5EA6", "tags": ["meridian", "product"],
            "notes": "Plan next sprint",
            "checklist": [], "recurring": None, "order": 0,
        },
        {
            "id": _id(), "title": "Architecture review session",
            "category": "work", "priority": "high", "status": "todo",
            "done": False, "date": _ds(0), "time": _ts(11), "duration": 90,
            "color": "#3B5EA6", "tags": ["architecture"], "notes": "",
            "checklist": [], "recurring": None, "order": 1,
        },
        {
            "id": _id(), "title": "Workout",
            "category": "health", "priority": "medium", "status": "todo",
            "done": False, "date": _ds(0), "time": _ts(7), "duration": 45,
            "color": "#5C7A6A", "tags": ["fitness"], "notes": "",
            "checklist": [], "recurring": "mon,wed,fri", "order": 2,
        },
        {
            "id": _id(), "title": "Plan Q2 OKRs",
            "category": "work", "priority": "high", "status": "todo",
            "done": False, "date": _ds(1), "time": _ts(10), "duration": 60,
            "color": "#3B5EA6", "tags": ["okr", "planning"], "notes": "",
            "checklist": [], "recurring": None, "order": 0,
        },
        {
            "id": _id(), "title": "Read: System Design Interview",
            "category": "learning", "priority": "medium", "status": "todo",
            "done": False, "date": _ds(0), "time": _ts(20), "duration": 30,
            "color": "#7B4F8A", "tags": ["reading"], "notes": "",
            "checklist": [], "recurring": "daily", "order": 3,
        },
    ]

    store.habits[uid] = [
        {
            "id": _id(), "name": "Daily standup prep", "icon": "📋",
            "color": "#3B5EA6", "category": "mindset",
            "target_days": "mon,tue,wed,thu,fri",
            "completions": [_ds(-i) for i in range(14) if random.random() > 0.15],
            "reminder": "08:45", "streak": 10, "best_streak": 22,
        },
        {
            "id": _id(), "name": "Gym", "icon": "💪",
            "color": "#5C7A6A", "category": "health",
            "target_days": "mon,wed,fri",
            "completions": [_ds(-i) for i in range(21) if random.random() > 0.2],
            "reminder": "07:00", "streak": 6, "best_streak": 18,
        },
        {
            "id": _id(), "name": "Deep focus block", "icon": "🎯",
            "color": "#7B4F8A", "category": "learning",
            "target_days": "daily",
            "completions": [_ds(-i) for i in range(10) if random.random() > 0.3],
            "reminder": "10:00", "streak": 4, "best_streak": 14,
        },
    ]

    store.events[uid] = []

    store.routines[uid] = [
        {
            "id": _id(), "name": "Developer Morning", "icon": "💻",
            "time": "08:00", "days": "mon,tue,wed,thu,fri", "color": "#3B5EA6",
            "steps": [
                "Check messages & prioritize",
                "Plan top 3 tasks",
                "Start deep work block",
            ],
            "duration": 30, "active": True,
        },
    ]

    store.goals[uid] = [
        {
            "id": _id(), "title": "Ship Meridian v1.0", "category": "work",
            "color": "#3B5EA6",
            "target_date": (_today + timedelta(days=30)).isoformat(),
            "progress": 55,
            "milestones": [
                {"text": "Core task management", "done": True},
                {"text": "Habit tracker", "done": True},
                {"text": "Dashboard improvements", "done": False},
                {"text": "Admin panel", "done": False},
                {"text": "Public launch", "done": False},
            ],
            "notes": "Focus on UX polish",
        },
        {
            "id": _id(), "title": "Learn Kubernetes", "category": "learning",
            "color": "#7B4F8A",
            "target_date": (_today + timedelta(days=90)).isoformat(),
            "progress": 20,
            "milestones": [
                {"text": "Complete K8s fundamentals", "done": True},
                {"text": "Deploy first cluster", "done": False},
                {"text": "Production deployment", "done": False},
            ],
            "notes": "",
        },
    ]

    store.notes[uid] = [
        {
            "id": _id(), "title": "Meridian roadmap",
            "content": (
                "v1.0 features:\n"
                "- Task drag & drop between days ✓\n"
                "- Priority inline editing ✓\n"
                "- Pomodoro timer\n"
                "- Global search\n"
                "- Mobile responsive"
            ),
            "color": "#DBEAFE", "pinned": True,
            "created_at": (datetime.now() - timedelta(days=1)).isoformat(),
            "updated_at": datetime.now().isoformat(),
        },
    ]

