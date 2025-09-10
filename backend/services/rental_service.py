from models.rental import Rental
from models.user import User
from models.offer import Offer
from repositories.rental_repository import RentalRepository
from database.database import db
from repositories.offer_repository import OfferRepository
from datetime import datetime, timedelta, timezone
from babel.dates import format_date
from models.rental_reminder import RentalReminder


class RentalService:
    penalty_per_day = 25.0

    @staticmethod
    def create_rental(user_email: str, offer_id: int) -> tuple[Rental | None, str | None, int]:
        user = User.query.filter_by(email=user_email).first()
        if not user:
            return None, "Użytkownik nie istnieje", 404

        offer = Offer.query.get(offer_id)
        if not offer:
            return None, "Oferta nie istnieje", 404

        if offer.available_quantity <= 0:
            return None, "Brak dostępnych sztuk", 400

        rental = Rental(user_id=user.id, offer_id=offer.id)

        try:
            offer.available_quantity -= 1
            db.session.add(rental)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return None, f"Błąd tworzenia wypożyczenia: {str(e)}", 500

        return rental, None, 201

    @staticmethod
    def return_rental(rental_id: int) -> tuple[Rental | None, str, int]:
        rental = RentalRepository.get_by_id(rental_id)
        if not rental:
            return None, "Wypożyczenie nie istnieje", 404

        if rental.return_date:
            return None, "Przedmiot już został zwrócony", 400

        offer = OfferRepository.get_by_id(rental.offer_id)
        price_per_day = offer.price_per_day if offer else 0

        rental_start = rental.rental_date.replace(tzinfo=timezone.utc)
        rental_end = datetime.now(timezone.utc)
        rental_days = max(1, (rental_end.date() - rental_start.date()).days + 1)

        total_price = rental_days * price_per_day
        penalty_days = max(0, rental_days - 30)
        penalty_per_day = 25
        total_price += penalty_days * penalty_per_day

        rental.return_date = rental_end
        rental.total_price = total_price
        rental.status = "zakończone"

        if offer:
            offer.available_quantity += 1

        try:
            RentalReminder.query.filter_by(rental_id=rental.id).delete()

            RentalRepository.update(rental)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return None, f"Błąd podczas zwrotu: {str(e)}", 500

        return rental, "", 200

    @staticmethod
    def get_user_rentals(user_id: int) -> list[dict]:
        rentals = RentalRepository.get_by_user(user_id)
        now = datetime.now(timezone.utc)

        rental_list = []
        for rental in rentals:
            offer = OfferRepository.get_by_id(rental.offer_id)
            offer_name = offer.name if offer else "Oferta usunięta"
            price_per_day = float(offer.price_per_day) if offer and offer.price_per_day else 0.0

            rental_start = rental.rental_date.replace(tzinfo=timezone.utc)
            rental_end = rental.return_date.replace(tzinfo=timezone.utc) if rental.return_date else now

            rental_days = max(1, (rental_end.date() - rental_start.date()).days + 1)
            penalty_days = max(0, rental_days - 30)
            penalty_total = penalty_days * RentalService.penalty_per_day
            estimated_total = (rental_days * price_per_day) + penalty_total

            rental_list.append({
                "rental_id": rental.id,
                "offer_name": offer_name,
                "available_quantity": offer.available_quantity if offer else 0,
                "rental_date": rental.rental_date.isoformat(),
                "return_date": rental.return_date.isoformat() if rental.return_date else None,
                "status": rental.status,
                "price_per_day": price_per_day,
                "rental_days": rental_days,
                "penalty_days": penalty_days,
                "penalty_total": round(penalty_total, 2),
                "estimated_total": round(estimated_total, 2),
                "total_price": round(rental.total_price, 2) if rental.total_price else None
            })

        return rental_list

    @staticmethod
    def get_active_rentals(user_id: int) -> tuple[list | dict, int]:
        rentals = RentalRepository.get_active_by_user_id(user_id)
        if not rentals:
            return {"message": "Brak aktywnych wypożyczeń"}, 404

        now = datetime.now(timezone.utc)
        penalty_per_day = 25.0

        rental_list = []
        for rental in rentals:
            offer = Offer.query.get(rental.offer_id)
            offer_name = offer.name if offer else "Oferta usunięta"
            price_per_day = float(offer.price_per_day) if offer and offer.price_per_day else 0.0
            entry_price = float(offer.entry_price) if offer and offer.entry_price else 0.0

            rental_start = rental.rental_date.replace(tzinfo=timezone.utc)
            rental_days = max(1, (now.date() - rental_start.date()).days + 1)
            penalty_days = max(0, rental_days - 30)
            estimated_total = (rental_days * price_per_day) + (penalty_days * penalty_per_day)

            rental_list.append({
                "rental_id": rental.id,
                "offer_name": offer_name,
                "available_quantity": offer.available_quantity if offer else 0,
                "rental_date": format_date(rental.rental_date),
                "return_date": None,
                "status": rental.status,
                "entry_price": entry_price,
                "price_per_day": price_per_day,
                "rental_days": rental_days,
                "penalty_days": penalty_days,
                "penalty_total": round(penalty_days * penalty_per_day, 2),
                "estimated_total": round(estimated_total, 2)
            })

        return rental_list, 200

    @staticmethod
    def get_all_rentals() -> tuple[list[dict], int]:
        rentals = RentalRepository.get_all()
        rental_list = []

        for rental in rentals:
            user = User.query.get(rental.user_id)
            offer = Offer.query.get(rental.offer_id)

            rental_list.append({
                "rental_id": rental.id,
                "user_name": user.name if user else "Nieznany użytkownik",
                "offer_name": offer.name if offer else "Usunięta oferta",
                "available_quantity": offer.available_quantity if offer else 0,
                "rental_date": rental.rental_date.isoformat(),
                "return_date": rental.return_date.isoformat() if rental.return_date else None,
                "status": rental.status,
                "total_price": rental.total_price
            })

        return rental_list, 200

    @staticmethod
    def checkout(user, items: list[dict]) -> tuple[dict, int] | tuple[str, int]:
        if not items:
            return "Koszyk jest pusty", 400

        total_entry = 0.0
        total_per_day = 0.0
        rented_items = []

        for item in items:
            offer_id = item.get("id")
            quantity = item.get("quantity", 1)

            if offer_id is None:
                return f"Brak id oferty w pozycji koszyka", 400

            offer = RentalRepository.get_offer_by_id(offer_id)
            if not offer or offer.available_quantity < quantity:
                return f"Brak wystarczającej ilości dla oferty {offer_id}", 400

            for _ in range(quantity):
                rental = Rental(user_id=user.id, offer_id=offer_id)
                RentalRepository.add_rental(rental)

                rental_date = rental.rental_date or datetime.now(timezone.utc)
                reminders = [
                    (rental_date + timedelta(days=23), "7 dni przed terminem"),
                    (rental_date + timedelta(days=29), "1 dzień przed terminem")
                ]
                for remind_at, _label in reminders:
                    reminder = RentalReminder(
                        user_id=user.id,
                        rental_id=rental.id,
                        remind_at=remind_at,
                        email=user.email
                    )
                    RentalRepository.add_reminder(reminder)

            offer.available_quantity -= quantity

            total_entry += float(offer.entry_price or 0) * quantity
            total_per_day += float(offer.price_per_day or 0) * quantity

            rented_items.append({
                "name": offer.name,
                "quantity": quantity,
                "entry_price": offer.entry_price,
                "price_per_day": offer.price_per_day
            })

        RentalRepository.commit()

        return {
            "totalEntry": total_entry,
            "totalPerDay": total_per_day,
            "items": rented_items
        }, 200
