import os

SECRET_KEY = "zzz"

DB_USER = "postgres"
DB_PASSWORD = "Admin"
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "wypozyczalnia_db"

SQLALCHEMY_DATABASE_URI = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
