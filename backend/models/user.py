from database.database import db
from sqlalchemy import DateTime, Text  
from models.cart import Cart

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    surname = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(10), default="user")
    is_verified = db.Column(db.Boolean, default=False)
    cart_items = db.relationship("Cart", backref="user", cascade="all, delete-orphan")
    ban_until = db.Column(DateTime, nullable=True)
    ban_reason = db.Column(Text, nullable=True)

    def __init__(self, name, surname, email, password, is_verified=False):
        self.name = name
        self.surname = surname
        self.email = email
        self.password = password
        self.is_verified = is_verified
