import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import useLoginForm from "../hooks/useLoginForm";
import useGoogleLogin from "../hooks/useGoogleLogin";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { handleGoogleLogin, errorGoogle } = useGoogleLogin();
  const navigate = useNavigate();

  const {
    handleSubmit,
    success,
    error,
    loading,
    rememberMe,
    setRememberMe,
  } = useLoginForm();


  const handleResendVerification = async () => {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    if (response.ok) {
      alert("📧 Nowy kod został wysłany na Twój email!");
      navigate("/verify-email", { state: { email } });
    } else {
      alert("❌ Nie udało się wysłać kodu: " + data.message);
    }
  } catch (error) {
    console.error("Błąd:", error);
    alert("❌ Wystąpił błąd przy wysyłaniu kodu.");
  }
};


  const [localRememberMe, setLocalRememberMe] = useState(false);

  useEffect(() => {
    setLocalRememberMe(rememberMe);
  }, [rememberMe]);

  return (
    <div className="container text-center mt-5">
      <h2>Logowanie</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(email, password);
        }}
      >
        <input
          type="email"
          placeholder="Email"
          className="form-control mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Hasło"
          className="form-control mb-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {success && <p className="text-success">{success}</p>}
        {error && (
          <div className="text-danger">
            <p>{error}</p>
            {error ===
              "Musisz potwierdzić swój email, zanim się zalogujesz" && (
              <p>
                Jeśli nie dotarł kod,{" "}
                <span
                  style={{
                    color: "#0d6efd",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onClick={handleResendVerification}
                >
                  wyślij ponownie
                </span>
              </p>
            )}
          </div>
        )}

        {errorGoogle && <p className="text-danger">{errorGoogle}</p>}

        <div className="text-start mb-3">
          <span
            style={{ cursor: "pointer", color: "#0d6efd" }}
            onClick={() => navigate("/reset-password-request")}
          >
            Zapomniałem hasła
          </span>
        </div>

        <div className="form-check mb-3 text-start">
          <input
            type="checkbox"
            className="form-check-input"
            id="rememberMe"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
          />
          <label className="form-check-label" htmlFor="rememberMe">
            Zapamiętaj mnie
          </label>
        </div>

        <div className="d-flex justify-content-center gap-3 mb-4">
          <button type="submit" className="btn btn-primary">
            Zaloguj się
          </button>

          <GoogleLogin
            onSuccess={(credentialResponse) => {
              const token = credentialResponse.credential;
              handleGoogleLogin(token, localRememberMe);
            }}
            onError={() => {
              console.log("Nie udało się zalogować przez Google");
            }}
          />
        </div>

        <hr className="my-4" />

        <p className="text-center">
          Jeśli nie masz jeszcze konta{" "}
          <span
            style={{
              color: "#0d6efd",
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={() => navigate("/signup")}
          >
            Zarejestruj się
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
