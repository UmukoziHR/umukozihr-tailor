# Improved Tailor pipeline: pre-filter -> LLM -> validate -> repair

import re, json
from collections import Counter
from .llm import build_user_prompt, call_llm, SYSTEM, OUTPUT_JSON_SCHEMA
from .validate import validate_or_error, business_rules_check
from app.models import Profile, JobJD, LLMOutput

STOP = set("""a an the and or for to of in on at with from by as is are was were be been being will would should could into about over under within across""".split())

def norm_tokens(text:str):
    tokens = re.findall(r"[A-Za-z0-9\+\#\.]+", text.lower())
    return [t for t in tokens if t not in STOP and len(t)>1]

def score_bullet(bullet:str, jd_counts:Counter):
    toks = norm_tokens(bullet)
    return sum(jd_counts.get(t,0) for t in toks)

def select_topk_bullets(profile: Profile, jd_text: str, k:int=12):
    jd_counts = Counter(norm_tokens(jd_text))
    pool = []
    for row in profile.experience:
        for bullet in row.bullets:
            pool.append({
                "role_title": row.title,
                "company": row.company,
                "bullet": bullet,
                "score": score_bullet(bullet, jd_counts)
            })
    pool.sort(key=lambda x: x["score"], reverse=True)
    return [{"role_title":p["role_title"], "company":p["company"], "bullet":p["bullet"]} for p in pool[:k]]

def region_rules(region:str)->dict:
    if region=="US": return {"pages":1,"style":"no photo; concise; one-page","date_format":"YYYY-MM"}
    if region=="EU": return {"pages":2,"style":"two-page allowed; simple","date_format":"YYYY-MM"}
    if region=="GL": return {"pages":1,"style":"one-page allowed; simple","date_format":"YYYY-MM"}    
    return {"pages":2,"style":"no photo; refs on request ok","date_format":"YYYY-MM"}

def run_tailor(profile: Profile, job: JobJD)->LLMOutput:
    selected = select_topk_bullets(profile, job.jd_text)
    prompt = build_user_prompt(
        profile_min_json=profile.model_dump_json(),
        jd_text=job.jd_text,
        region_rules=region_rules(job.region),
        selected_bullets_json=json.dumps(selected, ensure_ascii=False),
        schema_json=json.dumps(OUTPUT_JSON_SCHEMA.to_json_dict(), ensure_ascii=False),
    )
    raw = call_llm(prompt)
    # call validator to check the schema
    data = validate_or_error(raw)
    # check to make sure it is grounded with facts
    business_rules_check(data, profile)
    return LLMOutput(**data)
