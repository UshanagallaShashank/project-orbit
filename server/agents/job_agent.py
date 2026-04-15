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

# Skills that signal an AI-focused candidate — expand role search to AI synonyms
_AI_SKILLS = {"langchain", "langgraph", "rag", "langsmith", "openai", "gemini", "huggingface",
               "llm", "gpt", "embeddings", "vector", "ai", "ml", "machine learning", "deep learning",
               "transformers", "pytorch", "tensorflow", "anthropic"}

# Role synonyms used when user has AI skills — covers FAANG JD vocabulary
_AI_ROLE_SYNONYMS = [
    "AI Engineer",
    "GenAI Developer",
    "Machine Learning Engineer",
    "LLM Engineer",
    "Applied AI Engineer",
]

# FAANG + top AI companies to bias search toward
_TARGET_COMPANIES = ["Google", "Meta", "Amazon", "Apple", "Microsoft",
                     "OpenAI", "Anthropic", "Nvidia", "Databricks", "Cohere"]


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
    if "linkedin.com"    in url: return "LinkedIn"
    if "naukri.com"      in url: return "Naukri"
    if "indeed.com"      in url: return "Indeed"
    if "glassdoor.com"   in url: return "Glassdoor"
    if "wellfound.com"   in url: return "Wellfound"
    if "internshala.com" in url: return "Internshala"
    if "workatastartup"  in url: return "WorkAtStartup"
    if "unstop.com"      in url: return "Unstop"
    return "Other"


def _has_ai_skills(skills: list[str]) -> bool:
    """Return True if the user's skill set contains AI/ML-related technologies."""
    lowered = {s.lower() for s in skills}
    return bool(lowered & _AI_SKILLS)


def _build_search_roles(skills: list[str], roles: list[str]) -> list[str]:
    """
    Expand the role list with AI synonyms when the user has AI skills.
    Always put AI-specific roles first so DDG queries hit them before generic ones.
    """
    if _has_ai_skills(skills):
        # Start with AI synonyms, then append the user's own stated roles (deduplicated)
        seen = set(r.lower() for r in _AI_ROLE_SYNONYMS)
        combined = list(_AI_ROLE_SYNONYMS)
        for r in roles:
            if r.lower() not in seen:
                seen.add(r.lower())
                combined.append(r)
        return combined[:4]  # cap to keep query count manageable
    return (roles[:3] if roles else ["Software Engineer"])


def _search_jobs(skills: list[str], roles: list[str]) -> list[dict]:
    """
    Build and run job search queries across multiple job boards.
    Sources: LinkedIn, Indeed, Glassdoor, Wellfound (startups), Internshala, Naukri.
    AI-skill holders get AI/GenAI role synonyms injected.
    """
    search_roles = _build_search_roles(skills, roles)
    ai_skill_str = " ".join(
        s for s in skills if s.lower() in _AI_SKILLS
    )[:60]
    skill_str = ai_skill_str if ai_skill_str else " ".join(skills[:3])
    top_role  = search_roles[0] if search_roles else "Software Engineer"

    queries: list[str] = []

    # LinkedIn — primary source, 2 roles
    for role in search_roles[:2]:
        queries.append(f'site:linkedin.com/jobs "{role}" {skill_str}')

    # Indeed — broad reach
    queries.append(f'site:indeed.com "{top_role}" {skill_str}')

    # Glassdoor — company reviews + listings
    queries.append(f'site:glassdoor.com/job-listing "{top_role}" {skill_str}')

    # Wellfound — startup/AI-native companies
    if _has_ai_skills(skills):
        queries.append(f'site:wellfound.com/jobs "AI Engineer" OR "ML Engineer" OR "GenAI" {skill_str}')

    # Naukri — India-focused market
    queries.append(f'site:naukri.com "{top_role}" {skill_str}')

    # Internshala — for fresher / early-career candidates
    queries.append(f'site:internshala.com "{top_role}" {skill_str}')

    # FAANG + top AI company targeted query on LinkedIn
    if _has_ai_skills(skills):
        company_str = " OR ".join(_TARGET_COMPANIES[:5])
        queries.append(f'site:linkedin.com/jobs "AI Engineer" OR "GenAI" ({company_str})')

    all_results = []
    seen_urls   = set()
    for q in queries[:7]:  # cap at 7 queries
        for r in _ddg_search(q):
            url = r.get("href", "")
            if url not in seen_urls:
                seen_urls.add(url)
                all_results.append(r)
        if len(all_results) >= 15:
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

    # Step 2: search (only runs when we have a profile — guardrail above ensures this)
    search_results = _search_jobs(skills, roles)
    results_text   = _format_results_for_llm(search_results)

    # Hard-coded guardrail: if no resume profile exists, return immediately.
    # Do NOT call the LLM — without a profile it will ask clarifying questions
    # instead of acting. The user needs to upload their resume first.
    if not skills and not roles:
        return {
            "reply": (
                "No resume on file, so I cannot match jobs to your profile. "
                "Upload your resume on the Documents page first — "
                "then I can search jobs that actually fit your skills."
            ),
            "jobs": [],
        }

    if skills or roles:
        exp = resume_data.get("total_experience") or profile.get("total_experience", "")
        profile_parts = [f"Skills: {', '.join(skills)}", f"Target roles: {', '.join(roles)}"]
        if exp:
            profile_parts.append(f"Experience: {exp}")
        profile_text = "\n".join(profile_parts)
    else:
        # No profile but search did return results (message-based query)
        profile_text = f"No resume profile. User is looking for: {message}"

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
