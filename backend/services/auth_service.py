"""
Meridian Planner — Authentication Service
"""
from __future__ import annotations

import hashlib
import uuid
from datetime import date

from services.store import store


class AuthService:
    """Handles login, session management and user CRUD."""

    DEMO_EMAILS = {"demo@meridian.app", "demo"}
    ADMIN_EMAILS = {"jose@meridian.app", "josecaceres", "admin@meridian.app", "jose"}

    # ── Login ────────────────────────────────────────────────────────────────

    def login(self, email: str, password: str, name: str | None = None) -> dict:
        """
        Authenticate a user by email.
        Returns ``{"token": ..., "user": ...}`` on success.
        Raises ``ValueError`` on failure.
        """
        email = email.lower().strip()
        if not email:
            raise ValueError("Email required")

        # Demo account — always allow
        if email in self.DEMO_EMAILS:
            return self._create_session("demo-001")

        # Admin account
        if email in self.ADMIN_EMAILS:
            return self._create_session("admin-jose")

        # Regular user — find or create
        uid = hashlib.md5(email.encode()).hexdigest()[:16]
        if uid not in store.users:
            display_name = name or email.split("@")[0].title()
            store.users[uid] = {
                "id": uid,
                "email": email,
                "name": display_name,
                "avatar": display_name[0].upper(),
                "timezone": "UTC",
                "created_at": date.today().isoformat(),
                "theme": "light",
                "week_start": "monday",
                "role": "user",
            }
            store.init_user_collections(uid)
            if password:
                store.passwords[uid] = store.hash_password(password)
        else:
            # Existing user — verify password if one is set
            if password and uid in store.passwords:
                if store.hash_password(password) != store.passwords[uid]:
                    raise ValueError("Incorrect password")
            elif password and uid not in store.passwords:
                store.passwords[uid] = store.hash_password(password)

        return self._create_session(uid)

    # ── Session helpers ──────────────────────────────────────────────────────

    def _create_session(self, uid: str) -> dict:
        token = str(uuid.uuid4())
        store.sessions[token] = uid
        return {"token": token, "user": store.users[uid]}

    @staticmethod
    def get_uid_from_token(token: str) -> str | None:
        return store.sessions.get(token)

    # ── Profile ──────────────────────────────────────────────────────────────

    @staticmethod
    def get_user(uid: str) -> dict | None:
        return store.users.get(uid)

    @staticmethod
    def update_user(uid: str, data: dict) -> dict | None:
        user = store.users.get(uid)
        if user is None:
            return None
        for key in ("name", "theme", "week_start", "timezone", "avatar"):
            if key in data:
                user[key] = data[key]
        return user


auth_service = AuthService()

