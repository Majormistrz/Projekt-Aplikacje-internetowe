import React, { useState, useEffect, useContext } from "react";
import { useUserContext } from "../context/UserContext";
import { NotificationContext } from "../context/NotificationContext";
import RentalList from "../components/UserPanelParts/RentalList";
import NotificationList from "../components/UserPanelParts/NotificationList";
import UserGreeting from "../components/UserPanelParts/UserGreeting";
import useLogoutCountdown from "../hooks/useLogoutCountdown";
import useUserRentals from "../hooks/useUserRentals";
import axios from "axios";

const UserPanel = () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const { fetchNotifications, notifications } = useContext(NotificationContext);
  const { user, setUser } = useUserContext();
  const { logout, countdown, isCounting } = useLogoutCountdown("/", 3000);

  // ========================
  // Wszystkie Hooki zawsze wywołujemy
  // ========================
  const [searchActive, setSearchActive] = useState("");
  const [searchHistory, setSearchHistory] = useState("");
  const [searchNotifications, setSearchNotifications] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    newEmail: "",
    verificationCode: ""
  });
  const [emailStep, setEmailStep] = useState("edit");
  const [message, setMessage] = useState("");
  const [localNotifications, setLocalNotifications] = useState(notifications);

  const { activeRentals, rentalHistory, totalPages, requestReturn } =
    useUserRentals(user?.id);

  const isGoogleAccount = Boolean(
    user &&
      (
        user.password === "GOOGLE_OAUTH" ||
        user.auth_provider === "google" ||
        user.is_google === true ||
        user.oauth === "google" ||
        user.provider === "google"
      )
  );

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        surname: user.surname,
        newEmail: "",
        verificationCode: ""
      });
      setEmailStep("edit");
    }
  }, [user]);

  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);


  useEffect(() => {
  if (user) {
    fetchNotifications();
  }
}, [user, fetchNotifications]);


  // ========================
  // Funkcje obsługi
  // ========================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReminderSet = async () => {
    await fetchNotifications();
  };

  const handleSaveNameSurname = async (e) => {
    e.preventDefault();
    if (!token) return setMessage("❌ Brak tokenu!");

    try {
      await axios.put(
        "http://localhost:5000/api/user",
        { name: formData.name, surname: formData.surname },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Imię i nazwisko zaktualizowane");
      setUser({ ...user, name: formData.name, surname: formData.surname });
      setShowForm(false);
    } catch (err) {
      setMessage("❌ Błąd: " + (err.response?.data?.message || err.message));
    }
  };

  const handleRequestEmailChange = async () => {
    if (!token) return setMessage("❌ Brak tokenu!");

    if (isGoogleAccount) {
      return setMessage("❌ Konto powiązane z Google — zmiana emaila zablokowana.");
    }

    try {
      await axios.post(
        "http://localhost:5000/api/user/request-email-change",
        { new_email: formData.newEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("📧 Kod został wysłany na nowy email");
      setEmailStep("verify");
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || err.message));
    }
  };

  const handleConfirmEmailChange = async () => {
    if (!token) return setMessage("❌ Brak tokenu!");

    if (isGoogleAccount) {
      return setMessage("❌ Konto powiązane z Google — zmiana emaila zablokowana.");
    }

    try {
      await axios.post(
        "http://localhost:5000/api/user/confirm-email-change",
        { code: formData.verificationCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Email został zmieniony. Zostaniesz wylogowany...");
      setTimeout(() => logout(), 3000);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!token) return setMessage("❌ Brak tokenu!");

    if (id === "ALL") {
      const confirmed = window.confirm("Czy na pewno chcesz usunąć wszystkie przypomnienia?");
      if (!confirmed) return;

      try {
        await axios.delete("http://localhost:5000/api/reminders", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLocalNotifications([]);
        await fetchNotifications();
        setMessage("✅ Wszystkie przypomnienia zostały usunięte");
      } catch (err) {
        setMessage("❌ Błąd przy usuwaniu wszystkich: " + (err.response?.data?.message || err.message));
      }
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/reminders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLocalNotifications(prev => prev.filter(n => n.id !== id));
      await fetchNotifications();
      setMessage("✅ Przypomnienie usunięte");
    } catch (err) {
      setMessage("❌ Błąd przy usuwaniu: " + (err.response?.data?.message || err.message));
    }
  };

  // ========================
  // Warunkowe renderowanie UI
  // ========================
  if (!user) {
    return (
      <div className="container mt-5">
        <h2 className="text-center mb-4">📋 Panel użytkownika</h2>
        <p className="text-center">Nie jesteś zalogowany.</p>
      </div>
    );
  }

  const filteredNotifications = notifications.filter(n => {
    const idMatch = n.rental_id?.toString().includes(searchNotifications);
    const dateMatch = n.remind_at?.toLowerCase().includes(searchNotifications.toLowerCase());
    return idMatch || dateMatch;
  });

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">📋 Panel użytkownika</h2>
      <UserGreeting user={user} logout={logout} />

      {isCounting && countdown > 0 && (
        <div className="alert alert-warning mt-3 text-center">
          Wylogowano. Za {countdown} sekund nastąpi przekierowanie...
        </div>
      )}

      <div className="text-center mb-3">
        <button className="btn btn-outline-primary fw-bold" onClick={() => setShowForm(!showForm)}>
          {showForm ? "❌ Anuluj" : "✏️ Edytuj dane"}
        </button>
      </div>

      {showForm && (
        <div className="card p-3 mb-4">
          <h5>✏️ Edytuj dane</h5>
          <form onSubmit={handleSaveNameSurname}>
            <div className="mb-2">
              <label>Imię:</label>
              <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} />
            </div>
            <div className="mb-2">
              <label>Nazwisko:</label>
              <input type="text" name="surname" className="form-control" value={formData.surname} onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-success mt-2">💾 Zapisz imię i nazwisko</button>
          </form>

          <hr />

          {isGoogleAccount ? (
            <div className="mb-2">
              <label>Email (konto Google):</label>
              <input
                type="email"
                className="form-control"
                value={user.email}
                readOnly
              />
              <small className="text-muted">
                Ten adres e-mail jest powiązany z kontem Google i nie może być zmieniony z poziomu aplikacji.
              </small>
            </div>
          ) : (
            <>
              {emailStep === "edit" ? (
                <div className="mb-2">
                  <label>Obecny email:</label>
                  <input type="email" className="form-control" value={user.email} readOnly />
                  <label className="mt-2">Nowy email:</label>
                  <input
                    type="email"
                    name="newEmail"
                    className="form-control"
                    value={formData.newEmail}
                    onChange={handleChange}
                  />
                  <button
                    className="btn btn-warning mt-2"
                    onClick={handleRequestEmailChange}
                  >
                    📧 Wyślij kod weryfikacyjny
                  </button>
                </div>
              ) : (
                <div className="mb-2">
                  <label>Kod weryfikacyjny:</label>
                  <input type="text" name="verificationCode" className="form-control" value={formData.verificationCode} onChange={handleChange} />
                  <button className="btn btn-success mt-2" onClick={handleConfirmEmailChange}>
                    ✅ Potwierdź zmianę emaila
                  </button>
                </div>
              )}
            </>
          )}

          {message && <div className="mt-2">{message}</div>}
        </div>
      )}

      <div className="container-fluid mt-5">
        <div className="row">
          <div className="col-12 col-lg-7 mb-4">
            <input
              type="text"
              className="form-control mb-2"
              placeholder="🔍 Szukaj po ID lub nazwie..."
              value={searchActive}
              onChange={(e) => setSearchActive(e.target.value)}
            />
            <RentalList
              title="Aktywne wypożyczenia"
              data={activeRentals.filter(
                r => r.rental_id.toString().includes(searchActive) ||
                     r.offer_name.toLowerCase().includes(searchActive.toLowerCase())
              )}
              type="active"
              onReturnRequest={requestReturn}
              onReminderSet={handleReminderSet}
            />
          </div>

          <div className="col-12 col-lg-5 mb-4 mt-4 mt-lg-0">
            <input
              type="text"
              className="form-control mb-2 mt-4 mt-lg-0"
              placeholder="🔍 Szukaj po ID lub nazwie..."
              value={searchHistory}
              onChange={(e) => setSearchHistory(e.target.value)}
            />
            <RentalList
              title="Historia wypożyczeń"
              data={rentalHistory}
              type="history"
              searchQuery={searchHistory}
            />
          </div>
        </div>
      </div>

      <div className="row justify-content-center mt-5 mb-4">
        <div className="col-12 mb-4">
          <NotificationList
            notifications={notifications}
            loading={false}
            onDelete={handleDeleteNotification}
          />
          {message && <div className="alert alert-info mt-2 text-center">{message}</div>}
        </div>
      </div>
    </div>
  );
};

export default UserPanel;
