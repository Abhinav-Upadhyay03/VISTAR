import React from 'react';
import { useNavigate } from 'react-router-dom';

const ErrorPage = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    // Go back to the previous route
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-2xl w-full px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mb-8">
            {/* <img
              src={imgList[0]}
              alt="Error illustration"
              className="mx-auto w-64 h-64 object-contain"
            /> */}
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Oops!
          </h1>

          <div className="space-y-4 mb-8">
            <p className="text-xl text-gray-600">
              Something went wrong
            </p>
            <p className="text-red-500">
              An unexpected error occurred. Please try again.
            </p>
            <p className="text-gray-500">
              If the issue persists, please contact support.
            </p>
          </div>

          <button
            onClick={handleBackClick}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold 
                     hover:bg-blue-700 transition-colors duration-200"
          >
            Home Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;