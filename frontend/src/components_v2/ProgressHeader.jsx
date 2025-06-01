import React from "react";
import logo from "../assets/vistar-logo.png";
import bookIcon from "../assets/book_generated.jpg"

const SharedProgressHeader = ({ activeStep, completedSteps, onStepClick }) => {
  // Get CSS classes for progress steps
  const getStepClasses = (step) => {
    // Base classes
    let classes = "cursor-pointer transition-all duration-300 ";

    if (completedSteps[step]) {
      classes += "text-[#27272A] font-medium ";
    } else {
      classes += "text-[#6B6B6B] ";
    }

    if (activeStep === step) {
      classes += "font-bold";
    }

    return classes;
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    const stepMapping = {
      upload: 0,
      device: 25,
      area: 50,
      colormap: 75,
      results: 100,
    };

    return stepMapping[activeStep] || 0;
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-start mb-2">
          <img src={logo} alt="logo" className="w-36 h-10 mb-2 ml-[-22px]" />
          {/* Manual download book icon with tooltip */}
          <div className="relative group">
            <a
              href="/manual.pdf"
              download
              className="inline-flex items-center justify-center"
            >
              <img src={bookIcon} alt="book" className="w-10 h-10" />
            </a>
            {/* Tooltip */}
            <div className="absolute right-0 top-12 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              Vistar User Manual
              <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span
              className={getStepClasses("upload")}
              onClick={() => onStepClick("upload")}
            >
              Upload
            </span>
            <span
              className={getStepClasses("device")}
              onClick={() => onStepClick("device")}
            >
              Device/Object of Interest
            </span>
            <span
              className={getStepClasses("area")}
              onClick={() => onStepClick("area")}
            >
              Region of Interest
            </span>
            <span
              className={getStepClasses("colormap")}
              onClick={() => onStepClick("colormap")}
            >
              Color Map
            </span>
            <span
              className={getStepClasses("results")}
              onClick={() => onStepClick("results")}
            >
              Results
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SharedProgressHeader;
