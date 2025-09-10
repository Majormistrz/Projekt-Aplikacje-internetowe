from database.database import db
from datetime import datetime, timedelta
import secrets

class EmailVerification(db.Model):
    __tablename__ = "email_verifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    new_email = db.Column(db.String(120), nullable=False)
    code = db.Column(db.String(6), nullable=False)
    expiration_time = db.Column(db.DateTime, default=lambda: datetime.utcnow() + timedelta(minutes=10))

    def __init__(self, user_id, new_email, code, expiration_time=None):
        self.user_id = user_id
        self.new_email = new_email
        self.code = code
        self.expiration_time = expiration_time if expiration_time else datetime.utcnow() + timedelta(minutes=10)