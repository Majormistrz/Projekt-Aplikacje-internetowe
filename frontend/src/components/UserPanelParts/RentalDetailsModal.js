import React from "react";
import ReminderButton from "./ReminderButton";

const RentalDetailsModal = ({ rental, onClose, onReturnRequest, onReminderSet }) => {
  if (!rental) return null;

  // Funkcja do bezpiecznego formatowania cen
  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) return "-";
    return Number(price).toFixed(2) + " zł";
  };

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">📦 Szczegóły wypożyczenia</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p><strong>ID:</strong> {rental.rental_id}</p>
            <p><strong>Nazwa produktu:</strong> {rental.offer_name}</p>
            <p><strong>Termin wypożyczenia:</strong> {rental.rental_date}</p>
            <p><strong>Cena startowa:</strong> {formatPrice(rental.entry_price)}</p>
            <p><strong>Cena za dzień:</strong> {formatPrice(rental.price_per_day)}</p>

            {/* Obliczenia */}
            <p><strong>Liczba dni wypożyczenia:</strong> {rental.rental_days}</p>
            {rental.penalty_days > 0 && (
              <p><strong>Kara za przetrzymanie:</strong> {formatPrice(rental.penalty_days * 25)}</p>
            )}
            <p><strong>Szacowana należność:</strong> {formatPrice(rental.estimated_total)}</p>

            {/* Status */}
            <p><strong>Status:</strong> {rental.status === "oczekuje" ? "⏳ Oczekuje na zwrot" : "✅ Aktywne"}</p>
          </div>
          <div className="modal-footer d-flex justify-content-between">
            {onReturnRequest && rental.status === "aktywne" && (
              <button
                className="btn btn-warning"
                onClick={() => {
                  onReturnRequest(rental.rental_id);
                  onClose();
                }}
              >
                Zgłoś zwrot
              </button>
            )}
            <ReminderButton rental={rental} onReminderSet={onReminderSet} />
            <button className="btn btn-secondary" onClick={onClose}>Zamknij</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalDetailsModal;
