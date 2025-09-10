from flask import request, jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta, timezone
from database.database import db
from models.user import User
from models.rental_reminder import RentalReminder
from models.rental import Rental
from flask_cors import cross_origin
from extensions import mail
from flask_mail import Message

notifications_bp = Blueprint("notifications", __name__)

# Dodawanie przypomnienia
@notifications_bp.route("/reminders", methods=["POST"])
@cross_origin()
@jwt_required()
def set_rental_reminder():
    user_email = get_jwt_identity()
    data = request.json

    rental_id = data.get("rental_id")
    remind_at_str = data.get("remind_at")

    if not rental_id or not remind_at_str:
        return jsonify({"message": "❌ Brak wymaganych danych"}), 400

    try:
        remind_at = datetime.fromisoformat(remind_at_str)
    except ValueError:
        return jsonify({"message": "❌ Niepoprawny format daty"}), 400

    user = User.query.filter_by(email=user_email).first()
    if not user:
        return jsonify({"message": "❌ Użytkownik nie istnieje"}), 404

    reminder = RentalReminder(
        user_id=user.id,
        rental_id=rental_id,
        remind_at=remind_at,
        email=user.email,
        sent=False
    )

    try:
        db.session.add(reminder)
        db.session.commit()
        return jsonify({"message": "✅ Przypomnienie zapisane!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"❌ Błąd przy zapisie przypomnienia: {str(e)}"}), 500

# Pobieranie przypomnień użytkownika
@notifications_bp.route("/notifications/user", methods=["GET", "OPTIONS"])
@cross_origin()
@jwt_required(optional=True)
def get_user_notifications():
    if request.method == "OPTIONS":
        return '', 200

    user_email = get_jwt_identity()
    user = User.query.filter_by(email=user_email).first()
    if not user:
        return jsonify({"message": "❌ Użytkownik nie istnieje"}), 404

    reminders = RentalReminder.query.filter_by(user_id=user.id).order_by(RentalReminder.remind_at.desc()).all()
    now = datetime.now(timezone.utc)
    result = []

    for r in reminders:
        # Usuwanie wysłanych przypomnień po 2 minutach
        r_remind_at = r.remind_at
        # jeśli remind_at jest naiwne -> dodaj UTC
        if r_remind_at.tzinfo is None:
            r_remind_at = r_remind_at.replace(tzinfo=timezone.utc)

        if r.sent and (now - r_remind_at) > timedelta(minutes=2):
            db.session.delete(r)
            continue

        rental = Rental.query.get(r.rental_id)
        days_left = "?"
        if rental and rental.rental_date:
            due_date = rental.rental_date + timedelta(days=30)
            # jeśli rental_date jest naiwne -> dodaj UTC
            if due_date.tzinfo is None:
                due_date = due_date.replace(tzinfo=timezone.utc)
            days_left = (due_date - now).days

        remind_at_formatted = r_remind_at.strftime("%d-%m-%Y %H:%M")

        result.append({
            "id": r.id,
            "rental_id": r.rental_id,
            "message": f"Przypomnienie o wypożyczeniu ID {r.rental_id} ({remind_at_formatted}) - zostało {days_left} dni do zwrotu",
            "remind_at": r_remind_at.strftime("%Y-%m-%d %H:%M:%S"),
            "sent": r.sent,
            "type": "reminder"
        })

    db.session.commit()
    return jsonify({"notifications": result}), 200


# Usuwanie przypomnienia
@notifications_bp.route("/reminders/<int:reminder_id>", methods=["DELETE", "OPTIONS"])
@cross_origin()
@jwt_required(optional=True)
def delete_reminder(reminder_id):
    if request.method == "OPTIONS":
        return '', 200

    user_email = get_jwt_identity()
    user = User.query.filter_by(email=user_email).first()
    if not user:
        return jsonify({"message": "❌ Użytkownik nie istnieje"}), 404

    reminder = RentalReminder.query.filter_by(id=reminder_id, user_id=user.id).first()
    if not reminder:
        return jsonify({"message": "❌ Przypomnienie nie istnieje"}), 404

    try:
        db.session.delete(reminder)
        db.session.commit()
        return jsonify({"message": "✅ Przypomnienie usunięte"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"❌ Błąd przy usuwaniu: {str(e)}"}), 500

# Usuwanie wszystkich przypomnień użytkownika
@notifications_bp.route("/reminders", methods=["DELETE", "OPTIONS"])
@cross_origin()
@jwt_required()
def delete_all_reminders():
    if request.method == "OPTIONS":
        return '', 200

    user_email = get_jwt_identity()
    user = User.query.filter_by(email=user_email).first()
    if not user:
        return jsonify({"message": "❌ Użytkownik nie istnieje"}), 404

    try:
        deleted = RentalReminder.query.filter_by(user_id=user.id).delete()
        db.session.commit()
        return jsonify({"message": f"✅ Usunięto {deleted} przypomnień"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"❌ Błąd przy usuwaniu: {str(e)}"}), 500

# ========================
# Funkcja wysyłająca przypomnienia
# ========================
def send_rental_reminders(app):
    with app.app_context():  # ważne! kontekst Flask dla scheduler'a
        now = datetime.now(timezone.utc)
        reminders = RentalReminder.query.filter(
            RentalReminder.remind_at <= now,
            RentalReminder.sent == False
        ).all()

        for reminder in reminders:
            user = User.query.get(reminder.user_id)
            rental = Rental.query.get(reminder.rental_id)
            if not user or not rental or not rental.offer:
                continue

            return_date = rental.rental_date + timedelta(days=30)
            offer_name = rental.offer.name  # pobranie nazwy oferty

            msg = Message(
                subject="📌 Przypomnienie o wypożyczeniu w naszej wypożyczalni!",
                recipients=[reminder.email],
                body=f"""
Cześć {user.name} {user.surname}!

To jest przypomnienie o Twoim wypożyczeniu w naszej wypożyczalni.

📄 Szczegóły wypożyczenia:
- Nazwa: {offer_name}
- ID wypożyczenia: {reminder.rental_id}
- Data wypożyczenia: {rental.rental_date.strftime('%d-%m-%Y')}
- Prosimy o zwrócenie przed: {return_date.strftime('%d-%m-%Y')}

Miłego dnia!
Twój zespół Rent&GO!
"""
            )
            try:
                mail.send(msg)
                reminder.sent = True
                db.session.commit()
                print(f"✅ Wysłano przypomnienie do {reminder.email}")
            except Exception as e:
                db.session.rollback()
                print(f"❌ Błąd wysyłki maila: {e}")

