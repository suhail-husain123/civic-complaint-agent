import os

from dotenv import load_dotenv

from database import SessionLocal
from models import User, UserRole
from security import hash_password


load_dotenv()


def create_super_admin():
    db = SessionLocal()

    try:
        email = os.getenv(
            "SUPER_ADMIN_EMAIL"
        )

        password = os.getenv(
            "SUPER_ADMIN_PASSWORD"
        )

        if not email or not password:
            print(
                "SUPER_ADMIN_EMAIL and "
                "SUPER_ADMIN_PASSWORD must be set."
            )
            return

        existing_user = db.query(User).filter(
            User.email == email
        ).first()

        if existing_user:
            print(
                "Super Admin already exists."
            )
            return

        super_admin = User(
            name="Super Admin",
            email=email,
            password_hash=hash_password(
                password
            ),
            role=UserRole.SUPER_ADMIN,
            department_id=None
        )

        db.add(super_admin)
        db.commit()
        db.refresh(super_admin)

        print(
            "Super Admin created successfully!"
        )
        print(
            "ID:",
            super_admin.id
        )
        print(
            "Email:",
            super_admin.email
        )

    finally:
        db.close()


if __name__ == "__main__":
    create_super_admin()