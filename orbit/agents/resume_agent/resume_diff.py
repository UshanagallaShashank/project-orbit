# Produces a simple line-level diff between two resume version contents
import difflib


def diff_versions(old_content: str, new_content: str) -> list[str]:
    old_lines = old_content.splitlines()
    new_lines = new_content.splitlines()
    return list(difflib.unified_diff(old_lines, new_lines, lineterm=""))
