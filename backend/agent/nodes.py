import os

from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from agent.state import ComplaintAgentState
from agent.tools import get_department_by_name
from agent.prompts import COMPLAINT_ANALYSIS_PROMPT

from agent.memory import (
    get_complaint_memory,
    get_similar_historical_complaints
)

load_dotenv()


client = genai.Client(
    api_key=os.getenv("GOOGLE_API_KEY")
)


class ComplaintAnalysis(BaseModel):
    category: str
    priority: str

    confidence: float = Field(
        ge=0,
        le=1
    )

    reasoning: str


def load_memory(
    state: ComplaintAgentState
):
    complaint_id = state.get(
        "complaint_id"
    )

    description = state.get(
        "description",
        ""
    )

    current_memory = get_complaint_memory(
        complaint_id
    )

    similar_complaints = (
        get_similar_historical_complaints(
            complaint_id=complaint_id,
            description=description
        )
    )

    context_parts = []

    if current_memory:
        history = "\n".join(
            current_memory["history"]
        )

        context_parts.append(
            "Current complaint history:\n"
            f"{history}"
        )

    if similar_complaints:
        similar_text = []

        for item in similar_complaints:

            if (
                not item.get("ai_category")
                or not item.get("final_category")
                or not item.get("final_priority")
            ):
                continue

            similar_text.append(
                (
                    f"Past complaint: {item['description']}\n"
                    f"AI category: {item['ai_category']}\n"
                    f"Final category: {item['final_category']}\n"
                    f"Final priority: {item['final_priority']}\n"
                    f"Human override: {item['human_override']}"
                )
            )

        context_parts.append(
            "Similar historical complaints:\n"
            + "\n\n".join(similar_text)
        )

    if not context_parts:
        return {
            "historical_context":
                "No relevant historical context available."
        }

    print(
    "Historical context loaded:\n",
    "\n\n".join(context_parts)
)

    return {
        "historical_context":
            "\n\n".join(context_parts)
    }


def analyze_complaint(
    state: ComplaintAgentState
):
    description = state["description"]

    historical_context = (
        state.get("historical_context")
        or "No relevant historical context available."
    )

    prompt = COMPLAINT_ANALYSIS_PROMPT.format(
        description=description,
        historical_context=historical_context
    )


    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ComplaintAnalysis,
            automatic_function_calling=types.AutomaticFunctionCallingConfig(
                disable=True
            )
        )
    )

    result = response.parsed

    print("Gemini returned:", result)

    return {
        "category": result.category,
        "priority": result.priority,
        "confidence": result.confidence,
        "reasoning": result.reasoning
    }


def confidence_router(
    state: ComplaintAgentState
):
    confidence = state.get(
        "confidence",
        0
    )

    if confidence >= 0.70:
        return "auto_route"

    return "manual_review"


def auto_route(
    state: ComplaintAgentState
):
    category = state.get("category")

    department_mapping = {
        "WATER": "Water Department",
        "ROADS": "Roads Department",
        "SANITATION": "Sanitation Department",
        "ELECTRICITY": "Electricity Department",
        "STREET_LIGHTING": "Street Lighting Department"
    }

    department_name = department_mapping.get(
        category
    )

    print(
        "DEPARTMENT NAME:",
        department_name
    )

    if not department_name:
        return {
            "status":
                "MANUAL_REVIEW_REQUIRED",
            "needs_human_review": True,
            "error":
                "No department mapping found"
        }

    department = get_department_by_name(
        department_name
    )

    print(
        "DEPARTMENT FOUND:",
        department
    )

    if not department:
        return {
            "status":
                "MANUAL_REVIEW_REQUIRED",
            "needs_human_review": True,
            "error": (
                f"{department_name} "
                f"does not exist in database"
            )
        }

    return {
        "department_id":
            department["id"],
        "department_name":
            department["name"],
        "status": "ASSIGNED",
        "needs_human_review": False,
        "error": None
    }
def manual_review(
    state: ComplaintAgentState
):
    return {
        "status": "MANUAL_REVIEW_REQUIRED",
        "needs_human_review": True
    }