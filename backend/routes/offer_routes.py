from flask import Blueprint, jsonify, request, send_from_directory, current_app, url_for, send_file
import os
import base64
from database.database import db
from models.offer import Offer
from models.category import Category
from models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import io
from services.offer_service import OfferService
from repositories.offer_repository import OfferRepository
from schemas.offer_schema import OfferCreateSchema, OfferUpdateSchema
from marshmallow import ValidationError



offer_bp = Blueprint("offer", __name__)

# Obsługa przesyłania plików
@offer_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    uploads_dir = os.path.join(current_app.root_path, '..', 'uploads')
    return send_from_directory(uploads_dir, filename)

# curl -X GET http://127.0.0.1:5000/api/offers



# Endpointy dla ofert
@offer_bp.route("/offers", methods=["GET"])
def get_offers():
    category_id = request.args.get("category_id", type=int)
    search_query = request.args.get("query", type=str)

    offers = OfferService.get_all_offers(category_id, search_query)
    return jsonify({"offers": offers}), 200

@offer_bp.route("/offers/<int:offer_id>", methods=["GET"])
def get_offer_by_id(offer_id):
    offer = OfferService.get_offer_by_id(offer_id)
    if not offer:
        return jsonify({"error": "oferta nie istnieje"}), 404
    return jsonify(offer), 200

    
"""
@offer_bp.route("/offers", methods=["POST"])
def create_offer():
    data = request.get_json()
    current_user_email = get_jwt_identity()
    
    
    user = User.query.filter_by(email=current_user_email).first()
    if not user or user.role != "seller":
        return jsonify({"error": "Brak uprawnień do dodawania ofert"}), 403
    
    name = data.get("name")
    description = data.get("description")
    entry_price = data.get("entry_price")
    price_per_day = data.get("price_per_day")
    category_id = data.get("category_id")
    
    # sprawdzanie obecności danych
    if not name or not entry_price or not price_per_day or not category_id:
        return jsonify({"error": "Brak wymaganych danych do utworzenia oferty"}), 400
    
    #sprawdzanie czy kategoria istnieje
    if not Category.query.get(category_id):
        return jsonify({"error": "Podana kategoria nie istnieje"}), 404
    
    # weryfikacja czy taka oferta już istnieje
    existing_offer = Offer.query.filter_by(name=name).first()
    if existing_offer:
        return jsonify({"error": "Oferta o takiej nazwie już istnieje"}), 409
    
    #tworzenie oferty
    new_offer = Offer(
        name=name,
        description=description,
        entry_price=entry_price,
        price_per_day=price_per_day,
        seller_id=user.id,
        category_id=category_id
    )
    
    # obsługa błędów w przypadku problemów z bazą danych. zastanaowiać się nad dodaniem wszędzie
    try:
        db.session.add(new_offer)
        db.session.commit()
    except Exception as e:
        db.session.rollback()  # Cofnięcie zmian w razie błędu
        return jsonify({"error": f"Błąd zapisu do bazy: {str(e)}"}), 500

    
    return jsonify({
        "message": "Oferta została utworzona pomyślnie!",
        "offer": {
            "id": new_offer.id,
            "name": new_offer.name,
            "description": new_offer.description,
            "entry_price": new_offer.entry_price,
            "price_per_day": new_offer.price_per_day,
            "category_id": new_offer.category_id,
            "seller_id": new_offer.seller_id
        }
    }), 201
    """

# Endpoint do tworzenia oferty    
@offer_bp.route("/offers", methods=["POST"])
@jwt_required()
def create_offer():
    schema = OfferCreateSchema()
    data = schema.load(request.form)  # walidacja
    image = request.files.get("image")

    try:
        OfferService.create_offer(data, image)
        return jsonify({"message": "Oferta dodana!"}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


# Endpoint do aktualizacji oferty
@offer_bp.route("/offers/<int:offer_id>", methods=["PUT", "POST"])
@jwt_required()
def update_offer(offer_id):
    schema = OfferUpdateSchema()
    
    data = dict(request.form)
    
    data.pop("seller_id", None)
    
    try:
        data = schema.load(data)  # walidacja
    except ValidationError as err:
        return jsonify(err.messages), 400

    image = request.files.get("image")
    current_user_email = get_jwt_identity()

    offer, message, status = OfferService.update_offer(offer_id, current_user_email, data, image) 
    if status != 200:
        return jsonify({"error": message}), status

    return jsonify({"message": message}), 200

# Endpoint do usuwania oferty
@offer_bp.route("/offers/<int:offer_id>", methods=["DELETE"])
@jwt_required()
def delete_offer(offer_id):
    offer = OfferRepository.get_by_id(offer_id)
    
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()

    success, message, status_code = OfferService.delete_offer(offer, user) # type: ignore
    return jsonify({"message": message} if success else {"error": message}), status_code


# Endpoint do przesyłania zdjęcia oferty
@offer_bp.route("/offers/<int:offer_id>/upload", methods=["POST"])
def upload_offer_image(offer_id):
    offer = Offer.query.get(offer_id)

    if not offer:
        return jsonify({"error": "Oferta nie istnieje"}), 404

    if "file" not in request.files:
        return jsonify({"error": "Brak pliku w zapytaniu"}), 400

    file = request.files["file"]
    image_data = file.read()  # odczytaj plik jako dane binarne

    offer.image = image_data  # Zapisz obraz w bazie
    db.session.commit()

    return jsonify({"message": "Zdjęcie zapisane dla oferty!"}), 200

# Endpoint do pobierania ofert konkretnego sprzedawcy
@offer_bp.route("/offers/seller/<int:seller_id>", methods=["GET"])
@jwt_required()
def get_offers_by_seller(seller_id: int):
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()

    try:
        offers = OfferService.get_offers_by_seller(user, seller_id) 
    except PermissionError as e:
        return jsonify({"error": str(e)}), 403

    return jsonify([{
        "id": offer.id,
        "name": offer.name,
        "description": offer.description,
        "entry_price": offer.entry_price,
        "price_per_day": offer.price_per_day,
        "category_id": offer.category_id,
        "seller_id": offer.seller_id,
        "available_quantity": offer.available_quantity
    } for offer in offers]), 200
    
from flask import send_file
import io

# Endpoint do pobierania zdjęcia oferty
@offer_bp.route("/offers/<int:offer_id>/image", methods=["GET"])
def get_offer_image(offer_id):
    offer = Offer.query.get(offer_id)
    if not offer or not offer.image:
        return jsonify({"error": "Obraz nie istnieje"}), 404

    return send_file(
        io.BytesIO(offer.image),
        mimetype="image/jpeg"  
    )


# Endpoint do rezerwacji oferty
@offer_bp.route("/offers/<int:offer_id>/reserve", methods=["POST"])
@jwt_required()
def reserve_offer(offer_id):
    offer = Offer.query.get(offer_id)
    if not offer:
        return jsonify({"error": "Oferta nie istnieje"}), 404

    data = request.get_json() or {}
    quantity = data.get("quantity", 1)  

    if quantity <= 0:
        return jsonify({"error": "Nieprawidłowa ilość"}), 400

    if offer.available_quantity < quantity:
        return jsonify({"error": f"Brak wystarczającej ilości. Dostępne: {offer.available_quantity}"}), 400

    offer.available_quantity -= quantity
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Błąd podczas rezerwacji: {str(e)}"}), 500

    return jsonify({
        "message": f"Zarezerwowano {quantity} sztuk oferty",
        "available_quantity": offer.available_quantity
    }), 200
