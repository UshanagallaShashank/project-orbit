# Calls any configured model through its provider's OpenAI-compatible chat API
import os

import httpx

PROVIDER_CONFIG: dict[str, tuple[str, str]] = {
    "grok": ("https://api.x.ai/v1/chat/completions", "XAI_API_KEY"),
    "gemini": (
        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        "GEMINI_API_KEY",
    ),
}


def complete(model: str, prompt: str) -> str:
    provider = "grok" if model.startswith("grok") else "gemini"
    url, key_name = PROVIDER_CONFIG[provider]
    headers = {"Authorization": f"Bearer {os.environ[key_name]}"}
    payload = {"model": model, "messages": [{"role": "user", "content": prompt}]}
    response = httpx.post(url, json=payload, headers=headers, timeout=60)
    response.raise_for_status()
    content = response.json()["choices"][0]["message"]["content"]
    return str(content)
