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
from utils.resume_builder import get_resume_data

AGENT = "job"

MAX_RESULTS_PER_QUERY = 4


class Job(BaseModel):
    title:            str
    company:          str = ""
    source:           str = ""   # "LinkedIn" | "Naukri" | "Other"
    url:              str = ""
    snippet:          str = ""
    match_score:      int = 0    # 1-10: how well this role matches the user's profile
    required_skills:  list[str] = Field(default_factory=list)  # skills this role needs
    missing_skills:   list[str] = Field(default_factory=list)  # skills user lacks for this role


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
                    "title":           {"type": "string"},
                    "company":         {"type": "string"},
                    "source":          {"type": "string"},
                    "url":             {"type": "string"},
                    "snippet":         {"type": "string"},
                    "match_score":     {"type": "integer", "description": "1-10 match score based on user's resume profile"},
                    "required_skills": {"type": "array", "items": {"type": "string"}, "description": "Skills this role requires"},
                    "missing_skills":  {"type": "array", "items": {"type": "string"}, "description": "Skills user lacks for this role"},
                },
                "required": ["title"],
            },
            "description": "Job listings found for the user, scored against their resume profile.",
        }
    },
)

llm = make_llm()


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
    # Step 1: get structured profile
    # Priority: orchestrator passes it from resume_agent -> else read from [RESUME] memories
    # WHY memories and not documents table?
    #   resume_parser.py already extracted structured skills/roles into memories on upload.
    #   That is much more useful than 200 chars of raw PDF text.
    profile = _resume_profile or {}
    skills  = profile.get("skills", [])
    roles   = profile.get("roles", [])

    resume_data: dict = {}
    if not skills and not roles:
        resume_data = get_resume_data(user_id)
        skills = resume_data.get("skills", [])
        roles  = resume_data.get("roles", [])

    # Step 2: search
    search_results = _search_jobs(skills, roles, extra_query="" if (skills or roles) else message)
    results_text   = _format_results_for_llm(search_results)

    if skills or roles:
        exp = resume_data.get("total_experience") or profile.get("total_experience", "")
        profile_parts = [f"Skills: {', '.join(skills)}", f"Target roles: {', '.join(roles)}"]
        if exp:
            profile_parts.append(f"Experience: {exp}")
        profile_text = "\n".join(profile_parts)
    else:
        profile_text = "No resume profile found. No resume uploaded yet."

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
