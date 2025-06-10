import React from 'react';
import { FileX } from 'lucide-react';

interface NoDataPlaceholderProps {
  message?: string;
  subtext?: string;
}

const NoDataPlaceholder: React.FC<NoDataPlaceholderProps> = ({
  message = 'தகவல்கள் இல்லை',
  subtext = 'உங்கள் தேடல் அல்லது வடிகட்டுதல்களை மாற்றி முயற்சிக்கவும்.',
}) => {
  return (
    <div className='flex flex-col items-center justify-center py-20 text-center text-gray-500'>
      <FileX className='h-16 w-16 text-gray-300 mb-4' />
      <p className='text-lg font-semibold'>{message}</p>
      <p className='text-sm text-gray-400 mt-1'>{subtext}</p>
    </div>
  );
};

export default NoDataPlaceholder;