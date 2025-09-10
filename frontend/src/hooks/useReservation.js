import { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const useReservation = (user, offer, setOffer) => {
  const [isLoading, setIsLoading] = useState(false);
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const handleReservation = useCallback(async () => {
    if (!user?.id) {
      toast.warn("Musisz być zalogowany, aby zarezerwować ofertę.");
      return;
    }

    if (!offer?.id) {
      toast.error("Nieprawidłowa oferta.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/rentals/create",
        {
          user_id: user.id,
          offer_id: offer.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("✅ Rezerwacja zakończona sukcesem!");

      if (setOffer) {
        setOffer((prev) => ({
          ...prev,
          available_quantity: res.data.available_quantity,
        }));
      }
    } catch (err) {
      const msg =
        err.response?.data?.error || "❌ Nie udało się zarezerwować oferty.";
      toast.error(msg);
      console.error("Błąd rezerwacji:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user, offer, token, setOffer]);

  return { handleReservation, isLoading };
};

export default useReservation;
