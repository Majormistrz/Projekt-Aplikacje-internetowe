import { useEffect, useState } from "react";
import axios from "axios";

const useOffer = (id) => {
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    axios
      .get(`http://localhost:5000/api/offers/${id}`)
      .then((res) => {
        setOffer(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  return { offer, setOffer, loading };
};

export default useOffer;
