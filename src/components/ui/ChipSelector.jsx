function ChipSelector({ pageFetch, label, setPageFetch }) {
  const pageGroup = [20, 40, 60, 80, 100];

  return (
    <div className='flex flex-col gap-3'>
      <h1 className='font-bold'>{label}</h1>
      <div className='flex gap-3'>
        {pageGroup.map((num) => (
          <div
            key={num}
            onClick={() => setPageFetch(num)}
            className={`h-8 w-12 flex items-center justify-center rounded-md cursor-pointer transition-all duration-200
            ${
              pageFetch === num
                ? 'bg-darkBlue text-white'
                : 'bg-white text-darkBlue border border-darkBlue'
            }`}
          >
            <p className='text-sm font-medium'>{num}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChipSelector;
