import React from 'react';
import { NavLink } from 'react-router-dom';
import { AiOutlineHome, AiOutlineCalculator, AiOutlineHistory, AiOutlineMessage } from 'react-icons/ai';
import { MdOutlinePeopleAlt } from 'react-icons/md';

const BottomNavBar = () => {
  return (
    <div className="fixed bottom-0 w-full max-w-md mx-auto bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-around items-center h-16">
        <NavLink 
          to="/home" 
          className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-blue-500' : 'text-gray-500'}`}
        >
          <AiOutlineHome size={24} />
          <span className="text-[10px] mt-1">홈</span>
        </NavLink>

        <NavLink 
          to="/community" 
          className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-blue-500' : 'text-gray-500'}`}
        >
          <MdOutlinePeopleAlt size={24} />
          <span className="text-[10px] mt-1">커뮤니티</span>
        </NavLink>

        <NavLink 
          to="/calculator" 
          className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-blue-500' : 'text-gray-500'}`}
        >
          <AiOutlineCalculator size={24} />
          <span className="text-[10px] mt-1">계산기</span>
        </NavLink>

        <NavLink 
          to="/record" 
          className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-blue-500' : 'text-gray-500'}`}
        >
          <AiOutlineHistory size={24} />
          <span className="text-[10px] mt-1">기록</span>
        </NavLink>

        <NavLink 
          to="/menu" 
          className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-blue-500' : 'text-gray-500'}`}
        >
          <AiOutlineMessage size={24} />
          <span className="text-[10px] mt-1">채팅</span>
        </NavLink>
      </div>
    </div>
  );
};

export default BottomNavBar;
