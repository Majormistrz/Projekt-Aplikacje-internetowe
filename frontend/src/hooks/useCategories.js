import { useState, useEffect } from "react";

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [errorCategories, setErrorCategories] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    setErrorCategories(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/categories");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Błąd pobierania kategorii.");

      setCategories(data.categories || data);
    } catch (err) {
      console.error("Błąd pobierania kategorii:", err.message);
      setErrorCategories("Nie udało się pobrać kategorii.");
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Nieznana kategoria";
  };

  return {
    categories,
    loadingCategories,
    errorCategories,
    getCategoryName,
  };
};

export default useCategories;
