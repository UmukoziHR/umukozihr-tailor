from fastapi import APIRouter
from app.models import Profile
import os

router = APIRouter()

@router.post("/profile")
def save_profile(profile: Profile):
    artifact_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts"))
    os.makedirs(artifact_dir, exist_ok=True)
    path = os.path.join(artifact_dir, f"profile_{profile.name.replace(' ','_')}.json")
    open(path, "w", encoding="utf-8").write(profile.model_dump_json(indent=2))
    return {"ok": True, "path": path}