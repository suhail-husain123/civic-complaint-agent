import os
import uuid

from datetime import datetime, timezone
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form,
    Request
)

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials
)

from sqlalchemy.orm import Session

from apscheduler.schedulers.background import (
    BackgroundScheduler
)

from database import (
    get_db,
    engine,
    Base
)

from models import (
    User,
    UserRole,
    Department,
    Complaint,
    ComplaintPriority,
    ComplaintStatus,
    ComplaintHistory,
    AIDecision,
    Notification,
    Escalation
)

from schemas import (
    UserCreate,
    UserLogin,
    UserResponse,
    AdminCreate,
    DepartmentCreate,
    DepartmentResponse,
    ComplaintCreate,
    ComplaintResponse,
    ComplaintHistoryResponse,
    AIDecisionResponse,
    ComplaintReviewUpdate,
    ComplaintStatusUpdate,
    NotificationResponse,
    EscalationResponse,
    DashboardSummaryResponse,
    AdminDepartmentUpdate
)

from security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token
)

from agent.graph import complaint_graph

from services.sla_service import (
    calculate_sla_deadline
)

from services.location_service import (
    get_address_from_coordinates
)

from services.notification_service import (
    create_notification
)

from jobs.escalation_jobs import (
    check_sla_escalations
)
from fastapi.staticfiles import StaticFiles

from fastapi.middleware.cors import CORSMiddleware

# -------------------------
# BACKGROUND SCHEDULER
# -------------------------

scheduler = BackgroundScheduler(
    timezone="Asia/Kolkata"
)


@asynccontextmanager
async def lifespan(app: FastAPI):

    scheduler.add_job(
        check_sla_escalations,
        "interval",
        minutes=10,
        id="sla_escalation_check",
        replace_existing=True
    )

    scheduler.start()

    yield

    scheduler.shutdown()


# -------------------------
# DATABASE TABLE CREATION
# -------------------------

Base.metadata.create_all(
    bind=engine
)


# -------------------------
# FASTAPI APP
# -------------------------

app = FastAPI(
    title="Civic Complaint Resolution Agent",
    lifespan=lifespan
)


FRONTEND_URL = os.getenv("FRONTEND_URL")

allowed_origins = [
    "http://localhost:5173"
]

if FRONTEND_URL:
    allowed_origins.append(
        FRONTEND_URL.rstrip("/")
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

os.makedirs(
    "uploads",
    exist_ok=True
)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

# -------------------------
# HTTP BEARER AUTH
# -------------------------

security = HTTPBearer()


# -------------------------
# GET CURRENT USER
# -------------------------

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user = db.query(User).filter(
        User.id == int(user_id)
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user


# -------------------------
# ROLE CHECKER
# -------------------------

def require_roles(
    *allowed_roles: UserRole
):

    def role_checker(
        current_user: User = Depends(get_current_user)
    ):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to perform this action"
            )

        return current_user

    return role_checker


# -------------------------
# HOME
# -------------------------

@app.get("/")
def home():
    return {
        "message": "Civic Complaint Resolution Agent API is running"
    }


# -------------------------
# USER REGISTRATION
# -------------------------

@app.post(
    "/users",
    response_model=UserResponse,
    status_code=201
)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(
            user.password
        ),
        role=UserRole.CITIZEN
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# -------------------------
# LOGIN
# -------------------------

@app.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user.password,
        existing_user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        {
            "sub": str(existing_user.id)
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# -------------------------
# CURRENT USER
# -------------------------

@app.get(
    "/users/me",
    response_model=UserResponse
)
def get_me(
    current_user: User = Depends(
        get_current_user
    )
):
    return current_user


# -------------------------
# CREATE DEPARTMENT
# -------------------------

@app.post(
    "/departments",
    response_model=DepartmentResponse,
    status_code=201
)
def create_department(
    department: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.SUPER_ADMIN)
    )
):
    existing_department = db.query(
        Department
    ).filter(
        Department.name == department.name
    ).first()

    if existing_department:
        raise HTTPException(
            status_code=400,
            detail="Department already exists"
        )

    new_department = Department(
        name=department.name,
        description=department.description
    )

    db.add(new_department)
    db.commit()
    db.refresh(new_department)

    return new_department


