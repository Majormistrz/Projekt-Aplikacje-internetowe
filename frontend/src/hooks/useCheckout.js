import { useState } from "react";
import axios from "axios";

const useCheckout = (user, cart, setCart, onBanDetected) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const handleCheckout = async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!user || !token) {
      setError("Musisz być zalogowany, aby wynająć produkty.");
      return;
    }

    const now = new Date();
    if (user.ban_until && new Date(user.ban_until) > now) {
      const banMessage = `Twoje konto jest zbanowane do ${new Date(user.ban_until).toLocaleString()}.\nPowód: ${user.ban_reason || "brak"}`;
      setError(banMessage);
      if (typeof onBanDetected === "function") {
        onBanDetected(); 
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      for (const item of cart) {
        for (let i = 0; i < item.quantity; i++) {
          await axios.post(
            "http://localhost:5000/api/rentals/create",
            { offer_id: item.id },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
        }
      }

      const totalEntry = cart.reduce(
        (acc, item) => acc + parseFloat(item.entry_price || 0) * item.quantity,
        0
      );
      const totalPerDay = cart.reduce(
        (acc, item) => acc + parseFloat(item.price_per_day || 0) * item.quantity,
        0
      );

      setSuccessData({ totalEntry, totalPerDay });
      setCart([]);
      localStorage.removeItem("cart");
    } catch (err) {
      setError(err.response?.data?.error || "Wystąpił błąd podczas wynajmu.");
      console.error("❌ Błąd wynajmu:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleCheckout,
    loading,
    error,
    successData,
  };
};

export default useCheckout;
