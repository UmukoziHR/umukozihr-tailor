import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import os

from app.models import (
    Profile, ProfileV3, ProfileResponse, ProfileUpdateRequest,
    ProfileUpdateResponse, CompletenessResponse
)
from app.db.database import get_db
from app.db.models import Profile as DBProfile
from app.auth.auth import get_current_user
from app.utils.completeness import calculate_completeness

logger = logging.getLogger(__name__)

router = APIRouter()

# Legacy endpoint (v1.2 - file-based storage)
@router.post("/profile")
def save_profile(profile: Profile):
    """Legacy endpoint for backward compatibility"""
    logger.info(f"Saving profile for: {profile.name}")
    artifact_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts"))
    os.makedirs(artifact_dir, exist_ok=True)
    path = os.path.join(artifact_dir, f"profile_{profile.name.replace(' ','_')}.json")
    open(path, "w", encoding="utf-8").write(profile.model_dump_json(indent=2))
    logger.info(f"Profile saved successfully to: {path}")
    return {"ok": True, "path": path}


# v1.3 endpoints (database-backed)

@router.get("/profile", response_model=ProfileResponse)
def get_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    GET /api/v1/profile
    Return saved profile for authenticated user
    """
    user_id = current_user["user_id"]
    logger.info(f"Fetching profile for user: {user_id}")

    # Convert string UUID to UUID object for database query
    import uuid
    try:
        user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    db_profile = db.query(DBProfile).filter(DBProfile.user_id == user_uuid).first()

    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found. Please complete onboarding.")

    # Parse profile_data JSON into ProfileV3
    profile = ProfileV3(**db_profile.profile_data)

    return ProfileResponse(
        profile=profile,
        version=db_profile.version,
        completeness=db_profile.completeness,
        updated_at=db_profile.updated_at.isoformat()
    )


@router.put("/profile", response_model=ProfileUpdateResponse)
def update_profile(
    request: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    PUT /api/v1/profile
    Update profile with versioning and completeness calculation
    """
    user_id = current_user["user_id"]
    logger.info(f"Updating profile for user: {user_id}")

    # Convert string UUID to UUID object
    import uuid
    try:
        user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    # Calculate completeness
    completeness, breakdown, missing = calculate_completeness(request.profile)
    logger.info(f"Profile completeness: {completeness}% - Breakdown: {breakdown}")

    # Check if profile exists
    db_profile = db.query(DBProfile).filter(DBProfile.user_id == user_uuid).first()

    if db_profile:
        # Update existing profile
        db_profile.profile_data = request.profile.model_dump(mode="json")
        db_profile.version += 1
        db_profile.completeness = completeness
        db_profile.updated_at = datetime.utcnow()
        message = f"Profile updated successfully to version {db_profile.version}"
    else:
        # Create new profile
        db_profile = DBProfile(
            user_id=user_uuid,
            profile_data=request.profile.model_dump(mode="json"),
            version=1,
            completeness=completeness,
            updated_at=datetime.utcnow()
        )
        db.add(db_profile)
        message = "Profile created successfully"

    db.commit()
    db.refresh(db_profile)

    logger.info(message)

    return ProfileUpdateResponse(
        success=True,
        version=db_profile.version,
        completeness=db_profile.completeness,
        message=message
    )


@router.get("/me/completeness", response_model=CompletenessResponse)
def get_completeness(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    GET /api/v1/me/completeness
    Calculate and return profile completeness with breakdown
    """
    user_id = current_user["user_id"]
    logger.info(f"Calculating completeness for user: {user_id}")

    # Convert string UUID to UUID object for database query
    import uuid
    try:
        user_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    db_profile = db.query(DBProfile).filter(DBProfile.user_id == user_uuid).first()

    if not db_profile:
        return CompletenessResponse(
            completeness=0.0,
            breakdown={},
            missing_fields=["Complete onboarding to create your profile"]
        )

    profile = ProfileV3(**db_profile.profile_data)
    completeness, breakdown, missing = calculate_completeness(profile)

    return CompletenessResponse(
        completeness=completeness,
        breakdown=breakdown,
        missing_fields=missing
    )