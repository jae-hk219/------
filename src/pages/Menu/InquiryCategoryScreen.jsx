import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaWrench, FaCalculator, FaComments, FaChevronRight } from 'react-icons/fa';
import { useAppContext } from '../../context/AppContext';

const InquiryCategoryScreen = () => {
  const navigate = useNavigate();
  const { t, isDarkMode } = useAppContext();

  const categories = [
    {
      id: 'system',
      title: t('inquiry_type_sys'),
      desc: '앱 기능 오류, 시스템 장애, 버그 및 개선 요청',
      icon: <FaWrench className="text-amber-500" size={20} />
    },
    {
      id: 'formula',
      title: t('inquiry_type_formula'),
      desc: '실무 계산기에 추가하고 싶은 수식 및 공식 건의',
      icon: <FaCalculator className="text-blue-500" size={20} />
    },
    {
      id: 'general',
      title: t('inquiry_type_general'),
      desc: '제휴, 건의, 가입 및 기타 서비스 전반 문의',
      icon: <FaComments className="text-emerald-500" size={20} />
    }
  ];

  const handleSelect = (category) => {
    navigate(`/inquiry/form?category=${encodeURIComponent(category)}`);
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
          onClick={() => navigate('/menu')} 
          className={`mr-3 p-2 rounded-full cursor-pointer transition-colors ${
            isDarkMode ? 'hover:bg-zinc-800 text-white' : 'hover:bg-gray-100 text-gray-800'
          }`}
        >
          <FaChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">{t('inquiry_title')}</h1>
      </div>

      {/* Main Content */}
      <div className="p-4 flex-1 max-w-md mx-auto w-full pt-8">
        <p className={`text-xs font-medium mb-6 px-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
          원하시는 문의 유형을 선택해 주세요. 담당자 확인 후 신속히 조치해 드리겠습니다.
        </p>

        <div className="space-y-4">
          {categories.map((cat) => (
            <div 
              key={cat.id}
              onClick={() => handleSelect(cat.title)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-sm active:scale-[0.98] ${
                isDarkMode 
                  ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 text-white active:bg-zinc-900' 
                  : 'bg-white border-gray-100 hover:border-gray-200 text-black active:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  isDarkMode ? 'bg-zinc-950' : 'bg-gray-50'
                }`}>
                  {cat.icon}
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1 leading-tight">{cat.title}</h3>
                  <p className={`text-[11px] leading-tight ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                    {cat.desc}
                  </p>
                </div>
              </div>
              <FaChevronRight size={12} className={isDarkMode ? 'text-zinc-600' : 'text-gray-300'} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InquiryCategoryScreen;
