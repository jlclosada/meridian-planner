"""
Meridian Planner — Authentication Service
"""
from __future__ import annotations

import hashlib
import json
import uuid
from datetime import date
from urllib.request import urlopen

from services.store import store


class AuthService:
    """Handles login, signup, Google OAuth, session management and user CRUD."""

    DEMO_EMAILS = {"demo@meridian.app", "demo"}
    ADMIN_EMAILS = {"jose@meridian.app", "josecaceres", "admin@meridian.app", "jose"}

    # ── Login ────────────────────────────────────────────────────────────────

    def login(self, email: str, password: str, name: str | None = None) -> dict:
        email = email.lower().strip()
        if not email:
            raise ValueError("Email required")

        # Demo account
        if email in self.DEMO_EMAILS:
            return self._create_session("demo-001")

        # Admin account
        if email in self.ADMIN_EMAILS:
            return self._create_session("admin-jose")

        # Regular user — must exist
        uid = self._email_to_uid(email)
        if uid not in store.users:
            raise ValueError("No account found. Please sign up first.")

        # Verify password
        if uid in store.passwords:
            if not password:
                raise ValueError("Password required")
            if store.hash_password(password) != store.passwords[uid]:
                raise ValueError("Incorrect password")

        return self._create_session(uid)

    # ── Signup ───────────────────────────────────────────────────────────────

    def signup(self, email: str, password: str, name: str) -> dict:
        email = email.lower().strip()
        uid = self._email_to_uid(email)

        if uid in store.users:
            raise ValueError("An account with this email already exists")

        store.users[uid] = {
            "id": uid,
            "email": email,
            "name": name,
            "avatar": self._make_avatar(name),
            "timezone": "UTC",
            "created_at": date.today().isoformat(),
            "theme": "light",
            "week_start": "monday",
            "role": "user",
            "provider": "email",
        }
        store.passwords[uid] = store.hash_password(password)
        store.init_user_collections(uid)

        return self._create_session(uid)

    # ── Google OAuth ─────────────────────────────────────────────────────────

    def google_login(self, id_token: str) -> dict:
        """
        Verify a Google ID token and create/login user.
        In production, use google-auth library. This is a simplified version.
        """
        try:
            # Verify with Google's tokeninfo endpoint
            url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
            with urlopen(url, timeout=5) as resp:
                info = json.loads(resp.read().decode())
        except Exception:
            raise ValueError("Invalid Google token")

        email = info.get("email", "").lower().strip()
        if not email or info.get("email_verified") != "true":
            raise ValueError("Google account email not verified")

        name = info.get("name", email.split("@")[0].title())
        picture = info.get("picture", "")

        uid = self._email_to_uid(email)

        if uid not in store.users:
            # Auto-create account
            store.users[uid] = {
                "id": uid,
                "email": email,
                "name": name,
                "avatar": self._make_avatar(name),
                "timezone": "UTC",
                "created_at": date.today().isoformat(),
                "theme": "light",
                "week_start": "monday",
                "role": "user",
                "provider": "google",
                "picture": picture,
            }
            store.init_user_collections(uid)
        else:
            # Update picture if available
            if picture:
                store.users[uid]["picture"] = picture

        return self._create_session(uid)

    # ── Logout ───────────────────────────────────────────────────────────────

    @staticmethod
    def logout(token: str) -> None:
        store.sessions.pop(token, None)

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

    # ── Helpers ──────────────────────────────────────────────────────────────

    @staticmethod
    def _email_to_uid(email: str) -> str:
        return hashlib.md5(email.encode()).hexdigest()[:16]

    @staticmethod
    def _make_avatar(name: str) -> str:
        parts = name.strip().split()
        if len(parts) >= 2:
            return (parts[0][0] + parts[-1][0]).upper()
        return name[0].upper() if name else "?"


auth_service = AuthService()

