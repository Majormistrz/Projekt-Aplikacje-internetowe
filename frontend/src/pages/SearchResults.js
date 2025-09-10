import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

import useSearchQuery from "../hooks/useSearchQuery";
import useSearchResults from "../hooks/useSearchResults";

const SearchResults = () => {
  const query = useSearchQuery();
  const { results, loading } = useSearchResults(query);
  const navigate = useNavigate();

  

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Wyniki dla: <span className="text-primary">"{query}"</span></h2>

      {loading ? (
        <p className="text-muted">Ładowanie wyników...</p>
      ) : results.length === 0 ? (
        <p className="text-muted">Brak wyników.</p>
      ) : (
        <div className="row">
          {results.map((offer) => (
            <div key={offer.id} className="col-md-4 mb-4">
              <div className="card h-100 shadow rounded">
                <img src={offer.image || "https://via.placeholder.com/300x200"} className="card-img-top" alt={offer.name} style={{ objectFit: "contain", height: "200px", background: "#f8f9fa" }} />
                <div className="card-body text-center">
                  <h5 className="card-title">{offer.name}</h5>
                  <p className="fw-bold mb-1">Cena startowa: {offer.entry_price} zł</p>
                  <p className="fw-bold">Cena za dzień: {offer.price_per_day} zł</p>
                  <button className="btn btn-primary" onClick={() => navigate(`/offer/${offer.id}`)}>ZOBACZ</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
