"""
Meridian Planner — In-Memory Data Store

Centralized store for all application data.
Easily replaceable with a real database later.
"""
from __future__ import annotations

import hashlib


class Store:
    """Singleton in-memory data store."""

    _instance: Store | None = None

    def __new__(cls) -> Store:
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialised = False
        return cls._instance

    def __init__(self) -> None:
        if self._initialised:
            return
        self._initialised = True

        self.users: dict[str, dict] = {}
        self.passwords: dict[str, str] = {}      # uid -> sha256(password)
        self.sessions: dict[str, str] = {}        # token -> uid
        self.tasks: dict[str, list[dict]] = {}    # uid -> [task]
        self.habits: dict[str, list[dict]] = {}   # uid -> [habit]
        self.events: dict[str, list[dict]] = {}   # uid -> [event]
        self.routines: dict[str, list[dict]] = {} # uid -> [routine]
        self.goals: dict[str, list[dict]] = {}    # uid -> [goal]
        self.notes: dict[str, list[dict]] = {}    # uid -> [note]

    # ── Helpers ──────────────────────────────────────────────────────────────

    @staticmethod
    def hash_password(password: str) -> str:
        return hashlib.sha256(password.encode()).hexdigest()

    def init_user_collections(self, uid: str) -> None:
        """Ensure every collection has an entry for *uid*."""
        self.tasks.setdefault(uid, [])
        self.habits.setdefault(uid, [])
        self.events.setdefault(uid, [])
        self.routines.setdefault(uid, [])
        self.goals.setdefault(uid, [])
        self.notes.setdefault(uid, [])

    # ── Generic CRUD helpers ─────────────────────────────────────────────────

    def get_collection(self, uid: str, collection: str) -> list[dict]:
        """Return the list for *collection* (e.g. 'tasks') belonging to *uid*."""
        coll = getattr(self, collection, None)
        if coll is None:
            raise ValueError(f"Unknown collection: {collection}")
        return coll.get(uid, [])

    def find_by_id(self, uid: str, collection: str, item_id: str) -> dict | None:
        for item in self.get_collection(uid, collection):
            if item["id"] == item_id:
                return item
        return None

    def add_item(self, uid: str, collection: str, item: dict) -> dict:
        coll = getattr(self, collection)
        coll.setdefault(uid, []).append(item)
        return item

    def update_item(
        self, uid: str, collection: str, item_id: str, data: dict
    ) -> dict | None:
        item = self.find_by_id(uid, collection, item_id)
        if item is None:
            return None
        item.update({k: v for k, v in data.items() if k != "id"})
        return item

    def delete_item(self, uid: str, collection: str, item_id: str) -> bool:
        coll = getattr(self, collection)
        items = coll.get(uid, [])
        before = len(items)
        coll[uid] = [i for i in items if i["id"] != item_id]
        return len(coll[uid]) < before


# Module-level singleton
store = Store()

