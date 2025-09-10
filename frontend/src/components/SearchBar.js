import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/search?query=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="d-flex justify-content-center w-100">
    <form
     className="d-flex align-items-center"
     onSubmit={handleSearch}
     style={{
       maxWidth: "600px",
      width: "100%",
       border: "1px solid #888888ff", 
       boxShadow: "0 4px 12px rgba(117, 117, 117, 0.18)",
       borderRadius: "8px",
       background: "#ffffff",
       padding: "6px 10px",
    }}
>

        <input
          className="form-control border-0"
          type="search"
          placeholder="Szukaj ofert..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            fontSize: "16px",
            outline: "none",
            background: "transparent",
            flex: 1,
          }}
        />
        <button className="btn btn-outline-success ms-2" type="submit">
          Szukaj
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
