# Makefile — Run commands like npm scripts
# Usage:
#   make dev      ← start the server (like npm run dev)
#   make install  ← install all packages
#   make test     ← run unit tests

VENV = ~/venvs/orbit/bin/activate

dev:
	source $(VENV) && uvicorn main:app --reload

install:
	source $(VENV) && pip install -r requirements.txt

test:
	source $(VENV) && pytest tests/unit/ -v
