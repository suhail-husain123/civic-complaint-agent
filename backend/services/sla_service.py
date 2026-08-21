from datetime import datetime, timedelta, timezone

from database import SessionLocal
from models import SLARule, ComplaintPriority


DEFAULT_SLA_HOURS = {
    ComplaintPriority.CRITICAL: 24,
    ComplaintPriority.HIGH: 48,
    ComplaintPriority.MEDIUM: 72,
    ComplaintPriority.LOW: 120
}


def get_sla_hours(
    priority: ComplaintPriority
) -> int:
    db = SessionLocal()

    try:
        rule = db.query(SLARule).filter(
            SLARule.priority == priority
        ).first()

        if rule:
            return rule.resolution_time_hours

        return DEFAULT_SLA_HOURS[priority]

    finally:
        db.close()


def calculate_sla_deadline(
    priority: ComplaintPriority
):
    hours = get_sla_hours(
        priority
    )

    return (
        datetime.now(timezone.utc)
        + timedelta(hours=hours)
    )