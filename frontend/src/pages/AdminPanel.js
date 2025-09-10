import React, { useState, useEffect } from "react";
import useLogout from "../hooks/useLogout";
import useAllOffers from "../hooks/useAllOffers";
import useCategories from "../hooks/useCategories";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const logout = useLogout();
  const navigate = useNavigate();

  const { offers: allOffers = [], loading: loadingOffers, error: errorOffers } = useAllOffers();
  const { categories = [], getCategoryName } = useCategories();

  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);

  const [sellers, setSellers] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState(true);
  const [errorSellers, setErrorSellers] = useState(null);
  const [isBanning, setIsBanning] = useState(false);


  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedReason, setSelectedReason] = useState(null);

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const role = localStorage.getItem("role") || sessionStorage.getItem("role");


  // =======================
  // Sprawdzenie roli i autoryzacja
  // =======================
useEffect(() => {
  if (!token) {
    navigate("/login");
    return;
  }

  if (role !== "admin") {
    navigate("/"); 
  }
}, [token, role, navigate]);

  // =======================
  // Pobieranie użytkowników i sprzedawców
  // =======================
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setErrorUsers(null);
      try {
        const res = await fetch("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Błąd pobierania użytkowników");
        setAllUsers(data.users || []);
      } catch (err) {
        setErrorUsers(err.message);
      } finally {
        setLoadingUsers(false);
      }
    };

    const fetchSellers = async () => {
      setLoadingSellers(true);
      setErrorSellers(null);
      try {
        const res = await fetch("http://localhost:5000/api/admin/sellers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Błąd pobierania sprzedawców");
        setSellers(data.sellers || []);
      } catch (err) {
        setErrorSellers(err.message);
      } finally {
        setLoadingSellers(false);
      }
    };

    fetchUsers();
    fetchSellers();
  }, [token]);

  // =======================
  // Funkcje akcji (ban, unban, delete, promote, demote)
  // =======================
  const handleBanUser = async (userId) => {
  const reason = prompt("Podaj powód bana:");
  const duration = prompt("Na ile dni zbanować użytkownika?");
  if (!reason || !duration) return;

  setIsBanning(true); 

  try {
    const res = await fetch(`http://localhost:5000/api/admin/ban-user/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ reason, duration }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Błąd banowania");
    alert("✅ Użytkownik zbanowany");

    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, ban_until: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(), ban_reason: reason }
          : u
      )
    );
    setSelectedUser(null);
  } catch (err) {
    alert("❌ " + err.message);
  } finally {
    setIsBanning(false); 
  }
};


  const handleUnbanUser = async (userId) => {
    if (!window.confirm("Czy na pewno chcesz odbanować tego użytkownika?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/unban-user/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Błąd odbanowywania");
      alert("✅ Użytkownik odbanowany");

      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ban_until: null, ban_reason: null } : u))
      );
      setSelectedUser(null);
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Czy na pewno chcesz usunąć konto użytkownika?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/delete-user/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Błąd usuwania");
      alert("🗑️ Konto usunięte");
      setAllUsers((prev) => prev.filter((u) => u.id !== userId));
      setSelectedUser(null);
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  const handlePromoteToSeller = async (userId) => {
    if (!window.confirm("Czy na pewno chcesz promować użytkownika na sprzedawcę?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/promote-to-seller/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Błąd promocji");
      alert("✅ Użytkownik został sprzedawcą");

      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: "seller" } : u))
      );
      setSelectedUser(null);
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  const handleDemoteToUser = async (userId) => {
    if (!window.confirm("Czy na pewno chcesz zdegradować sprzedawcę do użytkownika?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/demote-to-user/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Błąd degradacji");
      alert("✅ Sprzedawca został zdegradowany do użytkownika");

      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: "user" } : u))
      );
      setSelectedUser(null);
    } catch (err) {
      alert("❌ " + err.message);
    }
  };



  return (
    <div className="container text-center mt-5">
      <h2>Panel Administratora</h2>
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-outline-danger" onClick={logout}>Wyloguj się</button>
      </div>

      {/* Wszystkie oferty */}
      <h3 className="mt-4">🌍 Wszystkie oferty</h3>
      {loadingOffers ? <p className="text-info">⏳ Ładowanie ofert...</p> :
       errorOffers ? <p className="text-danger">❌ Błąd: {errorOffers}</p> :
       allOffers.length > 0 ? (
         <div className="table-responsive mt-3">
           <table className="table table-bordered table-striped">
             <thead className="table-light">
               <tr>
                 <th>#</th>
                 <th>Nazwa</th>
                 <th>Kategoria</th>
                 <th>Cena startowa</th>
                 <th>Za dzień</th>
                 <th>Sprzedawca</th>
               </tr>
             </thead>
             <tbody>
               {allOffers.map((offer, index) => (
                 <tr key={offer.id}>
                   <td>{index + 1}</td>
                   <td>{offer.name}</td>
                   <td>{getCategoryName(offer.category_id)}</td>
                   <td>{offer.entry_price.toFixed(2)} zł</td>
                   <td>{offer.price_per_day.toFixed(2)} zł</td>
                   <td>{offer.seller_name || offer.seller_id}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       ) : <p className="text-warning mt-2">Brak ofert w systemie.</p>
      }

      {/* Wszyscy użytkownicy */}
      <h3 className="mt-5">👤 Wszyscy użytkownicy</h3>
      {loadingUsers ? <p className="text-info">⏳ Ładowanie użytkowników...</p> :
       errorUsers ? <p className="text-danger">❌ Błąd: {errorUsers}</p> :
       allUsers.length > 0 ? (
         <div className="table-responsive mt-3">
           <table className="table table-bordered table-striped">
             <thead className="table-light">
               <tr>
                 <th>#</th>
                 <th>Imię</th>
                 <th>Nazwisko</th>
                 <th>Email</th>
                 <th>Rola</th>
                 <th>Zweryfikowany</th>
                 <th>Zbanowany</th>
                 <th>Akcje</th>
               </tr>
             </thead>
             <tbody>
               {allUsers.map((user, index) => (
                 <tr key={user.id}>
                   <td>{index + 1}</td>
                   <td>{user.name}</td>
                   <td>{user.surname}</td>
                   <td>{user.email}</td>
                   <td>{user.role}</td>
                   <td>{user.is_verified ? "✅" : "❌"}</td>
                   <td>
                     {user.ban_until ? (
                       <>
                         <span className="text-danger">⛔ do {new Date(user.ban_until).toLocaleString()}</span>
                         <br />
                         <button className="btn btn-sm btn-outline-secondary mt-1" onClick={() => setSelectedReason(user.ban_reason)}>Powód</button>
                       </>
                     ) : <span className="text-success">✔️</span>}
                   </td>
                   <td>
                     <button className="btn btn-sm btn-info" onClick={() => setSelectedUser(user)}>Szczegóły</button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       ) : <p className="text-warning mt-2">Brak użytkowników w systemie.</p>
      }

      {/* Modal z użytkownikiem */}
      {selectedUser && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setSelectedUser(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Szczegóły użytkownika</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedUser(null)}></button>
              </div>
              <div className="modal-body text-start">
                <p><b>Imię:</b> {selectedUser.name}</p>
                <p><b>Nazwisko:</b> {selectedUser.surname}</p>
                <p><b>Email:</b> {selectedUser.email}</p>
                <p><b>Rola:</b> {selectedUser.role}</p>
                <p><b>Zweryfikowany:</b> {selectedUser.is_verified ? "✅" : "❌"}</p>
                <p><b>Zbanowany:</b> {selectedUser.ban_until ? `⛔ do ${new Date(selectedUser.ban_until).toLocaleString()}` : "✔️"}</p>
              </div>
              <div className="modal-footer d-flex flex-wrap gap-2">
                {selectedUser.ban_until ? (
                  <button className="btn btn-success" onClick={() => handleUnbanUser(selectedUser.id)}>Odbanuj</button>
                ) : (
                    <button className="btn btn-warning" onClick={() => handleBanUser(selectedUser.id)} disabled={isBanning}>
                    {isBanning ? "Banuję..." : "Zbanuj"}
                    </button>
                )}
                <button className="btn btn-danger" onClick={() => handleDeleteUser(selectedUser.id)}>Usuń</button>
                {selectedUser.role === "seller" ? (
                  <button className="btn btn-warning" onClick={() => handleDemoteToUser(selectedUser.id)}>
                    Zdegraduj sprzedawcę
                  </button>
                  ) : (
                  <button className="btn btn-primary" onClick={() => handlePromoteToSeller(selectedUser.id)}>
                    Promuj na sprzedawcę
                  </button>
                    )}                
                <button className="btn btn-secondary" onClick={() => setSelectedUser(null)}>Zamknij</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal z powodem bana */}
      {selectedReason && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Powód bana</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedReason(null)}></button>
              </div>
              <div className="modal-body">
                <p style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{selectedReason}</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedReason(null)}>Zamknij</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
