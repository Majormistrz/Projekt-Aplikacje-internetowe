import { useState } from "react";

const useOfferModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [offerToEdit, setOfferToEdit] = useState(null);

  const openModal = () => {
    setShowModal(true);
    setIsEditing(false);
    setOfferToEdit(null);
  };

const editOffer = async (offer) => {
  setIsEditing(true);
  try {
    const res = await fetch(`http://localhost:5000/api/offers/${offer.id}`);
    const data = await res.json();
    setOfferToEdit(data);
    setShowModal(true);
  } catch (err) {
    console.error("Błąd pobierania oferty:", err);
    setOfferToEdit(offer);
    setShowModal(true);
  }
};


  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setOfferToEdit(null);
  };

  return { showModal, isEditing, offerToEdit, openModal, editOffer, closeModal };
};

export default useOfferModal;
