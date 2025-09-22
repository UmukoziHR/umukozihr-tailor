import os, subprocess, zipfile, glob, datetime
from jinja2 import Environment, FileSystemLoader, select_autoescape, Template

BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # server/app
TEMPLATE_DIR = os.path.join(BASE_DIR, "templates")
# Use the same artifacts directory as main.py
ART_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "artifacts"))
os.makedirs(ART_DIR, exist_ok=True)

env = Environment(
    loader=FileSystemLoader(TEMPLATE_DIR),
    autoescape=select_autoescape(disabled_extensions=("tex",)),
    trim_blocks=True,
    lstrip_blocks=True,
)

REGION_RESUME_TEMPLATE: dict[str, str] = {
    "US": "resume_us_onepage.tex.j2",
    "EU": "resume_eu_twopage.tex.j2",
    "GL": "resume_gl_onepage.tex.j2",
}

REGION_LETTER_TEMPLATE: dict[str, str] = {
    "US": "cover_letter_simple.tex.j2",
    "EU": "cover_letter_simple.tex.j2",
    "GL": "cover_letter_standard_global.tex.j2",
}

def render_tex(resume_ctx:dict, cl_ctx:dict, region:str, out_base:str):
    resume_template_name: str = REGION_RESUME_TEMPLATE.get(region, REGION_RESUME_TEMPLATE["GL"])
    cover_letter_template_name: str  = REGION_LETTER_TEMPLATE.get(region, REGION_LETTER_TEMPLATE["GL"])
    resume_template: Template = env.get_template(resume_template_name)
    cover_letter_template: Template  = env.get_template(cover_letter_template_name)
    tex_resume: str = resume_template.render(**resume_ctx)
    tex_cover_letter: str = cover_letter_template.render(**cl_ctx)
    resume_path: str = os.path.join(ART_DIR, f"{out_base}_resume.tex")
    cover_letter_path: str  = os.path.join(ART_DIR, f"{out_base}_cover.tex")
    open(resume_path, "w", encoding="utf-8").write(tex_resume)
    open(cover_letter_path,  "w", encoding="utf-8").write(tex_cover_letter)
    return resume_path, cover_letter_path

def _latexmk(cwd:str, fname:str):
    subprocess.run(
        ["latexmk", "-pdf", "-interaction=nonstopmode", "-halt-on-error", fname],
        cwd=cwd, check=True, timeout=120
    )

def _docker_latexmk(cwd:str, fname:str):
    # Convert Windows path to Docker-compatible format
    docker_path = cwd.replace('\\', '/').replace('C:', '/c')
    subprocess.run([
        "docker","run","--rm","-v",f"{docker_path}:/data","blang/latex:ctanfull",
        "latexmk","-pdf","-interaction=nonstopmode","-halt-on-error",fname
    ], check=True, timeout=240)

def compile_tex(tex_path:str):
    cwd = os.path.dirname(tex_path)
    fname = os.path.basename(tex_path)
    try:
        _latexmk(cwd, fname)
    except Exception as e1:
        try:
            _docker_latexmk(cwd, fname)
        except Exception as e2:
            # If both LaTeX compilation methods fail, just log and continue
            # The LaTeX files are still generated and can be used with Overleaf
            print(f"LaTeX compilation failed (both local and Docker): {e1}, {e2}")
            print(f"LaTeX source file available at: {tex_path}")
            # Don't raise an exception, just continue without PDF

def bundle(run_id:str):
    zip_path = os.path.join(ART_DIR, f"{run_id}_bundle.zip")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        # Add PDFs if they exist
        for f in glob.glob(os.path.join(ART_DIR, f"{run_id}_*.pdf")):
            zf.write(f, arcname=os.path.basename(f))
        # Always add the .tex files
        for f in glob.glob(os.path.join(ART_DIR, f"{run_id}_*.tex")):
            zf.write(f, arcname=os.path.basename(f))
    return zip_path
