# PDF Compilation Guide for UmukoziHR Resume Tailor

## 🎯 **Primary Goal: PDF Generation and Download**

The main deliverable of the UmukoziHR Resume Tailor is **compiled PDF files**, not TEX content. TEX files serve as intermediate format and fallback for manual compilation.

## 📄 **PDF Compilation Methods**

### Method 1: Local LaTeX Installation (Fastest)

**Install TeX Live (Recommended):**
```bash
# Windows - Download from: https://tug.org/texlive/
# Or use Chocolatey:
choco install texlive

# macOS - Download from: https://tug.org/mactex/
# Or use Homebrew:
brew install --cask mactex

# Linux (Ubuntu/Debian):
sudo apt-get install texlive-full

# Verify installation:
latexmk --version
```

### Method 2: Docker LaTeX Container (Fallback)

**Requirements:**
- Docker Desktop installed and running
- Internet connection for first image download

**Automatic usage:**
- System automatically falls back to Docker if local LaTeX not available
- Uses `blang/latex:ctanfull` image (comprehensive LaTeX distribution)

## 🔧 **Current Implementation**

### PDF Generation Workflow:
1. **LLM Processing**: Generate tailored content with Gemini
2. **TEX Rendering**: Apply content to regional Jinja2 templates
3. **PDF Compilation**: Convert TEX to PDF using latexmk
4. **Bundle Creation**: Package PDFs + TEX files in ZIP
5. **Download Links**: Serve PDFs via `/artifacts/` endpoint

### Compilation Priority:
1. Try local `latexmk` (fast, ~5-10 seconds)
2. Fallback to Docker `blang/latex:ctanfull` (slower, ~30-60 seconds)
3. If both fail: TEX files available for manual compilation

## 📊 **API Response Structure**

```json
{
  "run": "uuid-123",
  "artifacts": [
    {
      "job_id": "google-swe",
      "region": "US",
      "resume_tex_file": "/artifacts/uuid_resume.tex",
      "cover_letter_tex_file": "/artifacts/uuid_cover.tex",
      "resume_pdf": "/artifacts/uuid_resume.pdf",        // ✅ Main deliverable
      "cover_letter_pdf": "/artifacts/uuid_cover.pdf",   // ✅ Main deliverable
      "pdf_compilation": {
        "resume_success": true,
        "cover_letter_success": true
      },
      "resume_tex_preview": "\\documentclass{article}...",  // Optional preview
      "cover_letter_tex_preview": "\\documentclass{letter}..."
    }
  ],
  "zip": "/artifacts/uuid_bundle.zip"  // ✅ Contains all PDFs + TEX files
}
```

## 🧪 **Testing PDF Generation**

### Quick Test:
```bash
# Make sure server is running on port 8001
curl -X GET http://localhost:8001/health

# Run comprehensive PDF test
python test_pdf_generation.py
```

### Expected Results:
- ✅ **resume_pdf**: Direct download link to compiled resume PDF
- ✅ **cover_letter_pdf**: Direct download link to compiled cover letter PDF  
- ✅ **zip bundle**: Contains both PDFs plus TEX source files
- ✅ **pdf_compilation**: Status of compilation success/failure

## 🔍 **Troubleshooting PDF Issues**

### Issue: "No PDF files generated"
**Solutions:**
1. Check if LaTeX is installed: `latexmk --version`
2. Ensure Docker is running: `docker info`
3. Check server logs for compilation errors
4. Verify TEX files are valid (download and inspect)

### Issue: "PDF compilation timeout"
**Solutions:**
1. Increase timeout in `tex_compile.py` (currently 120s local, 240s Docker)
2. Use simpler LaTeX templates for faster compilation
3. Check system resources (memory, CPU)

### Issue: "Docker compilation fails"
**Solutions:**
1. Pull LaTeX image manually: `docker pull blang/latex:ctanfull`
2. Check Docker volume mounting permissions
3. Verify Windows path conversion in `_docker_latexmk()`

## 📦 **Bundle Download**

### ZIP Contents (Priority Order):
1. **PDF files** (primary deliverables)
2. **TEX files** (for manual compilation/editing)

### Download Flow:
```bash
# 1. Generate documents
POST /api/v1/generate/generate

# 2. Get bundle URL from response
# Response: {"zip": "/artifacts/uuid_bundle.zip"}

# 3. Download bundle
GET /artifacts/uuid_bundle.zip
```

## 🚀 **Production Recommendations**

### For High Volume:
1. **Local LaTeX**: Install TeX Live on production servers
2. **Resource Allocation**: Ensure sufficient memory/CPU for compilation
3. **Monitoring**: Track PDF compilation success rates
4. **Caching**: Consider caching compiled templates

### For Development:
1. **Docker Fallback**: Use Docker compilation for consistency
2. **Manual Testing**: Keep Overleaf ready for manual compilation testing
3. **Error Handling**: Monitor compilation logs and failures

## 📋 **Current Status**

✅ **PDF Compilation**: Implemented with local + Docker fallback  
✅ **Download Links**: Direct PDF download URLs in response  
✅ **Bundle Creation**: ZIP with PDFs + TEX files  
✅ **Error Handling**: Graceful fallback when compilation fails  
✅ **Logging**: Detailed compilation status and debugging info  

---

**Remember**: The goal is **PDFs**, not TEX files. TEX content is useful for previews and manual compilation, but PDFs are what users ultimately need for job applications.