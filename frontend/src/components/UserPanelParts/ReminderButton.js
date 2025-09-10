import React, { useState, useContext } from "react";
import dayjs from "dayjs";
import useReminders from "../../hooks/useReminders";
import { NotificationContext } from "../../context/NotificationContext";

const ReminderButton = ({ rental, onReminderSet = () => {} }) => {
  const { setReminder } = useReminders();
  const { fetchNotifications } = useContext(NotificationContext);
  const [open, setOpen] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [message, setMessage] = useState("");

  const handleSetReminder = async () => {
    if (!reminderDate) return setMessage("❌ Wybierz datę przypomnienia");

    try {
      const msg = await setReminder(rental.rental_id, reminderDate);
      setMessage(msg);
      await fetchNotifications();       
      onReminderSet();                  
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  };

  const quickSet = (value, unit) => {
    setReminderDate(dayjs().add(value, unit).format("YYYY-MM-DDTHH:mm"));
  };

  return (
    <>
      <button className="btn btn-sm btn-outline-primary" onClick={() => setOpen(true)}>
        ⏰ Przypomnienie
      </button>

      {open && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Ustaw przypomnienie</h5>
                <button className="btn-close" onClick={() => setOpen(false)}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex flex-wrap gap-2 mb-2">
                  <button className="btn btn-outline-secondary" onClick={() => quickSet(5, "hour")}>
                    Za 5 godzin
                  </button>
                  <button className="btn btn-outline-secondary" onClick={() => quickSet(7, "day")}>
                    Za 7 dni
                  </button>
                  <button className="btn btn-outline-secondary" onClick={() => quickSet(20, "day")}>
                    Za 20 dni
                  </button>
                  <button className="btn btn-outline-secondary" onClick={() => quickSet(30, "day")}>
                    Za 30 dni
                  </button>
                </div>

                <input
                  type="datetime-local"
                  className="form-control mb-2"
                  value={reminderDate}
                  min={dayjs().format("YYYY-MM-DDTHH:mm")}
                  max={dayjs().add(30, "day").format("YYYY-MM-DDTHH:mm")}
                  onChange={(e) => setReminderDate(e.target.value)}
                />

                {message && <div className="mt-2">{message}</div>}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setOpen(false)}>
                  Anuluj
                </button>
                <button className="btn btn-success" onClick={handleSetReminder}>
                  Ustaw przypomnienie
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReminderButton;
