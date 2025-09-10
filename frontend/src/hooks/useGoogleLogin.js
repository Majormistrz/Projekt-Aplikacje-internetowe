import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";

const useGoogleLogin = () => {
  const [errorGoogle, setErrorGoogle] = useState("");
  const navigate = useNavigate();
  const { setUser } = useUserContext();

  const handleGoogleLogin = async (token, rememberMe) => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (data.token) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("token", data.token);
        storage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem("role", data.role || "user");

        const userRes = await fetch("http://127.0.0.1:5000/api/user", {
          headers: { Authorization: `Bearer ${data.token}` }
        });
        const userData = await userRes.json();
        setUser(userData);

        navigate("/user-panel");
      } else {
        setErrorGoogle("Błąd logowania przez Google.");
      }
    } catch {
      setErrorGoogle("Wystąpił problem z Google OAuth");
    }
  };

  return { handleGoogleLogin, errorGoogle };
};

export default useGoogleLogin;
