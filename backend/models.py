from enum import Enum as PyEnum

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Enum
)

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


# -------------------------
# ENUMS
# -------------------------

class UserRole(str, PyEnum):
    CITIZEN = "CITIZEN"
    DEPARTMENT_ADMIN = "DEPARTMENT_ADMIN"
    SUPER_ADMIN = "SUPER_ADMIN"


class ComplaintPriority(str, PyEnum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ComplaintStatus(str, PyEnum):
    SUBMITTED = "SUBMITTED"
    MANUAL_REVIEW_REQUIRED = "MANUAL_REVIEW_REQUIRED"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"


# -------------------------
# DEPARTMENT
# -------------------------

class Department(Base):
    __tablename__ = "departments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        unique=True,
        nullable=False
    )

    description = Column(
        String,
        nullable=True
    )

    users = relationship(
        "User",
        back_populates="department"
    )

    complaints = relationship(
        "Complaint",
        back_populates="department"
    )


# -------------------------
# USER
# -------------------------

class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    password_hash = Column(
        String,
        nullable=False
    )

    role = Column(
        Enum(UserRole),
        nullable=False,
        default=UserRole.CITIZEN
    )

    department_id = Column(
        Integer,
        ForeignKey("departments.id"),
        nullable=True
    )

    department = relationship(
        "Department",
        back_populates="users"
    )

    complaints = relationship(
        "Complaint",
        back_populates="citizen"
    )

    notifications = relationship(
        "Notification",
        back_populates="user"
    )


# -------------------------
# COMPLAINT
# -------------------------

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    citizen_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    department_id = Column(
        Integer,
        ForeignKey("departments.id"),
        nullable=True
    )

    description = Column(
        Text,
        nullable=False
    )

    category = Column(
        String,
        nullable=True
    )

    priority = Column(
        Enum(ComplaintPriority),
        nullable=True
    )

    status = Column(
        Enum(ComplaintStatus),
        nullable=False,
        default=ComplaintStatus.SUBMITTED
    )

    ai_confidence = Column(
        Float,
        nullable=True
    )

    needs_human_review = Column(
        Boolean,
        default=False
    )

    latitude = Column(
        Float,
        nullable=True
    )

    longitude = Column(
        Float,
        nullable=True
    )

    address = Column(
        String,
        nullable=True
    )

    image_url = Column(
        String,
        nullable=True
    )

    resolution_note = Column(
        Text,
        nullable=True
    )

    resolution_image_url = Column(
        String,
        nullable=True
    )

    sla_deadline = Column(
        DateTime(timezone=True),
        nullable=True
    )

    is_escalated = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    resolved_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    closed_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    citizen = relationship(
        "User",
        back_populates="complaints"
    )

    department = relationship(
        "Department",
        back_populates="complaints"
    )

    history = relationship(
        "ComplaintHistory",
        back_populates="complaint"
    )

    ai_decisions = relationship(
        "AIDecision",
        back_populates="complaint"
    )

    notifications = relationship(
        "Notification",
        back_populates="complaint"
    )

    escalations = relationship(
        "Escalation",
        back_populates="complaint"
    )


# -------------------------
# COMPLAINT HISTORY
# -------------------------

class ComplaintHistory(Base):
    __tablename__ = "complaint_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    complaint_id = Column(
        Integer,
        ForeignKey("complaints.id"),
        nullable=False
    )

    performed_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    actor_type = Column(
        String,
        nullable=False
    )

    action = Column(
        String,
        nullable=False
    )

    old_value = Column(
        String,
        nullable=True
    )

    new_value = Column(
        String,
        nullable=True
    )

    note = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    complaint = relationship(
        "Complaint",
        back_populates="history"
    )


# -------------------------
# AI DECISION
# -------------------------

class AIDecision(Base):
    __tablename__ = "ai_decisions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    complaint_id = Column(
        Integer,
        ForeignKey("complaints.id"),
        nullable=False
    )

    predicted_category = Column(
        String,
        nullable=True
    )

    predicted_department = Column(
        String,
        nullable=True
    )

    predicted_priority = Column(
        Enum(ComplaintPriority),
        nullable=True
    )

    confidence_score = Column(
        Float,
        nullable=True
    )

    needs_human_review = Column(
        Boolean,
        default=False
    )

    reasoning = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    complaint = relationship(
        "Complaint",
        back_populates="ai_decisions"
    )


# -------------------------
# NOTIFICATION
# -------------------------

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    complaint_id = Column(
        Integer,
        ForeignKey("complaints.id"),
        nullable=True
    )

    type = Column(
        String,
        nullable=False
    )

    message = Column(
        Text,
        nullable=False
    )

    is_read = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    user = relationship(
        "User",
        back_populates="notifications"
    )

    complaint = relationship(
        "Complaint",
        back_populates="notifications"
    )


# -------------------------
# ESCALATION
# -------------------------

class Escalation(Base):
    __tablename__ = "escalations"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    complaint_id = Column(
        Integer,
        ForeignKey("complaints.id"),
        nullable=False
    )

    escalation_level = Column(
        Integer,
        nullable=False,
        default=1
    )

    reason = Column(
        Text,
        nullable=False
    )

    escalated_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    resolved_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    complaint = relationship(
        "Complaint",
        back_populates="escalations"
    )


# -------------------------
# SLA RULE
# -------------------------

class SLARule(Base):
    __tablename__ = "sla_rules"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    priority = Column(
        Enum(ComplaintPriority),
        unique=True,
        nullable=False
    )

    resolution_time_hours = Column(
        Integer,
        nullable=False
    )