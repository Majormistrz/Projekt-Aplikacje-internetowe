from flask import Blueprint, request, jsonify, current_app, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from database.database import db
from models.user import User
from flask_jwt_extended import get_jwt_identity, jwt_required, create_access_token
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from models.password_reset import PasswordReset
from datetime import datetime
from flask_mail import Message
from extensions import mail 
from datetime import datetime, timedelta
import traceback
user_bp = Blueprint("user", __name__)  

import secrets
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
from models.user import User
from models.email_verification import EmailVerification
from repositories.user_repository import UserRepository
from repositories.email_verification_repository import EmailVerificationRepository
from schemas.user_schema import UserSchema,LoginSchema
from services.user_services import UserService
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token


user_schema = UserSchema()
login_schema = LoginSchema()

# ------------------ REJESTRACJA ------------------
@user_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    errors = user_schema.validate(data)
    required_fields = ["name", "surname", "email", "password"]
    missing = [f for f in required_fields if not data.get(f) or not str(data.get(f)).strip()]

    if missing:
        return jsonify({"message": "Brak wymaganych danych"}), 400
    if errors:
        return jsonify(errors), 400


    user, error = UserService.register(data)
    if error == "Email już istnieje!":
        return jsonify({"message": error}), 400
    elif error == "Błąd wysyłania maila":
        return jsonify({"message": error}), 500

    return jsonify({
        "message": "Rejestracja zakończona. Sprawdź email i wpisz kod weryfikacyjny, aby aktywować konto."
    }), 201



# ------------------ LOGOWANIE ------------------
@user_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    
    errors = login_schema.validate(data)
    if errors:
        return jsonify(errors), 400

    
    response_data, error, status_code = UserService.login(data)

    if error:
        if isinstance(error, str):
            return jsonify({"message": error}), status_code
        else:
            return jsonify(error), status_code

    return jsonify(response_data), status_code



# ------------------ POBIERANIE UŻYTKOWNIKA ------------------
@user_bp.route("/user", methods=["GET"])
@jwt_required()
def get_user():
    user_email = get_jwt_identity()

    user_data, error, status_code = UserService.get_user_by_email(user_email)

    if error:
        return jsonify({"message": error}), status_code

    return jsonify(user_data), status_code

# ------------------ GOOGLE LOGIN ------------------
@user_bp.route("/google-login", methods=["POST"])
def google_login():
    data = request.get_json()
    token = data.get("token")

    response_data, error, status_code = UserService.google_login(token)

    if error:
        return jsonify({"error": error}), status_code

    return jsonify(response_data), status_code

# ------------------ RESET HASŁA ------------------
@user_bp.route("/request-password-reset", methods=["POST"])
def request_password_reset():
    data = request.get_json()
    email = data.get("email")

    response_data, error, status_code = UserService.request_password_reset(email)

    if error:
        return jsonify({"message": error}), status_code

    return jsonify(response_data), status_code



@user_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    token = data.get("token")
    new_password = data.get("password")

    response_data, error, status_code = UserService.reset_password(token, new_password)

    if error:
        return jsonify({"message": error}), status_code

    return jsonify(response_data), status_code

# ------------------ AKTUALIZACJA UŻYTKOWNIKA ------------------
@user_bp.route("/user", methods=["PUT", "OPTIONS"])
@jwt_required(optional=True)  # pozwala na zapytanie bez tokena przy OPTIONS
def update_user():
    if request.method == "OPTIONS":
        return '', 200  

    user_email = get_jwt_identity()
    data = request.get_json()

    response_data, error, status_code = UserService.update_user(user_email, data)

    if error:
        return jsonify({"message": error}), status_code

    return jsonify(response_data), status_code


# ------------------ ŻĄDANIE ZMIANY EMAILA ------------------
from models.email_verification import EmailVerification
import secrets

@user_bp.route("/user/request-email-change", methods=["POST"])
@jwt_required()
def request_email_change():
    user_email = get_jwt_identity()
    data = request.get_json()
    new_email = data.get("new_email")

    if not new_email:
        return jsonify({"message": "Brak nowego emaila"}), 400

    result, error, status = UserService.request_email_change(user_email, new_email)
    if error:
        return jsonify({"message": error}), status

    return jsonify(result), status


# ------------------ POTWIERDZENIE ZMIANY EMAILA ------------------
@user_bp.route("/user/confirm-email-change", methods=["POST"])
@jwt_required()
def confirm_email_change():
    user_email = get_jwt_identity()
    data = request.get_json()
    code = data.get("code")

    if not code:
        return jsonify({"message": "Brak kodu"}), 400

    result, error, status = UserService.confirm_email_change(user_email, code)
    if error:
        return jsonify({"message": error}), status

    return jsonify(result), status

# ------------------ WERYFIKACJA EMAILA ------------------
@user_bp.route("/verify-email", methods=["POST"])
def verify_email():
    data = request.get_json()
    email = data.get("email")
    code = data.get("code")

    result, error, status = UserService.verify_email(email, code)

    if error:
        return jsonify({"message": error}), status

    # Serializujemy obiekt User za pomocą Marshmallow
    return jsonify(user_schema.dump(result)), status

# ------------------ PONOWNE WYSŁANIE KODU WERYFIKACYJNEGO ------------------
@user_bp.route("/resend-verification", methods=["POST"])
def resend_verification():
    data = request.get_json()
    email = data.get("email")

    result, error, status = UserService.resend_verification(email)
    if error:
        return jsonify({"message": error}), status

    return jsonify(result), status


@user_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True) 
def refresh():
    identity = get_jwt_identity()
    new_access_token = create_access_token(identity=identity)
    return jsonify({"token": new_access_token}), 200