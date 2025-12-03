# UmukoziHR Resume Tailor v1.2

🎆 **AI-Powered Resume & Cover Letter Generation Platform**

An intelligent system that generates perfectly tailored resumes and cover letters for any job posting. Simply create your profile once, add job descriptions, and let our Gemini-powered AI craft ATS-optimized documents with regional formatting support.

## ✨ **What's New in v1.2**

- 🔐 **JWT Authentication System** - Secure user authentication with login/signup
- 🚀 **Real-time Generation** - Immediate document processing with status tracking
- 💾 **Auto-Save Profiles** - Local storage persistence to prevent data loss
- 🔄 **Enhanced Error Handling** - Comprehensive logging and fallback systems
- 🌐 **CORS Support** - Full frontend-backend integration
- 📁 **Improved File Management** - Better artifact organization and download
- 🐛 **Bug Fixes** - Resolved UUID handling, field name mismatches, and compilation issues

## 🏗️ Architecture Overview

UmukoziHR Resume Tailor is a full-stack application with a clean separation between client and server:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js UI    │───▶│   FastAPI Server │───▶│   Gemini LLM    │
│ (React/Tailwind)│    │  (Python/Jinja) │    │  (AI Tailoring) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌────────▼────────┐              │
         │              │  LaTeX Templates │              │
         │              │ (Regional Styles)│              │
         │              └────────┬────────┘              │
         │                       │                       │
         │              ┌────────▼────────┐              │
         │              │  LaTeX Compiler │              │
         │              │ (Local/Docker)  │              │
         │              └────────┬────────┘              │
         │                       │                       │
         └──────────────────────▶▼◀──────────────────────┘
                        Artifacts Storage
                      (PDFs, TEX, ZIP bundles)
```

**Flow**: User Input → Profile Validation → Job Description Analysis → LLM Tailoring → Template Rendering → LaTeX Compilation → PDF Generation → Artifact Delivery

## 📁 Repository Structure

```
umukozihr-tailor/
├── client/                    # Next.js frontend application
│   ├── components/           # React components
│   │   ├── LoginForm.tsx     # Authentication component (NEW in v1.2)
│   │   ├── ProfileForm.tsx   # User profile input form
│   │   ├── JDInput.tsx       # Job description input
│   │   ├── JobCard.tsx       # Generated artifact display
│   │   └── StatusToast.tsx   # Status notifications (NEW)
│   ├── lib/
│   │   └── api.ts           # Axios API client with auth (UPDATED)
│   ├── pages/
│   │   ├── _app.tsx         # Next.js app wrapper with styling
│   │   └── index.tsx        # Main application page (UPDATED)
│   ├── styles/
│   │   └── globals.css      # Tailwind CSS + custom styles
│   ├── next.config.js       # API proxy configuration
│   └── package.json         # Dependencies and scripts
├── server/                  # FastAPI backend application
│   ├── app/
│   │   ├── auth/           # Authentication system (NEW in v1.2)
│   │   │   └── auth.py     # JWT token management
│   │   ├── core/           # Core business logic modules
│   │   │   ├── tailor.py   # Main tailoring pipeline
│   │   │   ├── llm.py      # Gemini LLM integration
│   │   │   ├── validate.py # JSON schema validation
│   │   │   ├── tex_compile.py # LaTeX rendering & compilation
│   │   │   └── ingest.py   # File parsing utilities (PDF/DOCX)
│   │   ├── db/             # Database models (NEW in v1.2)
│   │   │   ├── database.py # Database configuration
│   │   │   └── models.py   # SQLAlchemy user models
│   │   ├── routes/         # API endpoints
│   │   │   ├── v1_auth.py     # Authentication endpoints (NEW)
│   │   │   ├── v1_profile.py  # Profile save endpoint
│   │   │   └── v1_generate.py # Document generation endpoint
│   │   ├── templates/      # Jinja2 LaTeX templates
│   │   │   ├── resume_us_onepage.tex.j2
│   │   │   ├── resume_eu_twopage.tex.j2
│   │   │   ├── resume_gl_onepage.tex.j2
│   │   │   ├── cover_letter_simple.tex.j2
│   │   │   └── cover_letter_standard_global.tex.j2
│   │   ├── main.py         # FastAPI app initialization
│   │   └── models.py       # Pydantic data models
│   └── requirements.txt    # Python dependencies
├── artifacts/              # Generated files (PDFs, TEX, profiles)
└── README.md              # This documentation
```

## 📊 Data Models

The application uses Pydantic models for type safety and validation:

### Core Models (`models.py`)

- **`Profile`**: User's professional information
  - `name`, `contacts` (email, phone, location, links)
  - `summary`, `skills[]`, `experience[]`, `education[]`, `projects[]`

- **`JobJD`**: Job description input
  - `id` (optional), `region` (US/EU/GL), `company`, `title`, `jd_text`

- **`LLMOutput`**: AI-generated tailored content
  - `resume`: Tailored resume data
  - `cover_letter`: Tailored cover letter sections
  - `ats`: ATS optimization insights

### Regional Support

- **US**: One-page resume, concise format, YYYY-MM dates
- **EU**: Two-page allowed, simple style, YYYY-MM dates
- **GL (Global)**: One-page preferred, simple style, YYYY-MM dates

## 🔄 Core Workflows

### 1. Profile Save Flow
```
User Input → ProfileForm → POST /api/v1/profile → JSON saved to artifacts/
```

### 2. Document Generation Flow
```
1. User submits profile + job descriptions
2. POST /api/v1/generate/generate triggers:
   a. Pre-filtering: Extract top-k relevant bullets from profile
   b. LLM call: Send prompt to Gemini with structured schema
   c. Validation: Check JSON schema compliance + business rules
   d. Template rendering: Apply data to regional Jinja2 templates
   e. LaTeX compilation: Generate PDFs (local latexmk or Docker)
   f. Artifact bundling: Create ZIP with all outputs
