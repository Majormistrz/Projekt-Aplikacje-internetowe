import React, { useState, useEffect } from "react";
import useSeller from "../hooks/useSeller";
import useSellerOffers from "../hooks/useSellerOffers";
import useRentals from "../hooks/useRentals";
import useCategories from "../hooks/useCategories";
import useOfferSubmit from "../hooks/useOfferSubmit";
import useLogout from "../hooks/useLogout";
import useOfferDelete from "../hooks/useOfferDelete";
import useOfferModal from "../hooks/useOfferModal";
import useOfferForm from "../hooks/useOfferForm";
import useAllOffers from "../hooks/useAllOffers";
import { useNavigate } from "react-router-dom";

const SellerPanel = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const role = localStorage.getItem("role") || sessionStorage.getItem("role");
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchAllOffers, setSearchAllOffers] = useState("");
  const [searchSellerOffers, setSearchSellerOffers] = useState("");
  

  const [allRentalsState, setAllRentalsState] = useState([]); 
  const { seller, loadingSeller, errorSeller } = useSeller();
  const {
    offers: sellerOffers,
    loading,
    errorOffers,
    refetchOffers,
  } = useSellerOffers(seller?.id);

  const {
    offers: allOffers,
    loading: loadingAllOffers,
    errorOffers: errorAllOffers,
    refetchOffers: refetchAllOffers
  } = useAllOffers();

  const logout = useLogout();

  const {
    showModal,
    isEditing,
    offerToEdit,
    openModal,
    editOffer,
    closeModal,
  } = useOfferModal();

  const {
    categories,
    loadingCategories,
    errorCategories,
    getCategoryName,
  } = useCategories();

  const { submitOffer } = useOfferSubmit({
    sellerId: seller?.id,
    isEditing,
    offerToEdit,
    refetchOffers,
    closeModal,
  });

  const { handleSubmitOffer } = useOfferForm({ submitOffer });

  const {
    allRentals,
    activeRentals,
    showReturns,
    error: rentalError,
    fetchActiveRentals,
    acceptReturn,
  } = useRentals(seller?.id);

  const deleteOffer = useOfferDelete(refetchOffers);
  const handleFetchRentals = fetchActiveRentals;
  const handleAcceptReturn = acceptReturn;

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [computedPricePerDay, setComputedPricePerDay] = useState(0);
  const [computedDays, setComputedDays] = useState(0);
  const [computedTotal, setComputedTotal] = useState(0);
  
useEffect(() => {
  if (allRentals) {
    setAllRentalsState(allRentals);
  }
}, [allRentals]);

  useEffect(() => {
    if (!token) {
      navigate("/login"); 
      return;
    }

    if (role !== "seller" && role !== "admin") {
      navigate("/"); 
    }
  }, [token, role, navigate]);

const openReturnModal = (rental) => {
  const offer = allOffers?.find((o) => o.name === rental.offer_name);
  const pricePerDay = offer?.price_per_day || 0;
  
  const start = new Date(rental.rental_date);
  const end = rental.return_date ? new Date(rental.return_date) : new Date();

  const diffTime = end.getTime() - start.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  const days = diffDays < 1 ? 1 : Math.ceil(diffDays);

  const standardTotal = days * pricePerDay;

  const penaltyDays = Math.max(0, days - 30);
  const penaltyPerDay = 25;
  const penaltyTotal = penaltyDays * penaltyPerDay;

  const total = standardTotal + penaltyTotal;

  setComputedPricePerDay(pricePerDay);
  setComputedDays(days);
  setComputedTotal(total);
  setSelectedRental({ 
    ...rental, 
    price_per_day: pricePerDay, 
    total, 
    days, 
    penaltyTotal, 
    penaltyDays,
    penaltyPerDay
  });
  setShowReturnModal(true);
};




const closeReturnModal = () => {
  setShowReturnModal(false);
  setSelectedRental(null);
  setComputedPricePerDay(0);
  setComputedDays(0);
  setComputedTotal(0);
};