# -------------------------
# GET DEPARTMENTS
# -------------------------

@app.get(
    "/departments",
    response_model=list[DepartmentResponse]
)
def get_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):
    return db.query(Department).all()


# -------------------------
# CREATE DEPARTMENT ADMIN
# -------------------------

@app.post(
    "/admins",
    response_model=UserResponse,
    status_code=201
)
def create_department_admin(
    admin: AdminCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.SUPER_ADMIN)
    )
):
    existing_user = db.query(User).filter(
        User.email == admin.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    if admin.department_id is None:
        raise HTTPException(
            status_code=400,
            detail="Department is required"
        )

    department = db.query(Department).filter(
        Department.id == admin.department_id
    ).first()

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )

    new_admin = User(
        name=admin.name,
        email=admin.email,
        password_hash=hash_password(
            admin.password
        ),
        role=UserRole.DEPARTMENT_ADMIN,
        department_id=admin.department_id
    )

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    return new_admin


# -------------------------
# CREATE COMPLAINT
# -------------------------

@app.post(
    "/complaints",
    response_model=ComplaintResponse,
    status_code=201
)
def create_complaint(
    complaint: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.CITIZEN)
    )
):
    address = complaint.address

    # Reverse geocoding
    if (
        complaint.latitude is not None
        and complaint.longitude is not None
    ):
        detected_address = (
            get_address_from_coordinates(
                complaint.latitude,
                complaint.longitude
            )
        )

        if detected_address:
            address = detected_address

    new_complaint = Complaint(
        citizen_id=current_user.id,
        description=complaint.description,
        latitude=complaint.latitude,
        longitude=complaint.longitude,
        address=address,
        image_url=complaint.image_url,
        status=ComplaintStatus.SUBMITTED
    )

    db.add(new_complaint)

    # Gets complaint ID without committing yet
    db.flush()

    creation_history = ComplaintHistory(
        complaint_id=new_complaint.id,
        performed_by=current_user.id,
        actor_type="CITIZEN",
        action="CREATED",
        old_value=None,
        new_value=ComplaintStatus.SUBMITTED.value,
        note="Complaint submitted by citizen"
    )

    db.add(creation_history)

    initial_state = {
        "complaint_id": new_complaint.id,
        "description": new_complaint.description,
        "latitude": new_complaint.latitude,
        "longitude": new_complaint.longitude,
        "address": new_complaint.address,
        "status": ComplaintStatus.SUBMITTED.value
    }

    # -------------------------
    # RUN AI AGENT
    # -------------------------

    try:
        agent_result = complaint_graph.invoke(
            initial_state
        )

    except Exception as error:
        print(
            "Agent processing failed:",
            error
        )

        agent_result = {
            "category": None,
            "priority": None,
            "confidence": None,
            "department_id": None,
            "department_name": None,
            "needs_human_review": True,
            "status": (
                ComplaintStatus
                .MANUAL_REVIEW_REQUIRED
                .value
            ),
            "reasoning": None,
            "error": str(error)
        }

    # -------------------------
    # SAVE AI RESULT
    # -------------------------

    new_complaint.category = agent_result.get(
        "category"
    )

    priority_value = agent_result.get(
        "priority"
    )

    if priority_value:
        priority_enum = ComplaintPriority(
            priority_value
        )

        new_complaint.priority = priority_enum

        new_complaint.sla_deadline = (
            calculate_sla_deadline(
                priority_enum
            )
        )

    new_complaint.department_id = (
        agent_result.get(
            "department_id"
        )
    )

    new_complaint.ai_confidence = (
        agent_result.get(
            "confidence"
        )
    )

    new_complaint.needs_human_review = (
        agent_result.get(
            "needs_human_review",
            False
        )
    )

    status_value = agent_result.get(
        "status",
        ComplaintStatus
        .MANUAL_REVIEW_REQUIRED
        .value
    )

    new_complaint.status = ComplaintStatus(
        status_value
    )

    # -------------------------
    # SAVE AI DECISION MEMORY
    # -------------------------

    ai_priority = None

    if priority_value:
        ai_priority = ComplaintPriority(
            priority_value
        )

    ai_decision = AIDecision(
        complaint_id=new_complaint.id,
        predicted_category=agent_result.get(
            "category"
        ),
        predicted_department=agent_result.get(
            "department_name"
        ),
        predicted_priority=ai_priority,
        confidence_score=agent_result.get(
            "confidence"
        ),
        needs_human_review=agent_result.get(
            "needs_human_review",
            False
        ),
        reasoning=agent_result.get(
            "reasoning"
        )
    )

    db.add(ai_decision)

    # -------------------------
    # SAVE HISTORY
    # -------------------------

    agent_history = ComplaintHistory(
        complaint_id=new_complaint.id,
        performed_by=None,
        actor_type="AI",
        action="AI_PROCESSED",
        old_value=ComplaintStatus.SUBMITTED.value,
        new_value=status_value,
        note=(
            f"Category: "
            f"{agent_result.get('category')}, "
            f"Priority: "
            f"{agent_result.get('priority')}, "
            f"Confidence: "
            f"{agent_result.get('confidence')}, "
            f"Department: "
            f"{agent_result.get('department_name')}, "
            f"Error: "
            f"{agent_result.get('error')}"
        )
    )

    db.add(agent_history)

    db.commit()
    db.refresh(new_complaint)

    return new_complaint


