import logging
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.routes.v1_profile import router as profile_router
from app.routes.v1_generate import router as generate_router
from app.routes.v1_auth import router as auth_router
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('umukozihr.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(title="UmukoziHR Resume Tailor API", version="v1.2")
logger.info("Starting UmukoziHR Resume Tailor API v1.2")

app.include_router(auth_router)
app.include_router(profile_router, prefix="/api/v1/profile")
app.include_router(generate_router, prefix="/api/v1/generate")
logger.info("API routes registered successfully")

@app.get("/health")
def health_check():
    logger.info("Health check requested")
    return {"status": "healthy", "service": "umukozihrtailor-backend"}

ART = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts"))
os.makedirs(ART, exist_ok=True)
app.mount("/artifacts", StaticFiles(directory=ART), name="artifacts")
logger.info(f"Artifacts directory mounted at /artifacts: {ART}")