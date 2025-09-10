import { useEffect, useState, useCallback } from "react";
import axios from "axios";

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (e) {
    return true;
  }
}

const useUser = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(() => 
    localStorage.getItem("token") || sessionStorage.getItem("token")
  );

  const fetchUser = useCallback(async () => {
    if (!token || isTokenExpired(token)) {
      setIsLoading(false);
      setError("Token wygasł lub nie istnieje");
      setUser(null);
      return;
    }

    try {
      const res = await axios.get("http://localhost:5000/api/user", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setError(null);
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message || err.message;
      setError(message);
      setUser(null);

      if (status === 422 || status === 401) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href = "/login";
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token && storedToken) {
      setToken(storedToken);
    } else if (!token && !storedToken) {
      setIsLoading(false);
      setError("Brak tokenu");
    } else {
      fetchUser();
    }
  }, [token, fetchUser]);

  return { user, isLoading, error, refetch: fetchUser };
};

export default useUser;
