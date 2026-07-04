# Developer Tasks

## Current priority

- [ ] Install `langchain-google-genai` into the backend venv and verify `make backend` starts successfully.
- [ ] Confirm the `agent_name: auto` orchestration flow works end-to-end in the Orchestration UI.
- [ ] Log the Claude subscription as an expense in the app and verify it appears in `/expenses`.
- [ ] Seed the Claude subscription expense if you want a persistent test fixture for the app.

## Notes

- The backend currently uses `orbit/core/llm_client.py` with LangChain provider inference.
- The missing runtime package is `langchain-google-genai`; add it to the backend virtual environment and the `pyproject.toml` dependencies.
- If the expense is not yet in the Supabase table, use the app UI or the seed SQL file below to add it.