# -------------------------
# COMPLAINT HISTORY
# -------------------------

@app.get(
    "/complaints/{complaint_id}/history",
    response_model=list[ComplaintHistoryResponse]
)
def get_complaint_history(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):
    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id
    ).first()

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    if (
        current_user.role == UserRole.CITIZEN
        and complaint.citizen_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You cannot view this complaint"
        )

    if (
        current_user.role
        == UserRole.DEPARTMENT_ADMIN
        and complaint.department_id
        != current_user.department_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Complaint does not belong to your department"
        )

    return db.query(
        ComplaintHistory
    ).filter(
        ComplaintHistory.complaint_id
        == complaint_id
    ).order_by(
        ComplaintHistory.created_at.asc()
    ).all()


# -------------------------
# AI DECISIONS
# -------------------------

@app.get(
    "/complaints/{complaint_id}/ai-decisions",
    response_model=list[AIDecisionResponse]
)
def get_ai_decisions(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):
    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id
    ).first()

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    if (
        current_user.role == UserRole.CITIZEN
        and complaint.citizen_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You cannot view this complaint"
        )

    if (
        current_user.role
        == UserRole.DEPARTMENT_ADMIN
        and complaint.department_id
        != current_user.department_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Complaint does not belong to your department"
        )

    return db.query(
        AIDecision
    ).filter(
        AIDecision.complaint_id
        == complaint_id
    ).order_by(
        AIDecision.created_at.asc()
    ).all()


# -------------------------
# HUMAN REVIEW
# -------------------------

@app.patch(
    "/complaints/{complaint_id}/review",
    response_model=ComplaintResponse
)
def review_complaint(
    complaint_id: int,
    review: ComplaintReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.DEPARTMENT_ADMIN,
            UserRole.SUPER_ADMIN
        )
    )
):
    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id
    ).first()

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    if (
        current_user.role
        == UserRole.DEPARTMENT_ADMIN
        and complaint.department_id is not None
        and complaint.department_id
        != current_user.department_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Complaint does not belong to your department"
        )

    old_category = complaint.category
    old_priority = complaint.priority
    old_department_id = complaint.department_id

    if review.category is not None:
        complaint.category = review.category

    if review.priority is not None:
        complaint.priority = review.priority

        complaint.sla_deadline = (
            calculate_sla_deadline(
                review.priority
            )
        )

    if review.department_id is not None:
        department = db.query(
            Department
        ).filter(
            Department.id
            == review.department_id
        ).first()

        if not department:
            raise HTTPException(
                status_code=404,
                detail="Department not found"
            )

        complaint.department_id = (
            review.department_id
        )

    complaint.needs_human_review = False
    complaint.status = ComplaintStatus.ASSIGNED

    history = ComplaintHistory(
        complaint_id=complaint.id,
        performed_by=current_user.id,
        actor_type="HUMAN",
        action="AI_OVERRIDE",
        old_value=(
            f"category={old_category}, "
            f"priority={old_priority}, "
            f"department_id={old_department_id}"
        ),
        new_value=(
            f"category={complaint.category}, "
            f"priority={complaint.priority}, "
            f"department_id="
            f"{complaint.department_id}"
        ),
        note="AI decision reviewed and corrected by admin"
    )

    db.add(history)

    db.commit()
    db.refresh(complaint)

    return complaint


