const ActionOptions = ({ data }) => {
  return (
    <div className='border border-gray-300 rounded-md bg-white shadow-md w-32'>
      {data.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            onClick={() => item.action_func()} // Add parentheses to actually call the function
            className={`px-3 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer ${
              item.value === 'Delete' ? 'text-red-500' : ''
            }`}
          >
            <Icon />
            <p>{item.value}</p>
          </div>
        );
      })}
    </div>
  );
};

export default ActionOptions;
