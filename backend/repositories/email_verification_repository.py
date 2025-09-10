from models.email_verification import EmailVerification
from database.database import db

class EmailVerificationRepository:
    @staticmethod
    def add(verification):
        db.session.add(verification)
        db.session.commit()

    @staticmethod
    def delete_by_user_id(user_id: int):
        EmailVerification.query.filter_by(user_id=user_id).delete()
        db.session.commit()
        
    @staticmethod
    def get_by_user_and_code(user_id, code):
        return EmailVerification.query.filter(
            EmailVerification.user_id == user_id, 
            db.func.upper(db.func.trim(EmailVerification.code)) == code.strip().upper() 
        ).first()

    @staticmethod
    def delete(verification: EmailVerification):
        db.session.delete(verification)
        db.session.commit()
    
    
    