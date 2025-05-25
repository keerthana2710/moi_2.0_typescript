function CustomButton({ value, icon, onClick }) {
  return (
    <div
      onClick={onClick}
      className='bg-darkBlue text-white flex gap-2 justify-center items-center h-10 w-24 px-4 rounded-md hover:scale-105 transition-all duration-200'
    >
      {icon}
      <p className='text-sm'>{value}</p>
    </div>
  );
}

export default CustomButton;
