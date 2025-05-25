import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  const getVisiblePages = () => {
    const groupSize = 3;
    const currentGroup = Math.floor((currentPage - 1) / groupSize);
    const start = currentGroup * groupSize + 1;
    const end = Math.min(start + groupSize - 1, totalPages);

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className='w-full flex justify-center mt-4'>
      <div className='flex gap-4'>
        {/* Previous */}
        <button
          disabled={isFirst}
          onClick={() => onPageChange(currentPage - 1)}
          className={`flex gap-2 text-sm px-3 h-8 items-center border border-gray-300 rounded-xl transition-all duration-200 ${
            isFirst ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
          }`}
        >
          <IoIosArrowBack />
          <p>Previous</p>
        </button>

        <div className='flex gap-2'>
          {getVisiblePages().map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`rounded-xl h-8 px-3 min-w-[32px] flex justify-center items-center ${
                currentPage === page
                  ? 'bg-darkBlue text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          disabled={isLast}
          onClick={() => onPageChange(currentPage + 1)}
          className={`flex gap-2 text-sm px-3 h-8 items-center border border-gray-300 rounded-xl transition-all duration-200 ${
            isLast ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
          }`}
        >
          <p>Next</p>
          <IoIosArrowForward />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
