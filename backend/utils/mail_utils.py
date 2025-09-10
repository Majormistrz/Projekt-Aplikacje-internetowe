from flask_mail import Message
from extensions import mail

def send_verification_email(email, code):
    msg = Message(
        subject="Potwierdź swój email",
        recipients=[email],
        body=f"Twój kod weryfikacyjny to: {code}\n\nKod ważny 10 minut."
    )
    mail.send(msg)

def send_reset_email(email, reset_url):
    msg = Message(
        subject="Reset hasła - Wypożyczalnia",
        recipients=[email],
        body=f"Cześć,\n\nAby zresetować hasło kliknij w link:\n{reset_url}\n\nLink ważny 1 godzinę.",
        html=f"<p>Cześć,</p><p>Aby zresetować hasło kliknij w link:</p><a href='{reset_url}'>{reset_url}</a><p>Link ważny 1 godzinę.</p>"
    )
    mail.send(msg)