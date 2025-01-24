import React from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const CustomPagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="flex justify-end mt-4">
      {/* Left Arrow */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        className={`px-3 py-1 mx-1 border rounded ${
          currentPage === 1
            ? "text-gray-400 border-gray-300 cursor-not-allowed"
            : "text-[#4a9d2d] border-[#4a9d2d] hover:bg-[#4a9d2d] hover:text-white"
        }`}
        disabled={currentPage === 1}
      >
        &lt;
      </button>

      {/* Page Numbers */}
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index}
          onClick={() => onPageChange(index + 1)}
          className={`px-3 py-1 mx-1 border rounded ${
            currentPage === index + 1
              ? "bg-[#4a9d2d] text-white"
              : "border-[#4a9d2d] text-[#4a9d2d] hover:bg-[#4a9d2d] hover:text-white"
          }`}
        >
          {index + 1}
        </button>
      ))}

      {/* Right Arrow */}
      <button
        onClick={() =>
          currentPage < totalPages && onPageChange(currentPage + 1)
        }
        className={`px-3 py-1 mx-1 border rounded ${
          currentPage === totalPages
            ? "text-gray-400 border-gray-300 cursor-not-allowed"
            : "text-[#4a9d2d] border-[#4a9d2d] hover:bg-[#4a9d2d] hover:text-white"
        }`}
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
    </div>
  );
};

export default CustomPagination;
