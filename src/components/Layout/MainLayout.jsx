import React from 'react';
import BottomNavBar from '../Navigation/BottomNavBar';

const MainLayout = ({ children }) => {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#1A1D29] text-white flex flex-col font-sans relative pb-20">
      <div className="flex-1 bg-[#F5F5F5] text-black">
        {children}
      </div>
      <BottomNavBar />
    </div>
  );
};

export default MainLayout;
