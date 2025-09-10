import React from "react";
import useResetPasswordRequest from "../hooks/useResetPasswordRequest";

const ResetPasswordRequest = () => {
  const { email, setEmail, message, handleRequest } = useResetPasswordRequest();

  return (
    <div className="container mt-5">
      <h2>Resetowanie hasła</h2>
      <form onSubmit={handleRequest}>
        <input
          type="email"
          placeholder="Podaj swój email"
          className="form-control mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn btn-primary w-100">Wyślij link resetujący</button>
      </form>
      {message && <p className="mt-3">{message}</p>}
    </div>
  );
};

export default ResetPasswordRequest;
