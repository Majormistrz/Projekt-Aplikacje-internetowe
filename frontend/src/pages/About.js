import React from "react";

const About = () => {
  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div
        className="card p-4 shadow"
        style={{ maxWidth: "700px", width: "100%", borderRadius: "12px" }}
      >
        <h1 className="fw-bold text-center mb-4" style={{ textDecoration: "underline" }}>
          O nas
        </h1>
        <p className="text-dark fw-bold">
          Rent&GO to lokalna wypożyczalnia gier, narzędzi budowlanych, elektroniki i książek, stworzona z myślą o mieszkańcach naszego miasta. 
          Naszym celem jest umożliwienie wygodnego dostępu do potrzebnych przedmiotów bez konieczności ich zakupu.
        </p>
        <p className="text-dark fw-bold">
          Wierzymy, że wiele rzeczy można po prostu wypożyczyć — oszczędzając pieniądze, miejsce i środowisko. 
          Dzięki naszej aplikacji możesz zarezerwować wybrany przedmiot online, a następnie odebrać go i zwrócić w naszym fizycznym punkcie.
        </p>
        <p className="text-dark fw-bold">
          Dołącz do naszej społeczności i wypożyczaj mądrze. Bo nie wszystko trzeba mieć na własność.
        </p>
      </div>
    </div>
  );
};

export default About;
