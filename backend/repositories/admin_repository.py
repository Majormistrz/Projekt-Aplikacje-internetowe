from models.offer import Offer
from models.user import User
from database.database import db

class AdminRepository:
    @staticmethod
    def get_all_offers():
        return Offer.query.all()
    
    @staticmethod
    def get_all_users():
        return User.query.all()

    @staticmethod
    def get_all_sellers():
        return User.query.filter_by(role="seller").all()
    
    @staticmethod
    def get_user_by_id(user_id: int):
        return User.query.get(user_id)

    @staticmethod
    def ban_user(user: User, reason: str, ban_until_utc):
        user.ban_reason = reason
        user.ban_until = ban_until_utc
        db.session.commit()
    
    @staticmethod
    def delete_user(user: User):
        db.session.delete(user)
        db.session.commit()
        
    @staticmethod
    def unban_user(user: User):
        user.ban_reason = None
        user.ban_until = None
        db.session.commit()
        
    @staticmethod
    def promote_user_to_seller(user: User):
        user.role = "seller"
        db.session.commit()

    @staticmethod
    def demote_seller_to_user(user: User):
        user.role = "user"
        db.session.commit()
