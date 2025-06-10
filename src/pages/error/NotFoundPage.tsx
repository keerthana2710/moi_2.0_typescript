import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6 text-center'>
      <h1 className='text-5xl font-bold text-gray-800 mb-4'>404</h1>
      <p className='text-lg text-gray-600 mb-6'>
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link
        to='/'
        className='bg-darkBlue hover:scale-105  text-white font-semibold py-2 px-6 rounded shadow transition-all'
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFoundPage;