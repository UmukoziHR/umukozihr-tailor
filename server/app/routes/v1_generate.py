import uuid, os
import datetime
from fastapi import APIRouter, HTTPException
from app.models import GenerateRequest
from app.core.tailor import run_tailor
from app.core.tex_compile import render_tex, compile_tex, bundle
from datetime import datetime

router = APIRouter()

@router.post("/generate")
def generate(request: GenerateRequest):
    run_id = str(uuid.uuid4())
    artifacts = []
    for j in request.jobs:
        try:
            out = run_tailor(request.profile, j)
        except Exception as e:
            raise HTTPException(400, f"LLM/validation error: {e}")
        
        base = f"{run_id}_{(j.id or j.title).replace(' ', '_')}"
        resume_ctx = {"profile": request.profile.model_dump(), "out": out.resume.model_dump(), "job": j.model_dump()}
        cover_letter_ctx = {"profile": request.profile.model_dump(), "out": out.cover_letter.model_dump(), "job": j.model_dump()}

        resume_tex, cover_letter_tex = render_tex(resume_ctx, cover_letter_ctx, j.region, base)

        for path in (resume_tex, cover_letter_tex):
            compile_tex(path)  # This now handles errors gracefully
        
        # Check if PDFs were generated
        resume_pdf_path = os.path.join(os.path.dirname(resume_tex), os.path.basename(resume_tex).replace('.tex','.pdf'))
        cover_letter_pdf_path = os.path.join(os.path.dirname(cover_letter_tex), os.path.basename(cover_letter_tex).replace('.tex','.pdf'))
        
        artifact = {
            "job_id": j.id or j.title,
            "region": j.region,
            "resume_tex": f"/artifacts/{os.path.basename(resume_tex)}",
            "cover_letter_tex": f"/artifacts/{os.path.basename(cover_letter_tex)}",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }
        
        # Only add PDF links if the files exist
        if os.path.exists(resume_pdf_path):
            artifact["resume_pdf"] = f"/artifacts/{os.path.basename(resume_tex).replace('.tex','.pdf')}"
        if os.path.exists(cover_letter_pdf_path):
            artifact["cover_letter_pdf"] = f"/artifacts/{os.path.basename(cover_letter_tex).replace('.tex','.pdf')}"
            
        artifacts.append(artifact)
        # db.session.add(resume)
    
    zip_path = bundle(run_id)
    return {"run": run_id, "artifacts": artifacts, "zip": f"/artifacts/{os.path.basename(zip_path)}"}