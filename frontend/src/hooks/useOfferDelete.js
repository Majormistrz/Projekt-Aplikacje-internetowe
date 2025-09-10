import { useCallback } from "react";

const useOfferDelete = (refetchOffers) => {
  const deleteOffer = useCallback(async (offerId) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    const confirmed = window.confirm("Na pewno chcesz usunąć tę ofertę?");
    if (!confirmed) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/offers/${offerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Błąd usuwania oferty.");

      await refetchOffers();
    } catch (err) {
      console.error("❌ Błąd usuwania:", err.message);
      alert("Nie udało się usunąć oferty. Spróbuj ponownie.");
    }
  }, [refetchOffers]);

  return deleteOffer;
};

export default useOfferDelete;
