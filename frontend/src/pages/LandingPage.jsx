import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStartedClick = () => {
    navigate('/select-image');
  };
  const handlePreviousClick = () => {
    navigate('/');
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Instructions</h2>
        <p className="mb-4">
          The purpose of this application is to provide Sentaurus TCAD tool users with the added functionality of obtaining region-specific average values of the physical and electrical properties of a semiconductor device.
        </p>
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            <strong>Sentaurus:</strong>
            <ol className="list-lower-alpha pl-6 space-y-2">
              <li>Open the simulated device in SVisual.</li>
              <li>
                Choose the device property which you want to study and turn off the contours.
              </li>
              <li>
                For accurate results, it is advisable to reduce the range of the property's color map down to the same exponential power. Note the color map's extreme values.
              </li>
              <li>
                Enlarge the section of the device that needs to be studied and export the plot as a .png file.
              </li>
            </ol>
          </li>
          <li>
            <strong>Application:</strong>
            <ol className="list-lower-alpha pl-6 space-y-2">
              <li>Launch the application and on the prompt to upload an image, choose the exported plot.</li>
              <li>Crop the desired region by dragging over the image.</li>
              <li>
                Press "Proceed to color map" to display the color map settings. Insert the extreme values noted from the TCAD tool into the text fields at the top and bottom.
              </li>
              <li>
                Press "Calculate Average" to display the average value of the device property inside the particular region. A preview of the segmented image is also displayed.
              </li>
            </ol>
          </li>
        </ol>
      </div>
      <div className='flex justify-between  w-full max-w-2xl px-10'>
        <button
        onClick={handlePreviousClick}
        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg mt-8"
      >
        Previous
      </button>
      <button
        onClick={handleGetStartedClick}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg mt-8"
      >
        Get Started
      </button>
      </div>
      
    </div>
  );
};

export default LandingPage;