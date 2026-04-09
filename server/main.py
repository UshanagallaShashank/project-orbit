from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router

app = FastAPI(
    title="Project Orbit API",
    description="Personal AI OS — 5 specialized agents",
    version="0.1.0",
    # /docs → Swagger UI (interactive API tester, replaces Postman)
    # /redoc → alternative docs view
)

# CORS — allows the React frontend to call this backend
# WHY: browsers block cross-origin requests by default
# origins list = who is allowed to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # React dev server (Vite default)
        "http://localhost:3000",   # fallback if you change Vite port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])

# Health check — CI/CD pings this to confirm the server is alive
@app.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0"}
