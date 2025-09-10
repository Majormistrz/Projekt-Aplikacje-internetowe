Projekt wypożyczalni wykonany przez Dawida Rudnika (13001) oraz Norberta Strucińskiego (13004). Celem projektu jest zbudowanie kompleksowej aplikacji do zarządzania wypożyczeniami. Umożliwia ona nie tylko wypożyczanie przedmiotów klientom, ale również zarządzanie wypożyczeniami i ofertami przez sprzedawców oraz dostęp do funkcji administracyjnych.


## Technologie

| Warstwa       | Technologia                      |
|---------------|----------------------------------|
| Frontend      | React + Bootstrap                |
| Backend       | Flask + SQLAlchemy               |
| Baza danych   | PostgreSQL                       |
| Autoryzacja   | JWT (Flask-JWT-Extended)         |
| OAuth         | Google OAuth2                    |
| API           | REST (Flask Blueprints)          |
| Komunikacja   | Fetch / Axios                    |



---

## 📂 Struktura katalogów

```
projekt-wypozyczalnia/
└── backend/
    ├── __pycache__/                      # pliki cache Pythona (ignorowane przez Git)
    │   ├── config.cpython-*.pyc
    │   ├── main.cpython-*.pyc
    │
    ├── config/                           # Konfiguracja globalna aplikacji
    │   ├── __pycache__/
    │   └── config.py
    │
    ├── database/                         # Inicjalizacja połączenia z bazą danych
    │   ├── __pycache__/
    │   └── database.py
    │
    ├── migrations/                       # Folder migracji (opcjonalnie Alembic)
    │
    ├── models/                           # Modele SQLAlchemy (ORM)
    │   ├── __pycache__/
    │   ├── cart.py
    │   ├── category.py
    │   ├── email_verification.py
    │   ├── notification.py
    │   ├── offer.py
    │   ├── OfferImage.py
    │   ├── password_reset.py
    │   ├── rental_reminder.py
    │   ├── rental.py
    │   └── user.py
    │
    ├── repositories/                     # Logika dostępu do danych 
    │   ├── __pycache__/
    │   ├── admin_repository.py
    │   ├── category_repository.py
    │   ├── email_verification_repository.py
    │   ├── offer_repository.py
    │   ├── password_reset_repository.py
    │   ├── rental_repository.py
    │   ├── user_repository.py
    │
    ├── routes/                           # Endpointy API (Flask Blueprints)
    │   ├── __pycache__/
    │   ├── admin_routes.py
    │   ├── category_routes.py
    │   ├── notifications_routes.py
    │   ├── offer_routes.py
    │   ├── password_routes.py
    │   ├── rental_routes.py
    │   ├── test_routes.py
    │   └── user_routes.py
    │
    ├── schemas/                          # Schematy danych
    │   ├── __pycache__/
    │   ├── offer_schema.py
    │   ├── user_schema.py
    │
    ├── services/                         # Logika biznesowa aplikacji
    │   ├── __pycache__/
    │   ├── admin_service.py
    │   ├── category_service.py
    │   ├── email_service.py
    │   ├── offer_service.py
    │   ├── rental_service.py
    │   ├── user_services.py
    │ 
    ├── utils/                            # Narzędzia pomocnicze i dane początkowe
    │   └── data.json
    │
    ├── extensions.py
    └── main.py                           # Główna aplikacja Flask


└── frontend/
    ├── node_modules/                 # folder z zainstalowanymi paczkami NPM
    ├── public/                       # pliki publiczne 
    ├── src/                          # główny kod aplikacji
    │   ├── assets/                   # zasoby statyczne 
    │   ├── components/               # komponenty wielokrotnego użytku
    │   │   ├── Footer.js
    │   │   ├── Layout.js
    │   │   ├── LayoutWithSearch.js
    │   │   ├── NotificationBell.js
    │   │   ├── ReminderButton.js
    │   │   ├── SearchBar.js
    │   │   └── UserPanelParts/       # elementy panelu użytkownika
    │   ├── context/                  # konteksty Reacta 
    │   ├── hooks/                    # niestandardowe hooki
    │   │   ├── useAllOffers.js
    │   │   ├── useAllUsers.js  
    │   │   ├── useAuthGuard.js
    │   │   ├── useCart.js
    │   │   ├── useCategories.js
    │   │   ├── useCheckout.js
    │   │   ├── useLogin.js
    │   │   ├── useLoginForm.js
    │   │   ├── useLogout.js
    │   │   ├── useLogoutCountdown.js
    │   │   ├── useNotifications.js
    │   │   ├── useOffer.js
    │   │   ├── useOfferDelete.js
    │   │   ├── useOfferForm.js
    │   │   ├── useOfferModal.js
    │   │   ├── useOfferSubmit.js
    │   │   ├── useReminders.js
    │   │   ├── useRentals.js
    │   │   ├── useReservation.js
    │   │   ├── useResetPassword.js
    │   │   ├── useResetPasswordRequest.js
    │   │   ├── useSearchResults.js
    │   │   ├── useSeller.js
    │   │   ├── useSellerOffers.js
    │   │   ├── useSignUpForm.js
    │   │   ├── useUser.js
    │   │   ├── useUserContext.js
    │   │   └── useUserRentals.js
    │   ├── pages/                    # pełne widoki/strony
    │   │   ├── About.js
    │   │   ├── AdminPanel.js
    │   │   ├── Cart.js
    │   │   ├── CategoryPage.js
    │   │   ├── CategorySection.js
    │   │   ├── Checkout.js
    │   │   ├── Contact.js
    │   │   ├── Home.js
    │   │   ├── Login.js
    │   │   ├── OfferDetails.js
    │   │   ├── ResetPassword.js
    │   │   ├── ResetPasswordRequest.js
    │   │   ├── SearchResults.js
    │   │   ├── SellerPanel.js
    │   │   ├── SignUp.js
    │   │   └── UserPanel.js
    │   ├── utils/                    # funkcje pomocnicze
    │   │   └── auth.js
    │   ├── App.css                   # style główne aplikacji
    │   └── App.js                    # główny komponent aplikacji
    │
    ├── package.json                 # zależności i skrypty Reacta

```


