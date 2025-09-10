from database.database import db
from models.password_reset import PasswordReset

class PasswordResetRepository:
    @staticmethod
    def get_by_email(email):
        return PasswordReset.query.filter_by(email=email).all()

    @staticmethod
    def delete_by_email(email):
        PasswordReset.query.filter_by(email=email).delete()
        db.session.commit()

    @staticmethod
    def add(reset_entry):
        db.session.add(reset_entry)
        db.session.commit()
        
    @staticmethod
    def get_by_token(token):
        return PasswordReset.query.filter_by(token=token).first()

    @staticmethod
    def delete(reset_entry):
        db.session.delete(reset_entry)
        db.session.commit()
