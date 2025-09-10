import { useEffect, useState } from "react";
import axios from "axios";

const useSearchResults = (query) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      setLoading(true);
      axios.get(`http://localhost:5000/api/offers?query=${query}`)
        .then(res => setResults(res.data.offers))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }
  }, [query]);

  return { results, loading };
};

export default useSearchResults;