import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";

const useLogoutCountdown = (redirectPath = "/", delay = 3000) => {
  const [isCounting, setIsCounting] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const navigate = useNavigate();
  const { setUser } = useUserContext();

  const startCountdown = () => {
    setCountdown(Math.floor(delay / 1000));
    setIsCounting(true);
  };

  useEffect(() => {
    if (!isCounting || countdown === null) return;

    if (countdown <= 0) {
      navigate(redirectPath);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, isCounting, navigate, redirectPath]);

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("seller_id");
    setUser(null);
    startCountdown();
  };

  return {
    logout,
    countdown,
    isCounting,
  };
};

export default useLogoutCountdown;
