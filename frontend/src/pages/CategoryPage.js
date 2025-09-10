import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const navigate = useNavigate();

  const categoryNames = {
    1: "Elektronika",
    2: "Narzędzia budowlane",
    3: "Gry",
    4: "Książki"
  };

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:5000/api/offers?category_id=${categoryId}`)
      .then(res => {
        setOffers(res.data.offers);
        setLoading(false);
      })
      .catch(() => {
        setOffers([]);
        setLoading(false);
      });
  }, [categoryId]);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Produkty z kategorii {categoryNames[categoryId]}</h2>

      {loading ? (
        <div className="text-center">Ładowanie...</div>
      ) : offers.length === 0 ? (
        <div className="text-center">Brak produktów w tej kategorii.</div>
      ) : (
        <div className="row">
          {offers.map((offer, index) => (
            <div key={offer.id} className="col-md-4 mb-4">
              <div
                className="card h-100 shadow rounded"
                style={{
                  transform: hoveredIndex === index ? "scale(1.03)" : "scale(1)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease"
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <img
                  src={offer.image || "https://via.placeholder.com/300x200"}
                  className="card-img-top"
                  alt={offer.name}
                  style={{ objectFit: "contain", height: "200px", background: "#f8f9fa" }}
                />
                <div className="card-body text-center">
                  <h5 className="card-title">{offer.name}</h5>
                  <p className="fw-bold mb-1">Cena startowa: {offer.entry_price} zł</p>
                  <p className="fw-bold">Cena za dzień: {offer.price_per_day} zł</p>
                  <button className="btn btn-primary" onClick={() => navigate(`/offer/${offer.id}`)}>
                    ZOBACZ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
