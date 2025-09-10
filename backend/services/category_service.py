from models.category import Category
from repositories.category_repository import CategoryRepository

class CategoryService:
    @staticmethod
    def get_categories():
        categories = CategoryRepository.get_all()
        return [{"id": c.id, "name": c.name, "description": c.description} for c in categories]

    @staticmethod
    def get_category(category_id):
        category = CategoryRepository.get_by_id(category_id)
        if not category:
            return None, "Kategoria nie istnieje"
        return {"id": category.id, "name": category.name, "description": category.description}, None

    @staticmethod
    def create_category(data):
        name = data.get("name")
        description = data.get("description")

        if not name:
            return None, "Nazwa kategorii jest wymagana"

        if CategoryRepository.get_by_name(name):
            return None, "Kategoria o takiej nazwie już istnieje"

        category = Category(name=name, description=description)
        CategoryRepository.add(category)
        return {"id": category.id, "name": category.name, "description": category.description}, None

    @staticmethod
    def update_category(category_id, data):
        category = CategoryRepository.get_by_id(category_id)
        if not category:
            return None, "Kategoria nie istnieje"

        name = data.get("name")
        description = data.get("description")

        if not name and not description:
            return None, "Brak danych do aktualizacji"

        if name:
            category.name = name
        if description:
            category.description = description

        CategoryRepository.update()
        return {"id": category.id, "name": category.name, "description": category.description}, None

    @staticmethod
    def delete_category(category_id):
        category = CategoryRepository.get_by_id(category_id)
        if not category:
            return False, "Kategoria nie istnieje"

        CategoryRepository.delete(category)
        return True, None
