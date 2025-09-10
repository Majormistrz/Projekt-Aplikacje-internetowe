from database.database import db
from datetime import datetime, timedelta
import secrets

class PasswordReset(db.Model):
    __tablename__ = "password_resets"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), nullable=False)
    token = db.Column(db.String(255), nullable=False, unique=True)
    expiration_time = db.Column(db.DateTime, nullable=False)

    def __init__(self, email):
        self.email = email
        self.token = secrets.token_urlsafe(32)  
        self.expiration_time = datetime.utcnow() + timedelta(hours=1)
