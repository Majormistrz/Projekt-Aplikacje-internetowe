from database.database import db

class OfferImage(db.Model):
    __tablename__ = "offer_images"
    id = db.Column(db.Integer, primary_key=True)
    offer_id = db.Column(db.Integer, db.ForeignKey("offers.id"), nullable=False)
    image = db.Column(db.LargeBinary, nullable=False)  

    offer = db.relationship("Offer", backref=db.backref("images", lazy=True))