"""Minimal read-only Canvas LMS REST client.

Stdlib only, so a scheduled run works in a bare container with no pip step.
Each institution runs its own Canvas tenant, so one client == one school.

This client cannot write to Canvas. `_request` refuses any method other than
GET, so there is no code path -- present, unused, or added by accident later --
that posts on the instructor's behalf. Drafts go to a human, who posts them.
"""

from __future__ import annotations

import json
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request

_NEXT_LINK = re.compile(r'<([^>]+)>\s*;\s*rel="next"')


class CanvasError(RuntimeError):
    pass


class CanvasClient:
    def __init__(self, base_url: str, token: str, timeout: int = 30):
        if not token:
            raise CanvasError(f"no API token supplied for {base_url}")
        self.base_url = base_url.rstrip("/")
        self.token = token
        self.timeout = timeout

    @classmethod
    def from_school(cls, school: dict) -> "CanvasClient":
        """Build a client from a config.json school block."""
        env = school.get("token_env") or ""
        return cls(school["base_url"], os.environ.get(env, ""))

    # ---- transport -------------------------------------------------

    def _request(self, method: str, url: str):
        if method != "GET":
            raise CanvasError(
                f"{method} refused: this client is read-only by design. "
                f"Drafts are reviewed and posted by the instructor."
            )
        req = urllib.request.Request(url, method=method)
        req.add_header("Authorization", f"Bearer {self.token}")
        req.add_header("Accept", "application/json")

        last_err = None
        for attempt in range(4):
            try:
                with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                    payload = resp.read().decode("utf-8")
                    # Canvas prefixes JSON with an anti-XSSI guard on some routes.
                    payload = payload.lstrip()
                    if payload.startswith("while(1);"):
                        payload = payload[len("while(1);"):]
                    return json.loads(payload or "null"), dict(resp.headers)
            except urllib.error.HTTPError as exc:
                detail = exc.read().decode("utf-8", "replace")[:400]
                # Canvas reports throttling as 403 too, so read the body rather
                # than burning three backoffs on a token that will never work.
                throttled = exc.code == 403 and "rate limit" in detail.lower()
                if (throttled or exc.code in (429, 500, 502, 503, 504)) and attempt < 3:
                    last_err = exc
                    time.sleep(2 ** attempt)
                    continue
                if exc.code in (401, 403):
                    detail += (" -- check that the API token is valid, unexpired, "
                               "and belongs to an account enrolled in this course.")
                raise CanvasError(f"{method} {url} -> HTTP {exc.code}: {detail}") from exc
            except urllib.error.URLError as exc:
                if attempt < 3:
                    last_err = exc
                    time.sleep(2 ** attempt)
                    continue
                raise CanvasError(
                    f"{method} {url} unreachable: {exc.reason}. If this is a 403 on "
                    f"CONNECT, the environment network policy is still blocking Canvas."
                ) from exc
        raise CanvasError(f"{method} {url} failed after retries: {last_err}")

    # ---- verbs -----------------------------------------------------

    def get(self, path: str, **params):
        """GET one resource (no pagination follow)."""
        url = f"{self.base_url}{path}"
        if params:
            url += "?" + urllib.parse.urlencode(params, doseq=True)
        return self._request("GET", url)[0]

    def get_all(self, path: str, **params) -> list:
        """GET a collection, following RFC 5988 `rel="next"` links."""
        params.setdefault("per_page", 100)
        url = f"{self.base_url}{path}?" + urllib.parse.urlencode(params, doseq=True)
        out: list = []
        while url:
            page, headers = self._request("GET", url)
            if isinstance(page, list):
                out.extend(page)
            elif page is not None:
                out.append(page)
            match = _NEXT_LINK.search(headers.get("Link", "") or headers.get("link", ""))
            url = match.group(1) if match else None
        return out

    # ---- convenience ------------------------------------------------

    def whoami(self) -> dict:
        return self.get("/api/v1/users/self")

    def discussion_topics(self, course_id: int) -> list:
        return self.get_all(
            f"/api/v1/courses/{course_id}/discussion_topics",
            **{"exclude_assignment_descriptions": True},
        )

    def topic_view(self, course_id: int, topic_id: int) -> dict:
        """Full nested entry tree for a topic in a single call."""
        return self.get(
            f"/api/v1/courses/{course_id}/discussion_topics/{topic_id}/view"
        ) or {}
