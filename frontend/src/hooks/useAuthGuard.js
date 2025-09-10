import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useAuthGuard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return; 

    fetch("http://127.0.0.1:5000/api/user", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          localStorage.clear();
          sessionStorage.clear();
          navigate("/login");
        }
      })
      .catch(() => {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/login");
      });
  }, []);
};

export default useAuthGuard;
