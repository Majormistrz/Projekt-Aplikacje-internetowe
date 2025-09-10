from flask import request, jsonify, Blueprint
from database.database import db
from models.rental import Rental
from models.offer import Offer
from models.user import User
from datetime import datetime, timezone, timedelta
from flask_jwt_extended import jwt_required, get_jwt_identity
from babel.dates import format_datetime # pip install babel  
from extensions import mail
from models.rental_reminder import RentalReminder
from services.rental_service import RentalService

rental_bp = Blueprint("rental", __name__)

# --- Tworzenie wypożyczenia ---
@rental_bp.route("/rentals/create", methods=["POST"])
@jwt_required()
def create_rental():
    data = request.get_json()
    offer_id = data.get("offer_id")
    current_user_email = get_jwt_identity()

    rental, error, status = RentalService.create_rental(current_user_email, offer_id)

    if error:
        return jsonify({"error": error}), status

    offer = Offer.query.get(rental.offer_id) if rental else None
    available_quantity = offer.available_quantity if offer else None

    return jsonify({
        "message": "Wypożyczenie utworzone!",
        "rental_id": rental.id, 
        "available_quantity": available_quantity
    }), status

@rental_bp.route("/rentals/<int:rental_id>/return", methods=["DELETE"])
@jwt_required()  
def return_rental(rental_id):
    rental, error, status = RentalService.return_rental(rental_id)
    if error:
        return jsonify({"error": error}), status

    user = User.query.get(rental.user_id)
    if user:
        return_date = rental.rental_date + timedelta(days=30)
        offer_name = rental.offer.name if rental.offer else "Nieznana oferta"  # dodanie nazwy oferty

        msg = Message(
            subject="✅ Zwrot wypożyczenia zatwierdzony",
            recipients=[user.email],
            body=f"""
Cześć {user.name} {user.surname}!

Twój zwrot wypożyczenia o ID {rental.id} ({offer_name}) został zatwierdzony przez sprzedawcę.

📄 Szczegóły wypożyczenia:
- Nazwa: {offer_name}
- ID wypożyczenia: {rental.id}
- Data wypożyczenia: {rental.rental_date.strftime('%d-%m-%Y')}
- Data zwrotu: {rental.return_date.strftime('%d-%m-%Y') if rental.return_date else "brak"}

💰 Podsumowanie:
- Całkowita cena: {rental.total_price:.2f} zł

Dziękujemy za korzystanie z naszej wypożyczalni!

Pozdrawiamy,
Twój zespół Rent&GO
"""
        )
        try:
            mail.send(msg)
            print(f"✅ Mail o zatwierdzonym zwrocie wysłany do {user.email}")
        except Exception as e:
            print(f"❌ Błąd wysyłki maila o zwrocie: {e}")

    return jsonify({
        "message": "Przedmiot zwrócony!",
        "total_price": rental.total_price
    }), status


# --- Pobieranie wypożyczeń użytkownika (stronicowanie) ---
@rental_bp.route("/rentals/user/<int:user_id>", methods=["GET"])
def get_user_rentals(user_id):
    rentals_data = RentalService.get_user_rentals(user_id)
    return jsonify({
        "rentals": rentals_data,
        "total_items": len(rentals_data)
    }), 200


from datetime import datetime, timezone
@rental_bp.route("/rentals/user/<int:user_id>/active", methods=["GET"])
def get_active_rentals(user_id):
    rentals, status = RentalService.get_active_rentals(user_id)
    return jsonify({"active_rentals": rentals} if status == 200 else rentals), status


# --- Zgłaszanie wypożyczenia do zwrotu ---
@rental_bp.route("/rentals/<int:rental_id>/request-return", methods=["PATCH"])
@jwt_required()
def request_return(rental_id):
    rental = Rental.query.get(rental_id)
    if not rental:
        return jsonify({"error": "Nie znaleziono wypożyczenia."}), 404

    if rental.status != "aktywne":
        return jsonify({"error": "Tego wypożyczenia nie można zgłosić do zwrotu."}), 400

    rental.status = "oczekuje"
    db.session.commit()

    return jsonify({"message": "Zwrot został zgłoszony!"}), 200

# --- Pobieranie wszystkich wypożyczeń  ---
@rental_bp.route("/rentals/all", methods=["GET"])
@jwt_required()
def get_all_rentals():
    rental_list, status = RentalService.get_all_rentals()
    return jsonify(rental_list), status


from flask_mail import Message
from extensions import mail

@rental_bp.route("/rentals/checkout", methods=["POST"])
@jwt_required()
def checkout_rentals():
    user_email = get_jwt_identity()
    user = User.query.filter_by(email=user_email).first()
    if not user:
        return jsonify({"error": "Nieprawidłowy użytkownik"}), 401
    
     # Sprawdzenie czy użytkownik ma bana
    now = datetime.utcnow()
    if user.ban_until and user.ban_until > now:
        return jsonify({
            "error": "Twoje konto jest zbanowane",
            "ban_until": user.ban_until.isoformat(),
            "ban_reason": user.ban_reason
        }), 403

    data = request.get_json()
    items = data.get("items", [])

    result, status = RentalService.checkout(user, items)
    if isinstance(result, str):
        return jsonify({"error": result}), status

    # Wyślij potwierdzenie mailowe
    rented_items = result["items"]
    product_lines = "\n".join([
        f"- {i['name']} | Ilość: {i['quantity']} | "
        #f"Cena początkowa: {i['entry_price']} zł | Cena za dzień: {i['price_per_day']} zł" 
        for i in rented_items
    ])

    msg = Message(
        subject="📦 Potwierdzenie wynajmu w Wypożyczalni",
        recipients=[user.email],
        body=f"""
Cześć {user.name} {user.surname}!

Dziękujemy za skorzystanie z naszej wypożyczalni. Oto szczegóły Twojego wynajmu:

📋 Produkty:
{product_lines}

💰 Podsumowanie:
- Łączna cena początkowa: {result['totalEntry']:.2f} zł
- Łączna cena za dzień: {result['totalPerDay']:.2f} zł

⚠️ Przypomnienie:
Produkty należy zwrócić w ciągu 30 dni.
Po tym czasie naliczana będzie kara 25 zł za każdy dzień zwłoki.

Pozdrawiamy,
Zespół Rent&GO!
"""
    )

    try:
        mail.send(msg)
        print(f"✅ Potwierdzenie wysłane do {user.email}")
    except Exception as e:
        print(f"❌ Błąd wysyłki potwierdzenia: {e}")

    return jsonify({
        "message": "Wypożyczenie zakończone sukcesem",
        **result
    }), status
