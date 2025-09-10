import React, { useEffect, useState, useContext } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import RentGO from "../assets/RentGO.jpg";
import NotificationBell from "./NotificationBell";
import { useUserContext } from "../context/UserContext";
import { NotificationContext } from "../context/NotificationContext";
import { CartContext } from "../context/CartContext"; 
import { FaShoppingCart, FaUser, FaSignOutAlt, FaTools, FaBriefcase } from "react-icons/fa";
import Footer from "./Footer";

const Layout = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const { user, setUser, loadingUser } = useUserContext();
  const { clearNotifications } = useContext(NotificationContext);
  const { cart } = useContext(CartContext); 

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/categories")
      .then((response) => response.json())
      .then((data) => setCategories(data.categories))
      .catch((error) => console.error("Błąd pobierania kategorii:", error));
  }, []);

  const categoryMap = {
    elektronika: "category/1",
    gry: "category/3",
    książki: "category/4",
    "narzędzia budowlane": "category/2",
  };
  const getCategoryPath = (name) => categoryMap[name.toLowerCase()] || "#";

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    clearNotifications();
    setUser(null);
    navigate("/");
  };

  if (loadingUser) {
    return <div>Ładowanie...</div>;
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Górny pasek */}
      <nav className="navbar navbar-expand-lg bg-success">
        <div className="container-fluid justify-content-between align-items-center">
          <Link to="/" className="navbar-brand">
            <img src={RentGO} alt="Rent&GO" style={{ height: "75px" }} />
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            {user && <NotificationBell />}
            <ul className="navbar-nav align-items-center">
              <li className="nav-item me-3 position-relative">
                <Link className="nav-link text-white fw-bold d-flex align-items-center" to="/cart">
                  <FaShoppingCart className="me-1" /> Koszyk
                  {cart.length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {cart.length}
                    </span>
                  )}
                </Link>
              </li>

              {user ? (
                <li className="nav-item dropdown">
                  <span
                    className="nav-link dropdown-toggle text-white fw-bold d-flex align-items-center"
                    id="accountDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ cursor: "pointer" }}
                  >
                    <FaUser className="me-1" /> Moje konto ({user.name})
                  </span>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="accountDropdown">
                    <li>
                      <Link className="dropdown-item" to="/user-panel">
                        👤 Panel użytkownika
                      </Link>
                    </li>
                    {(user.role === "seller" || user.role === "admin") && (
                      <li>
                        <Link className="dropdown-item" to="/seller-panel">
                          <FaBriefcase className="me-1" /> Panel sprzedawcy
                        </Link>
                      </li>
                    )}
                    {user.role === "admin" && (
                      <li>
                        <Link className="dropdown-item" to="/admin-panel">
                          <FaTools className="me-1" /> Panel administratora
                        </Link>
                      </li>
                    )}
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button
                        className="dropdown-item text-danger d-flex align-items-center"
                        onClick={handleLogout}
                      >
                        <FaSignOutAlt className="me-1" /> Wyloguj
                      </button>
                    </li>
                  </ul>
                </li>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="nav-link text-white fw-bold" to="/login">
                      Logowanie
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link text-white fw-bold" to="/signup">
                      Rejestracja
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Pasek kategorii */}
      <nav className="navbar navbar-expand-lg bg-success" style={{ height: "60px", padding: "5px 10px" }}>
        <div className="dropdown">
          <button
            className="btn btn-success dropdown-toggle"
            type="button"
            id="categoryDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ backgroundColor: "#218c5a", border: "none", fontSize: "16px" }}
          >
            Kategorie
          </button>
          <ul className="dropdown-menu" aria-labelledby="categoryDropdown">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link className="dropdown-item" to={getCategoryPath(cat.name)}>
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Główna zawartość */}
      <div className="container flex-grow-1 py-4">
        {children}
        <Outlet />
      </div>

      {/* Stopka */}
      <Footer />
    </div>
  );
};

export default Layout;
