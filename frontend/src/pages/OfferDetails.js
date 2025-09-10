import React, { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import useOffer from "../hooks/useOffer";
import { CartContext } from "../context/CartContext";

const OfferDetails = () => {
  const { id } = useParams();
  const { offer, loading } = useOffer(id);
  const { addToCart } = useContext(CartContext);
  const [showModal, setShowModal] = useState(false);

  if (loading) return <div className="container mt-5 text-center">Ładowanie...</div>;
  if (!offer) return <div className="container mt-5 text-center">Nie znaleziono oferty.</div>;

  const handleAddToCart = () => {
    addToCart({
      id: offer.id,
      name: offer.name,
      entry_price: offer.entry_price,
      price_per_day: offer.price_per_day,
      img: offer.image,
      available_quantity: offer.available_quantity,
    });
    alert("Dodano do koszyka!");
  };

  return (
    <div className="container mt-5">
      <div className="row">
        {/* Obrazek */}
        <div className="col-md-7">
          <img
            src={offer.image || "https://via.placeholder.com/600x400"}
            alt={offer.name}
            className="img-fluid rounded mb-3"
            style={{ objectFit: "contain", height: "350px", width: "100%", background: "#f8f9fa", cursor: "pointer" }}
            onClick={() => setShowModal(true)}
          />
        </div>

        {/* Szczegóły oferty */}
        <div className="col-md-5">
          <h2 className="mb-3">{offer.name}</h2>
          <div className="mb-3">
            <span className="fw-bold">Cena startowa: </span>
            <span>{offer.entry_price.toFixed(2)} zł</span>
          </div>
          <div className="mb-3">
            <span className="fw-bold">Cena za dzień: </span>
            <span>{offer.price_per_day.toFixed(2)} zł</span>
          </div>
          <div className="mb-3">
            <span className="fw-bold">Dostępna ilość sztuk: </span>
            <span>{offer.available_quantity}</span>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-success flex-fill"
              onClick={handleAddToCart}
              disabled={offer.available_quantity === 0}
            >
              {offer.available_quantity === 0 ? "Brak sztuk" : "Dodaj do koszyka"}
            </button>
          </div>
        </div>
      </div>

      {/* Opis */}
      <div className="mt-4 border rounded p-3">
        <h4 className="fw-bold text-center">Opis oferty</h4>
        <p className="mb-4" style={{ whiteSpace: "pre-line" }}>
          {offer.description}
        </p>
      </div>

      {/* Modal z powiększonym zdjęciem */}
      {showModal && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.7)",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1050,
          }}
          onClick={() => setShowModal(false)} 
        >
          <div
            className="d-flex justify-content-center align-items-center h-100 position-relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Przycisk zamykania */}
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "20px",
                fontSize: "2rem",
                background: "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                zIndex: 1060,
              }}
            >
              &times;
            </button>

            <img
              src={offer.image || "https://via.placeholder.com/600x400"}
              alt={offer.name}
              style={{ maxHeight: "90%", maxWidth: "90%", borderRadius: "10px" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferDetails;
