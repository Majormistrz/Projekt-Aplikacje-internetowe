import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const useResetPassword = () => {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const token = query.get("token"); 

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:5000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.ok) {
        setTimeout(() => navigate("/login"), 2000); 
      }
    } catch {
      setMessage("Błąd podczas resetowania hasła");
    }
  };

  return { password, setPassword, message, handleReset };
};

export default useResetPassword;
