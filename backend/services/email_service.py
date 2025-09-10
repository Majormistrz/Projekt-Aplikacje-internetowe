from flask_mail import Message
from extensions import mail

class EmailService:
    @staticmethod
    def send_verification_email(recipient: str, code: str):
        msg = Message(
            subject="Potwierdź swój email",
            recipients=[recipient],
            body=f"Twój kod weryfikacyjny to: {code}\n\nKod ważny 10 minut."
        )
        mail.send(msg)
