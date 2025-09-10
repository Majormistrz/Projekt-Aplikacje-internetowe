from database.database import db
from datetime import datetime, timezone

class Rental(db.Model):
    __tablename__ = "rentals"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    offer_id = db.Column(db.Integer, db.ForeignKey("offers.id"), nullable=False)
    rental_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)  
    return_date = db.Column(db.DateTime, nullable=True)  
    total_price = db.Column(db.Float, nullable=True)  
    status = db.Column(db.String(20), default="aktywne", nullable=False)


    def __init__(self, user_id, offer_id):
        self.user_id = user_id
        self.offer_id = offer_id
        self.rental_date = datetime.now(timezone.utc)
        self.return_date = None
        self.total_price = None
