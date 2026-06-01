import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRobot } from 'react-icons/fa';

const HomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-[#F5F5F5] pb-24 relative">
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pt-2">
          <h1 className="text-2xl font-bold text-gray-900">현장링크 AI <span className="text-gray-400 text-lg">→ 계산 생태계</span></h1>
          <button 
            onClick={() => navigate('/menu')} 
            className="w-8 h-8 rounded-full bg-zinc-300 overflow-hidden cursor-pointer hover:opacity-95 active:scale-95 transition-all"
            title="내 정보"
          >
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl p-3 flex items-center shadow-sm mb-6 border border-gray-100">
          <span className="text-gray-400 mr-2">🔍</span>
          <input 
            type="text" 
            placeholder="수식, 주제, 또는 AI 검색..." 
            className="w-full outline-none text-sm bg-transparent"
          />
        </div>

        {/* AI Banner */}
        <div 
          onClick={() => navigate('/chat')} 
          className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-4 flex items-center mb-6 shadow-sm cursor-pointer hover:shadow-md active:scale-[0.99] transition-all"
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4 text-blue-500 shrink-0">
            <FaRobot size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm mb-1">AI에게 무엇이든 물어보세요!</h3>
            <p className="text-xs text-gray-600 leading-tight">현장 문제 해결이 필요하신가요? 계산 생태계가 도와드립니다.</p>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3 mb-8">
          <div 
            onClick={() => navigate('/calculator', { state: { category: 'electric' } })}
            className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl p-4 text-white shadow-md relative overflow-hidden cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-1">[전기공사]</h3>
              <p className="text-xs text-gray-300">회로 설계, 규격, 안전 수칙</p>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-80 text-yellow-400">
               ⚡
            </div>
          </div>
          
          <div 
            onClick={() => navigate('/calculator', { state: { category: 'plumbing' } })}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-4 text-white shadow-md relative overflow-hidden cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-1">[배관공사]</h3>
              <p className="text-xs text-gray-300">배관 시스템, 자재, 유량 계산</p>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-80 text-cyan-300 text-2xl">
               🚰
            </div>
          </div>

          <div 
            onClick={() => navigate('/calculator', { state: { category: 'engineering' } })}
            className="bg-gradient-to-r from-zinc-600 to-zinc-700 rounded-xl p-4 text-white shadow-md relative overflow-hidden cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-1">[일반 공학]</h3>
              <p className="text-xs text-gray-300">역학, 정역학, 유틸리티 도구</p>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-80 text-gray-300 text-2xl">
               ⚙️
            </div>
          </div>
        </div>

        {/* Popular Community Topics */}
        <div className="mb-8">
          <h2 className="font-bold text-gray-800 mb-3">인기 커뮤니티 토론</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <div className="bg-white p-4 rounded-xl min-w-[150px] shadow-sm border border-gray-100 shrink-0">
              <h4 className="font-bold text-sm text-gray-800 mb-2">PEX 파이프 설치 꿀팁 (배관)</h4>
              <p className="text-xs text-gray-500">Plumbing</p>
            </div>
            <div className="bg-white p-4 rounded-xl min-w-[150px] shadow-sm border border-gray-100 shrink-0">
              <h4 className="font-bold text-sm text-gray-800 mb-2">전선 굵기 Wire Gauge (전기)</h4>
              <p className="text-xs text-gray-500">Electric</p>
            </div>
            <div className="bg-white p-4 rounded-xl min-w-[150px] shadow-sm border border-gray-100 shrink-0">
              <h4 className="font-bold text-sm text-gray-800 mb-2">안전 수칙 점검 가이드</h4>
              <p className="text-xs text-gray-500">Safety</p>
            </div>
          </div>
        </div>

        {/* Events / Notices */}
        <div>
          <h2 className="font-bold text-gray-800 mb-3">주요 행사 및 공지사항</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
            <div className="flex items-center p-3 border-b border-gray-50">
              <span className="text-gray-400 mr-3">📄</span>
              <div>
                <h4 className="font-bold text-sm text-gray-800">KEC 2026 규격 업데이트</h4>
                <p className="text-xs text-gray-500 mt-1">2026년 전기설비기술기준 개정안</p>
              </div>
            </div>
            <div className="flex items-center p-3">
              <span className="text-gray-400 mr-3">📅</span>
              <div>
                <h4 className="font-bold text-sm text-gray-800">친환경 건축 기술 세미나</h4>
                <p className="text-xs text-gray-500 mt-1">다음 주 화요일 오후 2시 online</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Button */}
      <button 
        onClick={() => navigate('/chat')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white z-40 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        title="AI 비서와 채팅"
      >
        <FaRobot size={24} />
      </button>
    </div>
  );
};

export default HomeScreen;
