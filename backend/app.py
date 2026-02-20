from flask import Flask, jsonify, request
from flask_cors import CORS
import uuid, json, os, random
from datetime import datetime, timedelta, date
import hashlib

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'meridian-secret-2024')
CORS(app, supports_credentials=True, origins=["*"])

# ─── In-memory store ───────────────────────────────────────────────────────────
USERS = {}
SESSIONS = {}
TASKS = {}       # uid -> [task]
HABITS = {}      # uid -> [habit]
EVENTS = {}      # uid -> [event]  (calendar)
ROUTINES = {}    # uid -> [routine]
GOALS = {}       # uid -> [goal]
NOTES = {}       # uid -> [note]

# ─── Seed demo ────────────────────────────────────────────────────────────────
DU = "demo-001"
USERS[DU] = {
    "id": DU, "email": "demo@meridian.app", "name": "Jordan",
    "avatar": "J", "timezone": "Europe/Madrid",
    "created_at": "2024-01-01", "theme": "light",
    "week_start": "monday"
}

today = date.today()
def ds(offset=0): return (today + timedelta(days=offset)).isoformat()
def ts(h, m=0): return f"{h:02d}:{m:02d}"

TASKS[DU] = [
    {"id": str(uuid.uuid4()), "title": "Review Q1 objectives", "category": "work",
     "priority": "high", "done": False, "date": ds(0), "time": ts(9), "duration": 30,
     "color": "#3B82F6", "tags": ["review", "q1"], "notes": "", "recurring": None, "order": 0},
    {"id": str(uuid.uuid4()), "title": "Team standup", "category": "work",
     "priority": "medium", "done": False, "date": ds(0), "time": ts(10), "duration": 15,
     "color": "#3B82F6", "tags": ["meeting"], "notes": "", "recurring": "daily", "order": 1},
    {"id": str(uuid.uuid4()), "title": "Deep work: product roadmap", "category": "work",
     "priority": "high", "done": False, "date": ds(0), "time": ts(11), "duration": 90,
     "color": "#3B82F6", "tags": ["focus", "product"], "notes": "Block time, no interruptions", "recurring": None, "order": 2},
    {"id": str(uuid.uuid4()), "title": "Lunch + walk", "category": "health",
     "priority": "low", "done": True, "date": ds(0), "time": ts(13), "duration": 60,
     "color": "#10B981", "tags": ["health"], "notes": "", "recurring": "daily", "order": 3},
    {"id": str(uuid.uuid4()), "title": "Read: Atomic Habits ch. 5", "category": "learning",
     "priority": "medium", "done": False, "date": ds(0), "time": ts(18), "duration": 30,
     "color": "#8B5CF6", "tags": ["reading", "habits"], "notes": "", "recurring": None, "order": 4},
    {"id": str(uuid.uuid4()), "title": "Gym — upper body", "category": "health",
     "priority": "high", "done": False, "date": ds(0), "time": ts(19), "duration": 60,
     "color": "#10B981", "tags": ["gym", "fitness"], "notes": "", "recurring": "mon,wed,fri", "order": 5},
    {"id": str(uuid.uuid4()), "title": "Prepare tomorrow's plan", "category": "personal",
     "priority": "medium", "done": False, "date": ds(0), "time": ts(21), "duration": 15,
     "color": "#F59E0B", "tags": ["planning"], "notes": "", "recurring": "daily", "order": 6},

    # Tomorrow
    {"id": str(uuid.uuid4()), "title": "Weekly review", "category": "work",
     "priority": "high", "done": False, "date": ds(1), "time": ts(9), "duration": 45,
     "color": "#3B82F6", "tags": ["review"], "notes": "", "recurring": None, "order": 0},
    {"id": str(uuid.uuid4()), "title": "Call with client", "category": "work",
     "priority": "high", "done": False, "date": ds(1), "time": ts(11), "duration": 60,
     "color": "#3B82F6", "tags": ["client", "meeting"], "notes": "Prepare demo", "recurring": None, "order": 1},
    {"id": str(uuid.uuid4()), "title": "Spanish lesson", "category": "learning",
     "priority": "medium", "done": False, "date": ds(1), "time": ts(17), "duration": 30,
     "color": "#8B5CF6", "tags": ["language"], "notes": "", "recurring": "tue,thu", "order": 2},

    # Day after
    {"id": str(uuid.uuid4()), "title": "Doctor appointment", "category": "personal",
     "priority": "high", "done": False, "date": ds(2), "time": ts(10,30), "duration": 45,
     "color": "#EF4444", "tags": ["health", "appointment"], "notes": "Bring insurance card", "recurring": None, "order": 0},
    {"id": str(uuid.uuid4()), "title": "Blog post draft", "category": "work",
     "priority": "medium", "done": False, "date": ds(2), "time": ts(14), "duration": 90,
     "color": "#3B82F6", "tags": ["writing", "content"], "notes": "", "recurring": None, "order": 1},

    # Backlog (no date)
    {"id": str(uuid.uuid4()), "title": "Set up home office", "category": "personal",
     "priority": "low", "done": False, "date": None, "time": None, "duration": 120,
     "color": "#F59E0B", "tags": ["home"], "notes": "", "recurring": None, "order": 0},
    {"id": str(uuid.uuid4()), "title": "Research new laptop", "category": "personal",
     "priority": "low", "done": False, "date": None, "time": None, "duration": 60,
     "color": "#F59E0B", "tags": ["gear"], "notes": "", "recurring": None, "order": 1},
]

