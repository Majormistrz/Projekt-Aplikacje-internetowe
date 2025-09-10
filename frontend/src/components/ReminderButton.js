import React, { useState } from "react";
import dayjs from "dayjs";
import useReminders from "../../hooks/useReminders";

const ReminderButton = ({ rental }) => {
  const { setReminder } = useReminders();
  const [open, setOpen] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [message, setMessage] = useState("");

  const handleSetReminder = async () => {
    if (!reminderDate) return setMessage("❌ Wybierz datę przypomnienia");

    try {
      const msg = await setReminder(rental.rental_id, reminderDate);
      setMessage(msg);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <>
      <button
        className="btn btn-sm btn-outline-primary"
        onClick={() => setOpen(true)}
      >
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
                <input
                  type="datetime-local"
                  className="form-control"
                  value={reminderDate}
                  min={dayjs().format("YYYY-MM-DDTHH:mm")}
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
