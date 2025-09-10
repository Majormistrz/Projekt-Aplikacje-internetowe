import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import useUser from "../hooks/useUser";

const Cart = () => {
  const { cart, updateQuantity, removeFromCart } = useContext(CartContext);
  const { user } = useUser();
  const navigate = useNavigate();

  const increaseQuantity = (id, available) => {
    const item = cart.find((p) => p.id === id);
    if (item.quantity < available) {
      updateQuantity(id, item.quantity + 1);
    } else {
      alert(`Nie możesz dodać więcej niż ${available} sztuk!`);
    }
  };

  const decreaseQuantity = (id) => {
    const item = cart.find((p) => p.id === id);
    if (item.quantity > 1) {
      updateQuantity(id, item.quantity - 1);
    } else {
      removeFromCart(id);
    }
  };

  const calculateSummary = () => {
    let totalEntry = 0;
    let totalPerDay = 0;

    cart.forEach((item) => {
      totalEntry += parseFloat(item.entry_price) * item.quantity;
      totalPerDay += parseFloat(item.price_per_day) * item.quantity;
    });

    return { totalEntry, totalPerDay };
  };

  const summary = calculateSummary();

  const handleCheckout = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">🛒 Twój koszyk</h2>

      {cart.length === 0 ? (
        <p>Koszyk jest pusty</p>
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
                  <p>Dostępne sztuki: {item.available_quantity}</p>
                </div>

                <div className="d-flex align-items-center">
                  <button
                    className="btn btn-outline-secondary btn-sm me-2"
                    onClick={() => decreaseQuantity(item.id)}
                  >
                    -
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm me-2"
                    onClick={() =>
                      increaseQuantity(item.id, item.available_quantity)
                    }
                  >
                    +
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Usuń
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="border p-3 rounded bg-light">
            <h5>Podsumowanie</h5>
            <p>
              <strong>Łączna cena początkowa:</strong>{" "}
              {summary.totalEntry.toFixed(2)} zł
            </p>
            <p>
              <strong>Łączna cena za dzień:</strong>{" "}
              {summary.totalPerDay.toFixed(2)} zł
            </p>
            <button
              className="btn btn-success w-100 mt-3"
              onClick={handleCheckout}
            >
              Podsumowanie
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
