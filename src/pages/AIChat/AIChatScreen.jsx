import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaRobot, FaPaperPlane, FaChevronLeft, FaTrashAlt, FaKey, FaTimes, FaEye, FaEyeSlash, FaCog } from 'react-icons/fa';
import { askAI } from '../../services/api';

const CATEGORY_MAP = {
  all: { label: '전체', icon: '🤖', welcome: '안녕하세요! 현장링크 AI 비서입니다. 전기공사, 배관공사, 일반공학 등 현장에서 필요한 어떤 질문이든 편하게 물어보세요! 🛠️' },
  electric: { label: '전기공사', icon: '⚡', welcome: '전기공사 전용 AI 비서입니다. 회로 설계, 허용 전류 규격, 전선 선정, 안전 수칙 등에 대해 도움을 드릴 수 있습니다. ⚡ 무엇이 궁금하신가요?' },
  plumbing: { label: '배관공사', icon: '🚰', welcome: '배관공사 전용 AI 비서입니다. 배관 유량/유속 계산, 압력 손실, 배관 자재 선정, 펌프 동력 등에 대해 답변해 드릴 수 있습니다. 🚰 질문해 주세요!' },
  engineering: { label: '일반공학', icon: '⚙️', welcome: '일반공학 전용 AI 비서입니다. 단위 변환, 도형의 면적/부피 계산, 재료 중량 및 물리량(토크, 속도) 계산에 대해 도와드릴 수 있습니다. ⚙️ 질문해 주세요!' }
};

const SUGGESTIONS = {
  all: [
    '전기선 굵기 기준은 어떻게 되나요?',
    '배관 유량 계산 공식 알려줘',
    '콘크리트 비중 측정법이 궁금해요'
  ],
  electric: [
    'KEC 허용전류 표에 대해 알려줘',
    '전압강하 공식이 어떻게 돼?',
    '3상 3선식 전력 계산법'
  ],
  plumbing: [
    '배관 압력 손실 계산 공식은?',
    '펌프 소요 마력 계산법',
    'PEX 파이프 설치 기준'
  ],
  engineering: [
    '토크(Torque) 계산 공식',
    '인치(inch)에서 센티미터(cm) 변환',
    '철판 무게 계산식'
  ]
};

const GEMINI_MODELS = [
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash (최신/추천)' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite (부하 낮음/속도 최상 ⚡)' },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash (표준)' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (구버전)' },
  { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro (고성능 추론)' }
];

const AIChatScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const initialCategory = location.state?.category && CATEGORY_MAP[location.state.category]
    ? location.state.category
    : 'all';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // API Key States
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [keyInput, setKeyInput] = useState('');
  const [showKeyText, setShowKeyText] = useState(false);
  const [showKeyManager, setShowKeyManager] = useState(false);
  
  // Model Select State
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('gemini_model') || 'gemini-3.5-flash');
  
  const messagesEndRef = useRef(null);

  // Initialize welcome message when category changes (only if key is set)
  useEffect(() => {
    if (apiKey) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: CATEGORY_MAP[activeCategory].welcome,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [activeCategory, apiKey]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // --- API Key Setup Handler ---
  const handleActivateKey = (e) => {
    e.preventDefault();
    const cleanKey = keyInput.trim();
    if (!cleanKey) return;
    localStorage.setItem('gemini_api_key', cleanKey);
    localStorage.setItem('gemini_model', selectedModel);
    setApiKey(cleanKey);
    setKeyInput('');
    setShowKeyText(false);
  };

  const handleRemoveKey = () => {
    if (window.confirm('Gemini API Key를 삭제하시겠습니까? 대화 기록도 함께 초기화됩니다.')) {
      localStorage.removeItem('gemini_api_key');
      setApiKey('');
      setMessages([]);
      setShowKeyManager(false);
    }
  };

  const handleModelChange = (modelId) => {
    setSelectedModel(modelId);
    localStorage.setItem('gemini_model', modelId);
  };

  // --- Chat Handlers ---
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim() || !apiKey) return;

    if (!textToSend) {
      setInputValue('');
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      time: timestamp
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const responseText = await askAI(text, apiKey, activeCategory, selectedModel);

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      let friendlyError = error.message;
      if (error.message.includes('not found for API version')) {
        friendlyError = `${selectedModel} 모델이 지원되지 않거나 현재 API 버전에서 활성화되지 않았습니다. 상단의 모델 설정에서 'Gemini 3.5 Flash' 또는 다른 모델로 변경해 보세요.`;
      } else if (
        error.message.includes('high demand') ||
        error.message.includes('ResourceExhausted') ||
        error.message.includes('quota') ||
        error.message.includes('429') ||
        error.message.includes('503')
      ) {
        friendlyError = `현재 ${selectedModel} 모델에 일시적으로 구글 서버 트래픽 부하가 몰려 응답이 제한되었습니다(또는 무료 API Key 할당량 초과). \n\n💡 해결 방법:\n1. 화면 오른쪽 상단의 ⚙️ 설정을 클릭해 서버 부하가 가장 적고 빠른 'Gemini 3.1 Flash Lite (부하 낮음/속도 최상 ⚡)' 모델로 변경해 보세요! 대화가 즉시 재개됩니다.\n2. 잠시 후(3~5초 후) 다시 질문을 보내주셔도 정상 작동합니다.`;
      }
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: '❌ 오류가 발생했습니다:\n\n' + friendlyError,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('대화 기록을 모두 지우시겠습니까?')) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: CATEGORY_MAP[activeCategory].welcome,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  // --- Markdown-like renderer ---
  const renderMessageText = (text) => {
    return text.split('\n').map((line, i) => {
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-bold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      return (
        <span key={i} className="block min-h-[1.2rem]">
          {parts.length > 0 ? parts : line}
        </span>
      );
    });
  };

  // =============================================
  // RENDER: API Key Setup Screen (no key stored)
  // =============================================
  if (!apiKey) {
    return (
      <div className="flex flex-col h-full bg-[#F5F5F5] min-h-screen">
        {/* Header */}
        <div className="flex items-center p-4 border-b border-gray-200 bg-white">
          <button onClick={() => navigate('/home')} className="mr-2.5 text-gray-700 p-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <FaChevronLeft size={16} />
          </button>
          <div>
            <span className="text-[10px] text-gray-500 font-medium">현장링크 AI 비서</span>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">스마트 Gemini 질문방</h1>
          </div>
        </div>

        {/* Setup Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 w-full max-w-sm text-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg">
              <FaRobot className="text-white" size={36} />
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-2">Gemini API 연동</h2>
            <p className="text-xs text-gray-500 leading-relaxed mb-5">
              실시간 AI 비서와 대화하려면 Gemini API Key를 입력해 주세요.<br />
              입력하신 키는 이 브라우저에만 안전하게 보관됩니다.
            </p>

            <form onSubmit={handleActivateKey} className="space-y-4">
              {/* Model Select */}
              <div className="text-left">
                <label className="block text-[10px] font-bold text-gray-600 mb-1 ml-1">연동할 Gemini 모델</label>
                <select
                  value={selectedModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none text-gray-700 cursor-pointer font-medium"
                >
                  {GEMINI_MODELS.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* API Key Input */}
              <div className="text-left">
                <label className="block text-[10px] font-bold text-gray-600 mb-1 ml-1">Gemini API Key</label>
                <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                  <FaKey className="text-gray-400 mr-2 shrink-0" size={12} />
                  <input 
                    type={showKeyText ? 'text' : 'password'}
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="AIzaSy... Gemini API Key 입력"
                    className="w-full text-xs outline-none bg-transparent text-gray-800 pr-8"
                    autoFocus
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowKeyText(!showKeyText)} 
                    className="absolute right-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showKeyText ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={!keyInput.trim()}
                className={`w-full font-bold py-3 rounded-xl text-sm transition-all cursor-pointer ${
                  keyInput.trim()
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90 shadow-md'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                🔑 연동하고 대화 시작하기
              </button>
            </form>

            <p className="text-[10px] text-gray-400 mt-5 leading-relaxed">
              API Key는 <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline font-semibold">Google AI Studio</a>에서 쉽게 무료로 발급받을 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =============================================
  // RENDER: Chat Interface (key is stored)
  // =============================================
  return (
    <div className="flex flex-col h-full bg-[#F5F5F5] min-h-screen relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-30">
        <div className="flex items-center">
          <button onClick={() => navigate('/home')} className="mr-2.5 text-gray-700 p-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <FaChevronLeft size={16} />
          </button>
          <div>
            <span className="text-[10px] text-gray-500 font-medium">현장링크 AI 비서</span>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">스마트 Gemini 질문방</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          {/* Gemini active badge with Settings Icon */}
          <button 
            onClick={() => setShowKeyManager(!showKeyManager)}
            className="px-2 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 transition-all cursor-pointer shadow-sm bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
            title="모델 및 API Key 설정"
          >
            <FaCog size={9} />
            <span>{GEMINI_MODELS.find(m => m.id === selectedModel)?.name.split(' (')[0] || selectedModel}</span>
          </button>

          <button 
            onClick={handleClearChat}
            className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
            title="대화 지우기"
          >
            <FaTrashAlt size={14} />
          </button>
        </div>
      </div>

      {/* Settings / Key Manager Dropdown */}
      {showKeyManager && (
        <div className="bg-white border-b border-gray-200 p-4 shadow-md sticky top-[57px] z-20 animate-fade-in space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <FaCog className="text-indigo-500" size={12} />
              AI 모델 및 API Key 설정
            </h3>
            <button onClick={() => setShowKeyManager(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <FaTimes size={14} />
            </button>
          </div>

          {/* Model Switcher */}
          <div>
            <label className="block text-[10px] font-bold text-gray-600 mb-1">사용할 AI 모델 변경</label>
            <select
              value={selectedModel}
              onChange={(e) => handleModelChange(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs outline-none text-gray-700 cursor-pointer font-medium"
            >
              {GEMINI_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-1">
            <button 
              onClick={handleRemoveKey}
              className="w-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-semibold py-2 rounded-xl text-xs transition-colors cursor-pointer"
            >
              🔑 Gemini API Key 삭제 및 연결 해제
            </button>
          </div>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex bg-white px-4 py-2 gap-2 border-b border-gray-100 shadow-sm sticky top-[57px] z-10 overflow-x-auto scrollbar-hide">
        {Object.entries(CATEGORY_MAP).map(([key, data]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 shadow-sm border cursor-pointer ${
              activeCategory === key
                ? 'bg-zinc-900 text-white border-zinc-900'
                : 'bg-zinc-50 text-gray-600 border-zinc-200 hover:bg-gray-100'
            }`}
          >
            <span>{data.icon}</span>
            <span>{data.label}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2 shadow-sm shrink-0">
                <FaRobot size={16} />
              </div>
            )}
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-xs leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-zinc-950 text-white rounded-tr-none'
                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
            }`}>
              <div className="space-y-1">
                {renderMessageText(msg.text)}
              </div>
              <div className={`text-[9px] mt-1 text-right ${
                msg.sender === 'user' ? 'text-zinc-400' : 'text-gray-400'
              }`}>
                {msg.time}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2 shrink-0">
              <FaRobot size={16} />
            </div>
            <div className="bg-white text-gray-500 border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 text-[10px] flex items-center gap-2 shadow-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span>{GEMINI_MODELS.find(m => m.id === selectedModel)?.name.split(' (')[0] || selectedModel} 답변 작성 중...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input & Suggestions Footer */}
      <div className="fixed bottom-16 w-full max-w-md bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pt-4 pb-2 px-4 z-10">
        {/* Quick Suggestions */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
          {SUGGESTIONS[activeCategory].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSendMessage(suggestion)}
              className="bg-white border border-gray-200 text-gray-600 rounded-full px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-zinc-50 active:bg-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              💡 {suggestion}
            </button>
          ))}
        </div>

        {/* Message Input */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center bg-white border border-gray-200 rounded-2xl p-1.5 shadow-md"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`${CATEGORY_MAP[activeCategory].label} 관련 질문을 적어주세요...`}
            className="flex-1 bg-transparent px-3 py-2 text-xs outline-none text-gray-800 placeholder-gray-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all cursor-pointer ${
              inputValue.trim() && !isLoading
                ? 'bg-zinc-950 hover:bg-zinc-800 shadow'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <FaPaperPlane size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChatScreen;
