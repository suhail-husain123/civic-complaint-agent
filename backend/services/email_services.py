import os
import smtplib

from email.mime.text import MIMEText
from dotenv import load_dotenv


load_dotenv()


EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_APP_PASSWORD = os.getenv("EMAIL_APP_PASSWORD")


def send_email(
    to_email: str,
    subject: str,
    message: str
):
    email = MIMEText(message)

    email["Subject"] = subject
    email["From"] = EMAIL_ADDRESS
    email["To"] = to_email

    with smtplib.SMTP_SSL(
        "smtp.gmail.com",
        465
    ) as server:

        server.login(
            EMAIL_ADDRESS,
            EMAIL_APP_PASSWORD
        )

        server.send_message(email)