# -------------------------
# STATUS UPDATE
# -------------------------

@app.patch(
    "/complaints/{complaint_id}/status",
    response_model=ComplaintResponse
)
def update_complaint_status(
    complaint_id: int,
    update: ComplaintStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.DEPARTMENT_ADMIN,
            UserRole.SUPER_ADMIN
        )
    )
):
    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id
    ).first()

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    if (
        current_user.role
        == UserRole.DEPARTMENT_ADMIN
        and complaint.department_id
        != current_user.department_id
    ):
        raise HTTPException(
            status_code=403,
            detail="This complaint does not belong to your department"
        )

    old_status = complaint.status

    allowed_transitions = {
        ComplaintStatus.ASSIGNED: [
            ComplaintStatus.IN_PROGRESS
        ],

        ComplaintStatus.IN_PROGRESS: [
            ComplaintStatus.RESOLVED
        ],

        ComplaintStatus.RESOLVED: [
            ComplaintStatus.CLOSED
        ]
    }

    allowed_next_statuses = (
        allowed_transitions.get(
            complaint.status,
            []
        )
    )

    if update.status not in allowed_next_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Cannot change status from "
                f"{complaint.status.value} "
                f"to {update.status.value}"
            )
        )

    if (
        update.status
        == ComplaintStatus.RESOLVED
    ):
        if not update.resolution_note:
            raise HTTPException(
                status_code=400,
                detail="Resolution note is required"
            )

        if not update.resolution_image_url:
            raise HTTPException(
                status_code=400,
                detail="Resolution image is required"
            )

        complaint.resolution_note = (
            update.resolution_note
        )

        complaint.resolution_image_url = (
            update.resolution_image_url
        )

        complaint.resolved_at = (
            datetime.now(timezone.utc)
        )

    if (
        update.status
        == ComplaintStatus.CLOSED
    ):
        complaint.closed_at = (
            datetime.now(timezone.utc)
        )

    complaint.status = update.status

    history = ComplaintHistory(
        complaint_id=complaint.id,
        performed_by=current_user.id,
        actor_type="HUMAN",
        action="STATUS_CHANGED",
        old_value=old_status.value,
        new_value=update.status.value,
        note="Complaint status updated by admin"
    )

    db.add(history)

    create_notification(
        db=db,
        user_id=complaint.citizen_id,
        complaint_id=complaint.id,
        message=(
            f"Your complaint #{complaint.id} "
            f"status changed from "
            f"{old_status.value} "
            f"to {update.status.value}."
        )
    )

    db.commit()
    db.refresh(complaint)

    return complaint


# -------------------------
# GET NOTIFICATIONS
# -------------------------

@app.get(
    "/notifications",
    response_model=list[NotificationResponse]
)
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):
    return db.query(Notification).filter(
        Notification.user_id
        == current_user.id
    ).order_by(
        Notification.created_at.desc()
    ).all()


# -------------------------
# MARK NOTIFICATION READ
# -------------------------

@app.patch(
    "/notifications/{notification_id}/read",
    response_model=NotificationResponse
)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):
    notification = db.query(
        Notification
    ).filter(
        Notification.id == notification_id,
        Notification.user_id
        == current_user.id
    ).first()

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return notification


# -------------------------
# ADMIN COMPLAINT LIST
# -------------------------

