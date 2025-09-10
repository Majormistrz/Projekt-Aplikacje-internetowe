import secrets
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
from models.user import User
from models.email_verification import EmailVerification
from repositories.user_repository import UserRepository
from repositories.email_verification_repository import EmailVerificationRepository
from utils.mail_utils import send_verification_email,send_reset_email
from database.database import db
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash
from utils.google_auth import verify_google_token
from repositories.password_reset_repository import PasswordResetRepository
from models.password_reset import PasswordReset
from schemas.user_schema import UserUpdateSchema,ConfirmEmailChangeSchema
from flask_jwt_extended import create_access_token, create_refresh_token


class UserService:
    @staticmethod
    def register(data):
        existing_user = UserRepository.get_by_email(data["email"])
        if existing_user:
            return None, "Email już istnieje!"

        hashed_password = generate_password_hash(data["password"])
        user = User(
            name=data["name"],
            surname=data["surname"],
            email=data["email"],
            password=hashed_password,
            is_verified=False
        )
        UserRepository.add(user)

        code = secrets.token_hex(3).upper()[:6]
        expiration = datetime.utcnow() + timedelta(minutes=10)
        verification = EmailVerification(
            user_id=user.id,
            new_email=user.email,
            code=code,
            expiration_time=expiration
        )
        EmailVerificationRepository.add(verification)

        try:
            send_verification_email(user.email, code)
        except Exception:
            db.session.rollback()
            return None, "Błąd wysyłania maila"

        return user, None

    @staticmethod
    def login(data):
        email = data.get("email")
        password = data.get("password")

        user = UserRepository.get_by_email(email)

        if not user or not check_password_hash(user.password, password):
            return None, "Niepoprawny email lub hasło", 401

        if not user.is_verified:
            return None, "Musisz potwierdzić swój email, zanim się zalogujesz", 403

        if user.ban_until and user.ban_until > datetime.utcnow():
            return None, {
                "message": f"Konto zbanowane do {user.ban_until.strftime('%Y-%m-%d %H:%M')}",
                "reason": user.ban_reason
            }, 403

        access_token = create_access_token(identity=email)
        refresh_token = create_refresh_token(identity=email)

        response_data = {
            "message": "Logowanie zakończone sukcesem",
            "token": access_token,
            "refresh_token": refresh_token,
            "role": user.role,
            "name": user.name,
            "surname": user.surname,
            "email": user.email
        }
        if user.role == "seller":
            response_data["seller_id"] = user.id

        return response_data, None, 200
    
    @staticmethod
    def get_user_by_email(email):
        user = UserRepository.get_by_email(email)
        if not user:
            return None, "Nie znaleziono użytkownika", 404

        user_data = {
            "id": user.id,
            "name": user.name,
            "surname": user.surname,
            "email": user.email,
            "role": user.role
        }
        return user_data, None, 200
    
    @staticmethod
    def google_login(token: str):
        if not token:
            return None, "Brak tokenu", 400

        idinfo = verify_google_token(token)
        if not idinfo:
            return None, "Nieprawidłowy token", 401

        email = idinfo["email"]
        name = idinfo.get("given_name", "")
        surname = idinfo.get("family_name", "")

        user = UserRepository.get_by_email(email)

        if not user:
            user = User(name=name, surname=surname, email=email, password="GOOGLE_OAUTH")
            db.session.add(user)
        else:
            user.name = name
            user.surname = surname

        db.session.commit()

        access_token = create_access_token(identity=email)

        response_data = {
            "token": access_token,
            "message": "Zalogowano przez Google",
            "role": user.role,
        }
        if user.role == "seller":
            response_data["seller_id"] = user.id

        return response_data, None, 200
    
    
    @staticmethod
    def request_password_reset(email: str):
        user = UserRepository.get_by_email(email)
        if not user:
            return None, "Użytkownik nie istnieje", 404

        PasswordResetRepository.delete_by_email(email)

        reset_entry = PasswordReset(email=email)
        PasswordResetRepository.add(reset_entry)

        reset_url = f"http://localhost:3000/reset-password?token={reset_entry.token}"

        try:
            send_reset_email(email, reset_url)
        except Exception:
            db.session.rollback()
            return None, "Błąd wysyłania maila", 500

        return {"message": "Link do resetu hasła został wysłany na e-mail"}, None, 200
    
    @staticmethod
    def reset_password(token: str, new_password: str):
        reset_entry = PasswordResetRepository.get_by_token(token)
        if not reset_entry:
            return None, "Nieprawidłowy token", 400

        if reset_entry.expiration_time < datetime.utcnow():
            PasswordResetRepository.delete(reset_entry)
            return None, "Token wygasł", 400

        user = UserRepository.get_by_email(reset_entry.email)
        if not user:
            return None, "Użytkownik nie istnieje", 404

        user.password = generate_password_hash(new_password, method="pbkdf2:sha256", salt_length=8)
        UserRepository.update(user)

        PasswordResetRepository.delete(reset_entry)

        return {"message": "Hasło zostało zresetowane"}, None, 200
    
    @staticmethod
    def update_user(user_email: str, data: dict):
        user = UserRepository.get_by_email(user_email)
        if not user:
            return None, "Nie znaleziono użytkownika", 404

        schema = UserUpdateSchema()
        errors = schema.validate(data)
        if errors:
            missing_fields = ', '.join(errors.keys())
            return None, f"Brak wymaganych danych: {missing_fields}", 400

        user.name = data["name"]
        user.surname = data["surname"]
        UserRepository.update(user)

        return {
            "id": user.id,
            "name": user.name,
            "surname": user.surname,
            "email": user.email,
            "role": user.role,
            "ban_until": user.ban_until,
            "ban_reason": user.ban_reason
        }, None, 200
        
        
    @staticmethod
    def request_email_change(user_email: str, new_email: str):
        user = UserRepository.get_by_email(user_email)
        if not user:
            return None, "Użytkownik nie znaleziony", 404

        if user.password == "GOOGLE_OAUTH":
            return None, "Zmiana emaila jest niedozwolona dla kont Google", 403

        if UserRepository.get_by_email(new_email):
            return None, "Ten email jest już zajęty", 400

        EmailVerificationRepository.delete_by_user_id(user.id)

        code = secrets.token_hex(3).upper()[:6]
        verification = EmailVerification(user.id, new_email, code)
        EmailVerificationRepository.add(verification)

        try:
            send_verification_email(new_email, code)
        except Exception:
            EmailVerificationRepository.delete(verification)
            return None, "Błąd wysyłania maila", 500

        return {"message": "Kod został wysłany na nowy email"}, None, 200


    @staticmethod
    def confirm_email_change(user_email: str, code: str):
        user = UserRepository.get_by_email(user_email)
        if not user:
            return None, "Użytkownik nie znaleziony", 404

        if user.password == "GOOGLE_OAUTH":
            return None, "Zmiana emaila jest niedozwolona dla kont Google", 403

        verification = EmailVerificationRepository.get_by_user_and_code(user.id, code)
        if not verification:
            return None, "Niepoprawny kod", 400

        if verification.expiration_time < datetime.utcnow():
            EmailVerificationRepository.delete(verification)
            return None, "Kod wygasł", 400

        user.email = verification.new_email
        UserRepository.update(user)
        EmailVerificationRepository.delete(verification)

        return {"message": "✅ Email został zmieniony", "new_email": user.email}, None, 200

    
    @staticmethod
    def verify_email(user_email, code):
        user = UserRepository.get_by_email(user_email)
        if not user:
            return None, "Użytkownik nie znaleziony", 404

        verification = EmailVerificationRepository.get_by_user_and_code(user.id, code)
        if not verification:
            return None, "Niepoprawny kod", 400

        if verification.expiration_time < datetime.utcnow():
            EmailVerificationRepository.delete(verification)
            return None, "Kod wygasł", 400

        user.is_verified = True
        UserRepository.update(user)
        EmailVerificationRepository.delete(verification)
        return user, None, 200
    
    @staticmethod
    def resend_verification(email):
        user = User.query.filter_by(email=email).first()
        if not user:
            return None, "Użytkownik nie znaleziony", 404
        if user.is_verified:
            return None, "Email już został potwierdzony", 400

        EmailVerificationRepository.delete_by_user_id(user.id)

        code = secrets.token_hex(3).upper()[:6]
        expiration = datetime.utcnow() + timedelta(minutes=10)
        verification = EmailVerification(
            user_id=user.id,
            new_email=email,
            code=code,
            expiration_time=expiration
        )
        EmailVerificationRepository.add(verification)

        try:
            send_verification_email(email, code)
        except Exception:
            return None, "Błąd wysyłania maila", 500

        return {"message": "Nowy kod został wysłany"}, None, 200