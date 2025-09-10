import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationContext } from "../context/NotificationContext";
import { FiBell } from "react-icons/fi"; // Feather Icons

const NotificationBell = () => {
  const { notifications } = useContext(NotificationContext);
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(true);
  const bellRef = useRef(null);
  const navigate = useNavigate();

  const handleClick = (id) => {
    setOpen(false);
    navigate("/user-panel");
  };

  const sentNotifications = notifications.filter((n) => n.sent);

  useEffect(() => {
    if (bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      const isNearLeftEdge = rect.left < 150;
      setAlignRight(!isNearLeftEdge);
    }
  }, [open]);

  return (
    <div className="position-relative d-inline-block me-3" ref={bellRef}>
      <button
        className="btn btn-link position-relative p-0"
        onClick={() => setOpen(!open)}
        title="Powiadomienia"
      >
        <FiBell size={24} color="white" /> 
        {sentNotifications.length > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {sentNotifications.length}
          </span>
        )}
      </button>

      {open && (
        <div
          className="dropdown-menu show shadow p-2 mt-2"
          style={{
            left: alignRight ? "auto" : 0,
            right: alignRight ? 0 : "auto",
            minWidth: "250px",
            maxWidth: "90vw",
            zIndex: 1000,
          }}
        >
          {sentNotifications.length === 0 ? (
            <div className="text-muted text-center">Brak powiadomień</div>
          ) : (
            sentNotifications.map((n) => (
              <div
                key={n.id}
                className="notification-item py-2 px-3 mb-1 rounded bg-light"
                onClick={() => handleClick(n.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="fw-bold mb-1">📢 Powiadomienie</div>
                <div className="text-muted small">{n.message}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
