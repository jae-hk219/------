import React, { useState } from 'react';
import { FaSearch, FaChevronLeft, FaBolt, FaTint, FaCog, FaCalculator } from 'react-icons/fa';

const CALCULATOR_DATA = {
  electric: {
    title: '전기공사 계산기',
    subtitle: '회로, 부하, 안전규칙 계산',
    icon: <FaBolt size={40} className="text-gray-700" />,
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
    icon: <FaTint size={40} className="text-gray-700" />,
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
    icon: <FaCog size={40} className="text-gray-700" />,
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
    icon: <FaCalculator size={40} className="text-gray-700" />,
    color: 'bg-gray-500',
    list: [
      { id: 'm1', name: '수학 기초 (분수, 백분율, 비례식)', iconText: '%', inputs: ['전체 값', '부분 값'], formula: (vals) => `비율: ${(vals[1] / vals[0] * 100).toFixed(2)} %` },
    ]
  }
};

const CalculatorScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(null); // null means Home 4-boxes
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [selectedCalc, setSelectedCalc] = useState(null);

  // Form State
  const [inputValues, setInputValues] = useState({});
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

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
  };

  const handleBack = () => {
    if (viewMode === 'detail') {
      setViewMode('list');
      setSelectedCalc(null);
    } else {
      setSelectedCategory(null);
    }
  };

  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = async () => {
    const vals = selectedCalc.inputs.map((_, idx) => parseFloat(inputValues[idx]));
    if (vals.some(isNaN)) {
      setErrorMsg('모든 현장 데이터를 올바르게 입력해 주세요');
      setResult(null);
    } else {
      setErrorMsg('');
      setIsCalculating(true);
      try {
        const { performCalculation } = await import('../../services/api');
        const apiResult = await performCalculation(selectedCalc.id, vals, selectedCalc.formula);
        setResult(apiResult);
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
      <div className="flex flex-col h-full bg-[#F5F5F5] p-4">
        {/* Search Bar */}
        <div className="bg-zinc-200 rounded-2xl p-3 flex items-center mb-8 mt-2">
          <FaSearch className="text-gray-500 mr-2" size={18} />
          <input 
            type="text" 
            placeholder="수식, 주제, 또는 AI 검색" 
            className="w-full outline-none text-sm bg-transparent text-gray-700 placeholder-gray-500"
          />
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(CALCULATOR_DATA).map(([key, data]) => (
            <button 
              key={key} 
              onClick={() => handleCategorySelect(key)}
              className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow aspect-square"
              style={{ borderRadius: '15%' }}
            >
              <div className="mb-4">{data.icon}</div>
              <h3 className="font-bold text-gray-800 text-[15px] mb-1">{data.title}</h3>
              <p className="text-[11px] text-gray-500 font-light leading-tight">{data.subtitle}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const currentCategoryData = CALCULATOR_DATA[selectedCategory];

  return (
    <div className="flex flex-col h-full bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-zinc-200 bg-white sticky top-0 z-10">
        <button onClick={handleBack} className="mr-3 text-gray-800 p-2">
          <FaChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-gray-900">
          {viewMode === 'list' ? currentCategoryData.title : selectedCalc?.name}
        </h1>
      </div>

      {viewMode === 'list' ? (
        // List Mode
        <div className="flex-1 bg-white">
          {currentCategoryData.list.map(calc => (
            <div 
              key={calc.id} 
              onClick={() => handleCalcSelect(calc)}
              className="flex items-center p-4 border-b border-zinc-100 active:bg-gray-50 cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${currentCategoryData.color}`}>
                {calc.iconText}
              </div>
              <span className="ml-4 font-bold text-gray-900 flex-1">{calc.name}</span>
              <span className="text-gray-300 font-bold text-xl">&gt;</span>
            </div>
          ))}
        </div>
      ) : (
        // Detail / Form Mode
        <div className="flex-1 p-6 bg-[#F5F5F5]">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">수식 입력</h2>
            
            {selectedCalc.inputs.map((label, idx) => (
              <div key={idx} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input 
                  type="number"
                  value={inputValues[idx] || ''}
                  onChange={(e) => setInputValues({...inputValues, [idx]: e.target.value})}
                  placeholder="숫자 입력"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            ))}

            {errorMsg && (
              <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{errorMsg}</p>
            )}

            <button 
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full bg-gray-900 text-white font-bold rounded-xl py-4 mt-2 hover:bg-gray-800 transition-colors disabled:bg-gray-700"
            >
              {isCalculating ? '계산 중...' : '계산하기'}
            </button>
          </div>

          {result && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center animate-fade-in">
              <h3 className="text-sm font-medium text-blue-600 mb-2">계산 결과</h3>
              <p className="text-2xl font-bold text-gray-900">{result}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalculatorScreen;
