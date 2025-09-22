from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict

class Contact(BaseModel):
    email: Optional[str] = ""
    phone: Optional[str] = ""
    location: Optional[str] = ""
    links: List[str] = []

class Role(BaseModel):
    title: str
    company: str
    start: Optional[str] = ""
    end: Optional[str] = ""
    bullets: List[str] = []

class Project(BaseModel):
    name: str
    stack: List[str] = []
    bullets: List[str] = []

class Education(BaseModel):
    school: str
    degree: str = ""
    period: str = ""

class Profile(BaseModel):
    name: str
    contacts: Contact = Contact()
    summary: str = ""
    skills: List[str] = []
    experience: List[Role] = []
    education: List[Education] = []
    projects: List[Project] = []

class JobJD(BaseModel):
    id: Optional[str] = None
    # "GL" here is Global region... later we may add other regions
    region: Literal["US", "EU", "GL"] = "US"
    company: str
    title: str
    jd_text: str

class GenerateRequest(BaseModel):
    profile: Profile
    jobs: List[JobJD]
    prefs: Dict = {}

# LLM output schema -- let's use gemini or a grq model with tool use...
class OutRole(BaseModel):
    title: str
    company: str
    start: Optional[str] = ""
    end: Optional[str] = ""
    bullets: List[str]

class OutResume(BaseModel):
    summary: str
    skills_line: List[str]
    experience: List[OutRole]
    projects: List[Project] = []
    education: List[Education] = []

class OutCoverLetter(BaseModel):
    address: str
    intro: str
    why_you: str
    evidence: List[str]
    why_them: str
    close: str

class OutATS(BaseModel):
    jd_keywords_matched: List[str] = []
    risks: List[str] = []

class LLMOutput(BaseModel):
    resume: OutResume
    cover_letter: OutCoverLetter
    ats: OutATS
