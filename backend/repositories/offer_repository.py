from database.database import db
from models.offer import Offer

class OfferRepository:
    @staticmethod
    def add(offer: Offer):
        db.session.add(offer)
        db.session.commit()

    @staticmethod
    def get_by_id(offer_id: int):
        return Offer.query.get(offer_id)

    @staticmethod
    def get_all():
        return Offer.query.all()

    @staticmethod
    def delete(offer: Offer):
        db.session.delete(offer)
        db.session.commit()

    @staticmethod
    def update(offer: Offer):
        db.session.commit()
        
    @staticmethod
    def get_by_seller_id(seller_id: int):
        return Offer.query.filter_by(seller_id=seller_id).all()

    @staticmethod
    def create(offer: Offer):
        db.session.add(offer)
        db.session.commit()
        return offer

    @staticmethod
    def get_by_name(name: str):
        return Offer.query.filter_by(name=name).first()
    
    @staticmethod
    def save(offer: Offer):
        db.session.add(offer)
        db.session.commit()
        return offer    