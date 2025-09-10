from database.database import db

class Category(db.Model):
    __tablename__ = "categories"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String, nullable=True)

    offers = db.relationship("Offer", backref="category", lazy=True)

    def __init__(self, name, description):
        self.name = name
        self.description = description

    @staticmethod
    def initialize_categories():
        categories = [
            {"id": 1, "name": "Elektronika", "description": "Sprzęt elektroniczny"},
            {"id": 2, "name": "Narzędzia budowlane", "description": "Wyposażenie domu"},
            {"id": 3, "name": "Gry", "description": "Gry komputerowe i planszowe"},
            {"id": 4, "name": "Książki", "description": "Literatura i podręczniki"}
        ]

        for cat in categories:
            existing_category = Category.query.filter_by(name=cat["name"]).first()
            if not existing_category:
                new_category = Category(name=cat["name"], description=cat["description"])
                db.session.add(new_category)

        db.session.commit()
        print("Kategorie zostały dodane do bazy!")
