import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:5000/api/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Weryfikacja nie powiodła się");
      }

      setMessage("✅ Email został potwierdzony! Przekierowanie do logowania...");
      setTimeout(() => {
        navigate("/login");
      }, 2000); 
    } catch (err) {
      setMessage(`❌ Błąd: ${err.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="container text-center mt-5">
      <h2>Potwierdź swój email</h2>
      <form onSubmit={handleVerify}>
        <input
          type="email"
          placeholder="Twój email"
          className="form-control mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          readOnly={!!location.state?.email}
        />
        <input
          type="text"
          placeholder="Kod weryfikacyjny"
          className="form-control mb-2"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button className="btn btn-primary" disabled={isVerifying}>
          {isVerifying ? "Weryfikuję..." : "Potwierdź"}
        </button>
      </form>

      {message && (
        <p className="mt-3">
          {message}
          {message.includes("potwierdzony") && (
            <span className="text-muted d-block mt-2">
              Przekierowanie do logowania...
            </span>
          )}
        </p>
      )}
    </div>
  );
};

export default VerifyEmail;
