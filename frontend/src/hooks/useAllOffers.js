import { useState, useEffect } from "react";

const useAllOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorOffers, setErrorOffers] = useState(null);

  const fetchOffers = async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    setErrorOffers(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/offers", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Błąd pobierania ofert.");

      setOffers(Array.isArray(data) ? data : data.offers || []);
    } catch (err) {
      console.error("Błąd pobierania wszystkich ofert:", err.message);
      setErrorOffers("Nie udało się pobrać wszystkich ofert.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  return { offers, loading, errorOffers, refetchOffers: fetchOffers };
};

export default useAllOffers;
