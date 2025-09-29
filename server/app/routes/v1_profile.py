import logging
from fastapi import APIRouter
from app.models import Profile
import os

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/profile")
def save_profile(profile: Profile):
    logger.info(f"Saving profile for: {profile.name}")
    artifact_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts"))
    os.makedirs(artifact_dir, exist_ok=True)
    path = os.path.join(artifact_dir, f"profile_{profile.name.replace(' ','_')}.json")
    open(path, "w", encoding="utf-8").write(profile.model_dump_json(indent=2))
    logger.info(f"Profile saved successfully to: {path}")
    return {"ok": True, "path": path}