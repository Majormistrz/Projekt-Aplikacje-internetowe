from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from database.database import db
from models.user import User
from models.offer import Offer
from models.category import Category
from models.rental import Rental
test_bp = Blueprint("test_bp", __name__)








test_bp = Blueprint("test_bp", __name__)

# -----------------------------
# 1. Endpoint do tworzenia kategorii testowej
# -----------------------------
@test_bp.route("/test/create-category", methods=["POST"])
def create_test_category():
    category = Category.query.filter_by(name="Test Category").first()
    if category:
        return jsonify({"message": "Kategoria już istnieje", "id": category.id}), 200

    category = Category(name="Test Category", description="Opis kategorii testowej")
    db.session.add(category)
    db.session.commit()
    return jsonify({"message": "Kategoria stworzona", "id": category.id}), 201

# -----------------------------
# 2. Endpoint do tworzenia użytkownika testowego (seller)
# -----------------------------
@test_bp.route("/test/create-seller", methods=["POST"])
def create_test_seller():
    seller = User.query.filter_by(email="test_seller@example.com").first()
    if seller:
        return jsonify({"message": "Użytkownik już istnieje", "id": seller.id}), 200

    hashed_password = generate_password_hash("Test123!")
    seller = User(
        name="Test",
        surname="Seller",
        email="test_seller@example.com",
        password=hashed_password,
        is_verified=True
    )
    seller.role = "seller"
    db.session.add(seller)
    db.session.commit()
    return jsonify({"message": "Użytkownik stworzony", "id": seller.id}), 201

# -----------------------------
# 3. Endpoint do tworzenia oferty testowej
# -----------------------------
@test_bp.route("/test/create-offer", methods=["POST"])
def create_test_offer():
    data = request.get_json()

    # Sprawdzenie czy istnieje kategoria i seller
    category = Category.query.filter_by(name="Test Category").first()
    if not category:
        return jsonify({"message": "Najpierw stwórz kategorię testową"}), 400

    seller = User.query.filter_by(email="test_seller@example.com").first()
    if not seller:
        return jsonify({"message": "Najpierw stwórz użytkownika testowego (seller)"}), 400

    image_data = data.get("image")
    if image_data is None:
        image_data = b""

    offer = Offer(
        name=data["name"],
        description=data.get("description", ""),
        entry_price=data["entry_price"],
        price_per_day=data["price_per_day"],
        category_id=category.id,
        seller_id=seller.id,
        image=image_data,
        available_quantity=data.get("available_quantity", 1)
    )
    db.session.add(offer)
    db.session.commit()

    return jsonify({
        "id": offer.id,
        "name": offer.name,
        "category_id": category.id,
        "seller_id": seller.id
    }), 201




@test_bp.route("/test/delete-offer", methods=["DELETE"])
def delete_test_offer():
    offer_id = request.args.get("id")
    if not offer_id:
        return jsonify({"message": "ID oferty jest wymagane"}), 400

    offer = Offer.query.get(offer_id)
    if not offer:
        return jsonify({"message": "Oferta nie istnieje"}), 404

    db.session.delete(offer)
    db.session.commit()
    return jsonify({"message": f"Oferta {offer_id} została usunięta"}), 200




@test_bp.route("/test/create-test-user", methods=["POST"])
def create_test_user():
    db.create_all()  # upewniamy się, że tabele istnieją
    try:
        # Domyślne dane testowego użytkownika
        default_email = "test_user@example.com"
        default_password = "Test123!"
        default_name = "Test"
        default_surname = "User"

        # Sprawdzenie, czy użytkownik już istnieje
        existing_user = User.query.filter_by(email=default_email).first()
        if existing_user:
            return jsonify({
                "message": "Użytkownik już istnieje",
                "id": existing_user.id,
                "email": existing_user.email
            }), 200

        # Tworzenie nowego użytkownika testowego
        hashed_password = generate_password_hash(default_password)
        user = User(
            name=default_name,
            surname=default_surname,
            email=default_email,
            password=hashed_password,
            is_verified=True  # domyślnie weryfikowany
        )

        db.session.add(user)
        db.session.commit()

        return jsonify({
            "message": "Testowy użytkownik stworzony",
            "id": user.id,
            "email": user.email
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Błąd: {str(e)}"}), 500
    
    
@test_bp.route("/test/delete-test-user", methods=["DELETE"])
def delete_test_user():
    try:
        email = request.args.get("email")
        if not email:
            return jsonify({"message": "Email jest wymagany"}), 400

        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"message": f"Użytkownik {email} nie istnieje"}), 404

        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": f"Użytkownik {email} został usunięty"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Błąd usuwania: {str(e)}"}), 500

@test_bp.route("/test/delete-rental", methods=["DELETE"])
def delete_test_rental():
    
    try:
        rental_id = request.args.get("id")
        if not rental_id:
            return jsonify({"message": "ID wypożyczenia jest wymagane"}), 400

        rental = Rental.query.get(rental_id)
        if not rental:
            return jsonify({"message": f"Wypożyczenie {rental_id} nie istnieje"}), 404

        db.session.delete(rental)
        db.session.commit()
        return jsonify({"message": f"Wypożyczenie {rental_id} zostało usunięte"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Błąd przy usuwaniu wypożyczenia: {str(e)}"}), 500

@test_bp.route("/test/rentals-by-offer", methods=["GET"])
def rentals_by_offer():
    offer_id = request.args.get("id")
    if not offer_id:
        return jsonify({"message": "ID oferty jest wymagane"}), 400

    rentals = Rental.query.filter_by(offer_id=offer_id).all()
    return jsonify([
        {
            "id": r.id,
            "user_id": r.user_id,
            "offer_id": r.offer_id,
            "rental_date": r.rental_date.isoformat(),
            "return_date": r.return_date.isoformat() if r.return_date else None,
            "total_price": r.total_price,
            "status": r.status
        } for r in rentals
    ]), 200