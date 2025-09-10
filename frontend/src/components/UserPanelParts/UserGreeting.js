const UserGreeting = ({ user, logout }) => (
  <div className="d-flex justify-content-between align-items-center mb-4">
    <h5 className="text-success m-0">👋 Witaj, {user.name}!</h5>
    <button className="btn btn-outline-danger btn-sm" onClick={logout}>
      Wyloguj
    </button>
  </div>
);

export default UserGreeting;
