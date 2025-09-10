import React from "react";

const Contact = () => {
  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div
        className="card p-4 shadow"
        style={{ maxWidth: "700px", width: "100%", borderRadius: "12px" }}
      >
        <h1 className="fw-bold text-center mb-4" style={{ textDecoration: "underline" }}>
          Kontakt
        </h1>

        <p className="text-dark">
          Masz pytania? Skontaktuj się z nami:
        </p>
        <p className="text-dark">
          📧 Email: wypozyczalniap@gmail.com <br />
          📞 Telefon: +48 111 111 111 <br />
          📍 Adres: Super Ulica 12, 87-800 Włocławek
        </p>

        <div className="d-flex justify-content-center mt-3">
          <iframe
            src="https://www.google.com/maps?q=52.667709,19.040834&hl=pl&z=15&output=embed"
            width="350"
            height="350"
            style={{ border: 0, borderRadius: "8px" }}
            allowFullScreen=""
            loading="lazy"
            title="Mapa Google"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contact;
