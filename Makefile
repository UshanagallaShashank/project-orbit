# Shortcuts for installing, running, testing, and building Project Orbit
VENV = $(HOME)/venvs/orbit-v3/bin

.PHONY: help install backend frontend test build

help:
	@echo "make install   - create the venv and install all backend + frontend dependencies"
	@echo "make backend   - start the FastAPI backend on port 8000"
	@echo "make frontend  - start the dashboard dev server on port 5173"
	@echo "make test      - run the backend test suite"
	@echo "make build     - typecheck and build the frontend for production"

install:
	python3 -m venv $(HOME)/venvs/orbit-v3
	$(VENV)/pip install fastapi uvicorn langgraph langchain supabase python-dotenv httpx pytest
	cd frontend && npm install

backend:
	$(VENV)/uvicorn orbit.app:app --reload

frontend:
	cd frontend && npm run dev

test:
	$(VENV)/python -m pytest tests/ -v

build:
	cd frontend && npm run build
