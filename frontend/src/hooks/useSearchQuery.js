import { useLocation } from "react-router-dom";

const useSearchQuery = () => {
  const location = useLocation();
  return new URLSearchParams(location.search).get("query");
};

export default useSearchQuery;