@app.get(
    "/admin/complaints",
    response_model=list[ComplaintResponse]
)
def get_admin_complaints(
    status: Optional[ComplaintStatus] = None,
    priority: Optional[ComplaintPriority] = None,
    needs_human_review: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.DEPARTMENT_ADMIN,
            UserRole.SUPER_ADMIN
        )
    )
):
    query = db.query(Complaint)

    if (
        current_user.role
        == UserRole.DEPARTMENT_ADMIN
    ):
        query = query.filter(
            Complaint.department_id
            == current_user.department_id
        )

    if status is not None:
        query = query.filter(
            Complaint.status == status
        )

    if priority is not None:
        query = query.filter(
            Complaint.priority == priority
        )

    if needs_human_review is not None:
        query = query.filter(
            Complaint.needs_human_review
            == needs_human_review
        )

    return query.order_by(
        Complaint.created_at.desc()
    ).all()


# -------------------------
# CITIZEN COMPLAINT LIST
# -------------------------

@app.get(
    "/my-complaints",
    response_model=list[ComplaintResponse]
)
def get_my_complaints(
    status: Optional[ComplaintStatus] = None,
    priority: Optional[ComplaintPriority] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.CITIZEN)
    )
):
    query = db.query(Complaint).filter(
        Complaint.citizen_id
        == current_user.id
    )

    if status is not None:
        query = query.filter(
            Complaint.status == status
        )

    if priority is not None:
        query = query.filter(
            Complaint.priority == priority
        )

    return query.order_by(
        Complaint.created_at.desc()
    ).all()


# -------------------------
# SINGLE COMPLAINT
# -------------------------

@app.get(
    "/complaints/{complaint_id}",
    response_model=ComplaintResponse
)
def get_complaint_details(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):
    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id
    ).first()

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    if (
        current_user.role == UserRole.CITIZEN
        and complaint.citizen_id
        != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You cannot view this complaint"
        )

    if (
        current_user.role
        == UserRole.DEPARTMENT_ADMIN
        and complaint.department_id
        != current_user.department_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Complaint does not belong to your department"
        )

    complaint.department_name = (
        complaint.department.name
        if complaint.department
        else None
    )

    return complaint


# -------------------------
# ADMIN ESCALATIONS
# -------------------------

@app.get(
    "/admin/escalations",
    response_model=list[EscalationResponse]
)
def get_escalations(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.DEPARTMENT_ADMIN,
            UserRole.SUPER_ADMIN
        )
    )
):
    query = db.query(Escalation).join(
        Complaint,
        Escalation.complaint_id
        == Complaint.id
    )

    if (
        current_user.role
        == UserRole.DEPARTMENT_ADMIN
    ):
        query = query.filter(
            Complaint.department_id
            == current_user.department_id
        )

    return query.order_by(
        Escalation.escalated_at.desc()
    ).all()


# -------------------------
# COMPLAINT ESCALATIONS
# -------------------------

@app.get(
    "/complaints/{complaint_id}/escalations",
    response_model=list[EscalationResponse]
)
def get_complaint_escalations(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):
    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id
    ).first()

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    if (
        current_user.role == UserRole.CITIZEN
        and complaint.citizen_id
        != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You cannot view this complaint"
        )

    if (
        current_user.role
        == UserRole.DEPARTMENT_ADMIN
        and complaint.department_id
        != current_user.department_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Complaint does not belong to your department"
        )

    return db.query(Escalation).filter(
        Escalation.complaint_id
        == complaint_id
    ).order_by(
        Escalation.escalated_at.asc()
    ).all()


# -------------------------
# CITIZEN DASHBOARD
# -------------------------

@app.get(
    "/dashboard/citizen",
    response_model=DashboardSummaryResponse
)
def citizen_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.CITIZEN)
    )
):
    query = db.query(Complaint).filter(
        Complaint.citizen_id
        == current_user.id
    )

    return build_dashboard_summary(
        query
    )


# -------------------------
# DEPARTMENT DASHBOARD
# -------------------------

@app.get(
    "/dashboard/department",
    response_model=DashboardSummaryResponse
)
def department_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.DEPARTMENT_ADMIN
        )
    )
):
    query = db.query(Complaint).filter(
        Complaint.department_id
        == current_user.department_id
    )

    return build_dashboard_summary(
        query
    )


