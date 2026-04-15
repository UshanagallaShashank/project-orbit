# agents/resume_agent.py - Resume Analysis Agent
# ------------------------------------------------
# Reads the user's uploaded documents from the `documents` table,
# injects the content into the prompt, then answers resume-related questions.
#
# Flow:
#   fetch_resume()   -> get latest document content from Supabase
#   build prompt     -> inject resume text as context in system prompt
#   chain.invoke()   -> LLM replies with resume analysis / tailoring advice
#
# Also returns a structured `profile` dict so job_agent can use it
# without running another LLM call.

from typing import Optional
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from agents.agent_factory import (
    make_llm, make_chain, make_tool_schema,
    run_plain_agent,
)
from prompts.resume_prompt import SYSTEM_PROMPT
from utils.history import get_history, save_messages
from utils.summarize import maybe_summarize
from config import supabase

AGENT = "resume"
MAX_RESUME_CHARS = 8000  # stay within token budget


class ResumeAgentResponse(BaseModel):
    reply: str
    skills:              list[str] = Field(default_factory=list, description="Key skills extracted from the resume")
    roles:               list[str] = Field(default_factory=list, description="Job titles / roles the candidate fits")
    years_of_experience: Optional[str] = Field(default=None, description="Total years of experience, e.g. '3 years'")
    tailored_content:    Optional[str] = Field(default=None, description="Full tailored resume text when the user asks to customize for a role or JD")
    missing_skills:      list[str] = Field(default_factory=list, description="Skills the JD or target role requires that are absent from the resume")
    matching_skills:     list[str] = Field(default_factory=list, description="Skills from the resume that directly match the target role or JD")


TOOL_SCHEMA = make_tool_schema(
    name="ResumeAgentResponse",
    description="Analyze the resume and answer the user's question.",
    extra_properties={
        "skills": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Key technical and soft skills found in the resume.",
        },
        "roles": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Job titles or roles the candidate is suited for.",
        },
        "years_of_experience": {
            "type": "string",
            "description": "Total estimated years of experience, e.g. '3 years'.",
        },
        "tailored_content": {
            "type": "string",
            "description": "Full tailored resume text when the user asks to customize for a role or job description. Null for non-tailoring requests.",
        },
        "missing_skills": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Skills the target role or JD requires that are missing from the resume.",
        },
        "matching_skills": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Skills from the resume that directly match the target role or JD.",
        },
    },
)

llm = make_llm()


def _fetch_resume(user_id: str) -> str:
    """Fetch the most recent uploaded document content for the user."""
    res = (
        supabase.table("documents")
        .select("filename, content")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(3)
        .execute()
    )
    if not res.data:
        return ""

    # Concatenate up to 3 most recent docs, each labelled by filename
    parts = []
    total = 0
    for doc in res.data:
        content = doc.get("content", "") or ""
        if content.startswith("[Image file:"):
            continue  # skip image placeholders
        label = f"--- {doc['filename']} ---\n"
        available = MAX_RESUME_CHARS - total - len(label)
        if available <= 0:
            break
        chunk = content[:available]
        parts.append(label + chunk)
        total += len(label) + len(chunk)

    return "\n\n".join(parts)


def run(user_id: str, message: str) -> dict:
    resume_text = _fetch_resume(user_id)

    if resume_text:
        system = (
            SYSTEM_PROMPT
            + f"\n\n[RESUME CONTEXT:\n{resume_text}\n]"
        )
    else:
        system = (
            SYSTEM_PROMPT
            + "\n\n[RESUME CONTEXT: No resume uploaded yet. "
            "Ask the user to upload their resume at the Documents page.]"
        )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system),
        MessagesPlaceholder("history"),
        ("human", "{input}"),
    ])
    chain = make_chain(prompt, llm, ResumeAgentResponse, TOOL_SCHEMA)

    history, count = get_history(user_id, AGENT)
    result: ResumeAgentResponse | None = chain.invoke({"history": history, "input": message})

    if result is None:
        return run_plain_agent(user_id, AGENT, message, prompt | llm, llm)

    save_messages(user_id, AGENT, message, result.reply)
    maybe_summarize(user_id, AGENT, count + 1, llm)

    return {
        "reply":               result.reply,
        "skills":              result.skills,
        "roles":               result.roles,
        "years_of_experience": result.years_of_experience,
        "tailored_content":    result.tailored_content,
        "missing_skills":      result.missing_skills,
        "matching_skills":     result.matching_skills,
        # Pass profile forward so job_agent can pick it up without re-reading the resume
        "_resume_profile": {
            "skills": result.skills,
            "roles":  result.roles,
        },
    }
