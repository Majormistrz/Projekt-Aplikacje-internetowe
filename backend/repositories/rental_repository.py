from database.database import db
from models.rental import Rental
from models.offer import Offer
from models.rental_reminder import RentalReminder

class RentalRepository:
    @staticmethod
    def add(rental: Rental):
        db.session.add(rental)
        db.session.commit()

    @staticmethod
    def get_by_id(rental_id: int) -> Rental | None:
        return Rental.query.get(rental_id)
    
    @staticmethod
    def update(rental: Rental):
        db.session.commit()
        
    @staticmethod
    def get_by_user(user_id: int) -> list[Rental]:
        return Rental.query.filter_by(user_id=user_id).order_by(Rental.rental_date.desc()).all() 
    
    @staticmethod
    def get_by_user_id(user_id: int, page: int = 1, limit: int = 10):
        query = Rental.query.filter_by(user_id=user_id).order_by(Rental.rental_date.desc())
        total_items = query.count()
        total_pages = (total_items + limit - 1) // limit
        rentals = query.offset((page - 1) * limit).limit(limit).all()
        return rentals, total_items, total_pages

    @staticmethod
    def get_active_by_user_id(user_id: int):
        rentals = Rental.query.filter_by(user_id=user_id, return_date=None).all()
        return rentals

    @staticmethod
    def get_all() -> list[Rental]:
        return Rental.query.order_by(Rental.rental_date.desc()).all() 
    
    @staticmethod
    def get_offer_by_id(offer_id: int) -> Offer | None:
        return Offer.query.get(offer_id)
    
    @staticmethod
    def add_rental(rental: Rental):
        db.session.add(rental)
        db.session.flush()
    
    @staticmethod
    def add_reminder(reminder: RentalReminder):
        db.session.add(reminder)
    
    @staticmethod
    def commit():
        db.session.commit()