HABITS[DU] = [
    {"id": str(uuid.uuid4()), "name": "Morning pages", "icon": "✍️",
     "color": "#F59E0B", "category": "mindset", "target_days": "daily",
     "completions": [ds(-i) for i in range(12) if random.random() > 0.2],
     "reminder": "07:00", "streak": 8, "best_streak": 14},
    {"id": str(uuid.uuid4()), "name": "Exercise 30min", "icon": "🏃",
     "color": "#10B981", "category": "health", "target_days": "mon,wed,fri,sat",
     "completions": [ds(-i) for i in range(21) if random.random() > 0.25],
     "reminder": "07:30", "streak": 5, "best_streak": 21},
    {"id": str(uuid.uuid4()), "name": "Read 20 pages", "icon": "📖",
     "color": "#8B5CF6", "category": "learning", "target_days": "daily",
     "completions": [ds(-i) for i in range(15) if random.random() > 0.3],
     "reminder": "21:00", "streak": 3, "best_streak": 10},
    {"id": str(uuid.uuid4()), "name": "No phone before 9am", "icon": "📵",
     "color": "#EF4444", "category": "mindset", "target_days": "daily",
     "completions": [ds(-i) for i in range(10) if random.random() > 0.35],
     "reminder": None, "streak": 2, "best_streak": 7},
    {"id": str(uuid.uuid4()), "name": "Drink 2L water", "icon": "💧",
     "color": "#3B82F6", "category": "health", "target_days": "daily",
     "completions": [ds(-i) for i in range(20) if random.random() > 0.2],
     "reminder": "08:00", "streak": 6, "best_streak": 18},
    {"id": str(uuid.uuid4()), "name": "Meditation 10min", "icon": "🧘",
     "color": "#06B6D4", "category": "mindset", "target_days": "daily",
     "completions": [ds(-i) for i in range(18) if random.random() > 0.4],
     "reminder": "07:15", "streak": 4, "best_streak": 12},
]

EVENTS[DU] = [
    {"id": str(uuid.uuid4()), "title": "Team offsite", "category": "work",
     "start_date": ds(3), "end_date": ds(4), "start_time": None, "end_time": None,
     "color": "#3B82F6", "all_day": True, "notes": "Berlin office", "location": "Berlin"},
    {"id": str(uuid.uuid4()), "title": "Birthday: Ana", "category": "personal",
     "start_date": ds(7), "end_date": ds(7), "start_time": None, "end_time": None,
     "color": "#EC4899", "all_day": True, "notes": "Gift: book", "location": ""},
    {"id": str(uuid.uuid4()), "title": "Dentist", "category": "health",
     "start_date": ds(10), "end_date": ds(10), "start_time": "10:30", "end_time": "11:30",
     "color": "#10B981", "all_day": False, "notes": "", "location": "Clinic Av. Principal"},
]

