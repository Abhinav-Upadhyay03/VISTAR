import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import tsdlLogo from "../assets/tsdl_logo_4.png";
import tuLogo from "../assets/TU_Logo.png";
import logo from "../assets/vistar-logo.png"
const Introduction = () => {
  const navigate = useNavigate();

  const handleInstructionClick = () => {
    navigate("/select-image");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-white to-green-100 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute bg-blue-300 opacity-30 rounded-full w-96 h-96 top-[-6rem] left-[-6rem] blur-3xl animate-pulse" />
        <div className="absolute bg-pink-200 opacity-30 rounded-full w-80 h-80 bottom-[-4rem] right-[-4rem] blur-3xl animate-pulse delay-2000" />
        <div className="absolute bg-yellow-200 opacity-20 rounded-full w-72 h-72 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-2xl animate-pulse delay-1000" />
      </div>
      <div className="w-full max-w-4xl z-10">
        {/* Glassmorphism Card */}
        <motion.div 
          className="backdrop-blur-lg rounded-3xl  p-10 md:p-16 flex flex-col items-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {/* Header with Logos */}
          <div className="flex items-center justify-between w-full mb-12">
            <motion.img 
              src={tsdlLogo} 
              alt="TSDL Logo" 
              className="w-40 h-auto opacity-90 drop-shadow-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            />
            <motion.img 
              src={tuLogo} 
              alt="TU Logo" 
              className="w-32 h-auto opacity-90 drop-shadow-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            />
          </div>

          {/* Main Title */}
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            
            <img src={logo} alt="logo" className="w-1/2 h-20 mx-auto mb-12 mt-12" />
            <h2 className="text-2xl md:text-3xl font-light text-gray-700 max-w-2xl mx-auto">
              <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-transparent bg-clip-text font-semibold">
                Visual Insight for Segmented <span className=" text-black font-semibold">TCAD</span> Analysis for Research
              </span>
            </h2>
          </motion.div>

          {/* Contributors Section */}
          <motion.div 
            className="text-center mb-10 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <div className="bg-white/80 shadow-lg rounded-2xl p-6 max-w-lg mx-auto border border-gray-100 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Project Team</h3>
                <div className="space-y-1">
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
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-full shadow-xl hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 text-lg tracking-wide border-2 border-white/30"
            >
              Get Started
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Introduction;
