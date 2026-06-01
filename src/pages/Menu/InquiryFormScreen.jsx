import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaChevronLeft, FaPaperPlane, FaEdit } from 'react-icons/fa';
import { useAppContext } from '../../context/AppContext';

const InquiryFormScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, isDarkMode, currentUser } = useAppContext();

  const category = searchParams.get('category') || t('inquiry_type_general');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) return;

    const newInquiry = {
      id: Date.now(),
      category,
      subject: subject.trim(),
      content: content.trim(),
      user: currentUser?.nickname || '익명 사용자',
      userId: currentUser?.id || 'guest',
      date: new Date().toLocaleString('ko-KR')
    };

    try {
      const existing = JSON.parse(localStorage.getItem('inquiries')) || [];
      existing.push(newInquiry);
      localStorage.setItem('inquiries', JSON.stringify(existing));

      // Trigger notification for admin if a non-admin submits
      if (currentUser?.id !== 'admin') {
        localStorage.setItem('has_new_inquiry', 'true');
        localStorage.setItem('new_inquiry_category', category);
      }
    } catch (err) {
      console.error(err);
    }

    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      navigate('/menu');
    }, 2000);
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
        <h1 className="text-lg font-bold">{t('inquiry_form_title')}</h1>
      </div>

      {/* Main Content */}
      <div className="p-4 flex-1 max-w-md mx-auto w-full pt-6 pb-24">
        {/* Category Info Badge */}
        <div className={`mb-6 p-4 rounded-2xl border ${
          isDarkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-gray-100'
        }`}>
          <span className="text-[10px] text-gray-400 font-bold block mb-1">선택된 문의 유형</span>
          <span className="text-xs font-extrabold text-blue-500">{category}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={`block text-[11px] font-bold mb-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
              제목
            </label>
            <input 
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('inquiry_subject_placeholder')}
              className={`w-full text-xs px-3.5 py-3 rounded-xl outline-none border transition-colors ${
                isDarkMode 
                  ? 'bg-zinc-900 border-zinc-800 text-white focus:border-zinc-700' 
                  : 'bg-white border-gray-200 text-black focus:border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className={`block text-[11px] font-bold mb-1.5 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
              문의 상세 내용
            </label>
            <textarea 
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('inquiry_content_placeholder')}
              className={`w-full text-xs px-3.5 py-3 rounded-xl outline-none border transition-colors resize-none leading-relaxed ${
                isDarkMode 
                  ? 'bg-zinc-900 border-zinc-800 text-white focus:border-zinc-700' 
                  : 'bg-white border-gray-200 text-black focus:border-gray-300'
              }`}
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 font-bold py-3.5 rounded-xl text-xs text-white transition-all shadow-md mt-8 cursor-pointer flex items-center justify-center gap-2"
          >
            <FaPaperPlane size={12} />
            <span>{t('inquiry_submit')}</span>
          </button>
        </form>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white text-xs font-bold px-6 py-4 rounded-2xl z-50 animate-fade-in shadow-2xl max-w-xs text-center border border-zinc-800">
          <div className="mb-2 flex justify-center">
            <FaEdit className="text-emerald-400" size={24} />
          </div>
          {t('inquiry_success')}
        </div>
      )}
    </div>
  );
};

export default InquiryFormScreen;
