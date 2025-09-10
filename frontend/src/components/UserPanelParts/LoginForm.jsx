const LoginForm = ({ email, password, rememberMe, setEmail, setPassword, setRememberMe, onSubmit, success, error }) => (
  <form onSubmit={onSubmit}>
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
    {error && <p className="text-danger">{error}</p>}

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

    <button className="btn btn-primary">Zaloguj się</button>
  </form>
);
