import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaSearch, FaEllipsisV, FaPen, FaCommentAlt, FaEyeSlash, FaSync, FaUserCircle, FaTimes, FaThumbsUp } from 'react-icons/fa';
import { useAppContext } from '../../context/AppContext';
import { getLocalPosts, syncPosts } from '../../services/communitySync';
import { getLocalUsers } from '../../services/authSync';

// Empty post database as requested: "지금 떠 있는 글들은 다 삭제하고 아무것도 없는 상태로 만들 것."
export const MOCK_POSTS = [];

const CATEGORIES = ['전체', '전기공사', '배관공사', '일반공학', '질문/답변'];

const CommunityScreen = () => {
  const navigate = useNavigate();
  const { notificationsEnabled, currentUser, t, isDarkMode } = useAppContext();
  const [activeCategory, setActiveCategory] = useState('전체');
  const [posts, setPosts] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState(null);

  // Load and sync posts
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setPosts(getLocalPosts());
      setRegisteredUsers(getLocalUsers());
    } catch (e) {
      console.error(e);
    }

    setIsSyncing(true);
    try {
      const synced = await syncPosts();
      setPosts(synced);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter posts based on category and notification setting
  const getVisiblePosts = () => {
    let list = [...posts];

    if (!notificationsEnabled) {
      // If notification setting is "끄기", block posts from other users
      list = list.filter(post => post.author === currentUser?.nickname || post.userId === currentUser?.id);
    }

    if (activeCategory !== '전체') {
      list = list.filter(post => post.category === activeCategory);
    }

    return list;
  };

  const visiblePosts = getVisiblePosts();

  return (
    <div className={`flex flex-col h-full min-h-screen pb-24 transition-colors duration-300 ${
      isDarkMode ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b sticky top-0 z-10 transition-colors ${
        isDarkMode ? 'border-zinc-800 bg-zinc-950 text-white' : 'border-gray-100 bg-white text-black'
      }`}>
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/home')} 
            className={`mr-3 p-1.5 rounded-full ${isDarkMode ? 'hover:bg-zinc-850' : 'hover:bg-gray-100'}`}
          >
            <FaChevronLeft size={20} />
          </button>
          <div>
            <span className="text-[10px] text-gray-500">{t('community_sub')}</span>
            <h1 className="text-base font-extrabold leading-tight flex items-center gap-1.5">
              <span>{t('community_title')}</span>
              {isSyncing && (
                <FaSync className="text-blue-500 animate-spin" size={11} title="동기화 중..." />
              )}
            </h1>
          </div>
        </div>
        <div className="flex space-x-4 text-gray-400">
          <button className="hover:text-blue-500 transition-colors"><FaSearch size={18} /></button>
          <button className="hover:text-blue-500 transition-colors"><FaEllipsisV size={18} /></button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className={`flex overflow-x-auto whitespace-nowrap border-b scrollbar-hide sticky top-[53px] z-10 px-2 transition-colors ${
        isDarkMode ? 'border-zinc-900 bg-zinc-950' : 'border-gray-100 bg-white'
      }`}>
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeCategory === category 
                ? 'border-blue-500 text-blue-500' 
                : (isDarkMode ? 'border-transparent text-zinc-500 hover:text-zinc-300' : 'border-transparent text-gray-400 hover:text-gray-600')
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Post List */}
      <div className={`flex-1 p-3 space-y-3 transition-colors ${
        isDarkMode ? 'bg-black' : 'bg-[#F5F5F5]'
      }`}>
        {!notificationsEnabled && (
          <div className={`p-4 rounded-2xl border text-center text-xs font-semibold ${
            isDarkMode ? 'bg-zinc-950 border-red-950/40 text-red-400' : 'bg-red-50 border-red-100 text-red-600'
          } animate-fade-in flex items-center justify-center gap-2 mb-3 shadow-inner`}>
            <FaEyeSlash size={14} />
            <span>알림 설정이 <b>끄기</b> 상태입니다. 타인의 모든 글이 수신 차단되었습니다.</span>
          </div>
        )}

        {visiblePosts.length === 0 ? (
          <div className="text-center py-20 animate-fade-in flex flex-col items-center justify-center">
            <FaEyeSlash size={36} className={isDarkMode ? 'text-zinc-800 mb-3' : 'text-gray-300 mb-3'} />
            <p className={`text-xs font-bold ${isDarkMode ? 'text-zinc-650' : 'text-gray-450'}`}>
              {t('community_empty')}
            </p>
          </div>
        ) : (
          visiblePosts.map(post => (
            <div 
              key={post.id} 
              onClick={() => navigate(`/community/${post.id}`)}
              className={`p-4 rounded-2xl border cursor-pointer active:scale-[0.99] transition-all shadow-sm ${
                isDarkMode 
                  ? 'bg-zinc-900/60 border-zinc-800 text-white hover:border-zinc-700' 
                  : 'bg-white border-gray-100 text-black hover:border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                  {post.category}
                </span>
                <span className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                  {post.time}
                </span>
              </div>
              <h2 className="font-bold text-sm mb-1.5 line-clamp-1">{post.title}</h2>
              <p className={`text-xs line-clamp-2 leading-relaxed mb-4 ${
                isDarkMode ? 'text-zinc-450' : 'text-gray-500 font-light'
              }`}>{post.content}</p>
              
              <div className={`flex items-center justify-between text-[10px] pt-3 border-t ${
                isDarkMode ? 'border-zinc-800/80 text-zinc-500' : 'border-gray-100 text-gray-400'
              }`}>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const userDetails = registeredUsers.find(u => u.id === post.userId) || { 
                      id: post.userId || 'guest', 
                      nickname: post.author, 
                      specialty: '일반 전문가', 
                      profileImage: null 
                    };
                    setSelectedAuthor(userDetails);
                  }}
                  className="flex items-center gap-1.5 hover:opacity-80 active:scale-95 transition-all text-left cursor-pointer"
                >
                  {(() => {
                    const userDetails = registeredUsers.find(u => u.id === post.userId);
                    const img = userDetails?.profileImage;
                    if (img) {
                      return (
                        <img src={img} alt="Profile" className="w-5 h-5 rounded-full object-cover border border-zinc-800/10 shrink-0" />
                      );
                    }
                    return (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gray-200 text-gray-500 shrink-0">
                        <FaUserCircle size={12} />
                      </div>
                    );
                  })()}
                  <span className="font-bold">{post.author}</span>
                </button>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-zinc-500/10 px-2.5 py-1 rounded-full">
                    <FaThumbsUp size={10} className="text-blue-500" />
                    <span className="font-semibold text-blue-500">
                      {post.likes || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-zinc-500/10 px-2.5 py-1 rounded-full">
                    <FaCommentAlt size={10} className="text-blue-500" />
                    <span className="font-semibold text-blue-500">
                      {(() => {
                        try {
                          const comments = JSON.parse(localStorage.getItem(`post_comments_${post.id}`)) || [];
                          return comments.length;
                        } catch {
                          return 0;
                        }
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button for post creation */}
      <button 
        onClick={() => navigate('/community/write')}
        className="fixed bottom-24 right-4 w-12 h-12 bg-blue-600 rounded-full shadow-lg flex flex-col items-center justify-center text-white z-40 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        title="글 쓰기"
      >
        <FaPen size={14} className="mb-0.5" />
        <span className="text-[9px] font-bold">{t('community_write')}</span>
      </button>

      {/* ================= AUTHOR PROFILE MODAL ================= */}
      {selectedAuthor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className={`w-full max-w-xs rounded-3xl p-6 shadow-2xl animate-scale-up border transition-colors ${
            isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-gray-200 text-black'
          }`}>
            <div className="flex justify-end">
              <button 
                onClick={() => setSelectedAuthor(null)}
                className={`p-1.5 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <FaTimes size={16} />
              </button>
            </div>

            <div className="flex flex-col items-center text-center mt-2 mb-4">
              {selectedAuthor.profileImage ? (
                <img 
                  src={selectedAuthor.profileImage} 
                  alt="Author Profile" 
                  className="w-16 h-16 rounded-full object-cover mb-4 border border-gray-300 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-200 text-gray-400 mb-4 shadow-inner">
                  <FaUserCircle size={44} />
                </div>
              )}

              <h3 className="text-base font-extrabold tracking-tight mb-1">
                {selectedAuthor.nickname || '익명'}
              </h3>
              
              <span className="text-[9px] font-black text-blue-500 bg-blue-500/10 px-2.5 py-0.5 rounded-full mb-6 uppercase tracking-wider">
                {selectedAuthor.specialty || '일반 전문가'}
              </span>

              <div className={`w-full p-3.5 rounded-2xl border text-xs font-semibold space-y-2 text-left leading-relaxed ${
                isDarkMode ? 'bg-zinc-900 border-zinc-850' : 'bg-gray-50 border-gray-100'
              }`}>
                <div className="flex justify-between border-b border-dashed border-zinc-800/15 pb-1.5">
                  <span className="opacity-60 text-[10px]">계정 아이디 (ID)</span>
                  <span className="font-extrabold">{selectedAuthor.id || 'guest'}</span>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span className="opacity-60 text-[10px]">전문 분야</span>
                  <span className="font-bold">{selectedAuthor.specialty || '미등록'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityScreen;
