from flask import Blueprint, jsonify, request
from database.database import db
from models.user import User
from models.offer import Offer
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from extensions import mail
from flask_mail import Message
from pytz import timezone
from services.admin_service  import AdminService
admin_bp = Blueprint("admin", __name__)

def admin_required(fn):
    """Dekorator, żeby dostęp miał tylko administrator"""
    from functools import wraps

    @wraps(fn)
    def wrapper(*args, **kwargs):
        if request.method == "OPTIONS":
            return '', 200
        
        current_user_email = get_jwt_identity()
        user = User.query.filter_by(email=current_user_email).first()
        if not user or user.role != "admin":
            return jsonify({"error": "Brak uprawnień"}), 403
        return fn(*args, **kwargs)
    return wrapper

# Pobierz wszystkie oferty
@admin_bp.route("/admin/offers", methods=["GET"])
@jwt_required()
@admin_required
def get_all_offers():
    offers_list = AdminService.get_all_offers_dto()
    return jsonify({"offers": offers_list}), 200

# Pobierz wszystkich użytkowników (user + seller)
@admin_bp.route("/admin/users", methods=["GET"])
@jwt_required()
@admin_required
def get_all_users():
    users_list = AdminService.get_all_users_dto()
    return jsonify({"users": users_list}), 200

# Pobierz tylko sprzedawców
@admin_bp.route("/admin/sellers", methods=["GET"])
@jwt_required()
@admin_required
def get_all_sellers():
    sellers_list = AdminService.get_all_sellers_dto()
    return jsonify({"sellers": sellers_list}), 200

# Ban użytkownika
@admin_bp.route("/admin/ban-user/<int:user_id>", methods=["POST", "OPTIONS"])
@jwt_required()
@admin_required
def ban_user(user_id):
    if request.method == "OPTIONS":
        return '', 200

    data = request.get_json()
    reason = data.get("reason")
    duration = data.get("duration")

    if not reason or duration is None:
        return jsonify({"error": "Powód i czas trwania bana są wymagane"}), 400

    try:
        duration_days = int(duration)
    except (TypeError, ValueError):
        return jsonify({"error": "Czas trwania musi być liczbą"}), 400

    success = AdminService.ban_user_by_id(user_id, reason, duration_days)
    if not success:
        return jsonify({"error": "Użytkownik nie istnieje"}), 404

    return jsonify({"message": "Użytkownik zbanowany"}), 200

# Usuń użytkownika
@admin_bp.route("/admin/delete-user/<int:user_id>", methods=["DELETE", "OPTIONS"])
@jwt_required()
@admin_required
def delete_user(user_id):
    if request.method == "OPTIONS":
        return '', 200

    success = AdminService.delete_user_by_id(user_id)
    if not success:
        return jsonify({"error": "Użytkownik nie istnieje"}), 404

    return jsonify({"message": "Użytkownik usunięty"}), 200

# Odbanowanie użytkownika
@admin_bp.route("/admin/unban-user/<int:user_id>", methods=["POST", "OPTIONS"])
@jwt_required()
@admin_required
def unban_user(user_id):
    if request.method == "OPTIONS":
        return '', 200

    success = AdminService.unban_user_by_id(user_id)
    if not success:
        return jsonify({"error": "Użytkownik nie istnieje"}), 404

    return jsonify({"message": "Użytkownik odbanowany"}), 200

# Promuj użytkownika do sprzedawcy
@admin_bp.route("/admin/promote-to-seller/<int:user_id>", methods=["POST", "OPTIONS"])
@jwt_required()
@admin_required
def promote_to_seller(user_id):
    if request.method == "OPTIONS":
        return '', 200

    result = AdminService.promote_user_to_seller_by_id(user_id)

    if result == "not_found":
        return jsonify({"error": "Użytkownik nie istnieje"}), 404
    if result == "already_seller":
        return jsonify({"error": "Użytkownik jest już sprzedawcą"}), 400

    return jsonify({"message": "Użytkownik został sprzedawcą"}), 200

# Degraduj sprzedawcę do użytkownika
@admin_bp.route("/admin/demote-to-user/<int:user_id>", methods=["POST", "OPTIONS"])
@jwt_required()
@admin_required
def demote_to_user(user_id):
    if request.method == "OPTIONS":
        return '', 200

    result = AdminService.demote_seller_to_user_by_id(user_id)

    if result == "not_found":
        return jsonify({"error": "Użytkownik nie istnieje"}), 404
    if result == "not_seller":
        return jsonify({"error": "Użytkownik nie jest sprzedawcą"}), 400

    return jsonify({"message": "Sprzedawca został zdegradowany do użytkownika"}), 200


