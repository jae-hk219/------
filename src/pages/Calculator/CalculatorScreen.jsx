import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaSearch, FaChevronLeft, FaBolt, FaTint, FaCog, FaCalculator } from 'react-icons/fa';
import { performCalculation } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const CALCULATOR_DATA = {
  electric: {
    title: '전기공사 계산기',
    subtitle: '회로, 부하, 안전규칙 계산',
    icon: <FaBolt size={40} className="text-zinc-650" />,
    color: 'bg-yellow-500',
    list: [
      { id: 'e1', name: '허용전류 및 전선 단면적 선정', iconText: 'I', inputs: ['전압 (V)', '전류 (A)', '길이 (m)'], formula: (vals) => `추천 전선 단면적: ${(vals[1] * 1.5).toFixed(2)} sq` },
      { id: 'e2', name: '전압강하 계산', iconText: 'ΔV', inputs: ['전류 (A)', '저항 (Ω)'], formula: (vals) => `전압 강하: ${(vals[0] * vals[1]).toFixed(2)} V` },
      { id: 'e3', name: '전력 계산 (단상/3상)', iconText: 'W', inputs: ['전압 (V)', '전류 (A)', '역률'], formula: (vals) => `유효 전력: ${(vals[0] * vals[1] * vals[2]).toFixed(2)} W` },
    ]
  },
  plumbing: {
    title: '배관공사 계산기',
    subtitle: '유량, 압력, 자재 계산',
    icon: <FaTint size={40} className="text-zinc-650" />,
    color: 'bg-blue-400',
    list: [
      { id: 'p1', name: '배관 유량 및 유속 계산', iconText: 'Q', inputs: ['관경 (mm)', '유속 (m/s)'], formula: (vals) => `유량: ${(Math.PI * Math.pow(vals[0]/2000, 2) * vals[1] * 3600).toFixed(2)} m³/h` },
      { id: 'p2', name: '배관 압력 손실 계산', iconText: 'ΔP', inputs: ['마찰계수', '길이 (m)'], formula: (vals) => `압력 손실: ${(vals[0] * vals[1]).toFixed(2)} bar` },
      { id: 'p3', name: '펌프 양정 및 소요 동력 계산', iconText: 'HP', inputs: ['유량 (m³/h)', '전양정 (m)'], formula: (vals) => `소요 동력: ${(vals[0] * vals[1] / 367).toFixed(2)} kW` },
    ]
  },
  engineering: {
    title: '일반공학 계산기',
    subtitle: '역학, 정역학, 유틸리티 도구',
    icon: <FaCog size={40} className="text-zinc-650" />,
    color: 'bg-emerald-500',
    list: [
      { id: 'en1', name: '단위 변환기 (길이/무게/압력 등)', iconText: 'U', inputs: ['값 입력'], formula: (vals) => `변환 결과: ${vals[0] * 2.54} cm (inch 변환 예시)` },
      { id: 'en2', name: '기하학 계산 (도형 면적 및 입체 부피)', iconText: 'A', inputs: ['반지름 (r)'], formula: (vals) => `면적: ${(Math.PI * Math.pow(vals[0], 2)).toFixed(2)}` },
      { id: 'en3', name: '재료 중량 계산 (철판/파이프/콘크리트)', iconText: 'Kg', inputs: ['부피 (m³)', '비중'], formula: (vals) => `중량: ${(vals[0] * vals[1]).toFixed(2)} kg` },
      { id: 'en4', name: '물리량 계산 (토크, 모멘트, 속도)', iconText: 'T', inputs: ['힘 (N)', '거리 (m)'], formula: (vals) => `토크: ${(vals[0] * vals[1]).toFixed(2)} Nm` },
    ]
  },
  math: {
    title: '실생활 계산기',
    subtitle: '단위 변환, 퍼센트, 기본계산',
    icon: <FaCalculator size={40} className="text-zinc-650" />,
    color: 'bg-zinc-500',
    list: [
      { id: 'm1', name: '수학 기초 (분수, 백분율, 비례식)', iconText: '%', inputs: ['전체 값', '부분 값'], formula: (vals) => `비율: ${(vals[1] / vals[0] * 100).toFixed(2)} %` },
    ]
  }
};

// Helpers to track view count
const incrementViewCount = (calcId) => {
  try {
    const views = JSON.parse(localStorage.getItem('calculation_views')) || {};
    views[calcId] = (views[calcId] || 0) + 1;
    localStorage.setItem('calculation_views', JSON.stringify(views));
    return views[calcId];
  } catch (e) {
    console.error(e);
    return 1;
  }
};

