import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaPen, FaFileAlt } from 'react-icons/fa';
import { useAppContext } from '../../context/AppContext';

const CATEGORIES = ['전기공사', '배관공사', '일반공학', '질문/답변'];

const CommunityWriteScreen = () => {
  const navigate = useNavigate();
  const { currentUser, t, isDarkMode } = useAppContext();

  const [category, setCategory] = useState('전기공사');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newPost = {
      id: Date.now(),
      category,
      title: title.trim(),
      content: content.trim(),
      time: '방금 전',
      author: currentUser?.nickname || '익명',
      userId: currentUser?.id || 'guest',
      likes: 0,
      dislikes: 0,
      createdAt: new Date().toISOString()
    };

    try {
      const existing = JSON.parse(localStorage.getItem('custom_posts')) || [];
      const updated = [newPost, ...existing];
      localStorage.setItem('custom_posts', JSON.stringify(updated));
      navigate('/community');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`flex flex-col h-full min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-black text-white' : 'bg-[#F5F5F5] text-black'
    }`}>
      {/* Header */}
      <div className={`flex items-center p-4 border-b transition-colors ${
        isDarkMode ? 'border-zinc-800 bg-zinc-950 text-white' : 'border-gray-200 bg-white text-black'
      } sticky top-0 z-10`}>
        <button 
          onClick={() => navigate(-1)} 
          className={`mr-3 p-2 rounded-full cursor-pointer transition-colors ${
            isDarkMode ? 'hover:bg-zinc-800 text-white' : 'hover:bg-gray-100 text-gray-800'
          }`}
        >
          <FaChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">소통방 글 쓰기</h1>
      </div>

      {/* Main Form */}
      <div className="p-4 flex-grow max-w-md mx-auto w-full pt-6 pb-24">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category selection chips */}
          <div>
            <label className={`block text-[11px] font-bold mb-2.5 ${isDarkMode ? 'text-zinc-450' : 'text-gray-500'}`}>
              카테고리 선택
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-blue-600 text-white shadow-md'
                      : (isDarkMode 
                        ? 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-300' 
                        : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-800')
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className={`block text-[11px] font-bold mb-1.5 ${isDarkMode ? 'text-zinc-455' : 'text-gray-500'}`}>
              제목
            </label>
            <div className="relative">
              <input 
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="어떤 이야기를 공유하고 싶으신가요?"
                maxLength={80}
                className={`w-full text-xs px-4 py-3 rounded-xl border outline-none font-semibold transition-colors ${
                  isDarkMode 
                    ? 'bg-zinc-900 border-zinc-800 text-white focus:border-zinc-700' 
                    : 'bg-white border-gray-200 text-black focus:border-gray-300'
                }`}
              />
            </div>
          </div>

          {/* Content Input */}
          <div>
            <label className={`block text-[11px] font-bold mb-1.5 ${isDarkMode ? 'text-zinc-455' : 'text-gray-500'}`}>
              상세 내용 기재
            </label>
            <textarea 
              required
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 정성스럽게 작성해 주세요. (타인에 대한 모욕이나 부적절한 게시글은 제재될 수 있습니다.)"
              className={`w-full text-xs px-4 py-3.5 rounded-xl border outline-none leading-relaxed resize-none transition-colors ${
                isDarkMode 
                  ? 'bg-zinc-900 border-zinc-800 text-white focus:border-zinc-700' 
                  : 'bg-white border-gray-200 text-black focus:border-gray-300'
              }`}
            />
          </div>

          {/* Submit button */}
          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 font-bold py-3.5 rounded-xl text-xs text-white transition-all shadow-md mt-6 cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <FaPen size={12} />
            <span>작성 완료하여 등록하기</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommunityWriteScreen;
