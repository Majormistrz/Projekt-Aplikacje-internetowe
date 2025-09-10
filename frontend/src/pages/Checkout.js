import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useUser from "../hooks/useUser";
import { CartContext } from "../context/CartContext"; 

const Checkout = ({ logout }) => {
  const { user } = useUser();
  const { cart, clearCart } = useContext(CartContext); 
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [finalSummary, setFinalSummary] = useState(null);
  const [rentedItems, setRentedItems] = useState([]);
  const navigate = useNavigate();

  const calculateSummary = () => {
    let totalEntry = 0;
    let totalPerDay = 0;

    cart.forEach((item) => {
      const entry = parseFloat(item.entry_price) || 0;
      const perDay = parseFloat(item.price_per_day) || 0;
      const qty = item.quantity || 1;

      totalEntry += entry * qty;
      totalPerDay += perDay * qty;
    });

    return { totalEntry, totalPerDay };
  };

  const summary = calculateSummary();

  const handleRent = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!user || !token) {
      alert("Musisz być zalogowany, aby wynająć produkty.");
      navigate("/login");
      return;
    }


    const now = new Date();
    if (user?.ban_until && new Date(user.ban_until) > now) {
      alert(
        `Twoje konto jest zbanowane do ${new Date(
          user.ban_until
        ).toLocaleString()}\nPowód: ${user.ban_reason || "brak"}`
      );
      if (logout) logout();
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/rentals/checkout",
        { items: cart },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setFinalSummary({
        totalEntry: response.data.totalEntry,
        totalPerDay: response.data.totalPerDay,
      });
      setRentedItems(response.data.items);

      clearCart(); 
      setShowModal(true);
    } catch (error) {
      console.error("❌ Błąd wynajmu:", error.response?.data || error.message);
      alert("Nie udało się wynająć produktów. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate("/");
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">✅ Podsumowanie zamówienia</h2>

      {cart.length === 0 ? (
        <p>Twój koszyk jest pusty.</p>
      ) : (
        <>
          <ul className="list-group mb-4">
            {cart.map((item) => (
              <li
                key={item.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <h5>{item.name}</h5>
                  <p className="mb-1">
                    Cena początkowa: {parseFloat(item.entry_price).toFixed(2)} zł
                  </p>
                  <p className="mb-1">
                    Cena za dzień: {parseFloat(item.price_per_day).toFixed(2)} zł
                  </p>
                  <p>Ilość: {item.quantity}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="border p-3 rounded bg-light">
            <h5>💰 Podsumowanie</h5>
            <p>
              <strong>Łączna cena początkowa:</strong>{" "}
              {summary.totalEntry.toFixed(2)} zł
            </p>
            <p>
              <strong>Łączna cena za dzień:</strong>{" "}
              {summary.totalPerDay.toFixed(2)} zł
            </p>
            <button
              className="btn btn-primary w-100 mt-3"
              onClick={handleRent}
              disabled={
                loading ||
                (user?.ban_until && new Date(user.ban_until) > new Date())
              }
            >
              {loading ? "Wynajmuję..." : "Wynajmuję"}
            </button>
          </div>
        </>
      )}

      {showModal && finalSummary && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">📦 Potwierdzenie wynajmu</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Łączna cena początkowa:</strong>{" "}
                  {finalSummary.totalEntry.toFixed(2)} zł
                </p>
                <p>
                  <strong>Łączna cena za dzień:</strong>{" "}
                  {finalSummary.totalPerDay.toFixed(2)} zł
                </p>
                <hr />
                <h6>📋 Wynajęte produkty:</h6>
                <ul className="list-unstyled">
                  {rentedItems.map((item) => (
                    <li key={item.id}>
                      {item.name} — <strong>{item.quantity} szt.</strong>
                    </li>
                  ))}
                </ul>
                <hr />
                <p>
                  ✅ Odbiór i płatność odbywa się stacjonarnie w sklepie przy
                  ulicy <strong>Super Ulica 12</strong>.
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-success" onClick={handleCloseModal}>
                  OK, rozumiem
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