ROUTINES[DU] = [
    {"id": str(uuid.uuid4()), "name": "Morning Routine", "icon": "🌅",
     "time": "07:00", "days": "daily", "color": "#F59E0B",
     "steps": ["Wake up & stretch 5min", "Cold shower", "Morning pages 15min", "Healthy breakfast", "Review today's plan 10min"],
     "duration": 60, "active": True},
    {"id": str(uuid.uuid4()), "name": "Evening Wind-Down", "icon": "🌙",
     "time": "21:30", "days": "daily", "color": "#8B5CF6",
     "steps": ["No screens after 21:30", "Tomorrow's plan 10min", "Read 20min", "Gratitude journal 5min"],
     "duration": 40, "active": True},
    {"id": str(uuid.uuid4()), "name": "Weekly Review", "icon": "📊",
     "time": "09:00", "days": "sunday", "color": "#3B82F6",
     "steps": ["Review last week's goals", "Celebrate wins", "Identify blockers", "Plan next week's priorities", "Update goals progress"],
     "duration": 45, "active": True},
]

GOALS[DU] = [
    {"id": str(uuid.uuid4()), "title": "Launch MVP by Q2", "category": "work",
     "color": "#3B82F6", "target_date": (today + timedelta(days=45)).isoformat(),
     "progress": 35, "milestones": [
         {"text": "Define core features", "done": True},
         {"text": "Design system complete", "done": True},
         {"text": "Backend API done", "done": False},
         {"text": "Beta testing", "done": False},
         {"text": "Public launch", "done": False}
     ], "notes": "Focus on core loop first"},
    {"id": str(uuid.uuid4()), "title": "Run 5K under 25min", "category": "health",
     "color": "#10B981", "target_date": (today + timedelta(days=60)).isoformat(),
     "progress": 60, "milestones": [
         {"text": "Run 5K without stopping", "done": True},
         {"text": "5K under 30min", "done": True},
         {"text": "5K under 27min", "done": True},
         {"text": "5K under 25min", "done": False}
     ], "notes": "Train 3x/week"},
    {"id": str(uuid.uuid4()), "title": "Read 24 books this year", "category": "learning",
     "color": "#8B5CF6", "target_date": (today.replace(month=12, day=31)).isoformat(),
     "progress": 37, "milestones": [
         {"text": "6 books (Q1)", "done": True},
         {"text": "12 books (Q2)", "done": False},
         {"text": "18 books (Q3)", "done": False},
         {"text": "24 books (Q4)", "done": False}
     ], "notes": "Current: book 9"},
]

NOTES[DU] = [
    {"id": str(uuid.uuid4()), "title": "Brain dump", "content": "Ideas for the new project:\n- Unified API\n- Mobile first\n- Offline mode\n- AI suggestions",
     "color": "#F59E0B", "pinned": True, "created_at": (datetime.now() - timedelta(days=2)).isoformat(), "updated_at": datetime.now().isoformat()},
    {"id": str(uuid.uuid4()), "title": "Books to read", "content": "- Deep Work (Cal Newport)\n- The ONE Thing\n- Essentialism\n- 4-Hour Workweek",
     "color": "#8B5CF6", "pinned": False, "created_at": (datetime.now() - timedelta(days=5)).isoformat(), "updated_at": (datetime.now() - timedelta(days=1)).isoformat()},
]

# ─── Helpers ──────────────────────────────────────────────────────────────────
def get_uid(req):
    token = req.headers.get('Authorization', '').replace('Bearer ', '')
    return SESSIONS.get(token)

def auth_required(fn):
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        uid = get_uid(request)
        if not uid or uid not in USERS:
            return jsonify({"error": "Unauthorized"}), 401
        return fn(uid, *args, **kwargs)
    return wrapper

