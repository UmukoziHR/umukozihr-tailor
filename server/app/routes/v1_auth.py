import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.db.database import get_db
from app.db.models import User
from app.auth.auth import hash_password, verify_password, create_access_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

class SignupRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/signup")
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    logger.info(f"Signup attempt for email: {req.email}")
    # check if user exists
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        logger.warning(f"Signup failed - email already registered: {req.email}")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # create user
    user = User(
        email=req.email,
        password_hash=hash_password(req.password)
    )
    db.add(user)
    db.commit()
    logger.info(f"User created successfully: {req.email} with ID: {user.id}")
    
    # return token
    access_token = create_access_token({"sub": str(user.id)})
    logger.info(f"Access token generated for user: {user.id}")
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    logger.info(f"Login attempt for email: {req.email}")
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, str(user.password_hash)):
        logger.warning(f"Login failed - invalid credentials for email: {req.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    logger.info(f"Login successful for user: {user.id}")
    access_token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }