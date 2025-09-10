from repositories.admin_repository import AdminRepository
from models.rental import Rental
from database.database import db
from datetime import datetime, timedelta
from pytz import timezone
from flask_mail import Message
from extensions import mail

class AdminService:
    @staticmethod
    def get_all_offers_dto():
        offers = AdminRepository.get_all_offers()
        offers_list = []

        for offer in offers:
            seller = offer.seller
            offers_list.append({
                "id": offer.id,
                "name": offer.name,
                "description": offer.description,
                "entry_price": float(offer.entry_price),
                "price_per_day": float(offer.price_per_day),
                "category_id": offer.category_id,
                "available_quantity": offer.available_quantity,
                "seller_id": seller.id if seller else None,
                "seller_name": seller.name if seller else "Nieznany"
            })

        return offers_list

    @staticmethod
    def get_all_users_dto():
        users = AdminRepository.get_all_users()
        users_list = []

        for user in users:
            users_list.append({
                "id": user.id,
                "name": user.name,
                "surname": user.surname,
                "email": user.email,
                "role": user.role,
                "is_verified": user.is_verified,
                "ban_until": user.ban_until,
                "ban_reason": user.ban_reason
            })

        return users_list

    @staticmethod
    def get_all_sellers_dto():
        sellers = AdminRepository.get_all_sellers()
        sellers_list = []

        for seller in sellers:
            sellers_list.append({
                "id": seller.id,
                "name": seller.name,
                "surname": seller.surname,
                "email": seller.email,
                "is_verified": seller.is_verified
            })

        return sellers_list

    @staticmethod
    def ban_user_by_id(user_id: int, reason: str, duration_days: int):
        user = AdminRepository.get_user_by_id(user_id)
        if not user:
            return None

        ban_until_utc = datetime.utcnow() + timedelta(days=duration_days)
        AdminRepository.ban_user(user, reason, ban_until_utc)

        warsaw = timezone("Europe/Warsaw")
        ban_until_local = ban_until_utc.replace(tzinfo=timezone("UTC")).astimezone(warsaw)

        try:
            msg = Message(
                subject="⛔ Zostałeś zbanowany w serwisie Wypożyczalnia",
                recipients=[user.email],
                body=f"""
Cześć {user.name} {user.surname},

Twoje konto zostało zbanowane w naszym serwisie.

📅 Termin bana: do {ban_until_local.strftime('%d.%m.%Y, %H:%M:%S')}
📄 Powód: {reason}

Jeżeli uważasz, że to pomyłka, skontaktuj się z administracją pod adresem: "wypozyczalniap@gmail.com".

Pozdrawiamy,
Zespół Rent&GO!
"""
            )
            mail.send(msg)
        except Exception as e:
            print(f"❌ Błąd wysyłki maila do {user.email}: {e}")

        return True

    @staticmethod
    def delete_user_by_id(user_id: int):
        user = AdminRepository.get_user_by_id(user_id)
        if not user:
            return False

        try:
            Rental.query.filter_by(user_id=user.id).delete()

            AdminRepository.delete_user(user)

            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            print(f"❌ Błąd przy usuwaniu użytkownika {user_id}: {e}")
            return False

    @staticmethod
    def unban_user_by_id(user_id: int):
        user = AdminRepository.get_user_by_id(user_id)
        if not user:
            return False
        AdminRepository.unban_user(user)
        return True

    @staticmethod
    def promote_user_to_seller_by_id(user_id: int):
        user = AdminRepository.get_user_by_id(user_id)
        if not user:
            return "not_found"
        if user.role == "seller":
            return "already_seller"

        AdminRepository.promote_user_to_seller(user)
        return "success"

    @staticmethod
    def demote_seller_to_user_by_id(user_id: int):
        user = AdminRepository.get_user_by_id(user_id)
        if not user:
            return "not_found"
        if user.role != "seller":
            return "not_seller"

        AdminRepository.demote_seller_to_user(user)
        return "success"
