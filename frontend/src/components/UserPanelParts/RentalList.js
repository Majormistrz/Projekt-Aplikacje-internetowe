import React, { useState } from "react";
import ReminderButton from "./ReminderButton";
import RentalDetailsModal from "./RentalDetailsModal";
import Pagination from "./Pagination";

const RentalList = ({
  title,
  data,
  type,
  searchQuery = "",
  onReturnRequest = null,
  onReminderSet = () => {},
  className = ""
}) => {
  const [selectedRental, setSelectedRental] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const cardStyle = {
    active: { bg: "success", label: "📦" },
    history: { bg: "primary", label: "📜" },
  }[type] || { bg: "secondary", label: "📁" };

  // Filtrowanie danych
  const filteredData = (
    type === "history"
      ? data.filter((rental) => rental.status === "zakończone")
      : data
  ).filter(
    (rental) =>
      rental.rental_id.toString().includes(searchQuery) ||
      rental.offer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sortowanie historii po dacie zwrotu lub wypożyczenia
  const sortedData =
    type === "history"
      ? [...filteredData].sort((a, b) => {
          const dateA = new Date(a.return_date || a.rental_date);
          const dateB = new Date(b.return_date || b.rental_date);
          return dateB - dateA;
        })
      : filteredData;

  // Paginacja
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={`card shadow-sm h-100 w-100 ${className}`}>
      <div className={`card-header bg-${cardStyle.bg} text-white fw-bold`}>
        {cardStyle.label} {title}
      </div>

      <div className="card-body" style={{ maxHeight: "500px", overflowY: "auto" }}>
        {paginatedData.length > 0 ? (
          <ul className="list-group list-group-flush">
            {paginatedData.map((rental) => (
              <li
                key={rental.rental_id}
                className="list-group-item d-flex justify-content-between align-items-start flex-column flex-md-row"
              >
                <div className="mb-2 mb-md-0">
                  <span className="badge bg-success fw-bold me-1">
                    ID {rental.rental_id}
                  </span>
                  {rental.offer_name}
                  {type === "history" && (
                    <>
                      <br />
                      <span className="text-muted">
                        🔁 Zwrot: {rental.return_date ? new Date(rental.return_date).toLocaleString() : "-"}
                      </span>
                      <br />
                      <span className="text-muted">
                        💰 Cena zwrotu:{" "}
                        {rental.total_price ? `${rental.total_price.toFixed(2)} zł` : "-"}
                      </span>
                    </>
                  )}
                </div>

                {type === "active" && (
                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setSelectedRental(rental)}
                    >
                      Szczegóły
                    </button>
                    {rental.status === "oczekuje" && (
                      <span className="badge bg-warning text-dark">Oczekuje</span>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">Brak danych.</p>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {selectedRental && (
        <RentalDetailsModal
          rental={selectedRental}
          onClose={() => setSelectedRental(null)}
          onReturnRequest={onReturnRequest}
          onReminderSet={() => {
            onReminderSet(selectedRental);
            setSelectedRental(null);
          }}
        />
      )}
    </div>
  );
};

export default RentalList;
