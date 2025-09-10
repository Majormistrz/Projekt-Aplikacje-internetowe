from database.database import db
from models.offer import Offer

class Cart(db.Model):
    __tablename__ = "cart"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    offer_id = db.Column(db.Integer, db.ForeignKey("offers.id", ondelete="CASCADE"), nullable=False)
    quantity = db.Column(db.Integer, default=1, nullable=False)
    entry_price = db.Column(db.Numeric(10,2), nullable=False)
    price_per_day = db.Column(db.Numeric(10,2), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    offer = db.relationship("Offer", backref="cart_items")
