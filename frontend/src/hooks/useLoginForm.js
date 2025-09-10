import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useLogin from "./useLogin";
import { useUserContext } from "../context/UserContext";

const useLoginForm = () => {
  const [success, setSuccess] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { login, loading, error } = useLogin();
  const { refreshUser } = useUserContext(); 
  const navigate = useNavigate();

  const handleSubmit = async (email, password) => {
    const result = await login(email, password, rememberMe);

    if (result) {
      setSuccess("Zalogowano pomyślnie!");

      await refreshUser();

      let path = "/user-panel";
      if (result.role === "seller") path = "/seller-panel";
      if (result.role === "admin") path = "/admin-panel";

      navigate(path);
    }
  };

  return {
    handleSubmit,
    success,
    error,
    loading,
    rememberMe,
    setRememberMe,
  };
};

export default useLoginForm;
