import { useState } from "react";

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Logowanie użytkownika
   * @param {string} email 
   * @param {string} password 
   * @param {boolean} rememberMe 
   */
  const login = async (email, password, rememberMe = false) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {

        let fullMessage = "";
        if (data.message?.includes("Konto zbanowane do")) {
          const match = data.message.match(/do (\d{4}-\d{2}-\d{2} \d{2}:\d{2})/);
          if (match) {
            const utcDate = new Date(match[1] + " UTC");
            const localDate = utcDate.toLocaleString();
            fullMessage = `Konto zbanowane do ${localDate}`;
          } else {
            fullMessage = data.message;
          }
        } else {
          fullMessage = data.message || "Niepoprawny email lub hasło";
        }

        if (data.reason) fullMessage += `\nPowód: ${data.reason}`;

        setError(fullMessage);
        return null;
      }

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", data.token);        
      localStorage.setItem("role", data.role);   
      if (data.refresh_token) storage.setItem("refresh_token", data.refresh_token); 

      return {
        role: data.role,
        name: data.name,
        surname: data.surname,
        email: data.email,
        offers: data.offers || []
      };
    } catch (err) {
      console.error("❌ Błąd logowania:", err);
      setError("Błąd połączenia z serwerem.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

export default useLogin;
