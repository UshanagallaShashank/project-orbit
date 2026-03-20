"""
Memory tools — store and retrieve persistent key-value facts about the user.
Backed by a local JSON file. Keys are namespaced strings (e.g. 'preference.theme').
"""

import json
from datetime import datetime, timezone

from orbit.config import MEMORY_FILE


# ── helpers ──────────────────────────────────────────────────────────────────

def _load() -> dict:
    if not MEMORY_FILE.exists():
        return {}
    return json.loads(MEMORY_FILE.read_text(encoding="utf-8"))


def _save(memory: dict) -> None:
    MEMORY_FILE.write_text(json.dumps(memory, indent=2, ensure_ascii=False), encoding="utf-8")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── tools ─────────────────────────────────────────────────────────────────────

def remember(key: str, value: str) -> dict:
    """Store a fact or preference about the user under a named key.

    Use dot-notation for namespacing (e.g. 'preference.theme', 'goal.career').
    If the key already exists it will be overwritten.

    Args:
        key: The memory key. Use dot-notation for categories (e.g. 'preference.language').
        value: The value to store. Can be any string — a fact, preference, or note.

    Returns:
        dict: Confirmation with the stored key and value.
    """
    memory = _load()
    memory[key] = {"value": value, "updated_at": _now()}
    _save(memory)
    return {"status": "success", "key": key, "value": value}


def recall(key: str) -> dict:
    """Retrieve a previously stored fact or preference by key.

    Args:
        key: The exact memory key to look up.

    Returns:
        dict: The stored value and when it was saved, or an error if not found.
    """
    memory = _load()
    if key not in memory:
        return {"status": "error", "error_message": f"No memory found for key '{key}'."}
    entry = memory[key]
    return {"status": "success", "key": key, "value": entry["value"], "updated_at": entry["updated_at"]}


def list_memories(prefix: str = "") -> dict:
    """List all stored memory keys, optionally filtered by a prefix.

    Args:
        prefix: Optional prefix to filter keys (e.g. 'preference' returns all preference.* keys).
                Leave empty to return all keys.

    Returns:
        dict: A dict of all matching key → value pairs.
    """
    memory = _load()
    result = {
        k: v["value"]
        for k, v in memory.items()
        if k.startswith(prefix)
    }
    return {"status": "success", "memories": result, "count": len(result)}


def forget(key: str) -> dict:
    """Delete a specific memory entry by key.

    Args:
        key: The exact memory key to remove.

    Returns:
        dict: Confirmation or error if key was not found.
    """
    memory = _load()
    if key not in memory:
        return {"status": "error", "error_message": f"No memory found for key '{key}'."}
    del memory[key]
    _save(memory)
    return {"status": "success", "message": f"Memory '{key}' deleted."}


def search_memories(query: str) -> dict:
    """Search memory entries whose key or value contains the query string (case-insensitive).

    Args:
        query: The search string to match against keys and values.

    Returns:
        dict: Matching key → value pairs.
    """
    memory = _load()
    q = query.lower()
    result = {
        k: v["value"]
        for k, v in memory.items()
        if q in k.lower() or q in v["value"].lower()
    }
    return {"status": "success", "memories": result, "count": len(result)}
