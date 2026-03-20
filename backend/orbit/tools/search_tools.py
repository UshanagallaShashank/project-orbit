"""
Search tools — web search using DuckDuckGo (no API key required).
Replaces ADK's built-in google_search to avoid the Gemini restriction that
prevents mixing grounding tools with function calling in the same request.
"""

from ddgs import DDGS


def web_search(query: str, max_results: int = 5) -> dict:
    """Search the web for up-to-date information on any topic.

    Args:
        query: The search query string.
        max_results: Number of results to return (default 5, max 10).

    Returns:
        dict: A list of results, each with 'title', 'url', and 'snippet'.
    """
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=min(max_results, 10)))

        if not results:
            return {"status": "error", "error_message": f"No results found for '{query}'."}

        formatted = [
            {
                "title": r.get("title", ""),
                "url": r.get("href", ""),
                "snippet": r.get("body", ""),
            }
            for r in results
        ]
        return {"status": "success", "query": query, "results": formatted, "count": len(formatted)}
    except Exception as e:
        return {"status": "error", "error_message": str(e)}


def fetch_page(url: str) -> dict:
    """Fetch and return the text content of a web page.

    Use this after web_search to read the full content of a specific result.

    Args:
        url: The full URL of the page to fetch.

    Returns:
        dict: The page title and text content (truncated to 4000 chars).
    """
    try:
        import urllib.request
        from html.parser import HTMLParser

        class _TextExtractor(HTMLParser):
            def __init__(self):
                super().__init__()
                self.text_parts = []
                self._skip = False

            def handle_starttag(self, tag, attrs):
                if tag in ("script", "style", "nav", "footer"):
                    self._skip = True

            def handle_endtag(self, tag):
                if tag in ("script", "style", "nav", "footer"):
                    self._skip = False

            def handle_data(self, data):
                if not self._skip:
                    stripped = data.strip()
                    if stripped:
                        self.text_parts.append(stripped)

        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode("utf-8", errors="ignore")

        parser = _TextExtractor()
        parser.feed(html)
        text = " ".join(parser.text_parts)[:4000]

        return {"status": "success", "url": url, "content": text}
    except Exception as e:
        return {"status": "error", "error_message": str(e)}
