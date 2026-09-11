import json
import os

from dotenv import load_dotenv
from groq import Groq

from app.prompts.report_prompt import REPORT_SYSTEM_PROMPT
from app.schemas.report import (
    ReportResponse,
    UniversityMatchingResponse,
)


load_dotenv()


GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is not configured")


client = Groq(
    api_key=GROQ_API_KEY
)


# ==================================================
# CITIZEN REPORT PROCESSING
# ==================================================

def process_report(messages, citizen_location=None):

    # --------------------------------------------------
    # REGISTERED CITIZEN LOCATION
    # --------------------------------------------------

    location_context = ""

    if citizen_location:

        location_context = f"""
==================================================
REGISTERED CITIZEN LOCATION
==================================================

The following information is trusted information from
the JanSamadhan backend.

IMPORTANT:
This is the citizen's REGISTERED location.

It is NOT automatically the location where the
reported problem is occurring.

Registered citizen location:

Address: {citizen_location.get("address")}
City: {citizen_location.get("city")}
District: {citizen_location.get("district")}
State: {citizen_location.get("state")}
Pincode: {citizen_location.get("pincode")}

The citizen's registered location and the problem
location must be treated as two separate things.
"""

    # --------------------------------------------------
    # SYSTEM PROMPT
    # --------------------------------------------------

    system_prompt = f"""
{REPORT_SYSTEM_PROMPT}

{location_context}
"""

    # --------------------------------------------------
    # BUILD GROQ CONVERSATION
    # --------------------------------------------------

    groq_messages = [
        {
            "role": "system",
            "content": system_prompt
        }
    ]

    for message in messages:

        groq_messages.append({
            "role": message["role"],
            "content": message["content"]
        })

    # --------------------------------------------------
    # CALL GROQ
    # --------------------------------------------------

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",

        messages=groq_messages,

        response_format={
            "type": "json_object"
        }
    )

    # --------------------------------------------------
    # GET AI RESPONSE
    # --------------------------------------------------

    result = response.choices[0].message.content

    result = json.loads(result)

    # --------------------------------------------------
    # VALIDATE + CONVERT TO PYDANTIC MODEL
    # --------------------------------------------------

    return ReportResponse.model_validate(result)


# ==================================================
# UNIVERSITY REQUIREMENT EXTRACTION
# ==================================================

def generate_university_requirements(report):

    """
    Analyze a VERIFIED civic problem and determine
    what capabilities a university should have to
    develop a suitable solution.
    """

    system_prompt = """
You are the university-matching intelligence for
JanSamadhan.

Your task is to analyze a VERIFIED civic/government
problem and determine what kind of university expertise
would be useful to solve it.

You are NOT selecting a university.

You are only identifying the required capabilities.

Return ONLY valid JSON with exactly this structure:

{
  "requirements": {
    "skills": [],
    "researchAreas": [],
    "technologies": [],
    "departments": []
  }
}

Rules:

1. skills:
   Specific technical or practical skills required
   to solve the problem.

2. researchAreas:
   Relevant research or academic areas.

3. technologies:
   Technologies, platforms, hardware, software,
   methods, or technical approaches that may be useful.

4. departments:
   University departments that would likely have
   relevant expertise.

Keep the values concise.

Do not include explanations outside the JSON.

Do not recommend or name any university.

Do not invent unnecessary technologies.

Focus only on capabilities genuinely relevant
to the verified problem.
"""

    report_text = f"""
Title:
{report.get("title")}

Description:
{report.get("description")}

Category:
{report.get("category")}

Priority:
{report.get("priority")}

Location:
Address: {(report.get("location") or {}).get("address")}
City: {(report.get("location") or {}).get("city")}
District: {(report.get("location") or {}).get("district")}
State: {(report.get("location") or {}).get("state")}
Pincode: {(report.get("location") or {}).get("pincode")}
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",

        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": report_text
            }
        ],

        response_format={
            "type": "json_object"
        }
    )

    result = response.choices[0].message.content

    result = json.loads(result)

    return UniversityMatchingResponse.model_validate(result)


# ==================================================
# INDUSTRY REQUIREMENT EXTRACTION
# ==================================================

def generate_industry_requirements(report, solution):
    """Extract matching requirements only; this function never selects an industry."""
    system_prompt = """
You extract requirements for matching an approved civic solution with industry
capabilities. You are NOT selecting, recommending, or naming an industry.
Return ONLY valid JSON in exactly this form:
{
  "success": true,
  "requirements": {
    "skills": [], "technologies": [], "services": [], "domains": [],
    "location": {"area": "", "city": "", "district": "", "state": "", "pincode": ""}
  }
}
Use concise strings. Derive capabilities from the report and approved solution.
Copy location only from the report when available. Do not invent a location.
"""
    report_location = report.get("location") or {}
    prompt = f"""Report title: {report.get('title', '')}
Report description: {report.get('description', '')}
Report category: {report.get('category', '')}
Report location: {json.dumps(report_location)}

Approved solution title: {solution.get('title', '')}
Approved solution description: {solution.get('description', '')}
Approved solution technologies: {json.dumps(solution.get('technologies') or [])}
Implementation plan: {solution.get('implementationPlan', '')}
"""
    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )
    result = json.loads(response.choices[0].message.content)
    requirements = result.get("requirements")
    if not isinstance(requirements, dict):
        raise ValueError("Groq response did not contain requirements")

    normalized = {}
    for field in ("skills", "technologies", "services", "domains"):
        values = requirements.get(field) or []
        normalized[field] = [str(value).strip() for value in values if str(value).strip()] if isinstance(values, list) else []
    location = requirements.get("location") or {}
    normalized["location"] = {field: str(location.get(field) or "").strip() for field in ("area", "city", "district", "state", "pincode")}
    return {"success": True, "requirements": normalized}