# ─── Auth ─────────────────────────────────────────────────────────────────────
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json or {}
    email = data.get('email', '').lower().strip()
    if not email:
        return jsonify({"error": "Email required"}), 400
    # Demo
    if email in ('demo@meridian.app', 'demo'):
        token = str(uuid.uuid4())
        SESSIONS[token] = DU
        return jsonify({"token": token, "user": USERS[DU]})
    # New / existing user
    uid = hashlib.md5(email.encode()).hexdigest()[:16]
    if uid not in USERS:
        name = data.get('name') or email.split('@')[0].title()
        USERS[uid] = {"id": uid, "email": email, "name": name,
                      "avatar": name[0].upper(), "timezone": "UTC",
                      "created_at": date.today().isoformat(), "theme": "light", "week_start": "monday"}
        TASKS[uid] = []; HABITS[uid] = []; EVENTS[uid] = []
        ROUTINES[uid] = []; GOALS[uid] = []; NOTES[uid] = []
    token = str(uuid.uuid4())
    SESSIONS[token] = uid
    return jsonify({"token": token, "user": USERS[uid]})

@app.route('/api/auth/me', methods=['GET'])
def me():
    uid = get_uid(request)
    if not uid or uid not in USERS:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify(USERS[uid])

@app.route('/api/auth/me', methods=['PATCH'])
def update_me():
    uid = get_uid(request)
    if not uid: return jsonify({"error": "Unauthorized"}), 401
    data = request.json or {}
    for k in ('name', 'theme', 'week_start', 'timezone'):
        if k in data: USERS[uid][k] = data[k]
    return jsonify(USERS[uid])

# ─── Tasks ────────────────────────────────────────────────────────────────────
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    uid = get_uid(request)
    if not uid: return jsonify([])
    tasks = TASKS.get(uid, [])
    # Filter by date if provided
    d = request.args.get('date')
    if d: tasks = [t for t in tasks if t.get('date') == d]
    week = request.args.get('week')  # YYYY-WNN
    if week:
        # Return tasks for 7 days of that week
        year, wn = int(week.split('-W')[0]), int(week.split('-W')[1])
        start = datetime.strptime(f'{year}-W{wn:02d}-1', "%Y-W%W-%w").date()
        dates = [(start + timedelta(days=i)).isoformat() for i in range(7)]
        tasks = [t for t in tasks if t.get('date') in dates]
    backlog = request.args.get('backlog')
    if backlog: tasks = [t for t in tasks if not t.get('date')]
    return jsonify(sorted(tasks, key=lambda t: (t.get('time') or '99:99', t.get('order', 0))))

@app.route('/api/tasks', methods=['POST'])
def create_task():
    uid = get_uid(request)
    if not uid: return jsonify({"error": "Unauthorized"}), 401
    d = request.json or {}
    task = {
        "id": str(uuid.uuid4()),
        "title": d.get('title', 'New task'),
        "category": d.get('category', 'personal'),
        "priority": d.get('priority', 'medium'),
        "done": False,
        "date": d.get('date'),
        "time": d.get('time'),
        "duration": d.get('duration', 30),
        "color": d.get('color', '#3B82F6'),
        "tags": d.get('tags', []),
        "notes": d.get('notes', ''),
        "recurring": d.get('recurring'),
        "order": len(TASKS.get(uid, []))
    }
    TASKS.setdefault(uid, []).append(task)
    return jsonify(task), 201

@app.route('/api/tasks/<tid>', methods=['GET'])
def get_task(tid):
    uid = get_uid(request)
    if not uid: return jsonify({}), 404
    for t in TASKS.get(uid, []):
        if t['id'] == tid: return jsonify(t)
    return jsonify({}), 404

@app.route('/api/tasks/<tid>', methods=['PATCH'])
def update_task(tid):
    uid = get_uid(request)
    if not uid: return jsonify({"error": "Unauthorized"}), 401
    data = request.json or {}
    for t in TASKS.get(uid, []):
        if t['id'] == tid:
            t.update({k: v for k, v in data.items() if k != 'id'})
            return jsonify(t)
    return jsonify({"error": "Not found"}), 404

@app.route('/api/tasks/<tid>', methods=['DELETE'])
def delete_task(tid):
    uid = get_uid(request)
    if not uid: return jsonify({"error": "Unauthorized"}), 401
    TASKS[uid] = [t for t in TASKS.get(uid, []) if t['id'] != tid]
    return jsonify({"ok": True})

