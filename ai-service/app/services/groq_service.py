import json
import os

from dotenv import load_dotenv
from groq import Groq

from app.prompts.report_prompt import REPORT_SYSTEM_PROMPT


load_dotenv()


GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is not configured")


client = Groq(
    api_key=GROQ_API_KEY
)


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

    # Add previous conversation
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

    return json.loads(result)