from database.database import db
from models.category import Category
from sqlalchemy import LargeBinary

class Offer(db.Model):
    __tablename__ = "offers"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.String, nullable=True)
    entry_price = db.Column(db.Float, nullable=False)
    price_per_day = db.Column(db.Float, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=False)
    #image = db.Column(db.String, nullable=True)
    views = db.Column(db.Integer, default=0)
    image = db.Column(db.LargeBinary, nullable=True)
    
    seller_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)  # Powiązanie ofert z danym sprzedawcą
    seller = db.relationship("User", backref="offers")  
    rentals = db.relationship("Rental", backref="offer", cascade="all, delete", passive_deletes=True)

    available_quantity = db.Column(db.Integer, nullable=False, default=0)

    def __init__(self, name, description, entry_price, price_per_day, category_id,seller_id,image, available_quantity):
        self.name = name
        self.description = description
        self.entry_price = entry_price
        self.price_per_day = price_per_day
        self.category_id = category_id
        self.seller_id = seller_id 
        self.image = image
        self.available_quantity = available_quantity