@app.route('/api/tasks/reorder', methods=['POST'])
def reorder_tasks():
    uid = get_uid(request)
    if not uid: return jsonify({"error": "Unauthorized"}), 401
    data = request.json or {}  # [{id, order, date}]
    for item in data:
        for t in TASKS.get(uid, []):
            if t['id'] == item['id']:
                t['order'] = item.get('order', t['order'])
                if 'date' in item: t['date'] = item['date']
                if 'time' in item: t['time'] = item['time']
    return jsonify({"ok": True})

# ─── Habits ───────────────────────────────────────────────────────────────────
@app.route('/api/habits', methods=['GET'])
def get_habits():
    uid = get_uid(request)
    if not uid: return jsonify([])
    return jsonify(HABITS.get(uid, []))

@app.route('/api/habits', methods=['POST'])
def create_habit():
    uid = get_uid(request)
    if not uid: return jsonify({"error": "Unauthorized"}), 401
    d = request.json or {}
    habit = {
        "id": str(uuid.uuid4()),
        "name": d.get('name', 'New Habit'),
        "icon": d.get('icon', '⭐'),
        "color": d.get('color', '#3B82F6'),
        "category": d.get('category', 'personal'),
        "target_days": d.get('target_days', 'daily'),
        "completions": [],
        "reminder": d.get('reminder'),
        "streak": 0, "best_streak": 0
    }
    HABITS.setdefault(uid, []).append(habit)
    return jsonify(habit), 201

@app.route('/api/habits/<hid>/toggle', methods=['POST'])
def toggle_habit(hid):
    uid = get_uid(request)
    if not uid: return jsonify({"error": "Unauthorized"}), 401
    data = request.json or {}
    d = data.get('date', date.today().isoformat())
    for h in HABITS.get(uid, []):
        if h['id'] == hid:
            if d in h['completions']: h['completions'].remove(d)
            else: h['completions'].append(d)
            # Recalculate streak
            streak = 0
            check = date.today()
            while True:
                if check.isoformat() in h['completions']:
                    streak += 1; check -= timedelta(days=1)
                else: break
            h['streak'] = streak
            h['best_streak'] = max(h.get('best_streak', 0), streak)
            return jsonify(h)
    return jsonify({"error": "Not found"}), 404

@app.route('/api/habits/<hid>', methods=['PATCH'])
def update_habit(hid):
    uid = get_uid(request)
    if not uid: return jsonify({"error": "Unauthorized"}), 401
    data = request.json or {}
    for h in HABITS.get(uid, []):
        if h['id'] == hid:
            h.update({k: v for k, v in data.items() if k != 'id'})
            return jsonify(h)
    return jsonify({"error": "Not found"}), 404

@app.route('/api/habits/<hid>', methods=['DELETE'])
def delete_habit(hid):
    uid = get_uid(request)
    if not uid: return jsonify({"error": "Unauthorized"}), 401
    HABITS[uid] = [h for h in HABITS.get(uid, []) if h['id'] != hid]
    return jsonify({"ok": True})

# ─── Events (Calendar) ────────────────────────────────────────────────────────
@app.route('/api/events', methods=['GET'])
def get_events():
    uid = get_uid(request)
    if not uid: return jsonify([])
    events = EVENTS.get(uid, [])
    month = request.args.get('month')  # YYYY-MM
    if month:
        events = [e for e in events if e['start_date'].startswith(month) or e['end_date'].startswith(month)]
    return jsonify(events)

@app.route('/api/events', methods=['POST'])
def create_event():
    uid = get_uid(request)
    if not uid: return jsonify({"error": "Unauthorized"}), 401
    d = request.json or {}
    event = {
        "id": str(uuid.uuid4()),
        "title": d.get('title', 'New Event'),
        "category": d.get('category', 'personal'),
        "start_date": d.get('start_date', date.today().isoformat()),
        "end_date": d.get('end_date', date.today().isoformat()),
        "start_time": d.get('start_time'),
        "end_time": d.get('end_time'),
        "color": d.get('color', '#3B82F6'),
        "all_day": d.get('all_day', True),
        "notes": d.get('notes', ''),
        "location": d.get('location', '')
    }
    EVENTS.setdefault(uid, []).append(event)
    return jsonify(event), 201

