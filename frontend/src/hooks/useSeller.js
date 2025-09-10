import { useState, useEffect } from "react";

const useSeller = () => {
  const [seller, setSeller] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setError("Brak tokenu – zaloguj się ponownie.");
      return;
    }

    const fetchSeller = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/user", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Błąd pobierania danych sprzedawcy.");

        setSeller(data);
      } catch (err) {
        console.error("Błąd pobierania danych sprzedawcy:", err.message);
        setError("Nie udało się pobrać danych sprzedawcy.");
      }
    };

    fetchSeller();
  }, []);

  return { seller, error };
};

export default useSeller;
