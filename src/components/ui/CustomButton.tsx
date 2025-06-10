import React from 'react';

interface CustomButtonProps {
  value: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

const CustomButton: React.FC<CustomButtonProps> = ({ value, icon, onClick }) => {
  return (
    <div
      onClick={onClick}
      className='bg-darkBlue text-white flex gap-2 justify-center items-center h-10 w-24 px-4 rounded-md hover:scale-105 transition-all duration-200 cursor-pointer'
    >
      {icon}
      <p className='text-sm'>{value}</p>
    </div>
  );
};

export default CustomButton;