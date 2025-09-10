import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // 🔄 Pobieranie powiadomień z backendu
  const fetchNotifications = async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get("http://localhost:5000/api/notifications/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data.notifications || [];

      const mapped = data.map(n => ({
        id: n.id,
        rentalId: n.rental_id,
        remindAt: n.remind_at,
        sent: n.sent,
        message: n.message
      }));

      setNotifications(mapped);
    } catch (err) {
      console.error("❌ Błąd pobierania powiadomień:", err);
    }
  };

  // ✅ Oznaczenie powiadomienia jako przeczytanego
  const markAsRead = async (id) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;

    try {
      await axios.patch(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, sent: true } : n)
      );
    } catch (err) {
      console.error("❌ Błąd oznaczania powiadomienia jako przeczytanego:", err);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, fetchNotifications, markAsRead, clearNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
