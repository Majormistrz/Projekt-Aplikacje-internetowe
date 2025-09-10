import React, {useState} from "react";
import useSignUpForm from "../hooks/useSignUpForm";
import { useNavigate } from "react-router-dom";



const SignUp = () => {
    const navigate = useNavigate();
  const {
    name,
    setName,
    surname,
    setSurname,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    handleSubmit,
    getPasswordStrength,
  } = useSignUpForm(navigate);




    return (
        <div className="container text-center mt-5">
            <h2>Rejestracja</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Imię"
                    className="form-control mb-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}            
                />
                 <input 
                    type ="text"
                    placeholder="Nazwisko"
                    className="form-control mb-2"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                />
                <input 
                    type ="email"
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

    
            {password && (
            <div className="mb-2">
             <div className="progress" style={{ height: "8px" }}>
            <div
            className="progress-bar"
            role="progressbar"
            style={{
            width: `${(getPasswordStrength(password) / 5) * 100}%`,
            backgroundColor:
            getPasswordStrength(password) < 3
              ? "red"
              : getPasswordStrength(password) < 4
              ? "orange"
              : "green"
            }}
         ></div>
        </div>
            <small
                style={{
                fontSize: "18px",
                fontWeight: "bold",
                color:
                getPasswordStrength(password) < 3
                ? "red"
                : getPasswordStrength(password) < 4
                ? "orange"
                : "green"
            }}
            >
                {getPasswordStrength(password) < 3
                ? "Słabe hasło"
                : getPasswordStrength(password) < 4
                ? "Średnie hasło"
                : "Silne hasło"}
            </small>
        </div>
            )}

            <input
                type="password"
                placeholder="Potwierdź hasło"
                className="form-control mb-2"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />

                {error && <p className="text-danger">{error}</p>} {/* Wyświetlanie błędu */}
                

                <button className="btn btn-success"> Załóż konto </button>

                
            </form>

        </div>
    );
};

export default SignUp;