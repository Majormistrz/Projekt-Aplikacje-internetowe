const useOfferForm = ({ submitOffer }) => {
  const handleSubmitOffer = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    submitOffer(formData);
  };

  return { handleSubmitOffer };
};

export default useOfferForm;
