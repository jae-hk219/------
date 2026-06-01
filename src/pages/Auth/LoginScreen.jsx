import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWrench, FaBolt, FaUser, FaLock, FaAddressCard, FaGraduationCap, FaChevronRight } from 'react-icons/fa';
import { useAppContext } from '../../context/AppContext';

const SPECIALTY_OPTIONS = [
  { value: '전기공사', label: '⚡ 전기공사' },
  { value: '배관공사', label: '🚰 배관공사' },
  { value: '일반공학', label: '⚙️ 일반공학' },
  { value: '기타', label: '🔧 기타 전문가' }
];

const LoginScreen = () => {
  const navigate = useNavigate();
  const { loginUser, t, isDarkMode } = useAppContext();
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
  
  // Fast Loading Overlay state
  const [showFastLoading, setShowFastLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  // Login Form States
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');

  // Signup Form States
  const [signupId, setSignupId] = useState('');
  const [signupPw, setSignupPw] = useState('');
  const [signupPwConfirm, setSignupPwConfirm] = useState('');
  const [signupNickname, setSignupNickname] = useState('');
  const [signupSpecialty, setSignupSpecialty] = useState('전기공사');

  // Trigger Toast Helper
  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 2500);
  };

  // Fast 1.5 second loading trigger
  const runFastLoading = (userData) => {
    setShowFastLoading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setLoadingProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        loginUser(userData);
        navigate('/home');
      }
    }, 120); // 1.2s total progress bar transition
  };

  // Handle Login Submission
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const id = loginId.trim();
    const pw = loginPw.trim();

    if (!id || !pw) {
      showToast('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    // Get registered users from localStorage
    const users = JSON.parse(localStorage.getItem('registered_users')) || [];
    
    // Find matching user
    const matchedUser = users.find(u => u.id === id && u.password === pw);

    if (matchedUser) {
      showToast('성공적으로 로그인되었습니다! 🎉', 'success');
      setTimeout(() => {
        runFastLoading({
          id: matchedUser.id,
          nickname: matchedUser.nickname,
          specialty: matchedUser.specialty,
          profileImage: matchedUser.profileImage || null
        });
      }, 500);
    } else {
      // Hardcoded fallback for first-time trial mock user
      if (id === 'admin' && pw === '1234') {
        const adminUser = { id: 'admin', nickname: '홍길동', specialty: '전기공사' };
        showToast('성공적으로 로그인되었습니다! 🎉', 'success');
        setTimeout(() => {
          runFastLoading(adminUser);
        }, 500);
      } else {
        showToast('일치하는 회원 정보가 없습니다. 아이디와 비밀번호를 확인해 주세요.');
      }
    }
  };

  // Handle Signup Submission
  const handleSignupSubmit = (e) => {
    e.preventDefault();
    const id = signupId.trim();
    const pw = signupPw.trim();
    const pwConfirm = signupPwConfirm.trim();
    const nickname = signupNickname.trim();

    if (!id || !pw || !pwConfirm || !nickname) {
      showToast('모든 항목을 올바르게 입력해 주세요.');
      return;
    }

    if (id.length < 4) {
      showToast('아이디는 4자 이상이어야 합니다.');
      return;
    }

    if (pw.length < 4) {
      showToast('비밀번호는 4자 이상이어야 합니다.');
      return;
    }

    if (pw !== pwConfirm) {
      showToast('비밀번호가 서로 일치하지 않습니다.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('registered_users')) || [];
    
    // Check duplication
    if (users.some(u => u.id === id)) {
      showToast('이미 사용 중인 아이디입니다.');
      return;
    }

    // Register user
    const newUser = { id, password: pw, nickname, specialty: signupSpecialty, profileImage: null };
    users.push(newUser);
    localStorage.setItem('registered_users', JSON.stringify(users));

    showToast('회원가입이 완료되었습니다! 로그인해 주세요. 👤', 'success');
    
    // Reset signup inputs
    setSignupId('');
    setSignupPw('');
    setSignupPwConfirm('');
    setSignupNickname('');
    
    // Switch to Login Tab
    setTimeout(() => {
      setActiveTab('login');
    }, 1200);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#131520] text-white font-sans relative overflow-hidden items-center justify-center p-6 w-full">
      
      {/* Toast Alert */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-5 py-3.5 rounded-2xl shadow-xl z-50 text-xs font-bold animate-fade-in whitespace-nowrap border ${
          toast.type === 'success' 
            ? 'bg-emerald-950 text-emerald-400 border-emerald-800' 
            : 'bg-red-950 text-red-400 border-red-900'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-20%] w-80 h-80 bg-blue-900 rounded-full blur-[100px] opacity-35 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-20%] w-80 h-80 bg-indigo-900 rounded-full blur-[100px] opacity-35 pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-sm flex flex-col items-center">
        
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center text-center mb-8 animate-fade-in">
          <div className="relative flex items-center justify-center w-20 h-20 mb-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl shadow-inner">
            <FaWrench className="text-zinc-600 absolute rotate-45" size={40} />
            <FaBolt className="text-[#FFEA00] absolute z-10" size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{t('app_title')}</h1>
          <p className="text-xs text-zinc-400 mt-1">{t('app_subtitle')}</p>
        </div>

        {/* Tab Controls */}
        <div className="w-full bg-zinc-900/80 border border-zinc-800/80 p-1 rounded-2xl flex mb-6 shadow-lg">
          <button 
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'login' 
                ? 'bg-zinc-800 text-white shadow' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t('login_tab')}
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === 'signup' 
                ? 'bg-zinc-800 text-white shadow' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t('signup_tab')}
          </button>
        </div>

        {/* Card Body */}
        <div className="w-full bg-zinc-900/40 border border-zinc-800/60 rounded-3xl p-6 shadow-2xl backdrop-blur-xl animate-scale-up">
          
          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <h2 className="text-sm font-bold text-zinc-300 mb-2">{t('login_prompt')}</h2>
              
              <div className="space-y-3">
                <div className="flex items-center bg-zinc-950/60 border border-zinc-800/80 rounded-xl px-3.5 py-2.5">
                  <FaUser className="text-zinc-500 mr-2.5 shrink-0" size={12} />
                  <input 
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder={t('login_id_placeholder')}
                    className="w-full text-xs outline-none bg-transparent text-white placeholder-zinc-500 font-medium"
                    autoFocus
                  />
                </div>

                <div className="flex items-center bg-zinc-950/60 border border-zinc-800/80 rounded-xl px-3.5 py-2.5">
                  <FaLock className="text-zinc-500 mr-2.5 shrink-0" size={12} />
                  <input 
                    type="password"
                    value={loginPw}
                    onChange={(e) => setLoginPw(e.target.value)}
                    placeholder={t('login_pw_placeholder')}
                    className="w-full text-xs outline-none bg-transparent text-white placeholder-zinc-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-zinc-400 px-1 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-blue-500" />
                  <span>{t('login_keep_signed')}</span>
                </label>
                <span className="hover:text-white cursor-pointer transition-colors">{t('login_find_pw')}</span>
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 font-bold py-3.5 rounded-xl text-xs transition-all shadow-lg shadow-blue-900/20 mt-4 cursor-pointer flex items-center justify-center gap-1"
              >
                <span>{t('login_btn')}</span>
                <FaChevronRight size={10} />
              </button>
            </form>
          )}

          {/* TAB 2: SIGNUP */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <h2 className="text-sm font-bold text-zinc-300 mb-2">{t('signup_prompt')}</h2>
              
              <div className="space-y-3">
                {/* ID */}
                <div>
                  <div className="flex items-center bg-zinc-950/60 border border-zinc-800/80 rounded-xl px-3.5 py-2.5">
                    <FaUser className="text-zinc-500 mr-2.5 shrink-0" size={12} />
                    <input 
                      type="text"
                      value={signupId}
                      onChange={(e) => setSignupId(e.target.value)}
                      placeholder={t('signup_id_placeholder')}
                      className="w-full text-xs outline-none bg-transparent text-white placeholder-zinc-500 font-medium"
                    />
                  </div>
                </div>

                {/* Nickname */}
                <div>
                  <div className="flex items-center bg-zinc-950/60 border border-zinc-800/80 rounded-xl px-3.5 py-2.5">
                    <FaAddressCard className="text-zinc-500 mr-2.5 shrink-0" size={12} />
                    <input 
                      type="text"
                      value={signupNickname}
                      onChange={(e) => setSignupNickname(e.target.value)}
                      placeholder={t('signup_nickname_placeholder')}
                      className="w-full text-xs outline-none bg-transparent text-white placeholder-zinc-500 font-medium"
                    />
                  </div>
                </div>

                {/* Specialty Dropdown */}
                <div>
                  <div className="flex items-center bg-zinc-950/60 border border-zinc-800/80 rounded-xl px-3.5 py-2">
                    <FaGraduationCap className="text-zinc-500 mr-2.5 shrink-0" size={12} />
                    <select
                      value={signupSpecialty}
                      onChange={(e) => setSignupSpecialty(e.target.value)}
                      className="w-full text-xs outline-none bg-transparent text-white font-medium cursor-pointer"
                      style={{ colorScheme: 'dark' }}
                    >
                      {SPECIALTY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[#1C1F2E] text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center bg-zinc-950/60 border border-zinc-800/80 rounded-xl px-3.5 py-2.5">
                    <FaLock className="text-zinc-500 mr-2.5 shrink-0" size={12} />
                    <input 
                      type="password"
                      value={signupPw}
                      onChange={(e) => setSignupPw(e.target.value)}
                      placeholder={t('signup_pw_placeholder')}
                      className="w-full text-xs outline-none bg-transparent text-white placeholder-zinc-500 font-medium"
                    />
                  </div>
                </div>

                {/* Password Confirm */}
                <div>
                  <div className="flex items-center bg-zinc-950/60 border border-zinc-800/80 rounded-xl px-3.5 py-2.5">
                    <FaLock className="text-zinc-500 mr-2.5 shrink-0" size={12} />
                    <input 
                      type="password"
                      value={signupPwConfirm}
                      onChange={(e) => setSignupPwConfirm(e.target.value)}
                      placeholder={t('signup_pw_confirm_placeholder')}
                      className="w-full text-xs outline-none bg-transparent text-white placeholder-zinc-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 font-bold py-3.5 rounded-xl text-xs transition-all shadow-lg shadow-purple-900/20 mt-4 cursor-pointer"
              >
                {t('signup_btn')}
              </button>
            </form>
          )}

        </div>
      </div>

      {/* ================= HIGH demand Fast Loading Overlay ================= */}
      {showFastLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0D0E15] backdrop-blur-md p-6 animate-fade-in">
          {/* Circular Spinner */}
          <div className="relative flex items-center justify-center w-24 h-24 mb-6">
            {/* outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-zinc-800"></div>
            {/* moving spinner */}
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-indigo-500 animate-spin"></div>
            {/* inner text */}
            <span className="text-xs font-black text-white">{loadingProgress}%</span>
          </div>

          <p className="text-sm font-bold text-white tracking-widest animate-pulse">
            현장 자원 및 데이터를 동기화하는 중...
          </p>
          <div className="w-48 bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-100 rounded-full"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;