@app.route('/api/events/<eid>', methods=['PATCH'])
def update_event(eid):
    uid = get_uid(request)
    if not uid: return jsonify({"error": "Unauthorized"}), 401
    data = request.json or {}
    for e in EVENTS.get(uid, []):
        if e['id'] == eid:
            e.update({k: v for k, v in data.items() if k != 'id'})
            return jsonify(e)
    return jsonify({"error": "Not found"}), 404

@app.route('/api/events/<eid>', methods=['DELETE'])
def delete_event(eid):
    uid = get_uid(request)
    if not uid: return jsonify({"error": "Unauthorized"}), 401
    EVENTS[uid] = [e for e in EVENTS.get(uid, []) if e['id'] != eid]
    return jsonify({"ok": True})

# ─── Routines ─────────────────────────────────────────────────────────────────
@app.route('/api/routines', methods=['GET'])
def get_routines():
    uid = get_uid(request)
    if not uid: return jsonify([])
    return jsonify(ROUTINES.get(uid, []))

@app.route('/api/routines', methods=['POST'])
def create_routine():
    uid = get_uid(request)
    if not uid: return jsonify({"error": "Unauthorized"}), 401
    d = request.json or {}
    routine = {
        "id": str(uuid.uuid4()),
        "name": d.get('name', 'New Routine'),
        "icon": d.get('icon', '🔄'),
        "time": d.get('time', '08:00'),
        "days": d.get('days', 'daily'),
        "color": d.get('color', '#3B82F6'),
        "steps": d.get('steps', []),
        "duration": d.get('duration', 30),
        "active": True
    }
    ROUTINES.setdefault(uid, []).append(routine)
    return jsonify(routine), 201

@app.route('/api/routines/<rid>', methods=['PATCH'])
def update_routine(rid):
    uid = get_uid(request)
    if not uid: return jsonify({"error": "Unauthorized"}), 401
    data = request.json or {}
    for r in ROUTINES.get(uid, []):
        if r['id'] == rid:
            r.update({k: v for k, v in data.items() if k != 'id'})
            return jsonify(r)
    return jsonify({"error": "Not found"}), 404

@app.route('/api/routines/<rid>', methods=['DELETE'])
def delete_routine(rid):
    uid = get_uid(request)
    if not uid: return jsonify({"error": "Unauthorized"}), 401
    ROUTINES[uid] = [r for r in ROUTINES.get(uid, []) if r['id'] != rid]
    return jsonify({"ok": True})

# ─── Goals ────────────────────────────────────────────────────────────────────
@app.route('/api/goals', methods=['GET'])
def get_goals():
    uid = get_uid(request)
    if not uid: return jsonify([])
    return jsonify(GOALS.get(uid, []))

@app.route('/api/goals', methods=['POST'])
def create_goal():
    uid = get_uid(request)
    if not uid: return jsonify({"error": "Unauthorized"}), 401
    d = request.json or {}
    goal = {
        "id": str(uuid.uuid4()),
        "title": d.get('title', 'New Goal'),
        "category": d.get('category', 'personal'),
        "color": d.get('color', '#3B82F6'),
        "target_date": d.get('target_date', (date.today() + timedelta(days=30)).isoformat()),
        "progress": 0,
        "milestones": d.get('milestones', []),
        "notes": d.get('notes', '')
    }
    GOALS.setdefault(uid, []).append(goal)
    return jsonify(goal), 201

@app.route('/api/goals/<gid>', methods=['PATCH'])
def update_goal(gid):
    uid = get_uid(request)
    if not uid: return jsonify({"error": "Unauthorized"}), 401
    data = request.json or {}
    for g in GOALS.get(uid, []):
        if g['id'] == gid:
            g.update({k: v for k, v in data.items() if k != 'id'})
            return jsonify(g)
    return jsonify({"error": "Not found"}), 404

@app.route('/api/goals/<gid>', methods=['DELETE'])
def delete_goal(gid):
    uid = get_uid(request)
    if not uid: return jsonify({"error": "Unauthorized"}), 401
    GOALS[uid] = [g for g in GOALS.get(uid, []) if g['id'] != gid]
    return jsonify({"ok": True})

# ─── Notes ────────────────────────────────────────────────────────────────────
@app.route('/api/notes', methods=['GET'])
def get_notes():
    uid = get_uid(request)
    if not uid: return jsonify([])
    return jsonify(sorted(NOTES.get(uid, []), key=lambda n: (-n.get('pinned', False), n['updated_at']), reverse=False))

