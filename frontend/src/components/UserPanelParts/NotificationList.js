import React from "react";

const NotificationList = ({ notifications, loading, onDelete }) => {
  const parseSQLDate = (dateStr) => {
    if (!dateStr) return null;
    const [datePart, timePart] = dateStr.split(" ");
    if (!datePart || !timePart) return null;

    const [year, month, day] = datePart.split("-");
    const [hour, minute, second] = timePart.split(":");
    return new Date(year, month - 1, day, hour, minute, second);
  };

  const formatDate = (dateStr) => {
    const date = parseSQLDate(dateStr);
    return date ? date.toLocaleString("pl-PL") : "";
  };

  const getStatusBadge = (dateStr) => {
    const date = parseSQLDate(dateStr);
    if (!date) return null;

    const now = new Date();
    const diffDays = (date - now) / (1000 * 60 * 60 * 24);

    if (date < now) return <span className="badge bg-danger">Po terminie</span>;
    if (diffDays < 2) return <span className="badge bg-warning text-dark">Zbliża się</span>;
    return <span className="badge bg-success">Nowe</span>;
  };

  const getSentStatus = (sent) => {
    return sent
      ? <span className="badge bg-primary fs-5">Wysłane</span>
      : <span className="badge bg-secondary">Oczekuje</span>;
  };

  return (
    <div className="card shadow-sm h-100">
      <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
        <span className="fw-bold">🔔 Twoje przypomnienia</span>
        {onDelete && (
          <button
            className="btn btn-sm btn-outline-light"
            onClick={() => onDelete("ALL")}
            title="Usuń wszystkie przypomnienia"
          >
            🗑️
          </button>
        )}
      </div>

      <div className="card-body">
        {loading && <div className="text-center">⏳ Ładowanie...</div>}
        {notifications.length === 0 ? (
          <p className="text-muted text-center">Brak przypomnień</p>
        ) : (
          <div className="d-flex flex-column" style={{ maxHeight: "500px", overflowY: "auto" }}>
            {notifications.map((n) => (
              <div key={n.id} className="card mb-3 shadow-sm">
                <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
                  <div className="d-flex flex-column">
                    <h6 className="mb-1 text-break">{n.message}</h6>
                    <small className="text-muted">{formatDate(n.remind_at)}</small>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {getStatusBadge(n.remind_at)}
                    {getSentStatus(n.sent)}
                    {onDelete && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete(n.id)}
                        title="Usuń przypomnienie"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;
