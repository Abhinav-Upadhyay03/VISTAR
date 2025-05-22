import React from "react";
import logo from "../assets/vistar-logo.png"
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
      "upload": 0,
      "device": 25,
      "area": 50,
      "colormap": 75,
      "results": 100
    };
    
    return stepMapping[activeStep] || 0;
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <img src={logo} alt="logo" className="w-36 h-10 mb-2 ml-[-22px]"/>
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
              Device Selection
            </span>
            <span 
              className={getStepClasses("area")}
              onClick={() => onStepClick("area")}
            >
              Area Selection
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