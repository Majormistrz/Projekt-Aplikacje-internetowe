import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const CategorySection = ({ categoryId, title, moreLink }) => {
  const [offers, setOffers] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null); 
  

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/offers?category_id=${categoryId}`)
      .then((res) => {
        setOffers(res.data.offers.slice(0, 3));
      })
      .catch((err) => {
        console.error("Błąd ładowania ofert:", err.message);
      });
  }, [categoryId]);

  return (
    <div className="mt-5">
      <h3 className="text-center">{title}</h3>
      <div className="row">
        {offers.map((offer, index) => (
          <div key={offer.id} className="col-md-4">
            <div
              className="card h-100 shadow rounded"
              style={{
                transform: hoveredIndex === index ? "scale(1.03)" : "scale(1)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <img
                src={offer.image || "https://via.placeholder.com/300x200"}
                className="card-img-top"
                alt={offer.name}
                style={{
                  objectFit: "contain",
                  height: "200px",
                  background: "#f8f9fa",
                }}
              />
              <div className="card-body text-center">
                <h5 className="card-title">{offer.name}</h5>
                <p className="fw-bold mb-1">Start: {offer.entry_price} zł</p>
                <p className="fw-bold">Dzień: {offer.price_per_day} zł</p>
                <Link
                  to={`/offer/${offer.id}`}
                  className="btn btn-primary btn-sm"
                >
                  ZOBACZ
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-3">
        <Link to={moreLink} className="btn btn-outline-success">
          Zobacz więcej
        </Link>
      </div>
    </div>
  );
};

export default CategorySection;
