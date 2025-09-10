import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const useAllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setErrorUsers(null);

    try {
      const token = localStorage.getItem("token"); 
      const response = await axios.get("http://localhost:5000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Błąd pobierania użytkowników:", error);
      setErrorUsers(error.response?.data?.error || error.message || "Błąd sieci");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loadingUsers, errorUsers, refetchUsers: fetchUsers };
};

export default useAllUsers;
