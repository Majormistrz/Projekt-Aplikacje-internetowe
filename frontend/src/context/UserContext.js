import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);


  const refreshUser = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        setUser(null);
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
      } else if (!res.ok) {
        throw new Error("Błąd serwera");
      } else {
        const data = await res.json();
        setUser(data); 
      }
    } catch (err) {
      console.error("❌ Błąd pobierania danych użytkownika:", err);
      setUser(null);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      await refreshUser();
      setLoadingUser(false);
    };

    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loadingUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
