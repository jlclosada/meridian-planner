"""
Meridian Planner — Dashboard Service

Aggregates statistics for the dashboard view.
"""
from __future__ import annotations

from datetime import date, timedelta

from services.store import store


class DashboardService:
    """Computes dashboard statistics for a given user."""

    def get_stats(self, uid: str) -> dict:
        today_str = date.today().isoformat()
        tasks = store.get_collection(uid, "tasks")
        habits = store.get_collection(uid, "habits")
        goals = store.get_collection(uid, "goals")

        today_section = self._today_stats(tasks, today_str)
        habits_section = self._habit_stats(habits, today_str)
        goals_section = self._goal_stats(goals)
        weekly, week_completion = self._weekly_stats(tasks, habits)
        category_breakdown = self._category_breakdown(tasks, today_str)
        backlog_count = sum(
            1 for t in tasks if not t.get("date") and not t.get("done")
        )

        return {
            "today": today_section,
            "habits": habits_section,
            "goals": goals_section,
            "weekly": weekly,
            "week_completion": week_completion,
            "category_breakdown": category_breakdown,
            "backlog_count": backlog_count,
        }

    # ── Private helpers ──────────────────────────────────────────────────────

    @staticmethod
    def _today_stats(tasks: list[dict], today_str: str) -> dict:
        today_tasks = [t for t in tasks if t.get("date") == today_str]
        done = [t for t in today_tasks if t.get("done")]
        return {
            "date": today_str,
            "tasks_total": len(today_tasks),
            "tasks_done": len(done),
            "tasks_pending": len(today_tasks) - len(done),
            "completion_rate": (
                round(len(done) / len(today_tasks) * 100) if today_tasks else 0
            ),
        }

    @staticmethod
    def _habit_stats(habits: list[dict], today_str: str) -> dict:
        day_name = date.today().strftime("%a").lower()[:3]
        due = [
            h
            for h in habits
            if h.get("target_days") == "daily"
            or day_name in (h.get("target_days") or "")
        ]
        done = [h for h in due if today_str in h.get("completions", [])]
        top = max(habits, key=lambda h: h.get("streak", 0), default=None)
        return {
            "due_today": len(due),
            "done_today": len(done),
            "rate": round(len(done) / len(due) * 100) if due else 0,
            "top_streak": top["name"] if top else None,
            "top_streak_days": top["streak"] if top else 0,
        }

    @staticmethod
    def _goal_stats(goals: list[dict]) -> dict:
        return {
            "total": len(goals),
            "avg_progress": (
                round(sum(g["progress"] for g in goals) / len(goals))
                if goals
                else 0
            ),
        }

    @staticmethod
    def _weekly_stats(
        tasks: list[dict], habits: list[dict]
    ) -> tuple[dict, int]:
        weekly: dict[str, dict] = {}
        for i in range(7):
            d = (date.today() - timedelta(days=i)).isoformat()
            day_tasks = [t for t in tasks if t.get("date") == d]
            weekly[d] = {
                "total": len(day_tasks),
                "done": sum(1 for t in day_tasks if t.get("done")),
                "habits": sum(
                    1 for h in habits if d in h.get("completions", [])
                ),
            }
        total = sum(v["total"] for v in weekly.values())
        done = sum(v["done"] for v in weekly.values())
        rate = round(done / total * 100) if total else 0
        return weekly, rate

    @staticmethod
    def _category_breakdown(tasks: list[dict], today_str: str) -> dict:
        cats: dict[str, int] = {}
        for t in tasks:
            if t.get("date") == today_str:
                c = t.get("category", "other")
                cats[c] = cats.get(c, 0) + 1
        return cats


dashboard_service = DashboardService()

