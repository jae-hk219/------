import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRobot, FaUser, FaLink, FaEdit, FaTimes, FaThumbsUp } from 'react-icons/fa';
import { useAppContext } from '../../context/AppContext';

// Initial Seed News/Events data
const DEFAULT_NEWS = [
  {
    id: 1,
    icon: "⚡",
    title: "2026년 전기안전관리법 및 기술기준 개정안 안내",
    desc: "산업통상자원부와 한국전기안전공사(KESCO)에서 발표한 최신 전기기술기준 개정 전문과 준수사항.",
    url: "https://www.kesco.or.kr"
  },
  {
    id: 2,
    icon: "🚰",
    title: "건설현장 배관공 전문기능인력 양성 및 지원 지침",
    desc: "건설근로자공제회에서 주관하는 전문 배관 기능공 양성 훈련 지원 사업 및 노무 단가 정보.",
    url: "https://www.cw.or.kr"
  },
  {
    id: 3,
    icon: "📜",
    title: "KEC 접지시스템 설계 가이드 및 용량 산정 규칙",
    desc: "대한전기협회에서 발간한 현장 기술자를 위한 설계 실무 핵심 기술 해설집.",
    url: "http://www.electricity.or.kr"
  }
];

const HomeScreen = () => {
  const navigate = useNavigate();
  const { currentUser, isDarkMode, t } = useAppContext();

  // Dynamic States
  const [popularPosts, setPopularPosts] = useState([]);
  const [newsEvents, setNewsEvents] = useState([]);
  
  // Admin Update Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editNewsList, setEditNewsList] = useState([]);


  // Load popular posts & news events
  useEffect(() => {
    // 1. Fetch & Sort custom community posts
    try {
      const posts = JSON.parse(localStorage.getItem('custom_posts')) || [];
      // Sort descending by likes
      const sorted = [...posts].sort((a, b) => (b.likes || 0) - (a.likes || 0));
      setPopularPosts(sorted);
    } catch {
      setPopularPosts([]);
    }

    // 2. Fetch or seed news events
    try {
      const storedNews = localStorage.getItem('home_news_events');
      if (storedNews) {
        setNewsEvents(JSON.parse(storedNews));
      } else {
        localStorage.setItem('home_news_events', JSON.stringify(DEFAULT_NEWS));
        setNewsEvents(DEFAULT_NEWS);
      }
    } catch {
      setNewsEvents(DEFAULT_NEWS);
    }
  }, []);

  // Handle News Update Submission
  const handleUpdateNews = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('home_news_events', JSON.stringify(editNewsList));
      setNewsEvents(editNewsList);
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = () => {
    setEditNewsList(JSON.parse(JSON.stringify(newsEvents))); // deep copy
    setShowEditModal(true);
  };

  const handleNewsFieldChange = (index, field, value) => {
    const updated = [...editNewsList];
    updated[index][field] = value;
    setEditNewsList(updated);
  };

  const handleNewsClick = (url) => {
    if (!url) return;
    try {
      window.open(url, '_blank');
    } catch (e) {
      console.error("Failed to open source URL:", e);
    }
  };

  const isAdmin = currentUser?.id === 'admin';

  return (
    <div className={`flex flex-col h-full min-h-screen pb-24 transition-colors duration-300 ${
      isDarkMode ? 'bg-black text-white' : 'bg-[#F5F5F5] text-black'
    }`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pt-2">
          <h1 className="text-xl font-bold tracking-tight">
            {t('home_title')} <span className={isDarkMode ? 'text-zinc-550 text-sm' : 'text-gray-400 text-sm'}>→ {t('home_subtitle')}</span>
          </h1>
          <button 
            onClick={() => navigate('/menu')} 
            className="w-8 h-8 rounded-full overflow-hidden cursor-pointer hover:opacity-90 active:scale-95 transition-all border border-gray-300 shadow-sm"
            title="내 정보"
          >
            {currentUser?.profileImage ? (
              <img src={currentUser.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#E1E1E1] text-[#7F7F7F]">
                <FaUser size={16} className="mt-0.5" />
              </div>
            )}
          </button>
        </div>


        {/* AI Banner */}
        <div 
          onClick={() => navigate('/chat')} 
          className={`rounded-2xl p-4 flex items-center mb-6 shadow-sm cursor-pointer hover:shadow-md active:scale-[0.99] transition-all border ${
            isDarkMode 
              ? 'bg-gradient-to-r from-zinc-900 to-zinc-950 border-zinc-800' 
              : 'bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-200'
          }`}
        >
          <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center mr-4 text-blue-500 shrink-0 shadow-sm">
            <FaRobot size={22} />
          </div>
          <div>
            <h3 className={`font-bold text-xs mb-0.5 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              AI에게 무엇이든 물어보세요!
            </h3>
            <p className={`text-[10px] leading-tight ${isDarkMode ? 'text-zinc-400' : 'text-gray-600'}`}>
              현장 문제 해결이 필요하신가요? 계산 생태계가 도와드립니다.
            </p>
          </div>
        </div>

        {/* Calculator Categories */}
        <div className="space-y-3 mb-8">
          <div 
            onClick={() => navigate('/calculator', { state: { category: 'electric' } })}
            className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-4 text-white shadow-md relative overflow-hidden cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all border border-slate-600"
          >
            <div className="relative z-10">
              <h3 className="font-extrabold text-sm mb-0.5">[전기공사]</h3>
              <p className="text-[10px] text-gray-300 font-light">회로 설계, 규격, 안전 수칙 계산기</p>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-35 text-yellow-400 text-3xl select-none">
               ⚡
            </div>
          </div>
          
          <div 
            onClick={() => navigate('/calculator', { state: { category: 'plumbing' } })}
            className="bg-gradient-to-r from-emerald-700 to-emerald-800 rounded-2xl p-4 text-white shadow-md relative overflow-hidden cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all border border-emerald-600"
          >
            <div className="relative z-10">
              <h3 className="font-extrabold text-sm mb-0.5">[배관공사]</h3>
              <p className="text-[10px] text-gray-300 font-light">배관 시스템, 자재 선정, 유량 계산기</p>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-35 text-cyan-300 text-3xl select-none">
               🚰
            </div>
          </div>

          <div 
            onClick={() => navigate('/calculator', { state: { category: 'engineering' } })}
            className="bg-gradient-to-r from-zinc-700 to-zinc-800 rounded-2xl p-4 text-white shadow-md relative overflow-hidden cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all border border-zinc-650"
          >
            <div className="relative z-10">
              <h3 className="font-extrabold text-sm mb-0.5">[일반 공학]</h3>
              <p className="text-[10px] text-gray-300 font-light">역학, 정역학, 유틸리티 엔지니어링 도구</p>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-35 text-gray-300 text-3xl select-none">
               ⚙️
            </div>
          </div>
        </div>

        {/* Popular Community Topics */}
        <div className="mb-8">
          <h2 className="font-extrabold text-xs mb-3 tracking-wide flex items-center gap-1.5">
            💬 <span>인기 커뮤니티 토론</span>
          </h2>
          {popularPosts.length === 0 ? (
            <div 
              onClick={() => navigate('/community')}
              className={`p-5 rounded-2xl border text-center transition-all cursor-pointer shadow-sm ${
                isDarkMode 
                  ? 'bg-zinc-900 border-zinc-850 hover:border-zinc-800' 
                  : 'bg-white border-gray-100 hover:border-gray-200'
              }`}
            >
              <p className="text-[10px] font-bold text-blue-500 mb-1">인기 토론글이 없습니다.</p>
              <p className={`text-[9px] ${isDarkMode ? 'text-zinc-550' : 'text-gray-400'}`}>
                소통방에 첫 소중한 정보 나눔 글을 올려주세요! (클릭 시 이동)
              </p>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {popularPosts.map(post => (
                <div 
                  key={post.id}
                  onClick={() => navigate(`/community/${post.id}`)}
                  className={`p-4 rounded-2xl min-w-[170px] shadow-sm border shrink-0 cursor-pointer active:scale-95 transition-all ${
                    isDarkMode 
                      ? 'bg-zinc-900 border-zinc-850 text-white hover:border-zinc-800' 
                      : 'bg-white border-gray-100 text-black hover:border-gray-200'
                  }`}
                >
                  <span className="text-[8px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full mb-2 inline-block">
                    {post.category}
                  </span>
                  <h4 className="font-extrabold text-xs mb-2 line-clamp-1 leading-tight">{post.title}</h4>
                  <div className={`flex items-center justify-between text-[9px] pt-1.5 border-t ${
                    isDarkMode ? 'border-zinc-800 text-zinc-500' : 'border-gray-50 text-gray-400'
                  }`}>
                    <span className="font-medium truncate max-w-[80px]">{post.author}</span>
                    <span className="flex items-center gap-0.5 text-blue-500 font-bold">
                      <FaThumbsUp size={8} /> {post.likes || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Events / News / Notices */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-extrabold text-xs tracking-wide">
              📢 주요 행사 및 공지사항
            </h2>
            {isAdmin && (
              <button 
                onClick={openEditModal}
                className="text-[10px] font-bold text-blue-500 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <FaEdit size={10} />
                <span>링크 업데이트</span>
              </button>
            )}
          </div>

          <div className={`rounded-2xl shadow-sm border p-1 transition-colors ${
            isDarkMode ? 'bg-zinc-950 border-zinc-850' : 'bg-white border-gray-100'
          }`}>
            {newsEvents.map((item, idx) => (
              <div 
                key={item.id}
                onClick={() => handleNewsClick(item.url)}
                className={`flex items-start p-3.5 cursor-pointer active:opacity-75 transition-all ${
                  idx !== newsEvents.length - 1 
                    ? (isDarkMode ? 'border-b border-zinc-900' : 'border-b border-gray-50') 
                    : ''
                }`}
              >
                <span className="text-lg mr-3.5 select-none shrink-0 pt-0.5">{item.icon || "📄"}</span>
                <div className="flex-1 text-left pr-2">
                  <h4 className={`font-bold text-xs leading-tight mb-1 flex items-center gap-1 ${
                    isDarkMode ? 'text-zinc-200' : 'text-gray-800'
                  }`}>
                    <span>{item.title}</span>
                    <FaLink size={8} className="text-zinc-500 shrink-0" />
                  </h4>
                  <p className={`text-[10px] leading-relaxed ${
                    isDarkMode ? 'text-zinc-450' : 'text-gray-500 font-light'
                  }`}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating AI Button */}
      <button 
        onClick={() => navigate('/chat')}
        className="fixed bottom-20 right-4 w-12 h-12 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white z-40 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        title="AI 비서와 채팅"
      >
        <FaRobot size={22} />
      </button>

      {/* ================= ADMIN NEWS EDITOR MODAL ================= */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-scale-up border max-h-[85vh] overflow-y-auto transition-colors ${
            isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-gray-200 text-black'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FaEdit className="text-blue-500" />
                <span>공지/행사 URL 업데이트</span>
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className={`p-1.5 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <FaTimes size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateNews} className="space-y-6">
              {editNewsList.map((item, idx) => (
                <div key={item.id} className={`p-4 rounded-2xl border ${
                  isDarkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-gray-50 border-gray-200'
                }`}>
                  <span className="text-[10px] font-black text-blue-500 block mb-3">슬롯 {idx + 1} ({item.icon})</span>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 mb-1">제목</label>
                      <input 
                        type="text"
                        required
                        value={item.title}
                        onChange={(e) => handleNewsFieldChange(idx, 'title', e.target.value)}
                        className={`w-full text-xs px-3 py-2 rounded-xl outline-none border transition-colors ${
                          isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 mb-1">설명</label>
                      <textarea 
                        required
                        rows={2}
                        value={item.desc}
                        onChange={(e) => handleNewsFieldChange(idx, 'desc', e.target.value)}
                        className={`w-full text-xs px-3 py-2 rounded-xl outline-none border transition-colors resize-none ${
                          isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 mb-1">출처 이동 URL (http:// 또는 https://)</label>
                      <input 
                        type="url"
                        required
                        value={item.url}
                        onChange={(e) => handleNewsFieldChange(idx, 'url', e.target.value)}
                        className={`w-full text-xs px-3 py-2 rounded-xl outline-none border transition-colors ${
                          isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-gray-300'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 font-bold py-3.5 rounded-xl text-xs text-white transition-all shadow-md mt-6 cursor-pointer"
              >
                정보 및 URL 업데이트 저장
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;
