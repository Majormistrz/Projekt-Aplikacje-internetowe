from database.database import db
from datetime import datetime, timezone

class RentalReminder(db.Model):
    __tablename__ = "rental_reminders"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    rental_id = db.Column(db.Integer, db.ForeignKey("rentals.id"), nullable=False)
    remind_at = db.Column(db.DateTime, nullable=False)
    email = db.Column(db.String(100), nullable=False)
    sent = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
