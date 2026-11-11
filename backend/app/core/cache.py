"""
In-process TTL cache for HealthCore's Financial Metrics API.

Provides a simple dictionary-based cache with per-key TTL expiration
and prefix-based invalidation. Suitable for in-process use where
all cache entries share the same process memory.

Tradeoff: cache entries are potentially stale between their creation
and TTL expiry. This is an explicit tradeoff of freshness for performance.
"""

from __future__ import annotations

import time
from typing import Any

_store: dict[str, tuple[float, Any]] = {}


def cache_get(key: str) -> Any | None:
    """Return cached value for *key*, or None if missing or expired."""
    entry = _store.get(key)
    if entry is None:
        return None
    expires_at, value = entry
    if time.time() > expires_at:
        del _store[key]
        return None
    return value


def cache_set(key: str, value: Any, ttl_seconds: int) -> None:
    """Store *value* under *key* with a TTL of *ttl_seconds* seconds."""
    _store[key] = (time.time() + ttl_seconds, value)


def cache_invalidate_prefix(prefix: str) -> None:
    """Remove all cache entries whose key starts with *prefix*."""
    for key in list(_store.keys()):
        if key.startswith(prefix):
            del _store[key]


def cache_clear() -> None:
    """Remove every entry from the cache.  Useful in tests."""
    _store.clear()