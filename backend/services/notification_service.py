from models import Notification


def create_notification(
    db,
    user_id: int,
    message: str,
    complaint_id: int | None = None,
    notification_type: str = "IN_APP"
):
    notification = Notification(
        user_id=user_id,
        complaint_id=complaint_id,
        type=notification_type,
        message=message,
        is_read=False
    )

    db.add(notification)

    return notification