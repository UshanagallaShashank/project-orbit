# agents/job_agent.py - Job Search Agent
# ----------------------------------------
# Searches LinkedIn and Naukri for jobs matching the user's resume profile.
#
# Flow:
#   1. Try to get resume profile from resume_agent context (passed via message or DB)
#      If not available, fetch the resume directly and extract skills/roles.
#   2. Build search queries: "site:linkedin.com/jobs <role> <skills>"
#   3. Run DuckDuckGo text search for each query
#   4. Pass results + profile to LLM for a formatted, personalised reply
#
# WHY DuckDuckGo?
#   LinkedIn and Naukri block direct scraping. DuckDuckGo indexes their job
#   pages and returns snippets + URLs without requiring API keys or headless
#   browsers. The job titles, companies, and links come from DDG's index.

from typing import Optional
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from agents.agent_factory import (
    make_llm, make_chain, make_tool_schema, run_plain_agent,
)
from prompts.job_prompt import SYSTEM_PROMPT
from utils.history import get_history, save_messages
from utils.summarize import maybe_summarize
from config import supabase

AGENT = "job"

MAX_RESULTS_PER_QUERY = 4
MAX_RESUME_CHARS       = 4000


class Job(BaseModel):
    title:   str
    company: str = ""
    source:  str = ""   # "LinkedIn" | "Naukri" | "Other"
    url:     str = ""
    snippet: str = ""


class JobAgentResponse(BaseModel):
    reply: str
    jobs:  list[Job] = Field(default_factory=list)


TOOL_SCHEMA = make_tool_schema(
    name="JobAgentResponse",
    description="Return job search results and a personalised reply.",
    extra_properties={
        "jobs": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title":   {"type": "string"},
                    "company": {"type": "string"},
                    "source":  {"type": "string"},
                    "url":     {"type": "string"},
                    "snippet": {"type": "string"},
                },
                "required": ["title"],
            },
            "description": "Job listings found for the user.",
        }
    },
)

llm = make_llm()


def _fetch_resume_profile(user_id: str) -> dict:
    """Read the latest resume from documents table, return basic profile."""
    res = (
        supabase.table("documents")
        .select("content")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if not res.data:
        return {}
    content = (res.data[0].get("content") or "")[:MAX_RESUME_CHARS]
    return {"raw_text": content}


def _ddg_search(query: str, max_results: int = MAX_RESULTS_PER_QUERY) -> list[dict]:
    """Run a DuckDuckGo text search, return list of {title, href, body} dicts."""
    try:
        from duckduckgo_search import DDGS
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))
        return results
    except Exception:
        return []


def _source_from_url(url: str) -> str:
    if "linkedin.com" in url:
        return "LinkedIn"
    if "naukri.com" in url:
        return "Naukri"
    return "Other"


def _search_jobs(skills: list[str], roles: list[str], extra_query: str = "") -> list[dict]:
    """Build and run job search queries, return raw DDG results."""
    skill_str = " ".join(skills[:4]) if skills else ""
    queries   = []

    for role in (roles[:2] if roles else ["software engineer"]):
        if skill_str:
            queries.append(f'site:linkedin.com/jobs "{role}" {skill_str}')
            queries.append(f'site:naukri.com "{role}" {skill_str}')
        else:
            queries.append(f'site:linkedin.com/jobs "{role}"')
            queries.append(f'site:naukri.com "{role}"')

    if extra_query:
        queries.append(f'site:linkedin.com/jobs {extra_query}')

    all_results = []
    seen_urls   = set()
    for q in queries[:4]:  # cap at 4 queries to stay fast
        for r in _ddg_search(q):
            url = r.get("href", "")
            if url not in seen_urls:
                seen_urls.add(url)
                all_results.append(r)
        if len(all_results) >= 10:
            break

    return all_results


def _format_results_for_llm(results: list[dict]) -> str:
    if not results:
        return "No job listings found."
    lines = []
    for i, r in enumerate(results[:8], 1):
        lines.append(
            f"{i}. {r.get('title', 'Job')} | {r.get('href', '')} | {r.get('body', '')[:200]}"
        )
    return "\n".join(lines)


def run(user_id: str, message: str, _resume_profile: Optional[dict] = None) -> dict:
    # Step 1: get profile (may come from resume_agent via orchestrator merge, or fetch fresh)
    profile = _resume_profile or {}
    skills  = profile.get("skills", [])
    roles   = profile.get("roles", [])

    if not skills and not roles:
        raw = _fetch_resume_profile(user_id)
        # Use the raw text as extra query context if no structured profile yet
        raw_text = raw.get("raw_text", "")
        # Extract a rough query from the first 200 chars of resume
        extra_query = raw_text[:200].replace("\n", " ") if raw_text else message
    else:
        extra_query = ""

    # Step 2: search
    search_results = _search_jobs(skills, roles, extra_query=extra_query or message)
    results_text   = _format_results_for_llm(search_results)

    profile_text = (
        f"Skills: {', '.join(skills)}\nRoles: {', '.join(roles)}"
        if (skills or roles)
        else "No resume profile available."
    )

    system = (
        SYSTEM_PROMPT
        + f"\n\n[USER PROFILE:\n{profile_text}\n]"
        + f"\n\n[JOB SEARCH RESULTS:\n{results_text}\n]"
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system),
        MessagesPlaceholder("history"),
        ("human", "{input}"),
    ])
    chain = make_chain(prompt, llm, JobAgentResponse, TOOL_SCHEMA)

    history, count = get_history(user_id, AGENT)
    result: JobAgentResponse | None = chain.invoke({"history": history, "input": message})

    if result is None:
        return run_plain_agent(user_id, AGENT, message, prompt | llm, llm)

    save_messages(user_id, AGENT, message, result.reply)
    maybe_summarize(user_id, AGENT, count + 1, llm)

    # Convert Job objects to plain dicts for JSON serialisation
    jobs_list = [j.model_dump() for j in result.jobs]

    return {
        "reply": result.reply,
        "jobs":  jobs_list,
    }
