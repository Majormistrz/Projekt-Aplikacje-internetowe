import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-success text-white py-3 mt-5">
      <div className="container d-flex flex-column flex-md-row justify-content-center align-items-center gap-4">
        <Link
          to="/about"
          className="fw-bold text-decoration-underline text-white"
        >
          O nas
        </Link>
        <Link
          to="/contact"
          className="fw-bold text-decoration-underline text-white"
        >
          Kontakt
        </Link>
      </div>
      <div className="text-center mt-2 small">
        &copy; {new Date().getFullYear()} Rent&GO. Projekt na Aplikacje Internetowe.
      </div>
    </footer>
  );
};

export default Footer;