const CalculatorScreen = () => {
  const location = useLocation();
  const { isDarkMode } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState(location.state?.category || null); // null means Home 4-boxes
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [selectedCalc, setSelectedCalc] = useState(null);

  // Form State
  const [inputValues, setInputValues] = useState({});
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  // Handle Location State (Recovery and populating from History)
  useEffect(() => {
    if (location.state?.calcId) {
      const cat = location.state.category;
      const cid = location.state.calcId;
      const catData = CALCULATOR_DATA[cat];
      if (catData) {
        const foundCalc = catData.list.find(c => c.id === cid);
        if (foundCalc) {
          setSelectedCategory(cat);
          setViewMode('detail');
          setSelectedCalc(foundCalc);
          setInputValues(location.state.inputValues || {});
          setResult(location.state.result || null);
          setErrorMsg('');
          
          // Increment and set view count
          const newCount = incrementViewCount(cid);
          setViewCount(newCount);
        }
      }
    }
  }, [location.state]);

  const handleCategorySelect = (key) => {
    setSelectedCategory(key);
    setViewMode('list');
    setSelectedCalc(null);
  };

  const handleCalcSelect = (calc) => {
    setSelectedCalc(calc);
    setViewMode('detail');
    setInputValues({});
    setResult(null);
    setErrorMsg('');

    // Increment and set view count
    const newCount = incrementViewCount(calc.id);
    setViewCount(newCount);
  };

  const handleBack = () => {
    if (viewMode === 'detail') {
      setViewMode('list');
      setSelectedCalc(null);
    } else {
      setSelectedCategory(null);
    }
  };

  const handleCalculate = async () => {
    const vals = selectedCalc.inputs.map((_, idx) => parseFloat(inputValues[idx]));
    if (vals.some(isNaN)) {
      setErrorMsg('모든 현장 데이터를 올바르게 입력해 주세요');
      setResult(null);
    } else {
      setErrorMsg('');
      setIsCalculating(true);
      try {
        const apiResult = await performCalculation(selectedCalc.id, vals, selectedCalc.formula);
        setResult(apiResult);

        // Record history logs
        try {
          const records = JSON.parse(localStorage.getItem('calculation_records')) || [];
          const newRecord = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            category: selectedCategory,
            categoryName: CALCULATOR_DATA[selectedCategory]?.title || '',
            calcId: selectedCalc.id,
            calcName: selectedCalc.name,
            inputs: selectedCalc.inputs,
            inputValues: inputValues,
            result: apiResult,
            timestamp: new Date().toISOString(),
            memo: ''
          };
          records.unshift(newRecord);
          localStorage.setItem('calculation_records', JSON.stringify(records));
        } catch (err) {
          console.error("Failed to write to calculation_records:", err);
        }

      } catch (e) {
        setErrorMsg(e.message);
      } finally {
        setIsCalculating(false);
      }
    }
  };

  if (!selectedCategory) {
    // Main 4 Boxes Screen
    return (
      <div className={`flex flex-col h-full min-h-screen pb-24 p-4 transition-colors duration-300 ${
        isDarkMode ? 'bg-black text-white' : 'bg-[#F5F5F5] text-black'
      }`}>
        {/* Search Bar */}
        <div className={`rounded-2xl p-3.5 flex items-center mb-8 mt-2 border transition-colors ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-200 border-zinc-300 text-gray-700'
        }`}>
          <FaSearch className="text-gray-500 mr-2 shrink-0" size={18} />
          <input 
            type="text" 
            placeholder="수식, 주제, 또는 AI 검색" 
            className="w-full outline-none text-xs bg-transparent placeholder-zinc-500 font-medium"
          />
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(CALCULATOR_DATA).map(([key, data]) => (
            <button 
              key={key} 
              onClick={() => handleCategorySelect(key)}
              className={`rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-sm border transition-all cursor-pointer active:scale-95 duration-200 aspect-square ${
                isDarkMode 
                  ? 'bg-zinc-900/60 border-zinc-850 hover:border-zinc-800 text-white' 
                  : 'bg-white border-gray-100 hover:border-gray-200 text-black'
              }`}
              style={{ borderRadius: '15%' }}
            >
              <div className={`mb-4 p-2 rounded-2xl ${isDarkMode ? 'bg-zinc-850' : 'bg-gray-50'}`}>{data.icon}</div>
              <h3 className="font-extrabold text-[14px] mb-1 tracking-tight">{data.title}</h3>
              <p className={`text-[10px] font-light leading-tight ${isDarkMode ? 'text-zinc-450' : 'text-gray-500'}`}>{data.subtitle}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const currentCategoryData = CALCULATOR_DATA[selectedCategory];

  return (
    <div className={`flex flex-col h-full min-h-screen pb-24 transition-colors duration-300 ${
      isDarkMode ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Header */}
      <div className={`flex items-center p-4 border-b sticky top-0 z-10 transition-colors ${
        isDarkMode ? 'border-zinc-800 bg-zinc-950 text-white' : 'border-zinc-200 bg-white text-black'
      }`}>
        <button 
          onClick={handleBack} 
          className={`mr-3 p-1.5 rounded-full ${isDarkMode ? 'hover:bg-zinc-850 text-white' : 'hover:bg-gray-100 text-black'}`}
        >
          <FaChevronLeft size={20} />
        </button>
        <h1 className="text-base font-extrabold tracking-tight">
          {viewMode === 'list' ? currentCategoryData.title : selectedCalc?.name}
        </h1>
      </div>

      {viewMode === 'list' ? (
        // List Mode
        <div className="flex-1">
          {currentCategoryData.list.map(calc => (
            <div 
              key={calc.id} 
              onClick={() => handleCalcSelect(calc)}
              className={`flex items-center p-4 border-b cursor-pointer transition-colors ${
                isDarkMode 
                  ? 'border-zinc-900 hover:bg-zinc-900/40 text-white' 
                  : 'border-zinc-100 hover:bg-gray-50 text-black'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-xs shrink-0 ${currentCategoryData.color}`}>
                {calc.iconText}
              </div>
              <span className="ml-4 font-bold text-xs flex-1">{calc.name}</span>
              <span className={`font-bold text-lg leading-none shrink-0 ${isDarkMode ? 'text-zinc-700' : 'text-gray-300'}`}>&gt;</span>
            </div>
          ))}
        </div>
      ) : (
        // Detail / Form Mode
        <div className={`flex-1 p-5 transition-colors duration-300 ${
          isDarkMode ? 'bg-black' : 'bg-[#F5F5F5]'
        }`}>
          
          {/* View Count Tooltip Speech Bubble */}
          {viewCount >= 3 && (
            <div className="relative mb-3 flex animate-pulse">
              <div className={`px-3 py-2 rounded-2xl text-[10px] font-extrabold shadow-sm border flex items-center gap-1.5 relative shrink-0 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-blue-950 to-indigo-950 border-blue-900 text-blue-200' 
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 text-blue-600'
              }`}>
                <span>💡 이 계산식을 {viewCount}번 이상 봤어요!</span>
                {/* bubble tail */}
                <div className={`absolute bottom-[-5px] left-6 w-2.5 h-2.5 rotate-45 border-r border-b ${
                  isDarkMode ? 'bg-indigo-950 border-blue-900' : 'bg-indigo-50 border-blue-100'
                }`}></div>
              </div>
            </div>
          )}

          <div className={`rounded-3xl p-6 shadow-sm border mb-6 transition-colors ${
            isDarkMode ? 'bg-zinc-900 border-zinc-850' : 'bg-white border-gray-100'
          }`}>
            <h2 className={`text-xs font-black tracking-wide mb-6 border-b pb-2.5 ${
              isDarkMode ? 'border-zinc-800 text-zinc-300' : 'border-gray-100 text-gray-800'
            }`}>수식 입력</h2>
            
            {selectedCalc.inputs.map((label, idx) => (
              <div key={idx} className="mb-4">
                <label className={`block text-[11px] font-bold mb-1.5 ${
                  isDarkMode ? 'text-zinc-450' : 'text-gray-600'
                }`}>{label}</label>
                <input 
                  type="number"
                  value={inputValues[idx] || ''}
                  onChange={(e) => setInputValues({...inputValues, [idx]: e.target.value})}
                  placeholder="숫자 입력"
                  className={`w-full text-xs font-semibold rounded-xl px-4 py-3 border outline-none transition-colors ${
                    isDarkMode 
                      ? 'bg-zinc-950 border-zinc-800 text-white focus:border-zinc-700' 
                      : 'bg-zinc-50 border-zinc-200 text-gray-900 focus:border-blue-500'
                  }`}
                />
              </div>
            ))}

            {errorMsg && (
              <p className="text-red-500 text-[10px] font-bold mb-4 bg-red-500/10 p-3 rounded-xl border border-red-500/20">{errorMsg}</p>
            )}

            <button 
              onClick={handleCalculate}
              disabled={isCalculating}
              className={`w-full text-xs font-bold rounded-xl py-4 mt-2 transition-all active:scale-[0.98] cursor-pointer text-white shadow-md ${
                isCalculating 
                  ? 'bg-zinc-500' 
                  : (isDarkMode ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90' : 'bg-gray-900 hover:bg-gray-800')
              }`}
            >
              {isCalculating ? '계산 중...' : '계산하기'}
            </button>
          </div>

          {result && (
            <div className={`rounded-3xl p-6 flex flex-col items-center justify-center text-center animate-scale-up border ${
              isDarkMode 
                ? 'bg-gradient-to-br from-blue-950/40 to-indigo-950/40 border-blue-900/60' 
                : 'bg-blue-50 border-blue-100'
            }`}>
              <h3 className={`text-[10px] font-black mb-2 tracking-wide uppercase ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>계산 결과</h3>
              <p className={`text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{result}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalculatorScreen;
