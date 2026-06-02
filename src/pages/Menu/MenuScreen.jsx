import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaChevronLeft, FaChevronRight, FaUser, FaCamera, FaLock, 
  FaLanguage, FaMoon, FaBell, FaBullhorn, FaTimes, FaSignOutAlt, FaUserTimes 
} from 'react-icons/fa';
import { useAppContext } from '../../context/AppContext';
import { syncUsers, getLocalUsers, updateRemoteUser, deleteRemoteUser } from '../../services/authSync';

const MenuScreen = () => {
  const navigate = useNavigate();
  const { 
    currentUser, logoutUser, updateCurrentUser, 
    currentLanguage, setLanguage, 
    isDarkMode, toggleDarkMode,
    notificationsEnabled, setNotifications, t 
  } = useAppContext();

  const fileInputRef = useRef(null);

  // Modal States
  const [activeModal, setActiveModal] = useState(null); // 'password' | 'language' | 'notifications' | 'deleteConfirm' | 'deletePassword' | 'translating'
  
  // Local Temp States
  const [currentPwInput, setCurrentPwInput] = useState('');
  const [newPwInput, setNewPwInput] = useState('');
  const [pwStep, setPwStep] = useState(1); // 1: current, 2: new
  const [deletePwInput, setDeletePwInput] = useState('');
  const [selectedLangTemp, setSelectedLangTemp] = useState('');

  // Sync users on mount
  useEffect(() => {
    syncUsers().catch(err => console.warn('Menu screen sync warning:', err));
  }, []);

  // Handle Profile Photo Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 선택하실 수 있습니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      updateCurrentUser({ profileImage: base64Data });
    };
    reader.readAsDataURL(file);
  };

  // Logout Workflow
  const handleLogout = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      logoutUser();
      navigate('/login');
    }
  };

  // 1. Password Change Handlers
  const handleVerifyCurrentPw = (e) => {
    e.preventDefault();
    // Fetch registered users to verify password
    const users = getLocalUsers();
    const dbUser = users.find(u => u.id === currentUser?.id);
    
    // Check match (fallback is '1234' for admin mock user)
    const storedPw = dbUser ? dbUser.password : (currentUser?.id === 'admin' ? '1234' : '');

    if (currentPwInput === storedPw) {
      setPwStep(2);
    } else {
      alert(t('pw_incorrect'));
      closeAllModals();
    }
  };

  const handleUpdateNewPw = async (e) => {
    e.preventDefault();
    if (newPwInput.length < 4) {
      alert('비밀번호는 4자 이상이어야 합니다.');
      return;
    }

    try {
      await updateRemoteUser(currentUser?.id, { password: newPwInput });
      alert(t('pw_change_success'));
    } catch (err) {
      console.error(err);
    }
    closeAllModals();
  };

  // 2. Language & DeepL Reboot Handlers
  const handleLanguageChoice = (lang) => {
    setSelectedLangTemp(lang);
    if (window.confirm(t('confirm_lang_change'))) {
      setActiveModal('translating');
      setTimeout(() => {
        setLanguage(lang);
        window.location.reload();
      }, 1500); // 1.5 seconds spinner simulation for DeepL API
    }
  };

  // 3. Account Deletion Handlers
  const handleDeleteCheckPassword = async (e) => {
    e.preventDefault();
    const users = getLocalUsers();
    const dbUser = users.find(u => u.id === currentUser?.id);
    const storedPw = dbUser ? dbUser.password : (currentUser?.id === 'admin' ? '1234' : '');

    if (deletePwInput === storedPw) {
      // Success: Delete account
      try {
        await deleteRemoteUser(currentUser?.id);
        alert(t('delete_success'));
        logoutUser();
        navigate('/login');
      } catch (err) {
        console.error(err);
      }
    } else {
      // Incorrect PW: return quietly to menu screen as requested
      closeAllModals();
    }
  };

  const closeAllModals = () => {
    setActiveModal(null);
    setCurrentPwInput('');
    setNewPwInput('');
    setDeletePwInput('');
    setPwStep(1);
  };

  // Custom UI groups
  const menuGroups = [
    {
      title: t('group_ai'),
      items: [
        { 
          label: t('item_chat'), 
          rightElement: (
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full flex items-center gap-1 border border-indigo-100 shadow-sm shrink-0">
              {t('item_chat_sub')} <FaChevronRight size={8} />
            </span>
          ),
          onClick: () => navigate('/chat')
        },
      ]
    },
    {
      title: t('group_account'),
      items: [
        { 
          label: t('item_password'), 
          rightElement: <FaLock className={isDarkMode ? 'text-zinc-500' : 'text-gray-400'} />,
          onClick: () => {
            setPwStep(1);
            setActiveModal('password');
          }
        },
        { 
          label: t('item_language'), 
          rightElement: <span className={`text-xs font-bold flex items-center gap-2 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>{currentLanguage} <FaLanguage className="text-blue-500" size={16} /></span>,
          onClick: () => setActiveModal('language')
        },
      ]
    },
    {
      title: t('group_app'),
      items: [
        { 
          label: t('item_darkmode'), 
          rightElement: (
            <span className={`text-xs font-bold flex items-center gap-2 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
              {isDarkMode ? t('darkmode_active') : t('darkmode_inactive')} 
              <FaMoon className="text-yellow-500" />
            </span>
          ),
          onClick: toggleDarkMode
        },
        { 
          label: t('item_notifications'), 
          rightElement: (
            <span className={`text-xs font-bold flex items-center gap-2 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
              {notificationsEnabled ? t('yes') : t('no')} 
              <FaBell className="text-orange-500" />
            </span>
          ),
          onClick: () => setActiveModal('notifications')
        }
      ]
    },
    {
      title: t('group_info'),
      items: [
        { 
          label: t('item_notice'), 
          rightElement: <FaBullhorn className={isDarkMode ? 'text-zinc-500' : 'text-gray-400'} />,
          onClick: () => navigate('/notice')
        },
        { 
          label: t('item_inquiry'), 
          rightElement: <FaChevronRight className={isDarkMode ? 'text-zinc-500' : 'text-gray-400'} />,
          onClick: () => navigate('/inquiry')
        },
      ]
    }
  ];

  return (
    <div className={`flex flex-col h-full min-h-screen pb-24 transition-colors duration-300 ${
      isDarkMode ? 'bg-black text-white' : 'bg-[#F5F5F5] text-black'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b transition-colors ${
        isDarkMode ? 'border-zinc-800 bg-zinc-950 text-white' : 'border-gray-200 bg-white text-black'
      } sticky top-0 z-10`}>
        <button 
          onClick={() => navigate('/home')} 
          className={`p-2 rounded-full cursor-pointer transition-colors ${
            isDarkMode ? 'hover:bg-zinc-800 text-white' : 'hover:bg-gray-100 text-gray-800'
          }`}
        >
          <FaChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">{t('menu_title')}</h1>
        <div className="w-8"></div>
      </div>

      <div className="p-4 flex-grow max-w-md mx-auto w-full">
        {/* Profile Card */}
        <div className={`rounded-2xl p-5 flex items-center shadow-md mb-8 border transition-colors ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-800 border-zinc-700 text-white'
        }`}>
          {/* Hidden Image Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            className="hidden" 
            onChange={handleImageChange}
          />
          
          {/* Avatar Area with Instagram default silhouette style */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative w-14 h-14 rounded-full flex items-center justify-center mr-4 shrink-0 overflow-hidden cursor-pointer group transition-all border border-zinc-700 shadow-inner"
            title="프로필 사진 변경"
          >
            {currentUser?.profileImage ? (
              <img 
                src={currentUser.profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#E1E1E1] text-[#7F7F7F]">
                <FaUser size={24} className="mt-1.5" />
              </div>
            )}
            
            {/* Edit overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <FaCamera className="text-white" size={14} />
            </div>

            {/* Small camera badge at bottom-right */}
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-zinc-950 border border-zinc-700 rounded-full flex items-center justify-center shadow">
              <FaCamera className="text-zinc-400" size={8} />
            </div>
          </div>

          <div className="flex-grow">
            <h2 className="font-bold text-base mb-0.5">{currentUser?.nickname || t('menu_visitor')}</h2>
            <p className="text-zinc-400 text-xs">
              {t('menu_account_id')}: {currentUser?.id || 'guest'} · {currentUser?.specialty || t('menu_specialty')}
            </p>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-zinc-400 p-2 hover:text-white transition-colors cursor-pointer"
            title="프로필 사진 변경"
          >
            <FaChevronRight size={16} />
          </button>
        </div>

        {/* Menu Groups */}
        {menuGroups.map((group, idx) => (
          <div key={idx} className="mb-6">
            <h3 className={`text-xs font-bold mb-2 ml-2 tracking-wide ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
              {group.title}
            </h3>
            <div className={`rounded-2xl overflow-hidden border transition-colors shadow-sm ${
              isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-gray-100'
            }`}>
              {group.items.map((item, itemIdx) => (
                <div 
                  key={itemIdx}
                  onClick={item.onClick}
                  className={`flex items-center justify-between p-4 cursor-pointer active:opacity-75 transition-colors ${
                    isDarkMode 
                      ? 'bg-zinc-950 active:bg-zinc-900 border-zinc-900' 
                      : 'bg-white active:bg-gray-50 border-gray-100'
                  } ${itemIdx !== group.items.length - 1 ? 'border-b' : ''}`}
                >
                  <span className="font-semibold text-xs">{item.label}</span>
                  {item.rightElement}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Danger Zone */}
        <div className={`mt-8 rounded-2xl overflow-hidden border transition-colors shadow-sm ${
          isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-gray-100'
        }`}>
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 p-4 font-semibold text-xs border-b cursor-pointer active:opacity-75 transition-colors ${
              isDarkMode 
                ? 'bg-zinc-950 text-zinc-400 border-zinc-900 active:bg-zinc-900' 
                : 'bg-white text-gray-500 border-gray-100 active:bg-gray-50'
            }`}
          >
            <FaSignOutAlt className="text-zinc-400" size={14} />
            <span>{t('item_logout')}</span>
          </button>
          <button 
            onClick={() => setActiveModal('deleteConfirm')}
            className={`w-full flex items-center gap-3 p-4 font-semibold text-xs cursor-pointer active:opacity-75 transition-colors ${
              isDarkMode 
                ? 'bg-zinc-950 text-red-400 active:bg-zinc-900' 
                : 'bg-white text-red-500 active:bg-red-50'
            }`}
          >
            <FaUserTimes className="text-red-500" size={14} />
            <span>{t('item_delete_account')}</span>
          </button>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1. Password Change Modal */}
      {activeModal === 'password' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-scale-up border transition-colors ${
            isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-gray-200 text-black'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FaLock className="text-blue-500" />
                <span>{t('item_password')}</span>
              </h3>
              <button onClick={closeAllModals} className="p-1 text-zinc-500 hover:text-zinc-300">
                <FaTimes size={16} />
              </button>
            </div>

            {pwStep === 1 ? (
              <form onSubmit={handleVerifyCurrentPw} className="space-y-4">
                <p className="text-[11px] text-gray-400 font-bold mb-3">{t('pw_current_prompt')}</p>
                <input 
                  type="password"
                  required
                  value={currentPwInput}
                  onChange={(e) => setCurrentPwInput(e.target.value)}
                  placeholder="현재 비밀번호 입력"
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-[#F5F5F5] border-gray-200 text-black'
                  }`}
                  autoFocus
                />
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl mt-4 cursor-pointer"
                >
                  {t('confirm')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleUpdateNewPw} className="space-y-4">
                <p className="text-[11px] text-gray-400 font-bold mb-3">{t('pw_new_prompt')}</p>
                <input 
                  type="password"
                  required
                  value={newPwInput}
                  onChange={(e) => setNewPwInput(e.target.value)}
                  placeholder="신규 비밀번호 입력 (4자 이상)"
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border outline-none ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-[#F5F5F5] border-gray-200 text-black'
                  }`}
                  autoFocus
                />
                <button 
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl mt-4 cursor-pointer"
                >
                  {t('confirm')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. Language Selection Modal */}
      {activeModal === 'language' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-scale-up border transition-colors ${
            isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-gray-200 text-black'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FaLanguage className="text-blue-500" size={18} />
                <span>{t('item_language')}</span>
              </h3>
              <button onClick={closeAllModals} className="p-1 text-zinc-500 hover:text-zinc-300">
                <FaTimes size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {[
                '한국어', 'English', 'Español', 'العربية', '中文', 'Tiếng Việt', 'Bahasa Indonesia'
              ].map(lang => (
                <button 
                  key={lang}
                  onClick={() => handleLanguageChoice(lang)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    lang === currentLanguage
                      ? 'bg-blue-600 text-white'
                      : (isDarkMode ? 'hover:bg-zinc-900 text-zinc-300' : 'hover:bg-gray-100 text-gray-700')
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Notification Option Modal */}
      {activeModal === 'notifications' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-scale-up border transition-colors ${
            isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-gray-200 text-black'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FaBell className="text-orange-500" />
                <span>{t('item_notifications')}</span>
              </h3>
              <button onClick={closeAllModals} className="p-1 text-zinc-500 hover:text-zinc-300">
                <FaTimes size={16} />
              </button>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setNotifications(true);
                  closeAllModals();
                }}
                className={`flex-1 py-3 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  notificationsEnabled
                    ? 'bg-blue-600 text-white'
                    : (isDarkMode ? 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                }`}
              >
                켜기 (수신 허용)
              </button>
              <button 
                onClick={() => {
                  setNotifications(false);
                  closeAllModals();
                }}
                className={`flex-1 py-3 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  !notificationsEnabled
                    ? 'bg-zinc-700 text-white'
                    : (isDarkMode ? 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                }`}
              >
                끄기 (수신 거부)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Account Deletion: Step 1 Confirmation */}
      {activeModal === 'deleteConfirm' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-scale-up border transition-colors ${
            isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-gray-200 text-black'
          }`}>
            <div className="text-center mb-6">
              <FaUserTimes className="text-red-500 mx-auto mb-3" size={32} />
              <h3 className="text-sm font-bold">{t('delete_confirm')}</h3>
              <p className="text-[10px] text-gray-400 mt-2">
                이 작업은 되돌릴 수 없으며, 모든 계정 정보와 활동 내역이 즉시 영구 삭제됩니다.
              </p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={closeAllModals}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer ${
                  isDarkMode ? 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('no')} (취소)
              </button>
              <button 
                onClick={() => setActiveModal('deletePassword')}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              >
                {t('yes')} (탈퇴 진행)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Account Deletion: Step 2 Password Validation */}
      {activeModal === 'deletePassword' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-scale-up border transition-colors ${
            isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-gray-200 text-black'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold flex items-center gap-2 text-red-500">
                <FaUserTimes />
                <span>계정 비밀번호 확인</span>
              </h3>
              <button onClick={closeAllModals} className="p-1 text-zinc-500 hover:text-zinc-300">
                <FaTimes size={16} />
              </button>
            </div>

            <form onSubmit={handleDeleteCheckPassword} className="space-y-4">
              <p className="text-[11px] text-gray-400 font-bold mb-3">{t('delete_pw_prompt')}</p>
              <input 
                type="password"
                required
                value={deletePwInput}
                onChange={(e) => setDeletePwInput(e.target.value)}
                placeholder="비밀번호 입력"
                className={`w-full text-xs px-3.5 py-2.5 rounded-xl border outline-none ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-[#F5F5F5] border-gray-200 text-black'
                }`}
                autoFocus
              />

              <div className="flex gap-4 pt-2">
                <button 
                  type="button"
                  onClick={closeAllModals}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer ${
                    isDarkMode ? 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                >
                  {t('confirm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. DeepL APIs Simulator Spinner */}
      {activeModal === 'translating' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-xs font-bold text-white tracking-wide animate-pulse">
            {t('translating_spinner')}
          </p>
        </div>
      )}
    </div>
  );
};

export default MenuScreen;

