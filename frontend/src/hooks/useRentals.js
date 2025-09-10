import { useState, useEffect } from "react";

const useRentals = (sellerId) => {
  const [allRentals, setAllRentals] = useState([]);
  const [activeRentals, setActiveRentals] = useState([]);
  const [showReturns, setShowReturns] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const fetchAllRentals = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/rentals/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Błąd pobierania wszystkich wypożyczeń");
      setAllRentals(data);
    } catch (err) {
      console.error("Błąd allRentals:", err.message);
      setError("Nie udało się pobrać wszystkich wypożyczeń");
    }
  };

  const fetchActiveRentals = async () => {
    if (!sellerId) return;
    if (showReturns) {
      setShowReturns(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/rentals/user/${sellerId}/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Błąd pobierania wypożyczeń.");
      setActiveRentals(data.active_rentals || []);
      setShowReturns(true);
    } catch (err) {
      console.error("Błąd pobierania zwrotów:", err.message);
      setError("Nie udało się pobrać aktywnych wypożyczeń");
    }
  };

  const acceptReturn = async (rentalId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/rentals/${rentalId}/return`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Błąd zwrotu.");

    return data.total_price;
  } catch (err) {
    console.error("Błąd przyjmowania zwrotu:", err.message);
    throw err;
  }
};


  useEffect(() => {
    fetchAllRentals();
  }, []);

  return {
    allRentals,
    activeRentals,
    showReturns,
    error,
    fetchActiveRentals,
    acceptReturn,
  };
};

export default useRentals;
