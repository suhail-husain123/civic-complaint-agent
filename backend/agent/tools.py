from database import SessionLocal
from models import Department


def get_department_by_name(
    department_name: str
):
    db = SessionLocal()

    try:
        department = db.query(Department).filter(
            Department.name == department_name
        ).first()

        if not department:
            return None

        return {
            "id": department.id,
            "name": department.name
        }

    finally:
        db.close()