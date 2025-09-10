import React from "react";
import useResetPassword from "../hooks/useResetPassword";

const ResetPassword = () => {
  const { password, setPassword, message, handleReset } = useResetPassword();

  return (
    <div className="container mt-5">
      <h2>Ustaw nowe hasło</h2>
      <form onSubmit={handleReset}>
        <input
          type="password"
          placeholder="Nowe hasło"
          className="form-control mb-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn btn-primary w-100">Zresetuj hasło</button>
      </form>
      {message && <p className="mt-3">{message}</p>}
    </div>
  );
};

export default ResetPassword;
