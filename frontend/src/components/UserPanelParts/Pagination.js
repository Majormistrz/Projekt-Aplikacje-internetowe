const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="mt-4 d-flex justify-content-center align-items-center gap-3">
    <button
      className="btn btn-sm btn-outline-secondary"
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
    >
      ◀ Poprzednia
    </button>
    <span>
      Strona {currentPage} z {totalPages}
    </span>
    <button
      className="btn btn-sm btn-outline-secondary"
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
    >
      Następna ▶
    </button>
  </div>
);

export default Pagination;
