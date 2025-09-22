import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai.types import Tool, Schema, GenerateContentConfig

# Load environment variables
load_dotenv()


SYSTEM = (
"You are an expert ATS resume & cover-letter tailor"
"Return ONLY valid JSON for the given schema"
"Never invent companies, schools, or dates"
"Use exact JD Keyowrds only when truthful"
"Respect region style rules. Keep concise, metric-first quantitative bullets, each bullet also flowing in the oder <action -> impactful result>"
)

# Strict JSON Schema for gemini to avoid hallucinations and stick to our convention
OUTPUT_JSON_SCHEMA = Schema(
    type="OBJECT",
    required=["resume","cover_letter","ats"],
    properties={
        "resume": Schema(type="OBJECT", required=["summary","skills_line","experience","projects","education"], properties={
            "summary": Schema(type="STRING"),
            "skills_line": Schema(type="ARRAY", items=Schema(type="STRING")),
            "experience": Schema(type="ARRAY", items=Schema(type="OBJECT", required=["title","company","bullets"], properties={
                "title": Schema(type="STRING"),
                "company": Schema(type="STRING"),
                "start": Schema(type="STRING"),
                "end": Schema(type="STRING"),
                "bullets": Schema(type="ARRAY", items=Schema(type="STRING")),
            })),
            "projects": Schema(type="ARRAY", items=Schema(type="OBJECT", properties={
                "name": Schema(type="STRING"),
                "stack": Schema(type="ARRAY", items=Schema(type="STRING")),
                "bullets": Schema(type="ARRAY", items=Schema(type="STRING")),
            })),
            "education": Schema(type="ARRAY", items=Schema(type="OBJECT", properties={
                "school": Schema(type="STRING"),
                "degree": Schema(type="STRING"),
                "period": Schema(type="STRING"),
            })),
        }),
        "cover_letter": Schema(type="OBJECT", required=["address","intro","why_you","evidence","why_them","close"], properties={
            "address": Schema(type="STRING"),
            "intro": Schema(type="STRING"),
            "why_you": Schema(type="STRING"),
            "evidence": Schema(type="ARRAY", items=Schema(type="STRING")),
            "why_them": Schema(type="STRING"),
            "close": Schema(type="STRING"),
        }),
        "ats": Schema(type="OBJECT", required=["jd_keywords_matched","risks"], properties={
            "jd_keywords_matched": Schema(type="ARRAY", items=Schema(type="STRING")),
            "risks": Schema(type="ARRAY", items=Schema(type="STRING")),
        })
    },
)


def build_user_prompt(profile_min_json:str, jd_text:str, region_rules:dict, selected_bullets_json:str, schema_json:str)-> str:
    return (
        f"REGION_RULES:\n{json.dumps(region_rules, ensure_ascii=False)}\n\n"
        f"PROFILE_MIN:\n{profile_min_json}\n\n"
        f"JD_TEXT:\n{jd_text}\n\n"
        f"PRESELECTED_PROFILE_BULLETS:\n{selected_bullets_json}\n\n"
        f"SCHEMA (immutable):\n{schema_json}\n\n"
        "Return JSON only."
        )

def call_llm(prompt:str)->str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not set")
    client = genai.Client(api_key=api_key)
    cfg = GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=OUTPUT_JSON_SCHEMA,
        temperature=0.2,
        top_p=0.9,
        candidate_count=1,
        max_output_tokens=4000,
    )
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[f"{SYSTEM}\n\n{prompt}"],
        config=cfg,
    )

    # the sdk returns .text for JSON string
    return response.text or "{}"
