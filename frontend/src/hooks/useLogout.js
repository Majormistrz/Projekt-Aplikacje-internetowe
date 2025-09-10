import { useUserContext } from "../context/UserContext";

const useLogout = () => {
  const { setUser } = useUserContext();

  return () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("seller_id");
    setUser(null); 
    window.location.href = "/login";
  };
};

export default useLogout;