3. Return artifact URLs and metadata
```

### 3. Overleaf Integration
```
Generated ZIP → Form POST to overleaf.com/docs → Opens in Overleaf editor
```

### 4. Error Handling
- **LLM failures**: Retry with adjusted parameters
- **Schema validation**: Return detailed error messages
- **LaTeX compilation**: Graceful fallback (TEX files always available)
- **Business rule violations**: Prevent hallucinated company names

## 🔌 API Reference

### Endpoints

#### `POST /api/v1/profile/profile`
**Description**: Save user profile to local storage

**Request Body**:
```json
{
  "name": "John Doe",
  "contacts": {
    "email": "john@example.com",
    "phone": "+1 555-123-4567",
    "location": "San Francisco, CA",
    "links": ["https://linkedin.com/in/johndoe"]
  },
  "summary": "Experienced software engineer...",
  "skills": ["Python", "React", "AWS"],
  "experience": [...],
  "education": [...],
  "projects": [...]
}
```

**Response**:
```json
{
  "ok": true,
  "path": "/path/to/profile_John_Doe.json"
}
```

#### `POST /api/v1/generate/generate`
**Description**: Generate tailored documents

**Request Body**:
```json
{
  "profile": { /* Profile object */ },
  "jobs": [
    {
      "id": "SWE-2024-001",
      "region": "US",
      "company": "Google",
      "title": "Senior Software Engineer",
      "jd_text": "We are looking for..."
    }
  ],
  "prefs": {}
}
```

**Response**:
```json
{
  "run": "uuid-run-id",
  "artifacts": [
    {
      "job_id": "SWE-2024-001",
      "region": "US",
      "resume_tex": "/artifacts/uuid_resume.tex",
      "cover_letter_tex": "/artifacts/uuid_cover.tex",
      "resume_pdf": "/artifacts/uuid_resume.pdf",
      "cover_letter_pdf": "/artifacts/uuid_cover.pdf",
      "created_at": "2025-01-27T10:30:00Z",
      "updated_at": "2025-01-27T10:30:00Z"
    }
  ],
  "zip": "/artifacts/uuid_bundle.zip"
}
```

#### `GET /artifacts/{filename}`
**Description**: Serve static files (PDFs, TEX, ZIP bundles)

### Example Usage

```bash
# Save profile
curl -X POST http://localhost:8000/api/v1/profile/profile \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","contacts":{"email":"john@example.com"}}'

# Generate documents
curl -X POST http://localhost:8000/api/v1/generate/generate \
  -H "Content-Type: application/json" \
  -d '{"profile":{...},"jobs":[{"company":"Google","title":"SWE","region":"US","jd_text":"..."}]}'
```

## 🚀 **Quick Start Guide**

### Prerequisites
- **Node.js** 18+ (for frontend)
- **Python** 3.9+ (for backend)
- **Google Gemini API Key** ([Get one here](https://ai.google.dev/))
- **Docker** (optional, for LaTeX compilation)

### 📋 Step-by-Step Setup

1. **Clone the repository**
```bash
git clone <repository>
cd umukozihr-tailor
```

2. **Backend Setup**
```bash
cd server
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Create .env file
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Start backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

3. **Frontend Setup**
```bash
cd client
npm install
npm run dev
```

