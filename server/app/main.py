import logging
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.routes.v1_profile import router as profile_router
from app.routes.v1_generate import router as generate_router
from app.routes.v1_auth import router as auth_router
from app.routes.v1_jd import router as jd_router
from app.routes.v1_history import router as history_router
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

app = FastAPI(title="UmukoziHR Resume Tailor API", version="v1.3")
logger.info("Starting UmukoziHR Resume Tailor API v1.3")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger.info("CORS middleware configured")

app.include_router(auth_router)
app.include_router(profile_router, prefix="/api/v1")
app.include_router(generate_router, prefix="/api/v1/generate")
app.include_router(jd_router, prefix="/api/v1")
app.include_router(history_router, prefix="/api/v1")
logger.info("API routes registered successfully (v1.3 endpoints active)")

@app.get("/health")
def health_check():
    logger.info("Health check requested")
    return {"status": "healthy", "service": "umukozihrtailor-backend"}

ART = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "artifacts"))
os.makedirs(ART, exist_ok=True)
app.mount("/artifacts", StaticFiles(directory=ART), name="artifacts")
logger.info(f"Artifacts directory mounted at /artifacts: {ART}")