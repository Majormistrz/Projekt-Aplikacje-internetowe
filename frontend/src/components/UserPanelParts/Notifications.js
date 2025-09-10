import React from "react";

const Notifications = ({ notifications, markAsRead }) => {
  return (
    <div className="card p-3 mb-4">
      <h5>🔔 Powiadomienia</h5>
      {notifications.length === 0 ? (
        <p>Brak powiadomień</p>
      ) : (
        <ul className="list-group">
          {notifications.map((n) => (
            <li key={n.id} className={`list-group-item ${n.is_read ? "text-muted" : "fw-bold"}`}>
              {n.message} <small>({new Date(n.created_at).toLocaleString()})</small>
              {!n.is_read && (
                <button className="btn btn-sm btn-outline-success float-end"
                        onClick={() => markAsRead(n.id)}>
                  ✅ Przeczytane
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
