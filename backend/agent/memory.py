from database import SessionLocal

from models import (
    Complaint,
    ComplaintHistory,
    AIDecision
)


def get_complaint_memory(
    complaint_id: int
):
    db = SessionLocal()

    try:
        complaint = db.query(Complaint).filter(
            Complaint.id == complaint_id
        ).first()

        if not complaint:
            return None

        history = db.query(ComplaintHistory).filter(
            ComplaintHistory.complaint_id == complaint_id
        ).order_by(
            ComplaintHistory.created_at.asc()
        ).all()

        ai_decisions = db.query(AIDecision).filter(
            AIDecision.complaint_id == complaint_id
        ).order_by(
            AIDecision.created_at.asc()
        ).all()

        history_text = []

        for item in history:
            history_text.append(
                f"{item.actor_type}: "
                f"{item.action} | "
                f"{item.old_value} -> {item.new_value}"
            )

        ai_text = []

        for decision in ai_decisions:
            ai_text.append(
                f"Category={decision.predicted_category}, "
                f"Priority={decision.predicted_priority}, "
                f"Department={decision.predicted_department}, "
                f"Confidence={decision.confidence_score}"
            )

        return {
            "complaint_description": complaint.description,
            "history": history_text,
            "ai_decisions": ai_text
        }

    finally:
        db.close()


def get_similar_historical_complaints(
    complaint_id: int,
    description: str,
    limit: int = 5
):
    db = SessionLocal()

    try:
        words = [
            word.lower()
            for word in description.split()
            if len(word) > 4
        ]

        if not words:
            return []

        complaints = db.query(Complaint).filter(
            Complaint.id != complaint_id
        ).order_by(
            Complaint.created_at.desc()
        ).limit(50).all()

        scored_complaints = []

        for complaint in complaints:
            old_description = complaint.description.lower()

            score = sum(
                1
                for word in words
                if word in old_description
            )

            if score > 0:
                scored_complaints.append(
                    (
                        score,
                        complaint
                    )
                )

        scored_complaints.sort(
            key=lambda item: item[0],
            reverse=True
        )

        results = []

        for _, complaint in scored_complaints[:limit]:

            latest_ai = db.query(AIDecision).filter(
                AIDecision.complaint_id == complaint.id
            ).order_by(
                AIDecision.created_at.desc()
            ).first()

            override = db.query(ComplaintHistory).filter(
                ComplaintHistory.complaint_id == complaint.id,
                ComplaintHistory.action == "AI_OVERRIDE"
            ).order_by(
                ComplaintHistory.created_at.desc()
            ).first()

            results.append({
                "complaint_id": complaint.id,
                "description": complaint.description,
                "final_category": complaint.category,
                "final_priority": (
                    complaint.priority.value
                    if complaint.priority
                    else None
                ),
                "ai_category": (
                    latest_ai.predicted_category
                    if latest_ai
                    else None
                ),
                "ai_priority": (
                    latest_ai.predicted_priority.value
                    if (
                        latest_ai
                        and latest_ai.predicted_priority
                    )
                    else None
                ),
                "human_override": (
                    override.new_value
                    if override
                    else None
                )
            })

        return results

    finally:
        db.close()