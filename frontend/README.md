# Orbit Frontend

The installable PWA dashboard shell: React + Vite + TypeScript + Tailwind, six tabs, and a status pill that checks the backend every thirty seconds.

## Run it

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 - the dev server proxies `/health`, `/agents`, and `/models` to the FastAPI backend on port 8000, so start the backend first to see the status pill turn green.

## Tabs

Today, Progress, Money, Jobs, Resume, Orchestration - each shows a clear empty state until its agent ships in the build order.

## Still to come

shadcn/ui components, Tremor charts, React Flow agent graph, web push notifications, and real data wiring as each phase lands.
