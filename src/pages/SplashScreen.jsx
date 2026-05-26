import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWrench, FaBolt } from 'react-icons/fa';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home');
    }, 2500); // 2.5 seconds splash screen
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1A1D29] text-white">
      {/* Logo Area */}
      <div className="relative flex items-center justify-center w-32 h-32 mb-8">
        <FaWrench className="text-[#4F5569] absolute rotate-45" size={80} />
        <FaBolt className="text-[#FFEA00] absolute z-10" size={60} />
      </div>

      {/* Text Area */}
      <h1 className="text-4xl font-bold mb-3 tracking-wider">계산 생태계</h1>
      <p className="text-sm font-light text-gray-300 mb-16 tracking-widest">전문가 현장 계산기 및 커뮤니티</p>

      {/* Loading Indicator */}
      <div className="absolute bottom-20">
        <div className="w-10 h-10 border-4 border-t-white border-r-transparent border-b-transparent border-l-white rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default SplashScreen;
