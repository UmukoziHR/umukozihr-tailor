import uuid, os, logging
import datetime
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.models import GenerateRequest
from app.core.tailor import run_tailor
from app.core.tex_compile import render_tex, compile_tex, bundle
from app.db.database import get_db
from app.db.models import User
from app.auth.auth import verify_token
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter()
security = HTTPBearer(auto_error=False)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Optional auth - returns user_id if authenticated, None otherwise"""
    if not credentials:
        return None
    
    token = credentials.credentials
    payload = verify_token(token)
    if not payload:
        return None
    
    # Verify user exists
    user = db.query(User).filter(User.id == payload["sub"]).first()
    return user.id if user else None

@router.post("/generate")
def generate(request: GenerateRequest, user_id: str = Depends(get_current_user)):
    """Generate documents - works with or without auth (for now, queue disabled)"""
    run_id = str(uuid.uuid4())
    logger.info(f"Starting document generation for run_id: {run_id}")
    logger.info(f"User authenticated: {bool(user_id)}, Jobs count: {len(request.jobs)}")
    
    # Process synchronously for all users (auth just provides tracking)
    artifacts = []
    for j in request.jobs:
        logger.info(f"Processing job: {j.id or j.title} for company: {j.company}")
        try:
            out = run_tailor(request.profile, j)
            logger.info(f"LLM processing completed for job: {j.id or j.title}")
        except Exception as e:
            logger.error(f"LLM/validation error for job {j.id or j.title}: {e}")
            raise HTTPException(400, f"LLM/validation error: {e}")
        
        base = f"{run_id}_{(j.id or j.title).replace(' ', '_')}"
        resume_ctx = {"profile": request.profile.model_dump(), "out": out.resume.model_dump(), "job": j.model_dump()}
        cover_letter_ctx = {"profile": request.profile.model_dump(), "out": out.cover_letter.model_dump(), "job": j.model_dump()}

        resume_tex_path, cover_letter_tex_path = render_tex(resume_ctx, cover_letter_ctx, j.region, base)

        # Compile to PDFs - this is the primary goal
        logger.info(f"Starting PDF compilation for job: {j.id or j.title}")
        resume_pdf_success = compile_tex(resume_tex_path)
        cover_letter_pdf_success = compile_tex(cover_letter_tex_path)
        
        # Check PDF paths
        resume_pdf_path = resume_tex_path.replace('.tex', '.pdf')
        cover_letter_pdf_path = cover_letter_tex_path.replace('.tex', '.pdf')
        
        artifact = {
            "job_id": j.id or j.title,
            "region": j.region,
            "resume_tex_file": f"/artifacts/{os.path.basename(resume_tex_path)}",
            "cover_letter_tex_file": f"/artifacts/{os.path.basename(cover_letter_tex_path)}",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "pdf_compilation": {
                "resume_success": resume_pdf_success,
                "cover_letter_success": cover_letter_pdf_success
            }
        }
        
        # Add PDF download links if compilation succeeded
        if resume_pdf_success and os.path.exists(resume_pdf_path):
            artifact["resume_pdf"] = f"/artifacts/{os.path.basename(resume_pdf_path)}"
            logger.info(f"Resume PDF ready for download: {artifact['resume_pdf']}")
        else:
            logger.warning(f"Resume PDF compilation failed for job {j.id or j.title} - TEX file available")
            
        if cover_letter_pdf_success and os.path.exists(cover_letter_pdf_path):
            artifact["cover_letter_pdf"] = f"/artifacts/{os.path.basename(cover_letter_pdf_path)}"
            logger.info(f"Cover letter PDF ready for download: {artifact['cover_letter_pdf']}")
        else:
            logger.warning(f"Cover letter PDF compilation failed for job {j.id or j.title} - TEX file available")
        
        # Optional: Include TEX content for preview (but PDFs are the main goal)
        if os.path.exists(resume_tex_path):
            with open(resume_tex_path, 'r', encoding='utf-8') as f:
                content = f.read()
                artifact["resume_tex_preview"] = content[:1000] + "..." if len(content) > 1000 else content
        if os.path.exists(cover_letter_tex_path):
            with open(cover_letter_tex_path, 'r', encoding='utf-8') as f:
                content = f.read()
                artifact["cover_letter_tex_preview"] = content[:1000] + "..." if len(content) > 1000 else content
            
        artifacts.append(artifact)
    
    zip_path = bundle(run_id)
    logger.info(f"Document generation completed for run_id: {run_id}")
    logger.info(f"Generated {len(artifacts)} artifacts, bundle: {zip_path}")
    
    return {
        "run": run_id, 
        "artifacts": artifacts, 
        "zip": f"/artifacts/{os.path.basename(zip_path)}", 
        "authenticated": bool(user_id),
        "user_id": user_id
    }