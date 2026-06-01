import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaPlus, FaBullhorn, FaTimes, FaCalendarAlt, FaUserShield } from 'react-icons/fa';
import { useAppContext } from '../../context/AppContext';

const NoticeScreen = () => {
  const navigate = useNavigate();
  const { currentUser, t, isDarkMode } = useAppContext();
  const [notices, setNotices] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  // Load notices from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('notices')) || [];
      setNotices(stored);
    } catch {
      setNotices([]);
    }
  }, []);

  const handleAddNotice = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newNotice = {
      id: Date.now(),
      title: newTitle.trim(),
      content: newContent.trim(),
      date: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      author: '관리자'
    };

    const updated = [newNotice, ...notices];
    localStorage.setItem('notices', JSON.stringify(updated));
    setNotices(updated);
    
    // Reset fields & close modal
    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
  };

  const handleDeleteNotice = (id) => {
    if (window.confirm('이 공지사항을 삭제하시겠습니까?')) {
      const updated = notices.filter(n => n.id !== id);
      localStorage.setItem('notices', JSON.stringify(updated));
      setNotices(updated);
    }
  };

  const isAdmin = currentUser?.id === 'admin';

  return (
    <div className={`flex flex-col h-full min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-black text-white' : 'bg-[#F5F5F5] text-black'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b transition-colors ${
        isDarkMode ? 'border-zinc-800 bg-zinc-950 text-white' : 'border-gray-200 bg-white text-black'
      } sticky top-0 z-10`}>
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/menu')} 
            className={`mr-3 p-2 rounded-full cursor-pointer transition-colors ${
              isDarkMode ? 'hover:bg-zinc-800 text-white' : 'hover:bg-gray-100 text-gray-800'
            }`}
          >
            <FaChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">{t('notice_title')}</h1>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 active:scale-95 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <FaPlus size={10} />
            <span>작성</span>
          </button>
        )}
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 pb-24 max-w-md mx-auto w-full flex flex-col justify-center">
        {notices.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in my-auto py-20">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
              isDarkMode ? 'bg-zinc-900 text-zinc-600' : 'bg-gray-200 text-gray-400'
            }`}>
              <FaBullhorn size={28} />
            </div>
            <p className={`text-base font-bold transition-colors ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
              {t('notice_empty')}
            </p>
          </div>
        ) : (
          <div className="flex-1 space-y-4 my-4">
            {notices.map(notice => (
              <div 
                key={notice.id}
                className={`p-5 rounded-2xl border transition-all shadow-sm ${
                  isDarkMode 
                    ? 'bg-zinc-900/60 border-zinc-800 text-white hover:border-zinc-700' 
                    : 'bg-white border-gray-100 text-black hover:border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs text-blue-500 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
                    <FaUserShield size={10} />
                    {notice.author}
                  </span>
                  {isAdmin && (
                    <button 
                      onClick={() => handleDeleteNotice(notice.id)}
                      className="text-red-500 hover:text-red-600 text-xs font-medium cursor-pointer"
                    >
                      {t('cancel')}
                    </button>
                  )}
                </div>
                <h2 className="font-bold text-base mb-2 leading-tight">{notice.title}</h2>
                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                  isDarkMode ? 'text-zinc-300' : 'text-gray-700'
                }`}>{notice.content}</p>
                <div className={`flex items-center text-[10px] mt-4 pt-3 border-t ${
                  isDarkMode ? 'border-zinc-800 text-zinc-500' : 'border-gray-100 text-gray-400'
                }`}>
                  <FaCalendarAlt size={10} className="mr-1.5" />
                  <span>{notice.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Notice Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-scale-up border transition-colors duration-300 ${
            isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-gray-200 text-black'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold flex items-center gap-2">
                <FaBullhorn className="text-blue-500" />
                <span>신규 공지사항 작성</span>
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className={`p-1.5 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <FaTimes size={16} />
              </button>
            </div>

            <form onSubmit={handleAddNotice} className="space-y-4">
              <div>
                <label className={`block text-[11px] font-bold mb-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>제목</label>
                <input 
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="공지사항 제목 입력"
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl outline-none border transition-colors ${
                    isDarkMode 
                      ? 'bg-zinc-900 border-zinc-800 text-white focus:border-zinc-700' 
                      : 'bg-[#F5F5F5] border-gray-200 text-black focus:border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>공지 내용</label>
                <textarea 
                  required
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="이곳에 공지할 핵심 내용을 상세히 적어주세요."
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl outline-none border transition-colors resize-none ${
                    isDarkMode 
                      ? 'bg-zinc-900 border-zinc-800 text-white focus:border-zinc-700' 
                      : 'bg-[#F5F5F5] border-gray-200 text-black focus:border-gray-300'
                  }`}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 font-bold py-3 rounded-xl text-xs text-white transition-all shadow-md mt-6 cursor-pointer"
              >
                공지사항 등록하기
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeScreen;
