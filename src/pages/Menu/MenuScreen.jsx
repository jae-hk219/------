import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useAppContext } from '../../context/AppContext';

const MenuScreen = () => {
  const { isDarkMode, toggleDarkMode, currentLanguage, toggleLanguage } = useAppContext();
  const [showCacheMsg, setShowCacheMsg] = useState(false);

  const handleClearCache = () => {
    setShowCacheMsg(true);
    setTimeout(() => setShowCacheMsg(false), 2000);
  };

  const menuGroups = [
    {
      title: '계정 설정',
      items: [
        { label: '비밀번호 변경', rightElement: <FaChevronRight className="text-gray-400" /> },
        { 
          label: '언어 설정', 
          rightElement: <span className="text-gray-500 text-sm flex items-center gap-2">{currentLanguage} <FaChevronRight className="text-gray-400" /></span>,
          onClick: toggleLanguage
        },
      ]
    },
    {
      title: '앱 설정',
      items: [
        { 
          label: '다크 모드', 
          rightElement: <span className="text-gray-500 text-sm flex items-center gap-2">시스템 기본값 <FaChevronRight className="text-gray-400" /></span> 
        },
        { label: '알림 설정', rightElement: <FaChevronRight className="text-gray-400" /> },
        { 
          label: '캐시 삭제', 
          rightElement: <FaChevronRight className="text-gray-400" />,
          onClick: handleClearCache
        },
      ]
    },
    {
      title: '이용 안내',
      items: [
        { label: '공지사항', rightElement: <FaChevronRight className="text-gray-400" /> },
        { label: '문의하기', rightElement: <FaChevronRight className="text-gray-400" /> },
      ]
    }
  ];

  return (
    <div className="flex flex-col h-full bg-[#F5F5F5] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-center p-4 border-b border-gray-200 bg-white relative">
        <button className="absolute left-4 text-gray-800 p-2">
          <FaChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">내 정보</h1>
      </div>

      <div className="p-4 flex-1 pb-24">
        {/* Profile Card */}
        <div className="bg-zinc-800 rounded-2xl p-5 flex items-center shadow-md mb-8">
          <div className="w-14 h-14 bg-zinc-600 rounded-full flex items-center justify-center text-white mr-4 shrink-0 overflow-hidden">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" />
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-lg mb-1">홍길동</h2>
            <p className="text-zinc-400 text-xs">컴퓨터공학부 · 전기공사</p>
          </div>
          <button className="text-zinc-400 p-2">
            <FaChevronRight size={16} />
          </button>
        </div>

        {/* Menu Groups */}
        {menuGroups.map((group, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="text-sm font-bold text-gray-500 mb-2 ml-2">{group.title}</h3>
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              {group.items.map((item, itemIdx) => (
                <div 
                  key={itemIdx}
                  onClick={item.onClick}
                  className={`flex items-center justify-between p-4 bg-white active:bg-gray-50 cursor-pointer ${
                    itemIdx !== group.items.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <span className="text-gray-900 font-medium text-[15px]">{item.label}</span>
                  {item.rightElement}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Danger Zone */}
        <div className="mt-8 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <button className="w-full text-left p-4 text-gray-500 font-medium text-[15px] border-b border-gray-100 active:bg-gray-50">
            로그아웃
          </button>
          <button className="w-full text-left p-4 text-red-500 font-medium text-[15px] active:bg-red-50">
            회원 탈퇴
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {showCacheMsg && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-6 py-3 rounded-full z-50 animate-fade-in whitespace-nowrap">
          캐시가 삭제되었습니다.
        </div>
      )}
    </div>
  );
};

export default MenuScreen;