4. **Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### 🎯 Usage
1. Create an account or login
2. Fill out your professional profile
3. Add job descriptions you want to apply for
4. Generate tailored documents
5. Download PDFs or edit in Overleaf

**For detailed setup instructions, see the individual README files:**
- 💻 [Client README](client/README.md) - Frontend setup and development
- 📡 [Server README](server/README.md) - Backend API and configuration

## 📝 LaTeX Templates

The system uses Jinja2-powered LaTeX templates with regional variations:

### Template Variables

**Resume templates** receive:
- `profile`: User profile data
- `out`: LLM-generated resume content (summary, skills_line, experience, projects, education)
- `job`: Job description metadata

**Cover letter templates** receive:
- `profile`: User profile data
- `out`: LLM-generated cover letter content (address, intro, why_you, evidence, why_them, close)
- `job`: Job description metadata

### Regional Templates

- **`resume_us_onepage.tex.j2`**: Clean one-page format, no photos
- **`resume_eu_twopage.tex.j2`**: Two-page allowed, formal style
- **`resume_gl_onepage.tex.j2`**: Global one-page format
- **`cover_letter_simple.tex.j2`**: Standard business letter
- **`cover_letter_standard_global.tex.j2`**: International format

### File Naming Convention

`{run_id}_{job_id_or_title}_{resume|cover}.{tex|pdf}`

Example: `abc123-def456_Google-SWE_resume.pdf`

## ⚠️ Current Limitations

### Storage & Persistence
- **Local-only storage**: Profiles and artifacts saved to local `artifacts/` directory
- **No database**: User data not persisted across deployments
- **No user authentication**: Single-user setup

### Processing
- **Synchronous generation**: No background job queue
- **Limited error recovery**: LaTeX compilation failures handled gracefully
- **Single LLM provider**: Currently Gemini-only

### Security & Privacy
- **API key in plaintext**: `.env` file not encrypted
- **No data encryption**: User data stored unencrypted
- **No audit logs**: Limited logging of user actions

## 🔐 Security & Privacy

### Current Data Handling
- **User profiles**: Stored as JSON in `artifacts/profile_{name}.json`
- **Generated documents**: Stored in `artifacts/` with UUID prefixes
- **API keys**: Loaded from `.env` file (ensure `.env` is in `.gitignore`)

### Logging
- **LaTeX compilation errors**: Logged to console
- **LLM API calls**: Not logged (no sensitive data retention)
- **User data**: No automatic redaction (manual review needed)

### Recommendations
- Store `GEMINI_API_KEY` in secure environment variables
- Implement data retention policies for artifacts
- Add request/response logging with PII redaction
- Consider encrypting stored profiles

## 🛣️ Upgrade Roadmap (v1.2)

### Planned Infrastructure
- **Database**: PostgreSQL for user profiles and job history
- **Authentication**: OAuth2 with JWT tokens
- **Cloud storage**: S3/GCS for artifact persistence
- **Background jobs**: Celery/RQ for async processing
- **Status polling**: WebSocket or SSE for real-time updates

### Suggested Module Extensions
- `server/app/auth/` - Authentication & user management
- `server/app/db/` - Database models and migrations
- `server/app/storage/` - Cloud storage abstraction
- `server/app/queue/` - Background job processing
- `client/hooks/` - React hooks for real-time updates
- `client/auth/` - Authentication context and components

## 🧪 Quality & Testing

### Complexity Hotspots
- **`tailor.py`** (54 lines): Core pipeline logic - needs unit tests
- **`tex_compile.py`** (81 lines): LaTeX handling - integration tests needed
- **`index.tsx`** (238 lines): Main UI component - split into smaller components

### Suggested Unit Tests
```python
# test_validate.py
def test_schema_validation_success()
def test_business_rules_company_validation()

# test_tailor.py  
def test_bullet_scoring_algorithm()
def test_region_rules_application()

# test_tex_compile.py
def test_template_rendering()
def test_latex_compilation_fallback()
```

### Linting & Formatting
- **Backend**: Add `black`, `flake8`, `mypy` to requirements-dev.txt
- **Frontend**: ESLint and Prettier already configured via Next.js
- **Pre-commit hooks**: Recommended for code quality

---

## 🤝 Contributing

This is a professional resume tailoring system designed for job seekers. The codebase prioritizes reliability, user privacy, and document quality. When contributing:

1. **Test LaTeX compilation** on your changes
2. **Validate JSON schemas** with sample data
3. **Preserve user data format** for backward compatibility
4. **Test regional template variations**

For questions about the AI tailoring pipeline or LaTeX template system, please review the core modules in `server/app/core/`.
