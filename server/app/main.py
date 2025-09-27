from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.routes.v1_profile import router as profile_router
from app.routes.v1_generate import router as generate_router
import os

app = FastAPI(title="UmukoziHR Resume Tailor API", version="v1")

app.include_router(profile_router, prefix="/api/v1/profile")
app.include_router(generate_router, prefix="/api/v1/generate")

ART = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts"))
os.makedirs(ART, exist_ok=True)
app.mount("/artifacts", StaticFiles(directory=ART), name="artifacts")