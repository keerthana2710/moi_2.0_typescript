import React from 'react';

const MobileMessage: React.FC = () => {
  return (
    <div className='lg:hidden min-h-screen flex items-center justify-center px-4'>
      <div className='bg-red-50 border border-red-200 text-red-800 max-w-md w-full p-6 rounded-xl shadow-md text-center'>
        <h2 className='text-xl font-semibold mb-2'>Mobile Not Supported</h2>
        <p className='text-sm'>
          Sorry, this website is not available on mobile devices. Please visit
          us on a desktop for the best experience.
        </p>
      </div>
    </div>
  );
};

export default MobileMessage;