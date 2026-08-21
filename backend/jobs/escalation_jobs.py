from datetime import datetime, timezone

from database import SessionLocal

from models import (
    Complaint,
    ComplaintStatus,
    Escalation,
    User,
    UserRole
)

from services.notification_service import create_notification


def check_sla_escalations():
    db = SessionLocal()

    try:
        now = datetime.now(timezone.utc)

        overdue_complaints = db.query(Complaint).filter(
            Complaint.sla_deadline.isnot(None),
            Complaint.sla_deadline < now,
            Complaint.is_escalated.is_(False),
            Complaint.status.notin_([
                ComplaintStatus.RESOLVED,
                ComplaintStatus.CLOSED
            ])
        ).all()

        for complaint in overdue_complaints:
            complaint.is_escalated = True

            escalation = Escalation(
                complaint_id=complaint.id,
                escalation_level=1,
                reason="Complaint exceeded SLA deadline"
            )

            db.add(escalation)

            # Notify citizen
            create_notification(
                db=db,
                user_id=complaint.citizen_id,
                complaint_id=complaint.id,
                message=(
                    f"Your complaint #{complaint.id} "
                    f"has exceeded its SLA deadline "
                    f"and has been escalated."
                )
            )

            # Find department admins
            department_admins = db.query(User).filter(
                User.role == UserRole.DEPARTMENT_ADMIN,
                User.department_id == complaint.department_id
            ).all()

            # Notify department admins
            for admin in department_admins:
                create_notification(
                    db=db,
                    user_id=admin.id,
                    complaint_id=complaint.id,
                    message=(
                        f"Complaint #{complaint.id} "
                        f"has exceeded its SLA deadline "
                        f"and requires attention."
                    )
                )

        db.commit()

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()