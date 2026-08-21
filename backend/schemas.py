from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr

from models import (
    UserRole,
    ComplaintPriority,
    ComplaintStatus
)


# -------------------------
# USER SCHEMAS
# -------------------------

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    department_id: Optional[int] = None

    model_config = {
        "from_attributes": True
    }


# -------------------------
# ADMIN SCHEMA
# -------------------------

class AdminCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    department_id: Optional[int] = None


# -------------------------
# DEPARTMENT SCHEMAS
# -------------------------

class DepartmentCreate(BaseModel):
    name: str
    description: Optional[str] = None


class DepartmentResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    model_config = {
        "from_attributes": True
    }


# -------------------------
# COMPLAINT SCHEMAS
# -------------------------

class ComplaintCreate(BaseModel):
    description: str

    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None

    image_url: Optional[str] = None


class ComplaintResponse(BaseModel):
    id: int
    citizen_id: int
    department_id: Optional[int] = None

    description: str

    category: Optional[str] = None
    priority: Optional[ComplaintPriority] = None
    status: ComplaintStatus

    ai_confidence: Optional[float] = None
    needs_human_review: bool

    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None

    image_url: Optional[str] = None

    resolution_note: Optional[str] = None
    resolution_image_url: Optional[str] = None

    sla_deadline: Optional[datetime] = None
    is_escalated: bool

    created_at: datetime
    updated_at: datetime

    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }

class ComplaintHistoryResponse(BaseModel):
    id: int
    complaint_id: int
    performed_by: Optional[int] = None
    actor_type: str
    action: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    note: Optional[str] = None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class AIDecisionResponse(BaseModel):
    id: int
    complaint_id: int
    predicted_category: Optional[str] = None
    predicted_department: Optional[str] = None
    predicted_priority: Optional[ComplaintPriority] = None
    confidence_score: Optional[float] = None
    needs_human_review: bool
    reasoning: Optional[str] = None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class ComplaintReviewUpdate(BaseModel):
    category: Optional[str] = None
    priority: Optional[ComplaintPriority] = None
    department_id: Optional[int] = None

class ComplaintStatusUpdate(BaseModel):
    status: ComplaintStatus
    resolution_note: Optional[str] = None
    resolution_image_url: Optional[str] = None

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    complaint_id: Optional[int] = None
    type: str
    message: str
    is_read: bool
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class EscalationResponse(BaseModel):
    id: int
    complaint_id: int
    escalation_level: int
    reason: str
    escalated_at: datetime
    resolved_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }


class DashboardSummaryResponse(BaseModel):
    total_complaints: int
    submitted: int
    assigned: int
    in_progress: int
    resolved: int
    closed: int
    critical: int
    escalated: int
    manual_review_required: int

class AdminDepartmentUpdate(BaseModel):
    department_id: int