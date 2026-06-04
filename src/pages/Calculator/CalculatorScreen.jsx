import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaSearch, FaChevronLeft, FaBolt, FaTint, FaCog, FaCalculator } from 'react-icons/fa';
import { performCalculation } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import { getLocalRecords, saveLocalRecords, saveRemoteRecords } from '../../services/recordSync';

const PIPE_SPECS = {
  'DIN2448': {
    '15A': { od: 21.3, t: 2.0 },
    '20A': { od: 26.9, t: 2.3 },
    '25A': { od: 33.7, t: 2.6 },
    '32A': { od: 42.4, t: 2.6 },
    '40A': { od: 48.3, t: 2.6 },
    '50A': { od: 60.3, t: 2.9 },
    '65A': { od: 76.1, t: 2.9 },
    '80A': { od: 88.9, t: 3.2 },
    '100A': { od: 114.3, t: 3.6 },
    '125A': { od: 139.7, t: 4.0 },
    '150A': { od: 168.3, t: 4.5 }
  },
  'ANSI Sch160': {
    '15A': { od: 21.3, t: 4.78 },
    '20A': { od: 26.7, t: 5.56 },
    '25A': { od: 33.4, t: 6.35 },
    '32A': { od: 42.2, t: 6.35 },
    '40A': { od: 48.3, t: 7.14 },
    '50A': { od: 60.3, t: 8.74 },
    '65A': { od: 73.0, t: 9.53 },
    '80A': { od: 88.9, t: 11.13 },
    '100A': { od: 114.3, t: 13.49 },
    '125A': { od: 139.8, t: 15.88 },
    '150A': { od: 168.3, t: 18.26 }
  },
  'ANSI Sch80': {
    '15A': { od: 21.3, t: 3.73 },
    '20A': { od: 26.7, t: 3.91 },
    '25A': { od: 33.4, t: 4.55 },
    '32A': { od: 42.2, t: 4.85 },
    '40A': { od: 48.3, t: 5.08 },
    '50A': { od: 60.3, t: 5.54 },
    '65A': { od: 73.0, t: 7.01 },
    '80A': { od: 88.9, t: 7.62 },
    '100A': { od: 114.3, t: 8.56 },
    '125A': { od: 139.8, t: 9.53 },
    '150A': { od: 168.3, t: 10.97 }
  },
  'ANSI Sch40': {
    '15A': { od: 21.3, t: 2.77 },
    '20A': { od: 26.7, t: 2.87 },
    '25A': { od: 33.4, t: 3.38 },
    '32A': { od: 42.2, t: 3.56 },
    '40A': { od: 48.3, t: 3.68 },
    '50A': { od: 60.3, t: 3.91 },
    '65A': { od: 73.0, t: 5.16 },
    '80A': { od: 88.9, t: 5.49 },
    '100A': { od: 114.3, t: 6.02 },
    '125A': { od: 139.8, t: 6.55 },
    '150A': { od: 168.3, t: 7.11 }
  },
  'JIS-STPG Sch80': {
    '15A': { od: 21.7, t: 3.7 },
    '20A': { od: 27.2, t: 3.9 },
    '25A': { od: 34.0, t: 4.5 },
    '32A': { od: 42.7, t: 4.9 },
    '40A': { od: 48.6, t: 5.1 },
    '50A': { od: 60.5, t: 5.5 },
    '65A': { od: 76.3, t: 7.0 },
    '80A': { od: 89.1, t: 7.6 },
    '100A': { od: 114.3, t: 8.6 },
    '125A': { od: 139.8, t: 9.5 },
    '150A': { od: 165.2, t: 11.0 }
  },
  'JIS-STPG Sch60': {
    '15A': { od: 21.7, t: 3.2 },
    '20A': { od: 27.2, t: 3.4 },
    '25A': { od: 34.0, t: 3.9 },
    '32A': { od: 42.7, t: 4.5 },
    '40A': { od: 48.6, t: 4.5 },
    '50A': { od: 60.5, t: 4.9 },
    '65A': { od: 76.3, t: 6.0 },
    '80A': { od: 89.1, t: 6.6 },
    '100A': { od: 114.3, t: 7.9 },
    '125A': { od: 139.8, t: 9.0 },
    '150A': { od: 165.2, t: 9.7 }
  },
  'JIS-STPG Sch40': {
    '15A': { od: 21.7, t: 2.8 },
    '20A': { od: 27.2, t: 2.9 },
    '25A': { od: 34.0, t: 3.4 },
    '32A': { od: 42.7, t: 3.6 },
    '40A': { od: 48.6, t: 3.7 },
    '50A': { od: 60.5, t: 3.9 },
    '65A': { od: 76.3, t: 5.2 },
    '80A': { od: 89.1, t: 5.5 },
    '100A': { od: 114.3, t: 6.0 },
    '125A': { od: 139.8, t: 6.6 },
    '150A': { od: 165.2, t: 7.1 }
  },
  'JIS-SGP': {
    '15A': { od: 21.7, t: 2.8 },
    '20A': { od: 27.2, t: 2.8 },
    '25A': { od: 34.0, t: 3.2 },
    '32A': { od: 42.7, t: 3.5 },
    '40A': { od: 48.6, t: 3.5 },
    '50A': { od: 60.5, t: 3.8 },
    '65A': { od: 76.3, t: 4.2 },
    '80A': { od: 89.1, t: 4.2 },
    '100A': { od: 114.3, t: 4.5 },
    '125A': { od: 139.8, t: 4.5 },
    '150A': { od: 165.2, t: 5.0 }
  }
};

