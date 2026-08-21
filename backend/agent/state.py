from typing import TypedDict, Optional


class ComplaintAgentState(TypedDict, total=False):

    complaint_id: int

    description: str

    latitude: Optional[float]
    longitude: Optional[float]
    address: Optional[str]

    category: Optional[str]

    priority: Optional[str]

    department_id: Optional[int]
    department_name: Optional[str]

    confidence: Optional[float]

    needs_human_review: bool

    status: str

    reasoning: Optional[str]

    historical_context: Optional[str]

    error: Optional[str]