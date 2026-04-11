# agents/orchestrator_agent.py — The AI Brain
# ─────────────────────────────────────────────
# ONE job: take user message + history → ask Gemini → save → return reply.
#
# Shared DB logic (get_history, save_messages, summarize) lives in utils/.
# This file only owns: the LLM, the prompt, and the run logic.

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from config import settings
from prompts.orchestrator_prompt import SYSTEM_PROMPT
from utils.history import get_history, save_messages
from utils.summarize import maybe_summarize

AGENT = "orchestrator"

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", google_api_key=settings.GOOGLE_API_KEY)

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    MessagesPlaceholder("history"),
    ("human", "{input}"),
])

chain = prompt | llm


def run(user_id: str, message: str) -> dict:
    history, count = get_history(user_id, AGENT)
    reply = chain.invoke({"history": history, "input": message}).content
    maybe_summarize(user_id, AGENT, count, llm)
    save_messages(user_id, AGENT, message, reply)
    return {"reply": reply}


async def run_stream(user_id: str, message: str):
    history, count = get_history(user_id, AGENT)
    full_reply = []

    async for chunk in chain.astream({"history": history, "input": message}):
        token = chunk.content
        if token:
            full_reply.append(token)
            yield token

    reply = "".join(full_reply)
    maybe_summarize(user_id, AGENT, count, llm)
    save_messages(user_id, AGENT, message, reply)