const CALCULATOR_DATA = {
  electric: {
    title: '전기공사 계산기',
    subtitle: '회로, 부하, 안전규칙 계산',
    icon: <FaBolt size={40} className="text-zinc-650" />,
    color: 'bg-yellow-500',
    list: [
      { id: 'e1', name: '허용전류 계산', iconText: 'I', inputs: ['전선 단면적 (mm²)', '주변 온도 (°C)', '복선 수 (회로 수)'], formula: () => '' },
      { id: 'e2', name: '전압강하 계산', iconText: 'ΔV', inputs: ['배전 방식', '전류 (A)', '선로 길이 (m)', '전선 단면적 (mm²)', '선로 전압 (V)'], formula: () => '' },
      { id: 'e3', name: '부하전력 계산', iconText: 'W', inputs: ['상 구분', '전압 (V)', '전류 (A)', '역률'], formula: () => '' },
    ]
  },
  plumbing: {
    title: '배관공사 계산기',
    subtitle: '유량, 압력, 자재 계산',
    icon: <FaTint size={40} className="text-zinc-650" />,
    color: 'bg-blue-400',
    list: [
      { id: 'p1', name: '배관 유량/유속', iconText: 'Q', inputs: ['배관 규격 모델', '배관 사이즈', '유속 (m/s)'], formula: () => '' },
      { id: 'p2', name: '압력손실 계산', iconText: 'ΔP', inputs: ['배관 규격 모델', '배관 사이즈', '배관 길이 (m)', '유속 (m/s)', '마찰계수', '유체 밀도 (kg/m³)'], formula: () => '' },
      { id: 'p3', name: '펌프 동력', iconText: 'HP', inputs: ['배관 규격 모델', '배관 사이즈', '유속 (m/s)', '양정 (m)', '펌프 효율 (%)', '유체 밀도 (kg/m³)'], formula: () => '' },
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

const getDefaultsForCalc = (calcId) => {
  if (calcId === 'e1') return { 0: '2.5', 1: '30', 2: '1' };
  if (calcId === 'e2') return { 0: '단상 2선식', 3: '2.5', 4: '220' };
  if (calcId === 'e3') return { 0: '단상 (1-Phase)', 1: '220', 3: '0.9' };
  if (calcId === 'p1') return { 0: 'DIN2448', 1: '50A', 2: '2.0' };
  if (calcId === 'p2') return { 0: 'DIN2448', 1: '50A', 3: '2.0', 4: '0.02', 5: '1000' };
  if (calcId === 'p3') return { 0: 'DIN2448', 1: '50A', 2: '2.0', 4: '75', 5: '1000' };
  return {};
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
  const { isDarkMode, currentUser } = useAppContext();
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
    setInputValues(getDefaultsForCalc(calc.id));
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
    setErrorMsg('');
    setIsCalculating(true);
    
    try {
      let finalResult = '';
      
      // Custom calculators validation & calculation
      if (selectedCalc.id === 'e1') {
        const area = inputValues[0] || '2.5';
        const temp = parseFloat(inputValues[1]);
        const circuits = parseFloat(inputValues[2]);
        if (isNaN(temp) || isNaN(circuits)) {
          throw new Error('모든 현장 데이터를 올바르게 입력해 주세요');
        }
        
        const baseCurrents = {
          '1.5': 18, '2.5': 24, '4': 32, '6': 41, '10': 57, '16': 76,
          '25': 101, '35': 125, '50': 151, '70': 192, '95': 232, '120': 269
        };
        const I0 = baseCurrents[area] || 24;
        const Ct = Math.max(0, Math.min(1, Math.sqrt((90 - temp) / 60)));
        let Cg = 1.0;
        if (circuits === 2) Cg = 0.8;
        else if (circuits === 3) Cg = 0.7;
        else if (circuits >= 4) Cg = 0.65;
        
        const I_allow = I0 * Ct * Cg;
        finalResult = `허용 전류: ${I_allow.toFixed(2)} A (기준전류: ${I0}A, 온도 보정계수: ${Ct.toFixed(2)}, 다조포설 보정계수: ${Cg.toFixed(2)})`;
      }
      else if (selectedCalc.id === 'e2') {
        const sys = inputValues[0] || '단상 2선식';
        const I = parseFloat(inputValues[1]);
        const L = parseFloat(inputValues[2]);
        const A = parseFloat(inputValues[3] || '2.5');
        const V = parseFloat(inputValues[4]);
        
        if (isNaN(I) || isNaN(L) || isNaN(A) || isNaN(V)) {
          throw new Error('모든 현장 데이터를 올바르게 입력해 주세요');
        }
        
        let K = 35.6;
        if (sys.includes('3상 3선')) K = 30.8;
        else if (sys.includes('3상 4선')) K = 17.8;
        
        const e = K * (L * I) / (1000 * A);
        const percent = (e / V) * 100;
        finalResult = `전압 강하: ${e.toFixed(2)} V (${percent.toFixed(2)} %)`;
      }
      else if (selectedCalc.id === 'e3') {
        const phase = inputValues[0] || '단상 (1-Phase)';
        const V = parseFloat(inputValues[1]);
        const I = parseFloat(inputValues[2]);
        const PF = parseFloat(inputValues[3]);
        
        if (isNaN(V) || isNaN(I) || isNaN(PF)) {
          throw new Error('모든 현장 데이터를 올바르게 입력해 주세요');
        }
        
        let P = V * I * PF;
        let S = V * I;
        if (phase.includes('3상')) {
          P = Math.sqrt(3) * V * I * PF;
          S = Math.sqrt(3) * V * I;
        }
        
        finalResult = `유효 전력: ${(P/1000).toFixed(2)} kW (${P.toFixed(0)} W), 피상 전력: ${(S/1000).toFixed(2)} kVA (${S.toFixed(0)} VA)`;
      }
      else if (selectedCalc.id === 'p1') {
        const model = inputValues[0] || 'DIN2448';
        const size = inputValues[1] || '50A';
        const V = parseFloat(inputValues[2]);
        
        if (isNaN(V)) {
          throw new Error('모든 현장 데이터를 올바르게 입력해 주세요');
        }
        
        const spec = PIPE_SPECS[model]?.[size] || { od: 60.3, t: 2.9 };
        const id = spec.od - 2 * spec.t;
        const area = Math.PI * Math.pow(id / 2000, 2);
        
        const Q_m3s = area * V;
        const Q_m3h = Q_m3s * 3600;
        
        finalResult = `유량: ${Q_m3h.toFixed(2)} m³/h (${Q_m3s.toFixed(5)} m³/s) [배관 내경: ${id.toFixed(1)} mm, 단면적: ${(area * 10000).toFixed(2)} cm²]`;
      }
      else if (selectedCalc.id === 'p2') {
        const model = inputValues[0] || 'DIN2448';
        const size = inputValues[1] || '50A';
        const L = parseFloat(inputValues[2]);
        const V = parseFloat(inputValues[3]);
        const f = parseFloat(inputValues[4] || '0.02');
        const rho = parseFloat(inputValues[5] || '1000');
        
        if (isNaN(L) || isNaN(V) || isNaN(f) || isNaN(rho)) {
          throw new Error('모든 현장 데이터를 올바르게 입력해 주세요');
        }
        
        const spec = PIPE_SPECS[model]?.[size] || { od: 60.3, t: 2.9 };
        const id = spec.od - 2 * spec.t;
        const D = id / 1000;
        
        const hf = f * (L / D) * (Math.pow(V, 2) / (2 * 9.81));
        const deltaP_pa = rho * 9.81 * hf;
        const deltaP_bar = deltaP_pa / 100000;
        const deltaP_kpa = deltaP_pa / 1000;
        
        finalResult = `압력 손실: ${deltaP_bar.toFixed(3)} bar (${deltaP_kpa.toFixed(1)} kPa) [수두 손실: ${hf.toFixed(2)} m, 배관 내경: ${id.toFixed(1)} mm]`;
      }
      else if (selectedCalc.id === 'p3') {
        const model = inputValues[0] || 'DIN2448';
        const size = inputValues[1] || '50A';
        const V = parseFloat(inputValues[2]);
        const H = parseFloat(inputValues[3]);
        const eta = parseFloat(inputValues[4] || '75') / 100;
        const rho = parseFloat(inputValues[5] || '1000');
        
        if (isNaN(V) || isNaN(H) || isNaN(eta) || isNaN(rho)) {
          throw new Error('모든 현장 데이터를 올바르게 입력해 주세요');
        }
        
        const spec = PIPE_SPECS[model]?.[size] || { od: 60.3, t: 2.9 };
        const id = spec.od - 2 * spec.t;
        const area = Math.PI * Math.pow(id / 2000, 2);
        const Q_m3s = area * V;
        
        const P_w = (rho * 9.81 * Q_m3s * H) / eta;
        const P_kw = P_w / 1000;
        
        finalResult = `펌프 동력: ${P_kw.toFixed(2)} kW (${(P_kw * 1.341).toFixed(2)} HP) [계산 유량: ${(Q_m3s * 3600).toFixed(2)} m³/h, 배관 내경: ${id.toFixed(1)} mm]`;
      }
      else {
        // Fallback for default calculators
        const vals = selectedCalc.inputs.map((_, idx) => parseFloat(inputValues[idx]));
        if (vals.some(isNaN)) {
          throw new Error('모든 현장 데이터를 올바르게 입력해 주세요');
        }
        finalResult = await performCalculation(selectedCalc.id, vals, selectedCalc.formula);
      }

      setResult(finalResult);

      // Record history logs
      try {
        const userId = currentUser?.id || 'guest';
        const records = getLocalRecords(userId);
        const newRecord = {
          id: Date.now() + Math.random().toString(36).substr(2, 9),
          category: selectedCategory,
          categoryName: CALCULATOR_DATA[selectedCategory]?.title || '',
          calcId: selectedCalc.id,
          calcName: selectedCalc.name,
          inputs: selectedCalc.inputs,
          inputValues: inputValues,
          result: finalResult,
          timestamp: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          memo: ''
        };
        records.unshift(newRecord);
        saveLocalRecords(userId, records);
        
        if (userId !== 'guest') {
          saveRemoteRecords(userId, records).catch(e => {
            console.warn("Deferred Firebase sync for new record:", e);
          });
        }
      } catch (err) {
        console.error("Failed to write to calculation_records:", err);
      }

    } catch (e) {
      setErrorMsg(e.message);
      setResult(null);
    } finally {
      setIsCalculating(false);
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
            
            {selectedCalc.inputs.map((label, idx) => {
              const isDarkTheme = isDarkMode;
              const inputClass = `w-full text-xs font-semibold rounded-xl px-4 py-3 border outline-none transition-colors ${
                isDarkTheme 
                  ? 'bg-zinc-950 border-zinc-800 text-white focus:border-zinc-700' 
                  : 'bg-white border-zinc-200 text-gray-900 focus:border-blue-500'
              }`;

              // 1. Wire size dropdown for e1 (index 0) and e2 (index 3)
              if ((selectedCalc.id === 'e1' && idx === 0) || (selectedCalc.id === 'e2' && idx === 3)) {
                return (
                  <div key={idx} className="mb-4">
                    <label className={`block text-[11px] font-bold mb-1.5 ${isDarkTheme ? 'text-zinc-450' : 'text-gray-600'}`}>{label}</label>
                    <select
                      value={inputValues[idx] || '2.5'}
                      onChange={(e) => setInputValues({...inputValues, [idx]: e.target.value})}
                      className={inputClass}
                      style={{ colorScheme: isDarkTheme ? 'dark' : 'light' }}
                    >
                      {['1.5', '2.5', '4', '6', '10', '16', '25', '35', '50', '70', '95', '120'].map(sz => (
                        <option key={sz} value={sz}>{sz} mm² (sq)</option>
                      ))}
                    </select>
                  </div>
                );
              }

              // 2. Wiring system for e2 (index 0)
              if (selectedCalc.id === 'e2' && idx === 0) {
                return (
                  <div key={idx} className="mb-4">
                    <label className={`block text-[11px] font-bold mb-1.5 ${isDarkTheme ? 'text-zinc-450' : 'text-gray-600'}`}>{label}</label>
                    <select
                      value={inputValues[idx] || '단상 2선식'}
                      onChange={(e) => setInputValues({...inputValues, [idx]: e.target.value})}
                      className={inputClass}
                      style={{ colorScheme: isDarkTheme ? 'dark' : 'light' }}
                    >
                      {['단상 2선식', '3상 3선식', '3상 4선식(상전압 기준)'].map(sys => (
                        <option key={sys} value={sys}>{sys}</option>
                      ))}
                    </select>
                  </div>
                );
              }

              // 3. Phase selection for e3 (index 0)
              if (selectedCalc.id === 'e3' && idx === 0) {
                return (
                  <div key={idx} className="mb-4">
                    <label className={`block text-[11px] font-bold mb-1.5 ${isDarkTheme ? 'text-zinc-450' : 'text-gray-600'}`}>{label}</label>
                    <select
                      value={inputValues[idx] || '단상 (1-Phase)'}
                      onChange={(e) => setInputValues({...inputValues, [idx]: e.target.value})}
                      className={inputClass}
                      style={{ colorScheme: isDarkTheme ? 'dark' : 'light' }}
                    >
                      {['단상 (1-Phase)', '3상 (3-Phase)'].map(phase => (
                        <option key={phase} value={phase}>{phase}</option>
                      ))}
                    </select>
                  </div>
                );
              }

              // 4. Pipe standard model for p1, p2, p3 (index 0)
              if (['p1', 'p2', 'p3'].includes(selectedCalc.id) && idx === 0) {
                return (
                  <div key={idx} className="mb-4">
                    <label className={`block text-[11px] font-bold mb-1.5 ${isDarkTheme ? 'text-zinc-450' : 'text-gray-600'}`}>{label}</label>
                    <select
                      value={inputValues[idx] || 'DIN2448'}
                      onChange={(e) => setInputValues({...inputValues, [idx]: e.target.value})}
                      className={inputClass}
                      style={{ colorScheme: isDarkTheme ? 'dark' : 'light' }}
                    >
                      {['DIN2448', 'ANSI Sch160', 'ANSI Sch80', 'ANSI Sch40', 'JIS-STPG Sch80', 'JIS-STPG Sch60', 'JIS-STPG Sch40', 'JIS-SGP'].map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                );
              }

              // 5. Pipe Size for p1, p2, p3 (index 1)
              if (['p1', 'p2', 'p3'].includes(selectedCalc.id) && idx === 1) {
                return (
                  <div key={idx} className="mb-4">
                    <label className={`block text-[11px] font-bold mb-1.5 ${isDarkTheme ? 'text-zinc-450' : 'text-gray-600'}`}>{label}</label>
                    <select
                      value={inputValues[idx] || '50A'}
                      onChange={(e) => setInputValues({...inputValues, [idx]: e.target.value})}
                      className={inputClass}
                      style={{ colorScheme: isDarkTheme ? 'dark' : 'light' }}
                    >
                      {['15A', '20A', '25A', '32A', '40A', '50A', '65A', '80A', '100A', '125A', '150A'].map(sz => (
                        <option key={sz} value={sz}>{sz}</option>
                      ))}
                    </select>
                  </div>
                );
              }

              // Standard Numeric Input
              return (
                <div key={idx} className="mb-4">
                  <label className={`block text-[11px] font-bold mb-1.5 ${
                    isDarkTheme ? 'text-zinc-450' : 'text-gray-600'
                  }`}>{label}</label>
                  <input 
                    type="number"
                    step="any"
                    value={inputValues[idx] ?? ''}
                    onChange={(e) => setInputValues({...inputValues, [idx]: e.target.value})}
                    placeholder="숫자 입력"
                    className={`w-full text-xs font-semibold rounded-xl px-4 py-3 border outline-none transition-colors ${
                      isDarkTheme 
                        ? 'bg-zinc-950 border-zinc-800 text-white focus:border-zinc-700' 
                        : 'bg-zinc-50 border-zinc-200 text-gray-900 focus:border-blue-500'
                    }`}
                  />
                </div>
              );
            })}

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