# -------------------------
# SUPER ADMIN DASHBOARD
# -------------------------

@app.get(
    "/dashboard/super-admin",
    response_model=DashboardSummaryResponse
)
def super_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.SUPER_ADMIN
        )
    )
):
    query = db.query(Complaint)

    return build_dashboard_summary(
        query
    )


# -------------------------
# DASHBOARD HELPER
# -------------------------

def build_dashboard_summary(
    query
):
    return {
        "total_complaints":
            query.count(),

        "submitted":
            query.filter(
                Complaint.status
                == ComplaintStatus.SUBMITTED
            ).count(),

        "assigned":
            query.filter(
                Complaint.status
                == ComplaintStatus.ASSIGNED
            ).count(),

        "in_progress":
            query.filter(
                Complaint.status
                == ComplaintStatus.IN_PROGRESS
            ).count(),

        "resolved":
            query.filter(
                Complaint.status
                == ComplaintStatus.RESOLVED
            ).count(),

        "closed":
            query.filter(
                Complaint.status
                == ComplaintStatus.CLOSED
            ).count(),

        "critical":
            query.filter(
                Complaint.priority
                == ComplaintPriority.CRITICAL
            ).count(),

        "escalated":
            query.filter(
                Complaint.is_escalated.is_(True)
            ).count(),

        "manual_review_required":
            query.filter(
                Complaint.needs_human_review.is_(True)
            ).count()
    }


# -------------------------
# GET DEPARTMENT ADMINS
# -------------------------

@app.get(
    "/admins",
    response_model=list[UserResponse]
)
def get_admins(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.SUPER_ADMIN
        )
    )
):
    return db.query(User).filter(
        User.role
        == UserRole.DEPARTMENT_ADMIN
    ).all()


# -------------------------
# CHANGE ADMIN DEPARTMENT
# -------------------------

@app.patch(
    "/admins/{admin_id}/department",
    response_model=UserResponse
)
def update_admin_department(
    admin_id: int,
    update: AdminDepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.SUPER_ADMIN
        )
    )
):
    admin = db.query(User).filter(
        User.id == admin_id,
        User.role
        == UserRole.DEPARTMENT_ADMIN
    ).first()

    if not admin:
        raise HTTPException(
            status_code=404,
            detail="Department admin not found"
        )

    department = db.query(
        Department
    ).filter(
        Department.id
        == update.department_id
    ).first()

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )

    admin.department_id = department.id

    db.commit()
    db.refresh(admin)

    return admin


# -------------------------
# IMAGE UPLOAD
# -------------------------

@app.post("/upload-image")
async def upload_image(
    request: Request,
    image: UploadFile = File(...),
    current_user: User = Depends(
        get_current_user
    )
):
    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ]

    if image.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Only JPEG, PNG and WEBP "
                "images are allowed"
            )
        )

    if not image.filename:
        raise HTTPException(
            status_code=400,
            detail="Invalid filename"
        )

    file_extension = (
        image.filename
        .rsplit(".", 1)[-1]
        .lower()
    )

    unique_filename = (
        f"{uuid.uuid4()}."
        f"{file_extension}"
    )

    os.makedirs(
        "uploads",
        exist_ok=True
    )

    file_path = os.path.join(
        "uploads",
        unique_filename
    )

    contents = await image.read()

    with open(
        file_path,
        "wb"
    ) as file:
        file.write(contents)

    base_url = str(
        request.base_url
    ).rstrip("/")

    image_url = (
        f"{base_url}/uploads/"
        f"{unique_filename}"
    )

    return {
        "filename": unique_filename,
        "image_url": image_url
    }

