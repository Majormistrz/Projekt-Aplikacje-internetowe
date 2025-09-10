#Dawid Rudnik 13001, Norbert Struciński 13004
from flask import Flask
from config.config import SQLALCHEMY_DATABASE_URI, SECRET_KEY
from database.database import db
from models.user import User
from models.category import Category
from models.offer import Offer
from models.rental import Rental
from models.notification import Notification
from models.rental_reminder import RentalReminder
from routes.user_routes import user_bp
from routes.category_routes import category_bp
from routes.offer_routes import offer_bp
from routes.rental_routes import rental_bp
from routes.notifications_routes import notifications_bp, send_rental_reminders
from routes.admin_routes import admin_bp
from routes.test_routes import test_bp
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from extensions import mail
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import timedelta


# ========================
#  Inicjalizacja aplikacji
# ========================
app = Flask(__name__)

# Konfiguracja CORS
CORS(
    app,
    resources={r"/*": {"origins": "http://localhost:3000"}},
    supports_credentials=True,
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"]
)

# Klucze i DB
app.config['SECRET_KEY'] = SECRET_KEY
app.config["JWT_SECRET_KEY"] = "ddd"   # zmień na bezpieczny klucz!
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=2)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30) 
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Mail (konfiguracja pozostaje, maili nie wysyłamy z main.py)
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = "wypozyczalniap@gmail.com"
app.config["MAIL_PASSWORD"] = "nini vteh nmnh omjn"  # hasło aplikacji
app.config["MAIL_DEFAULT_SENDER"] = "wypozyczalniap@gmail.com"

# ========================
#  Rejestracja blueprintów
# ========================
app.register_blueprint(user_bp, url_prefix="/api")
app.register_blueprint(category_bp, url_prefix="/api")
app.register_blueprint(offer_bp, url_prefix="/api")
app.register_blueprint(rental_bp, url_prefix="/api")
app.register_blueprint(notifications_bp, url_prefix="/api")
app.register_blueprint(admin_bp, url_prefix="/api")
app.register_blueprint(test_bp, url_prefix="/api")

# ========================
#  Inicjalizacja rozszerzeń
# ========================
db.init_app(app)
jwt = JWTManager(app)
mail.init_app(app)

# ========================
#  Główne uruchomienie
# ========================
if __name__ == "__main__":
    with app.app_context():
        try:
            # db.create_all()             # odkomentuj przy pierwszym uruchomieniu
            # Category.initialize_categories()  # odkomentuj jeśli dodajesz domyślne kategorie
            print("✅ Aplikacja uruchomiona")
        except Exception as e:
            print(f"❌ Błąd podczas inicjalizacji: {str(e)}")

        # Scheduler (co minutę wywołuje funkcję z notifications_routes.py)
        scheduler = BackgroundScheduler()
        scheduler.add_job(func=lambda: send_rental_reminders(app), trigger="interval", minutes=1)
        scheduler.start()

    app.run(debug=True, use_reloader=False)
