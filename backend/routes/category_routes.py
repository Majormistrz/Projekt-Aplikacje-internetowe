from flask import Flask,jsonify,Blueprint, request
from database.database import db
from models.category import Category
from models.offer import Offer
from services.category_service import CategoryService
category_bp = Blueprint("category", __name__) # tworzenie grupy endpointów


 
#curl -X GET http://127.0.0.1:5000/api/categories  komenda sprawedzajaca jakie kategorie istnieją
#curl -X DELETE http://127.0.0.1:5000/api/categories/1 metoda usuwająca kategorie o id 1
''' curl -X POST http://127.0.0.1:5000/api/categories  komenda  tworząca nową kategorie w bazie (zczytyhe z data.json. z jakiegoś powodu w samej komendzie nie chce mi działać)
    -H "Content-Type: application/json" \
    --data-binary @C:/Users/User/Desktop/data.json
    '''
    
'''curl -X PUT http://127.0.0.1:5000/api/categories/1  koemndada do edycji kategorii. pamięćtać że 1 zamienic na di kategorii którą edytujemy
    -H "Content-Type: application/json" \
    -d '{"name": "Nowa nazwa", "description": "Nowy opis"}'
    '''

# Endpointy dla kategorii
@category_bp.route("/categories", methods=["GET"])
def get_categories():
    categories = CategoryService.get_categories()
    return jsonify({"categories": categories})

# Endpoint do pobierania konkretnej kategorii po ID
@category_bp.route("/categories/<int:category_id>", methods=["GET"])
def get_category_by_id(category_id):
    result, error = CategoryService.get_category(category_id)
    if error:
        return jsonify({"error": error}), 404
    return jsonify(result)

# Endpointy do tworzenia, aktualizacji i usuwania kategorii
@category_bp.route("/categories", methods=["POST"])
def create_category():
    data = request.get_json()
    result, error = CategoryService.create_category(data)
    if error:
        return jsonify({"error": error}), 400
    return jsonify({"message": "Kategoria została utworzona pomyślnie!", "category": result}), 201

# Endpoint do aktualizacji kategorii
@category_bp.route("/categories/<int:category_id>", methods=["PUT"])
def update_category(category_id):
    data = request.get_json()
    result, error = CategoryService.update_category(category_id, data)
    if error:
        return jsonify({"error": error}), 400 if error == "Brak danych do aktualizacji" else 404
    return jsonify({"message": "Kategoria została zaktualizowana", "category": result})

# Endpoint do usuwania kategorii
@category_bp.route("/categories/<int:category_id>", methods=["DELETE"])
def delete_category(category_id):
    success, error = CategoryService.delete_category(category_id)
    if not success:
        return jsonify({"error": error}), 404
    return jsonify({"message": "Kategoria została usunięta pomyślnie!"})
