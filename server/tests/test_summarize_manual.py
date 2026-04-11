# tests/test_summarize_manual.py
# -----------------------------------------------------
# Manual test: sends 11 messages and checks if summary was created.
#
# HOW TO RUN:
#   1. Start the server:  uvicorn main:app --reload
#   2. Run this script:   python tests/test_summarize_manual.py
#   3. Check Supabase:    Table "messages" -> look for role = "summary"

import httpx
import time

BASE_URL = "http://localhost:8000"
EMAIL    = "test@gmail.com"       # <- change to your test account
PASSWORD = "test123"          # <- change to your test password

# -- Step 1: Login -------------------------------------
print("Logging in...")
res = httpx.post(f"{BASE_URL}/api/auth/login", json={"email": EMAIL, "password": PASSWORD})

if res.status_code != 200:
    print(f"Login failed: {res.text}")
    print("Tip: Register first at http://localhost:8000/docs -> /api/auth/register")
    exit(1)

token = res.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print(f"Logged in!\n")

# -- Step 2: Send 10 messages --------------------------
questions = [
    "What is the difference between RAG and fine-tuning?",
    "When should I use a vector database?",
    "What is the best way to structure a FastAPI project?",
    "How does LangChain manage conversation history?",
    "What is the difference between synchronous and asynchronous code in Python?",
    "How do I write good system prompts for an AI agent?",
    "What is prompt chaining and when should I use it?",
    "How do I reduce hallucinations in LLM responses?",
    "What is the difference between Gemini Flash and Gemini Pro?",
    "How should I version control my AI prompts?",
]

print(f"Sending 10 messages...")
for i, q in enumerate(questions, 1):
    res = httpx.post(
        f"{BASE_URL}/api/chat/orchestrator",
        json={"message": q},
        headers=headers,
        timeout=30,
    )
    print(f"  [{i}/10] '{q[:40]}' -> {res.status_code}")
    time.sleep(0.5)   # small delay to avoid rate limiting

# -- Step 3: Send the 11th message ---------------------
print(f"\nSending message 11 - this should trigger summarization...")
res = httpx.post(
    f"{BASE_URL}/api/chat/orchestrator",
    json={"message": "Based on everything we discussed, what should I focus on next for Orbit?"},
    headers=headers,
    timeout=30,
)
print(f"Reply: {res.text}\n")

# -- Step 4: Instructions -------------------------------
print("=" * 55)
print("NOW CHECK SUPABASE:")
print("  Table: messages")
print("  Filter: role = 'summary'")
print("  You should see 1 summary row + 1 exchange row")
print("  The 10 old exchange rows should be GONE")
print("=" * 55)
