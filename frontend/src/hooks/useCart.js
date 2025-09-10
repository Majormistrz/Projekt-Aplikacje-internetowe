import { useState, useEffect } from "react";
import axios from "axios";
import useUser from "../hooks/useUser";

const useCart = () => {
  const { user, token } = useUser(); 
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      setCart([]);
      return;
    }

    const fetchCart = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(res.data);
      } catch (err) {
        console.error("Błąd pobierania koszyka:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user, token]);

  const addToCart = async (offerId) => {
    if (!user || !token) return;

    try {
      await axios.post(
        `http://localhost:5000/api/cart/${offerId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const existing = cart.find((item) => item.offer_id === offerId);
      if (existing) {
        setCart((prev) =>
          prev.map((item) =>
            item.offer_id === offerId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        const offerRes = await axios.get(
          `http://localhost:5000/api/offers/${offerId}`
        );
        setCart((prev) => [
          ...prev,
          { ...offerRes.data, quantity: 1, offer_id: offerRes.data.id },
        ]);
      }
    } catch (err) {
      console.error("Błąd dodawania do koszyka:", err);
    }
  };

  const removeFromCart = async (offerId) => {
    if (!user || !token) return;

    try {
      await axios.delete(`http://localhost:5000/api/cart/${offerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart((prev) => prev.filter((item) => item.offer_id !== offerId));
    } catch (err) {
      console.error("Błąd usuwania z koszyka:", err);
    }
  };

  const updateQuantity = async (offerId, quantity) => {
    if (!user || !token) return;

    try {
      if (quantity <= 0) return removeFromCart(offerId);

      await axios.post(
        `http://localhost:5000/api/cart/${offerId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCart((prev) =>
        prev.map((item) =>
          item.offer_id === offerId ? { ...item, quantity } : item
        )
      );
    } catch (err) {
      console.error("Błąd aktualizacji ilości:", err);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  return { cart, loading, addToCart, removeFromCart, updateQuantity, clearCart };
};

export default useCart;
