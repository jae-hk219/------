import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaTimes } from 'react-icons/fa';
import BottomNavBar from '../Navigation/BottomNavBar';
import { useAppContext } from '../../context/AppContext';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const { isDarkMode, currentUser } = useAppContext();
  
  // Real-time Admin Inquiry Notification state
  const [adminInquiryAlert, setAdminInquiryAlert] = useState(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [navigate]);

  // Periodically check for new inquiries if logged in as admin
  useEffect(() => {
    if (currentUser?.id !== 'admin') return;

    const checkInquiry = () => {
      try {
        const hasNew = localStorage.getItem('has_new_inquiry') === 'true';
        if (hasNew) {
          const category = localStorage.getItem('new_inquiry_category') || '일반 문의';
          setAdminInquiryAlert(category);
        }
      } catch (e) {
        console.error(e);
      }
    };

    // Check immediately and then every 2 seconds
    checkInquiry();
    const interval = setInterval(checkInquiry, 2000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleDismissAdminAlert = () => {
    localStorage.removeItem('has_new_inquiry');
    localStorage.removeItem('new_inquiry_category');
    setAdminInquiryAlert(null);
  };

  return (
    <div className={`max-w-md mx-auto min-h-screen flex flex-col font-sans relative pb-20 shadow-2xl transition-colors duration-300 ${
      isDarkMode ? 'bg-black text-white' : 'bg-[#1A1D29] text-white'
    }`}>
      
      {/* Admin Notifier Banner */}
      {adminInquiryAlert && (
        <div className="absolute top-4 left-4 right-4 z-50 bg-gradient-to-r from-amber-600 to-orange-600 p-3.5 rounded-2xl shadow-2xl border border-amber-500 flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-2.5">
            <FaBell className="text-white animate-pulse shrink-0 animate-infinite" size={14} />
            <div className="text-left">
              <span className="text-[10px] font-black text-amber-100 uppercase tracking-widest block">관리자 긴급 알림</span>
              <span className="text-xs font-bold text-white leading-snug">
                새 문의 접수: {adminInquiryAlert}
              </span>
            </div>
          </div>
          <button 
            onClick={handleDismissAdminAlert}
            className="p-1 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <FaTimes size={14} />
          </button>
        </div>
      )}

      {/* Main Page Area with Dynamic Theme Class */}
      <div className={`flex-1 transition-colors duration-300 ${
        isDarkMode ? 'bg-black text-white' : 'bg-[#F5F5F5] text-black'
      }`}>
        {children}
      </div>

      <BottomNavBar />
    </div>
  );
};

export default MainLayout;

