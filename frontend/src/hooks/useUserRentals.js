import { useState, useEffect, useCallback } from "react";
import { getToken } from "../utils/auth";

const useUserRentals = (userId, currentPage) => {
  const [activeRentals, setActiveRentals] = useState([]);
  const [rentalHistory, setRentalHistory] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  const fetchRentals = useCallback(async () => {
    if (!userId) return;

    try {
      const [activeRes, historyRes] = await Promise.all([
        fetch(`http://127.0.0.1:5000/api/rentals/user/${userId}/active`),
        fetch(`http://127.0.0.1:5000/api/rentals/user/${userId}?page=${currentPage}`),
      ]);

      const activeData = activeRes.ok ? await activeRes.json() : { active_rentals: [] };
      const historyData = historyRes.ok ? await historyRes.json() : { rentals: [], page: 1, total_pages: 1 };

      setActiveRentals(activeData.active_rentals);
      setRentalHistory(historyData.rentals);
      setTotalPages(historyData.total_pages);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [userId, currentPage]);

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  const requestReturn = async (rentalId) => {
    const token = getToken();
    if (!window.confirm("Czy chcesz zgłosić zwrot tego przedmiotu?")) return;

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/rentals/${rentalId}/request-return`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("✅ Zwrot został zgłoszony. Pracownik przyjmie go wkrótce.");
      fetchRentals();
    } catch {
      alert("Nie udało się zgłosić zwrotu.");
    }
  };

  return {
    activeRentals,
    rentalHistory,
    totalPages,
    error,
    requestReturn,
    refetchRentals: fetchRentals,
  };
};

export default useUserRentals;
