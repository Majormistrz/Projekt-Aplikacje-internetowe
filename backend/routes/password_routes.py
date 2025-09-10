from flask import Blueprint, request, jsonify
from models.password_reset import PasswordReset
from flask_mail import Message

password_bp = Blueprint("password_bp", __name__)
# Endpoint do resetowania hasła
@password_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    msg = Message("Resetowanie hasła", recipients=[email])
    msg.body = "Kliknij link, aby zresetować hasło: http://localhost:3000/reset?token=XYZ"
    mail.send(msg)

    return jsonify({"message": "Link resetujący został wysłany"}), 200
