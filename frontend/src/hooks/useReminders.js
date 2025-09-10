import { getToken } from "../utils/auth";
import axios from "axios";

const useReminders = () => {
  const setReminder = async (rentalId, remindAt) => {
    const token = getToken();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/reminders",
        { rental_id: rentalId, remind_at: remindAt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data.message;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message);
    }
  };

  return { setReminder };
};

export default useReminders;
