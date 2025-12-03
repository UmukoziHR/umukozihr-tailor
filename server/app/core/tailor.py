# Improved Tailor pipeline: pre-filter -> LLM -> validate -> repair

import re, json, logging
from collections import Counter
from .llm import build_user_prompt, call_llm, SYSTEM, OUTPUT_JSON_SCHEMA
from .validate import validate_or_error, business_rules_check
from app.models import Profile, JobJD, LLMOutput

logger = logging.getLogger(__name__)

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
    logger.info(f"Starting tailoring process for job: {job.id or job.title} at {job.company}")
    selected = select_topk_bullets(profile, job.jd_text)
    logger.info(f"Selected {len(selected)} top bullets from profile for job matching")
    
    prompt = build_user_prompt(
        profile_min_json=profile.model_dump_json(),
        jd_text=job.jd_text,
        region_rules=region_rules(job.region),
        selected_bullets_json=json.dumps(selected, ensure_ascii=False),
        schema_json=json.dumps(OUTPUT_JSON_SCHEMA.to_json_dict(), ensure_ascii=False),
    )
    logger.info(f"Built LLM prompt for {job.region} region, prompt length: {len(prompt)} chars")
    
    raw = call_llm(prompt)
    logger.info(f"LLM response received, length: {len(raw)} chars")
    logger.debug(f"Raw LLM response (first 500 chars): {raw[:500]}")

    # call validator to check the schema
    try:
        data = validate_or_error(raw)
        logger.info("LLM output passed schema validation")
    except Exception as validation_error:
        logger.error(f"Schema validation failed: {validation_error}")
        logger.error(f"Full raw LLM response that failed validation: {raw}")
        raise

    # check to make sure it is grounded with facts
    try:
        business_rules_check(data, profile)
        logger.info("LLM output passed business rules validation")
    except Exception as business_error:
        logger.error(f"Business rules validation failed: {business_error}")
        logger.error(f"Data that failed business rules: {json.dumps(data, indent=2)}")
        raise
    
    logger.info(f"Tailoring process completed successfully for job: {job.id or job.title}")
    return LLMOutput(**data)
