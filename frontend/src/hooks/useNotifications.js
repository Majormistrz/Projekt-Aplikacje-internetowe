import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  // Funkcja pobierająca powiadomienia z backendu
  const fetchNotifications = async () => {
    const token = getToken();
    if (!token) return; // nie robimy fetcha jeśli nie ma tokena

    try {
      const res = await axios.get("http://localhost:5000/api/notifications/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Bezpieczne mapowanie powiadomień, obsługa braku daty
      const mappedNotifications = (res.data.notifications || []).map(n => ({
        id: n.id,
        rentalId: n.rental_id,
        remindAt: n.remind_at,
        sent: n.sent,
        message: `Przypomnienie o wypożyczeniu ID ${n.rental_id}` +
                 (n.remind_at ? ` na ${new Date(n.remind_at).toLocaleString("pl-PL")}` : " (brak daty)"),
      }));

      setNotifications(mappedNotifications);
    } catch (err) {
      console.error("❌ Błąd pobierania powiadomień:", err.message);
    }
  };

  // Funkcja oznaczająca powiadomienie jako przeczytane
  const markAsRead = async (id) => {
    const token = getToken();
    if (!token) return;

    try {
      await axios.patch(
        `http://localhost:5000/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Aktualizacja lokalnego stanu
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, sent: true } : n)
      );
    } catch (err) {
      console.error("❌ Błąd oznaczania powiadomienia:", err.message);
    }
  };


  useEffect(() => {
    if (getToken()) fetchNotifications();

    const interval = setInterval(() => {
      if (getToken()) fetchNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return { notifications, fetchNotifications, markAsRead };
};

export default useNotifications;
