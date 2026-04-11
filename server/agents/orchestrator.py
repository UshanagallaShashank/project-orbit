# agents/orchestrator.py — The AI Brain
# ────────────────────────────────────────
# ONE job: take user message + history → ask Gemini → save → return reply.
#
# How LangChain works here:
#   prompt = the template with gaps ({ history }, { input })
#   llm    = the Gemini model
#   chain  = prompt | llm  →  fill gaps → send to Gemini → get reply
#
# Why save history?
#   AI has NO memory between calls. You must send the last N messages every time.
#   We save to Supabase, fetch on next call, send to Gemini. That's "memory".
#
# Why limit to 10 messages?
#   AI models charge by token (1 token ≈ 4 chars). Sending 100 messages = expensive + slow.

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from config import settings, supabase

# The Gemini model — gemini-2.5-flash-lite = fast and cheap
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", google_api_key=settings.GOOGLE_API_KEY)

# The prompt template
# MessagesPlaceholder = a gap where history gets inserted at runtime
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are Orbit, a helpful personal AI assistant. Be concise and friendly."),
    MessagesPlaceholder("history"),   # ← last 10 messages injected here
    ("human", "{input}"),             # ← current user message injected here
])

# chain = connect prompt → model. Call chain.invoke() to run the whole thing.
chain = prompt | llm


def get_history(user_id: str) -> list:
    # Fetch last 10 messages from Supabase for this user + this agent
    res = (
        supabase.table("messages")
        .select("role, content")
        .eq("user_id", user_id)        # only this user's messages
        .eq("agent", "orchestrator")   # only orchestrator messages
        .order("created_at", desc=True)
        .limit(10)
        .execute()
    )
    history = []
    for msg in res.data[::-1]:         # [::-1] reverses list → oldest first
        if msg["role"] == "user":
            history.append(HumanMessage(content=msg["content"]))
        else:
            history.append(AIMessage(content=msg["content"]))
    return history


def run(user_id: str, message: str) -> dict:
    history = get_history(user_id)

    # Fill the prompt gaps and send to Gemini
    response = chain.invoke({"history": history, "input": message})
    reply = response.content

    # Save both messages so next call has history
    supabase.table("messages").insert([
        {"user_id": user_id, "agent": "orchestrator", "role": "user",      "content": message},
        {"user_id": user_id, "agent": "orchestrator", "role": "assistant",  "content": reply},
    ]).execute()

    return {"reply": reply}


async def run_stream(user_id: str, message: str):
    # Same as run() but yields tokens as Gemini generates them
    history = get_history(user_id)

    full_reply = []

    async for chunk in chain.astream({"history": history, "input": message}):
        token = chunk.content
        if token:
            full_reply.append(token)
            yield token          # send each word to frontend immediately

    # Stream finished — now save both messages to DB
    reply = "".join(full_reply)
    supabase.table("messages").insert([
        {"user_id": user_id, "agent": "orchestrator", "role": "user",      "content": message},
        {"user_id": user_id, "agent": "orchestrator", "role": "assistant",  "content": reply},
    ]).execute()
