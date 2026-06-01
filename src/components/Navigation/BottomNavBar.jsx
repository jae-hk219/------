import React from 'react';
import { NavLink } from 'react-router-dom';
import { AiOutlineHome, AiOutlineCalculator, AiOutlineHistory, AiOutlineMenu } from 'react-icons/ai';
import { MdOutlinePeopleAlt } from 'react-icons/md';
import { useAppContext } from '../../context/AppContext';

const BottomNavBar = () => {
  const { t, isDarkMode } = useAppContext();

  return (
    <div className={`fixed bottom-0 w-full max-w-md mx-auto border-t shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 transition-colors duration-300 ${
      isDarkMode ? 'bg-zinc-950 border-zinc-850 text-white' : 'bg-white border-gray-200 text-black'
    }`}>
      <div className="flex justify-around items-center h-16">
        <NavLink 
          to="/home" 
          className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full transition-colors ${
            isActive ? 'text-blue-500' : (isDarkMode ? 'text-zinc-500 hover:text-zinc-400' : 'text-gray-400 hover:text-gray-600')
          }`}
        >
          <AiOutlineHome size={24} />
          <span className="text-[10px] mt-1 font-bold">{t('nav_home')}</span>
        </NavLink>

        <NavLink 
          to="/community" 
          className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full transition-colors ${
            isActive ? 'text-blue-500' : (isDarkMode ? 'text-zinc-500 hover:text-zinc-400' : 'text-gray-400 hover:text-gray-600')
          }`}
        >
          <MdOutlinePeopleAlt size={24} />
          <span className="text-[10px] mt-1 font-bold">{t('nav_community')}</span>
        </NavLink>

        <NavLink 
          to="/calculator" 
          className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full transition-colors ${
            isActive ? 'text-blue-500' : (isDarkMode ? 'text-zinc-500 hover:text-zinc-400' : 'text-gray-400 hover:text-gray-600')
          }`}
        >
          <AiOutlineCalculator size={24} />
          <span className="text-[10px] mt-1 font-bold">{t('nav_calc')}</span>
        </NavLink>

        <NavLink 
          to="/record" 
          className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full transition-colors ${
            isActive ? 'text-blue-500' : (isDarkMode ? 'text-zinc-500 hover:text-zinc-400' : 'text-gray-400 hover:text-gray-600')
          }`}
        >
          <AiOutlineHistory size={24} />
          <span className="text-[10px] mt-1 font-bold">기록</span>
        </NavLink>

        <NavLink 
          to="/menu" 
          className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full transition-colors ${
            isActive ? 'text-blue-500' : (isDarkMode ? 'text-zinc-500 hover:text-zinc-400' : 'text-gray-400 hover:text-gray-600')
          }`}
        >
          <AiOutlineMenu size={24} />
          <span className="text-[10px] mt-1 font-bold">{t('nav_menu')}</span>
        </NavLink>
      </div>
    </div>
  );
};

export default BottomNavBar;