@app.post(
    "/complaints-with-image",
    response_model=ComplaintResponse,
    status_code=201
)
async def create_complaint_with_image(
    request:Request,
    description: str = Form(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    address: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.CITIZEN)
    )
):
    image_url = None

    if image:
        allowed_types = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ]

        if image.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="Only JPEG, PNG and WEBP images are allowed"
            )

        file_extension = (
            image.filename
            .rsplit(".", 1)[-1]
            .lower()
        )

        unique_filename = (
            f"{uuid.uuid4()}.{file_extension}"
        )

        file_path = os.path.join(
            "uploads",
            unique_filename
        )

        contents = await image.read()

        with open(
            file_path,
            "wb"
        ) as file:
            file.write(contents)

        base_url = str(
            request.base_url
        ).rstrip("/")

        image_url = (
            f"{base_url}/uploads/"
            f"{unique_filename}"
        )
    final_address = address

    if (
        latitude is not None
        and longitude is not None
    ):
        detected_address = get_address_from_coordinates(
            latitude,
            longitude
        )

        if detected_address:
            final_address = detected_address

    new_complaint = Complaint(
        citizen_id=current_user.id,
        description=description,
        latitude=latitude,
        longitude=longitude,
        address=final_address,
        image_url=image_url,
        status=ComplaintStatus.SUBMITTED
    )

    db.add(new_complaint)
    db.flush()

    creation_history = ComplaintHistory(
        complaint_id=new_complaint.id,
        performed_by=current_user.id,
        actor_type="CITIZEN",
        action="CREATED",
        old_value=None,
        new_value=ComplaintStatus.SUBMITTED.value,
        note="Complaint submitted by citizen"
    )

    db.add(creation_history)

    initial_state = {
        "complaint_id": new_complaint.id,
        "description": new_complaint.description,
        "latitude": new_complaint.latitude,
        "longitude": new_complaint.longitude,
        "address": new_complaint.address,
        "status": ComplaintStatus.SUBMITTED.value
    }

    try:
        agent_result = complaint_graph.invoke(
            initial_state
        )

    except Exception as error:
        agent_result = {
            "category": None,
            "priority": None,
            "confidence": None,
            "department_id": None,
            "department_name": None,
            "needs_human_review": True,
            "status": ComplaintStatus.MANUAL_REVIEW_REQUIRED.value,
            "reasoning": None,
            "error": str(error)
        }

    new_complaint.category = agent_result.get(
        "category"
    )

    priority_value = agent_result.get(
        "priority"
    )

    if priority_value:
        priority_enum = ComplaintPriority(
            priority_value
        )

        new_complaint.priority = priority_enum

        new_complaint.sla_deadline = (
            calculate_sla_deadline(
                priority_enum
            )
        )

    new_complaint.department_id = agent_result.get(
        "department_id"
    )

    new_complaint.ai_confidence = agent_result.get(
        "confidence"
    )

    new_complaint.needs_human_review = agent_result.get(
        "needs_human_review",
        False
    )

    status_value = agent_result.get(
        "status",
        ComplaintStatus.MANUAL_REVIEW_REQUIRED.value
    )

    new_complaint.status = ComplaintStatus(
        status_value
    )

    ai_decision = AIDecision(
        complaint_id=new_complaint.id,
        predicted_category=agent_result.get(
            "category"
        ),
        predicted_department=agent_result.get(
            "department_name"
        ),
        predicted_priority=(
            ComplaintPriority(priority_value)
            if priority_value
            else None
        ),
        confidence_score=agent_result.get(
            "confidence"
        ),
        needs_human_review=agent_result.get(
            "needs_human_review",
            False
        ),
        reasoning=agent_result.get(
            "reasoning"
        )
    )

    db.add(ai_decision)

    db.add(
        ComplaintHistory(
            complaint_id=new_complaint.id,
            performed_by=None,
            actor_type="AI",
            action="AI_PROCESSED",
            old_value=ComplaintStatus.SUBMITTED.value,
            new_value=status_value,
            note=agent_result.get("reasoning")
        )
    )

    db.commit()
    db.refresh(new_complaint)

    return new_complaint


@app.get("/reverse-geocode")
def reverse_geocode_location(
    latitude: float,
    longitude: float
):
    from geopy.geocoders import Nominatim

    geolocator = Nominatim(
        user_agent="civicresolve"
    )

    location = geolocator.reverse(
        (latitude, longitude),
        language="en"
    )

    if not location:
        raise HTTPException(
            status_code=404,
            detail="Address could not be determined"
        )

    return {
        "address": location.address
    }