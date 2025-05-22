import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import tsdlLogo from "../assets/tsdl_logo_4.png";
import tuLogo from "../assets/TU_Logo.png";

const Introduction = () => {
  const navigate = useNavigate();

  const handleInstructionClick = () => {
    navigate("/instruction");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        {/* Header with Logos */}
        <div className="flex items-center justify-between mb-16">
          <motion.img 
            src={tsdlLogo} 
            alt="TSDL Logo" 
            className="w-52 h-auto opacity-90"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          />
          <motion.img 
            src={tuLogo} 
            alt="TU Logo" 
            className="w-40 h-auto opacity-90"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          />
        </div>

        {/* Main Title */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-red-600">V</span>
            <span className="text-emerald-500">I</span>
            <span className="text-yellow-500">S</span>
            <span className="text-blue-600">T</span>
            <span className="text-green-600">A</span>
          </h1>
          <h2 className="text-3xl font-light text-gray-700">
            <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-transparent bg-clip-text">
            Visual Insight for Segmented <span className=" text-gray-500">TCAD</span> Analysis

            </span>
            
          </h2>
        </motion.div>

        {/* Contributors Section */}
        <motion.div 
          className="text-center mb-16 space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Project Team</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-600">Developed by:</span>
                <p className="text-lg text-gray-900">Abhinav Upadhyay, Anurag Medhi</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Supervisor:</span>
                <p className="text-lg text-gray-900">Rupam Goswami</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action Button */}
        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <button
            onClick={handleInstructionClick}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
          >
            Read Instructions
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Introduction;