@app.route('/api/notes', methods=['POST'])
def create_note():
    uid = get_uid(request)
    if not uid: return jsonify({"error": "Unauthorized"}), 401
    d = request.json or {}
    note = {
        "id": str(uuid.uuid4()),
        "title": d.get('title', 'New Note'),
        "content": d.get('content', ''),
        "color": d.get('color', '#F5F0E8'),
        "pinned": d.get('pinned', False),
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    NOTES.setdefault(uid, []).append(note)
    return jsonify(note), 201

@app.route('/api/notes/<nid>', methods=['PATCH'])
def update_note(nid):
    uid = get_uid(request)
    if not uid: return jsonify({"error": "Unauthorized"}), 401
    data = request.json or {}
    for n in NOTES.get(uid, []):
        if n['id'] == nid:
            n.update({k: v for k, v in data.items() if k != 'id'})
            n['updated_at'] = datetime.now().isoformat()
            return jsonify(n)
    return jsonify({"error": "Not found"}), 404

@app.route('/api/notes/<nid>', methods=['DELETE'])
def delete_note(nid):
    uid = get_uid(request)
    if not uid: return jsonify({"error": "Unauthorized"}), 401
    NOTES[uid] = [n for n in NOTES.get(uid, []) if n['id'] != nid]
    return jsonify({"ok": True})

# ─── Dashboard stats ──────────────────────────────────────────────────────────
@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    uid = get_uid(request)
    if not uid: return jsonify({}), 401

    today_str = date.today().isoformat()
    tasks = TASKS.get(uid, [])
    habits = HABITS.get(uid, [])
    goals = GOALS.get(uid, [])

    today_tasks = [t for t in tasks if t.get('date') == today_str]
    done_today = [t for t in today_tasks if t.get('done')]
    pending_today = [t for t in today_tasks if not t.get('done')]

    # Habits today
    habits_due_today = []
    for h in habits:
        td = h.get('target_days', 'daily')
        day_name = date.today().strftime('%a').lower()[:3]
        if td == 'daily' or day_name in (td or ''):
            habits_due_today.append(h)
    habits_done_today = [h for h in habits_due_today if today_str in h.get('completions', [])]

    # Weekly stats (last 7 days)
    weekly = {}
    for i in range(7):
        d = (date.today() - timedelta(days=i)).isoformat()
        day_tasks = [t for t in tasks if t.get('date') == d]
        weekly[d] = {
            "total": len(day_tasks),
            "done": len([t for t in day_tasks if t.get('done')]),
            "habits": len([h for h in habits if d in h.get('completions', [])])
        }

    # Completion rate this week
    week_total = sum(v['total'] for v in weekly.values())
    week_done = sum(v['done'] for v in weekly.values())
    completion_rate = round(week_done / week_total * 100) if week_total else 0

    # Top streak habit
    top_habit = max(habits, key=lambda h: h.get('streak', 0), default=None)

    # Category breakdown (today)
    cats = {}
    for t in today_tasks:
        c = t.get('category', 'other')
        cats[c] = cats.get(c, 0) + 1

    return jsonify({
        "today": {
            "date": today_str,
            "tasks_total": len(today_tasks),
            "tasks_done": len(done_today),
            "tasks_pending": len(pending_today),
            "completion_rate": round(len(done_today) / len(today_tasks) * 100) if today_tasks else 0,
        },
        "habits": {
            "due_today": len(habits_due_today),
            "done_today": len(habits_done_today),
            "rate": round(len(habits_done_today) / len(habits_due_today) * 100) if habits_due_today else 0,
            "top_streak": top_habit['name'] if top_habit else None,
            "top_streak_days": top_habit['streak'] if top_habit else 0,
        },
        "goals": {
            "total": len(goals),
            "avg_progress": round(sum(g['progress'] for g in goals) / len(goals)) if goals else 0,
        },
        "weekly": weekly,
        "week_completion": completion_rate,
        "category_breakdown": cats,
    })

@app.route('/api/health')
def health():
    return jsonify({"status": "ok", "ts": datetime.now().isoformat()})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
