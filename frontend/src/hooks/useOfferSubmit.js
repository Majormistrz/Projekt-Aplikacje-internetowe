const useOfferSubmit = ({ sellerId, isEditing, offerToEdit, refetchOffers, closeModal }) => {
  const submitOffer = async (formData) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    formData.append("seller_id", sellerId);

    try {
      const url = isEditing
        ? `http://127.0.0.1:5000/api/offers/${offerToEdit.id}`
        : "http://127.0.0.1:5000/api/offers";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      closeModal(); 
      await refetchOffers(); 
    } catch (err) {
      console.error("❌ Błąd zapisu:", err.message);
    }
  };

  return { submitOffer };
};

export default useOfferSubmit;
