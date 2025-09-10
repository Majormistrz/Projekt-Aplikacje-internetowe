import base64
from models.offer import Offer
from typing import Optional
from repositories.offer_repository import OfferRepository
from schemas.offer_schema import OfferSchema, OfferCreateSchema, OfferUpdateSchema
from database.database import db
from models.category import Category
from werkzeug.datastructures import FileStorage
from models.rental import Rental
from models.user import User
from sqlalchemy import and_

class OfferService:
    @staticmethod
    def get_all_offers(category_id=None, search_query=None):
        offers = OfferRepository.get_all()

        if category_id:
            offers = [o for o in offers if o.category_id == category_id]
        if search_query:
            offers = [o for o in offers if search_query.lower() in o.name.lower()]

        return [OfferService.serialize_offer(o) for o in offers]

    @staticmethod
    def get_offer_by_id(offer_id):
        offer = OfferRepository.get_by_id(offer_id)
        if offer:
            offer.views = (offer.views or 0) + 1
            OfferRepository.update(offer)
            return OfferService.serialize_offer(offer)
        return None

    @staticmethod
    def serialize_offer(offer):
        image_base64 = base64.b64encode(offer.image).decode("utf-8") if offer.image else None
        return {
            "id": offer.id,
            "name": offer.name,
            "description": offer.description,
            "entry_price": offer.entry_price,
            "price_per_day": offer.price_per_day,
            "category_id": offer.category_id,
            "views": offer.views or 0,
            "available_quantity": offer.available_quantity,
            "seller_id": offer.seller_id,
            "image": f"data:image/jpeg;base64,{image_base64}" if image_base64 else None
        }

    @staticmethod
    def delete_offer(offer: Offer, current_user: User):
        if not offer:
            return False, "Oferta nie istnieje", 404

        if not current_user or offer.seller_id != current_user.id:
            return False, "Brak uprawnień do usunięcia tej oferty", 403

        active_rentals_count = Rental.query.filter(
            and_(
                Rental.offer_id == offer.id,
                Rental.status.in_(["aktywne", "oczekuje"])
            )
        ).count()

        if active_rentals_count > 0:
            return False, "Nie można usunąć oferty – posiada aktywne lub oczekujące wypożyczenia", 400

        try:
            Rental.query.filter(Rental.offer_id == offer.id, Rental.status == "zakończone")\
                        .update({"offer_id": None})
            db.session.commit()

            OfferRepository.delete(offer)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return False, f"Błąd podczas usuwania oferty: {str(e)}", 500

        return True, "Oferta została usunięta, historia wypożyczeń zachowana!", 200

    @staticmethod
    def get_offers_by_seller(requesting_user: User, seller_id: int) -> list[Offer]:
        if not requesting_user or requesting_user.id != seller_id:
            raise PermissionError("Brak uprawnień do przeglądania ofert tego sprzedawcy")
        
        return OfferRepository.get_by_seller_id(seller_id)

    @staticmethod
    def create_offer(data, image_file):
        if data["entry_price"] <= 0 or data["price_per_day"] <= 0:
            raise ValueError("Ceny muszą być większe od 0")

        if not image_file or not image_file.filename:
            raise ValueError("Nieprawidłowy plik")

        if not image_file.mimetype.startswith("image/"):
            raise ValueError("Dozwolone są tylko pliki graficzne")

        image_data = image_file.read()

        offer = Offer(
            name=data["name"],
            description=data["description"],
            entry_price=data["entry_price"],
            price_per_day=data["price_per_day"],
            category_id=data["category_id"],
            seller_id=data["seller_id"],
            image=image_data,
            available_quantity=data["available_quantity"],
        )

        return OfferRepository.create(offer)

    @staticmethod
    def update_offer(offer_id, user_email, data, image_file=None):
        offer = OfferRepository.get_by_id(offer_id)
        if not offer:
            return None, "Oferta nie istnieje", 404

        from models.user import User
        current_user_email = user_email
        user = User.query.filter_by(email=current_user_email).first()
        if not user or user.id != offer.seller_id:
            return None, "Brak uprawnień do aktualizacji oferty", 403

        for key, value in data.items():
            setattr(offer, key, value)

        if image_file and image_file.filename:
            offer.image = image_file.read()

        try:
            OfferRepository.update(offer)
        except Exception as e:
            return None, f"Błąd podczas aktualizacji oferty: {str(e)}", 500

        return offer, "Oferta zaktualizowana pomyślnie", 200