const confirmReturn = async () => {
  if (!selectedRental || selectedRental.isReturning) return;

  setSelectedRental(prev => ({ ...prev, isReturning: true }));

  try {
    const totalFromServer = await handleAcceptReturn(selectedRental.rental_id);

    const finalTotal = selectedRental.total || totalFromServer || 0;

    setAllRentalsState(prev =>
      prev.map(r =>
        r.rental_id === selectedRental.rental_id
          ? { ...r, status: "zwrócone", total_price: finalTotal }
          : r
      )
    );

    refetchOffers(); 
    refetchAllOffers();

    alert(`Zwrot przyjęty ✅ Kwota do zapłaty: ${finalTotal.toFixed(2)} zł`);
    closeReturnModal();
  } catch (e) {
    console.error("Błąd przy potwierdzaniu zwrotu:", e);
    alert("Błąd przy potwierdzaniu zwrotu ❌");

    setSelectedRental(prev => ({ ...prev, isReturning: false }));
  }
};





  return (
    <div className="container text-center mt-5">
      <h2>Panel sprzedawcy</h2>

      {loadingSeller ? (
        <p className="text-info">⏳ Ładowanie danych sprzedawcy...</p>
      ) : errorSeller ? (
        <p className="text-danger">❌ Błąd: {errorSeller}</p>
      ) : errorOffers ? (
        <p className="text-danger">❌ Błąd: {errorOffers}</p>
      ) : seller && seller.id ? (
        <>
          {/* Powitanie i przycisk wylogowania */}
          <div className="d-flex justify-content-between align-items-center mt-2">
            <p className="text-success mb-0">Witaj, {seller.name}!</p>
            <button className="btn btn-outline-danger btn-sm" onClick={logout}>
              Wyloguj się
            </button>
          </div>

          {/* Modal dodawania/edycji oferty (bez zmian poza lokalnym obrazkiem) */}
          {showModal && (
            <div
              className="modal-backdrop d-flex justify-content-center align-items-center"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 1050,
              }}
            >
              <div
                className="modal-content p-4"
                style={{ maxWidth: "800px", background: "#fff", borderRadius: "10px" }}
              >
                <h4 className="mb-4 text-center">
                  {isEditing ? "Edytuj ofertę" : "Nowa oferta"}
                </h4>
                <form onSubmit={handleSubmitOffer} encType="multipart/form-data">
                  <div className="d-flex flex-wrap">
                    {/* Obrazek */}
                    <div className="flex-grow-1 text-center" style={{ maxWidth: "300px" }}>
                      <img
                        src={
                          offerToEdit?.id
                            ? `http://localhost:5000/api/offers/${offerToEdit.id}/image`
                            : selectedImage
                            ? URL.createObjectURL(selectedImage)
                            : undefined
                        }
                        alt="Podgląd oferty"
                        className="img-fluid rounded mb-3"
                        style={{
                          objectFit: "cover",
                          height: "200px",
                          width: "100%",
                          background: "#f8f9fa",
                        }}
                      />
                      <input
                        type="file"
                        name="image"
                        accept="image/*"
                        className="form-control"
                        required={!isEditing}
                        onChange={(e) => setSelectedImage(e.target.files[0])}
                      />
                    </div>

                    {/* Szczegóły */}
                    <div className="flex-grow-1 ps-4" style={{ minWidth: "400px" }}>
                      <div className="mb-3">
                        <label className="form-label">Nazwa</label>
                        <input
                          type="text"
                          name="name"
                          defaultValue={offerToEdit?.name || ""}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Opis</label>
                        <textarea
                          name="description"
                          defaultValue={offerToEdit?.description || ""}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Cena startowa</label>
                        <input
                          type="number"
                          name="entry_price"
                          defaultValue={offerToEdit?.entry_price || ""}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Cena za dzień</label>
                        <input
                          type="number"
                          name="price_per_day"
                          defaultValue={offerToEdit?.price_per_day || ""}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Dostępna ilość sztuk</label>
                        <input
                          type="number"
                          name="available_quantity"
                          defaultValue={offerToEdit?.available_quantity || ""}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Kategoria</label>
                        <select
                          name="category_id"
                          className="form-control"
                          defaultValue={offerToEdit?.category_id || ""}
                          required
                        >
                          <option value="" disabled>
                            Wybierz kategorię
                          </option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="d-flex justify-content-between mt-4">
                        <button type="submit" className="btn btn-success">
                          {isEditing ? "Zapisz zmiany" : "Dodaj ofertę"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={closeModal}
                        >
                          Anuluj
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          <h3 className="mt-4">🌍 Wszystkie oferty</h3>

{/* Wyszukiwarka */}
<div className="mb-3">
  <input
    type="text"
    className="form-control"
    placeholder="🔍 Szukaj po nazwie lub kategorii..."
    value={searchAllOffers}
    onChange={(e) => setSearchAllOffers(e.target.value)}
  />
</div>

{loadingAllOffers ? (
  <p className="text-info">⏳ Ładowanie ofert...</p>
) : errorAllOffers ? (
  <p className="text-danger">❌ Błąd: {errorAllOffers}</p>
) : allOffers.length > 0 ? (
  <div className="table-responsive mt-3" style={{ maxHeight: "600px", overflowY: "auto" }}>
    <table className="table table-bordered table-striped">
      <thead className="table-light">
        <tr>
          <th>#</th>
          <th>Nazwa</th>
          <th>Kategoria</th>
          <th>Cena startowa</th>
          <th>Za dzień</th>
          <th>Dostępna ilość</th>
          <th>ID_Sprzedawca</th>
        </tr>
      </thead>
      <tbody>
        {allOffers
          .filter((offer) =>
            offer.name.toLowerCase().includes(searchAllOffers.toLowerCase()) ||
            getCategoryName(offer.category_id).toLowerCase().includes(searchAllOffers.toLowerCase())
          )  
          .map((offer, index) => (
            <tr key={offer.id}>
              <td>{index + 1}</td>
              <td>{offer.name}</td>
              <td>{getCategoryName(offer.category_id)}</td>
              <td>{Number(offer.entry_price).toFixed(2)} zł</td>
              <td>{Number(offer.price_per_day).toFixed(2)} zł</td>
              <td>{offer.available_quantity}</td>
              <td>{offer.seller_id}</td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
) : (
  <p className="text-warning mt-2">Brak dostępnych ofert.</p>
)}

          {/* Twoje oferty */}
          <div className="d-flex justify-content-between align-items-center mt-4">
  <h3 className="mb-6">📦 Twoje oferty</h3>
  <button className="btn btn-success" onClick={openModal}>
    ➕ Dodaj ofertę
  </button>
</div>

{/* Wyszukiwarka */}
<div className="mb-3">
  <input
    type="text"
    className="form-control"
    placeholder="🔍 Szukaj w swoich ofertach..."
    value={searchSellerOffers}
    onChange={(e) => setSearchSellerOffers(e.target.value)}
  />
</div>

{sellerOffers.length > 0 ? (
  <div className="table-responsive mt-3" style={{ maxHeight: "600px", overflowY: "auto" }}>
    <table className="table table-bordered table-striped">
      <thead className="table-light">
        <tr>
          <th>#</th>
          <th>Nazwa</th>
          <th>Kategoria</th>
          <th>Cena startowa</th>
          <th>Za dzień</th>
          <th>Dostępna ilość</th>
          <th>Akcje</th>
        </tr>
      </thead>
      <tbody>
        {sellerOffers
          .filter((offer) =>
            offer.name.toLowerCase().includes(searchSellerOffers.toLowerCase()) ||
            getCategoryName(offer.category_id).toLowerCase().includes(searchSellerOffers.toLowerCase())
          )
          .map((offer, index) => (
            <tr key={offer.id}>
              <td>{index + 1}</td>
              <td>{offer.name}</td>
              <td>{getCategoryName(offer.category_id)}</td>
              <td>{Number(offer.entry_price).toFixed(2)} zł</td>
              <td>{Number(offer.price_per_day).toFixed(2)} zł</td>
              <td>{offer.available_quantity}</td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => editOffer(offer)}
                >
                  Edytuj
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => deleteOffer(offer.id)}
                >
                  Usuń
                </button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
) : (
  <p className="text-warning mt-2">Brak dodanych ofert.</p>
)}

{/* Lista wypożyczeń */}
<h3 className="mt-5">📋 Wszystkie wypożyczenia</h3>

{/* Wyszukiwarka */}
<div className="mb-3">
  <input
    type="text"
    className="form-control"
    placeholder="🔍 Szukaj po nazwie użytkownika lub oferty..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>

<div className="table-responsive mb-5" style={{ maxHeight: "400px", overflowY: "auto" }}>
  <table className="table table-striped table-bordered">
    <thead className="table-light">
      <tr>
        <th>#</th>
        <th>Użytkownik</th>
        <th>Oferta</th>
        <th>Od</th>
        <th>Do</th>
        <th>Status / Akcja</th>
        <th>Cena</th>
      </tr>
    </thead>
    <tbody>
      {allRentalsState
        .filter((rental) => {
          const search = searchTerm.toLowerCase();
          return (
            rental.offer_name.toLowerCase().includes(search) ||
            rental.user_name.toLowerCase().includes(search)
          );
        })
        .map((rental, index) => (
          <tr key={rental.rental_id}>
            <td>{index + 1}</td>
            <td>{rental.user_name}</td>
            <td>{rental.offer_name}</td>
            <td>{new Date(rental.rental_date).toLocaleDateString()}</td>
            <td>{rental.return_date ? new Date(rental.return_date).toLocaleDateString() : "–"}</td>
            <td>
              {rental.status === "oczekuje" ? (
                <button
                  className="btn btn-sm btn-outline-success"
                  onClick={() => openReturnModal(rental)}
                >
                  Przyjmij zwrot
                </button>
              ) : (
                <span
                  className={`badge bg-${rental.status === "aktywne" ? "success" : "secondary"}`}
                >
                  {rental.status}
                </span>
              )}
            </td>
            <td>{rental.total_price ? `${rental.total_price.toFixed(2)} zł` : "–"}</td>
          </tr>
        ))}
    </tbody>
  </table>
</div>


{/* MODAL zwrotu ze szczegółami */}
{showReturnModal && selectedRental && (
  <div
    className="modal-backdrop d-flex justify-content-center align-items-center"
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)",
      zIndex: 2000,
    }}
  >
    <div
      className="modal-content p-4"
      style={{ maxWidth: "600px", background: "#fff", borderRadius: "10px" }}
    >
      <h4 className="mb-3 text-center">📦 Podsumowanie zwrotu</h4>
      <p>
        <b>Użytkownik:</b> {selectedRental.user_name}
      </p>
      <p>
        <b>Produkt:</b> {selectedRental.offer_name}
      </p>
      <p>
        <b>Od:</b>{" "}
        {new Date(selectedRental.rental_date).toLocaleDateString()}
      </p>
      <p>
        <b>Do:</b>{" "}
        {selectedRental.return_date
          ? new Date(selectedRental.return_date).toLocaleDateString()
          : new Date().toLocaleDateString()}
      </p>

      <hr />

      <p>
        <b>Liczba dni:</b> {computedDays}
      </p>
      <p>
        <b>Cena za dzień:</b>{" "}
        {Number(computedPricePerDay).toFixed(2)} zł
      </p>
      <p className="text-success">
        <b>Kwota do zapłaty:</b> {Number(computedTotal).toFixed(2)} zł
        {selectedRental.penaltyTotal > 0 && (
          <> (Kara: {Number(selectedRental.penaltyTotal).toFixed(2)} zł | {selectedRental.penaltyDays} dni)</>
        )}
      </p>

      {computedPricePerDay === 0 && (
        <p className="text-warning mt-2">
          ⚠️ Nie udało się znaleźć ceny za dzień dla tej oferty w
          liście ofert. Sprawdź, czy nazwa oferty w wypożyczeniu jest
          zgodna z nazwą w ofercie.
        </p>
      )}

      <div className="d-flex justify-content-between mt-4">
        <button
          className="btn btn-success"
          onClick={confirmReturn}
          disabled={selectedRental?.isReturning} 
        >
          {selectedRental?.isReturning ? "Przyjmuję..." : "✅ Potwierdź zwrot"}
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={closeReturnModal}
          disabled={selectedRental?.isReturning} 
        >
          ❌ Anuluj
        </button>
      </div>
    </div>
  </div>
)}

        </>
      ) : (
        <p className="text-warning">⚠️ Brak danych sprzedawcy.</p>
      )}
    </div>
  );
};

export default SellerPanel;
