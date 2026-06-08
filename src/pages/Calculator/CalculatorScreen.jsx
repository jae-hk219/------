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
      { id: 'elec-1', name: '전압 계산', iconText: 'V', inputs: ['전류 (A)', '저항 (Ω)'], formula: () => '' },
      { id: 'elec-2', name: '전류 계산', iconText: 'I', inputs: ['전압 (V)', '저항 (Ω)'], formula: () => '' },
      { id: 'elec-3', name: '저항 계산', iconText: 'R', inputs: ['전압 (V)', '전류 (A)'], formula: () => '' },
      { id: 'elec-4', name: '주울 효과 (발열량)', iconText: 'H', inputs: ['전류 (A)', '저항 (Ω)', '시간 (초)'], formula: () => '' },
      { id: 'elec-5', name: '유효 전력 계산', iconText: 'P', inputs: ['전압 (V)', '전류 (A)', '역률 (cosθ)'], formula: () => '' },
      { id: 'elec-6', name: '피상 전력 계산', iconText: 'S', inputs: ['전압 (V)', '전류 (A)'], formula: () => '' },
      { id: 'elec-7', name: '무효 전력 계산', iconText: 'Q', inputs: ['전압 (V)', '전류 (A)', '무효율 (sinθ)'], formula: () => '' },
      { id: 'elec-8', name: '역률 계산', iconText: 'PF', inputs: ['유효전력 (W)', '피상전력 (VA)'], formula: () => '' },
      { id: 'elec-9', name: '임피던스 계산 (R-L-C 직렬)', iconText: 'Z', inputs: ['저항 (Ω)', '유도 리액턴스 (Ω)', '용량 리액턴스 (Ω)'], formula: () => '' },
      { id: 'elec-11', name: '최대 와이어 길이 (ΔV 기준)', iconText: 'L', inputs: ['허용 전압강하 (V)', '단면적 (mm²)', '전류 (A)'], formula: () => '' },
      { id: 'elec-12', name: '저항 합계 (직렬)', iconText: 'Rt', inputs: ['저항 1 (Ω)', '저항 2 (Ω)'], formula: () => '' },
      { id: 'elec-13', name: '저항 합계 (병렬)', iconText: 'R∥', inputs: ['저항 1 (Ω)', '저항 2 (Ω)'], formula: () => '' },
      { id: 'elec-14', name: '콘덴서 합계 (병렬)', iconText: 'Ct', inputs: ['콘덴서 1 (F)', '콘덴서 2 (F)'], formula: () => '' },
      { id: 'elec-15', name: 'LED 보호 저항 계산', iconText: 'LED', inputs: ['공급 전압 (V)', 'LED 전압 (V)', 'LED 전류 (A)'], formula: () => '' },
      { id: 'elec-16', name: '변압기 권선비 계산 (2차 전압)', iconText: 'Tr', inputs: ['1차 전압 (V)', '1차 권선수 (회)', '2차 권선수 (회)'], formula: () => '' },
      { id: 'elec-17', name: '배터리 수명 계산', iconText: '🔋', inputs: ['배터리 용량 (mAh)', '소비 전류 (mA)'], formula: () => '' },
      { id: 'elec-18', name: '안테나 길이 (1/4 파장)', iconText: 'λ', inputs: ['주파수 (MHz)'], formula: () => '' },
      { id: 'elec-19', name: 'CCTV 하드드라이브 용량', iconText: 'HDD', inputs: ['비트레이트 (Mbps)', '녹화 시간 (시간)'], formula: () => '' },
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
      { id: 'pipe-1', name: '배관내의 증기유량', iconText: 'Qs', inputs: ['배관 내경 (mm)', '증기 유속 (m/s)', '비체적 (m³/kg)'], formula: () => '' },
      { id: 'pipe-2', name: '배관내의 증기유속', iconText: 'Vs', inputs: ['증기 유량 (kg/h)', '비체적 (m³/kg)', '배관 내경 (mm)'], formula: () => '' },
      { id: 'pipe-3', name: '증기유속에 따른 배관사이즈 선정', iconText: 'D', inputs: ['증기 유량 (kg/h)', '비체적 (m³/kg)', '허용 유속 (m/s)'], formula: () => '' },
      { id: 'pipe-4', name: '증기배관 압력손실 (Darcy-Weisbach)', iconText: 'ΔP', inputs: ['마찰계수', '배관 길이 (m)', '배관 내경 (m)', '증기 밀도 (kg/m³)', '증기 유속 (m/s)'], formula: () => '' },
      { id: 'pipe-5', name: '재증발 증기량 계산', iconText: 'Fs', inputs: ['고압측 현열 (kJ/kg)', '저압측 현열 (kJ/kg)', '저압측 잠열 (kJ/kg)'], formula: () => '' },
      { id: 'pipe-6', name: '펌프출구관 배관사이즈 선정', iconText: 'Dp', inputs: ['토출 유량 (m³/min)', '설계 유속 (m/s)'], formula: () => '' },
      { id: 'pipe-7', name: '보일러 효율', iconText: 'η', inputs: ['실제 증발량 (kg/h)', '발생증기 엔탈피 (kJ/kg)', '급수 엔탈피 (kJ/kg)', '연료 소비량 (kg/h)', '연료 저위발열량 (kJ/kg)'], formula: () => '' },
      { id: 'pipe-8', name: '열량 단가', iconText: '₩', inputs: ['연료 단가 (원/kg)', '저위발열량 (kcal/kg)', '보일러 효율 (%)'], formula: () => '' },
      { id: 'pipe-9', name: '증기 단가 (Steam Cost)', iconText: '₩s', inputs: ['연료 단가 (원/kg)', '증기 엔탈피 (kcal/kg)', '급수 엔탈피 (kcal/kg)', '저위발열량 (kcal/kg)', '보일러 효율 (%)'], formula: () => '' },
      { id: 'pipe-10', name: '감압에 따른 건도 개선', iconText: 'x₂', inputs: ['감압 전 건도 (소수점)', '감압전 현열 (kJ/kg)', '감압전 잠열 (kJ/kg)', '감압후 현열 (kJ/kg)', '감압후 잠열 (kJ/kg)'], formula: () => '' },
      { id: 'pipe-11', name: '응축수 분리 및 감압 후 건도', iconText: 'x₂', inputs: ['분리후/감압전 현열 (kJ/kg)', '분리후/감압전 잠열 (kJ/kg)', '감압후 현열 (kJ/kg)', '감압후 잠열 (kJ/kg)'], formula: () => '' },
      { id: 'pipe-12', name: '에어체적비', iconText: 'Va', inputs: ['전체 혼합 압력 (MPa)', '증기 분압 (MPa)'], formula: () => '' },
      { id: 'pipe-13', name: '경제적 보온의 두께', iconText: 't', inputs: ['보온재 열전도율 (W/m·K)', '내부 온도 (℃)', '외기 온도 (℃)', '배관 외반경 (m)', '허용 열손실량 (W/m)'], formula: () => '' },
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
      { id: 'math-proportion', name: '비례식 계산 (A : B = C : X)', iconText: 'A:B', inputs: ['A 값', 'B 값', 'C 값'] },
      { id: 'math-percentage', name: '백분율 계산 (A의 X%)', iconText: '%', inputs: ['전체 값 (A)', '퍼센트 (X)'] },
      { id: 'math-percent-change', name: '증감율 계산 (A에서 B로)', iconText: '±%', inputs: ['이전 값 (A)', '새로운 값 (B)'] }
    ]
  }
};

const ELEC_FORMULAS = {
  'elec-1': (vals) => {
    const [I, R] = vals;
    const V = I * R;
    return `전압: ${V.toFixed(4)} V`;
  },
  'elec-2': (vals) => {
    const [V, R] = vals;
    const I = V / R;
    return `전류: ${I.toFixed(4)} A`;
  },
  'elec-3': (vals) => {
    const [V, I] = vals;
    const R = V / I;
    return `저항: ${R.toFixed(4)} Ω`;
  },
  'elec-4': (vals) => {
    const [I, R, t] = vals;
    const H = Math.pow(I, 2) * R * t;
    return `발열량: ${H.toFixed(2)} J (${(H / 1000).toFixed(4)} kJ)`;
  },
  'elec-5': (vals) => {
    const [V, I, pf] = vals;
    const P = V * I * pf;
    return `유효 전력: ${P.toFixed(2)} W (${(P / 1000).toFixed(4)} kW)`;
  },
  'elec-6': (vals) => {
    const [V, I] = vals;
    const S = V * I;
    return `피상 전력: ${S.toFixed(2)} VA (${(S / 1000).toFixed(4)} kVA)`;
  },
  'elec-7': (vals) => {
    const [V, I, sinTheta] = vals;
    const Q = V * I * sinTheta;
    return `무효 전력: ${Q.toFixed(2)} var (${(Q / 1000).toFixed(4)} kvar)`;
  },
  'elec-8': (vals) => {
    const [P, S] = vals;
    const pf = P / S;
    return `역률: ${pf.toFixed(4)} (${(pf * 100).toFixed(2)} %)`;
  },
  'elec-9': (vals) => {
    const [R, XL, XC] = vals;
    const Z = Math.sqrt(Math.pow(R, 2) + Math.pow(XL - XC, 2));
    return `임피던스: ${Z.toFixed(4)} Ω`;
  },
  'elec-11': (vals) => {
    const [e, A, I] = vals;
    const L = (1000 * e * A) / (35.6 * I);
    return `최대 와이어 길이: ${L.toFixed(2)} m`;
  },
  'elec-12': (vals) => {
    const [R1, R2] = vals;
    const Rt = Number(R1) + Number(R2);
    return `합성 저항 (직렬): ${Rt.toFixed(4)} Ω`;
  },
  'elec-13': (vals) => {
    const [R1, R2] = vals;
    const Rt = (R1 * R2) / (Number(R1) + Number(R2));
    return `합성 저항 (병렬): ${Rt.toFixed(4)} Ω`;
  },
  'elec-14': (vals) => {
    const [C1, C2] = vals;
    const Ct = Number(C1) + Number(C2);
    return `합성 용량 (병렬): ${Ct.toFixed(6)} F`;
  },
  'elec-15': (vals) => {
    const [Vs, Vf, If_val] = vals;
    const R = (Vs - Vf) / If_val;
    const P_mw = (Vs - Vf) * If_val * 1000;
    return `LED 보호 저항: ${R.toFixed(2)} Ω (저항 소비 전력: ${P_mw.toFixed(1)} mW)`;
  },
  'elec-16': (vals) => {
    const [V1, N1, N2] = vals;
    const V2 = V1 * (N2 / N1);
    return `2차 전압: ${V2.toFixed(2)} V (권선비: ${(N2 / N1).toFixed(4)})`;
  },
  'elec-17': (vals) => {
    const [C, I] = vals;
    const T = (C / I) * 0.7;
    return `배터리 수명: ${T.toFixed(2)} 시간 (안전율 70% 적용, 이론값: ${(C / I).toFixed(2)} 시간)`;
  },
  'elec-18': (vals) => {
    const [f] = vals;
    const L = (300 / f) * 0.25;
    return `안테나 길이: ${L.toFixed(4)} m (${(L * 100).toFixed(2)} cm)`;
  },
  'elec-19': (vals) => {
    const [bitrate, hours] = vals;
    const storageGB = (bitrate * 3600 * hours) / (8 * 1024);
    return `필요 저장 용량: ${storageGB.toFixed(2)} GB (${(storageGB / 1024).toFixed(4)} TB)`;
  }
};

const PIPE_FORMULAS = {
  'pipe-1': (vals) => {
    const [D, V, v] = vals;
    const Q = (Math.PI * Math.pow(D, 2) / 4) * (V / v) * 3600 * Math.pow(10, -6);
    return `증기 유량: ${Q.toFixed(2)} kg/h`;
  },
  'pipe-2': (vals) => {
    const [Q, v, D] = vals;
    const V = (Q * v) / (3600 * (Math.PI * Math.pow(D, 2) / 4) * Math.pow(10, -6));
    return `증기 유속: ${V.toFixed(2)} m/s`;
  },
  'pipe-3': (vals) => {
    const [Q, v, V] = vals;
    const D = Math.sqrt((4 * Q * v) / (Math.PI * V * 3600)) * 1000;
    return `필요 배관 내경: ${D.toFixed(1)} mm`;
  },
  'pipe-4': (vals) => {
    const [f, L, D, rho, V] = vals;
    const deltaP = f * (L / D) * ((rho * Math.pow(V, 2)) / 2);
    const deltaP_kpa = deltaP / 1000;
    const deltaP_bar = deltaP / 100000;
    return `압력 손실: ${deltaP.toFixed(2)} Pa (${deltaP_kpa.toFixed(3)} kPa, ${deltaP_bar.toFixed(5)} bar)`;
  },
  'pipe-5': (vals) => {
    const [hf1, hf2, hfg2] = vals;
    const Fs = ((hf1 - hf2) / hfg2) * 100;
    return `재증발 비율: ${Fs.toFixed(2)} %`;
  },
  'pipe-6': (vals) => {
    const [Q, V] = vals;
    const D = Math.sqrt((4 * (Q / 60)) / (Math.PI * V)) * 1000;
    return `필요 배관 내경: ${D.toFixed(1)} mm`;
  },
  'pipe-7': (vals) => {
    const [Gs, h2, h1, B, Hl] = vals;
    const eta = ((Gs * (h2 - h1)) / (B * Hl)) * 100;
    return `보일러 효율: ${eta.toFixed(2)} %`;
  },
  'pipe-8': (vals) => {
    const [Pf, Hl, eff] = vals;
    const cost = (Pf / (Hl * (eff / 100))) * 10000;
    return `열량 단가: ${cost.toFixed(2)} 원/10,000kcal`;
  },
  'pipe-9': (vals) => {
    const [Pf, h2, h1, Hl, eff] = vals;
    const cost = (Pf * (h2 - h1)) / (Hl * (eff / 100));
    return `증기 단가: ${cost.toFixed(2)} 원/kg`;
  },
  'pipe-10': (vals) => {
    const [x1, hf1, hfg1, hf2, hfg2] = vals;
    const x2 = ((hf1 + (x1 * hfg1)) - hf2) / hfg2;
    return `감압 후 건도: ${x2.toFixed(4)} (${(x2 * 100).toFixed(2)} %)`;
  },
  'pipe-11': (vals) => {
    const [hf1, hfg1, hf2, hfg2] = vals;
    const x2 = ((hf1 + hfg1) - hf2) / hfg2;
    return `분리/감압 후 건도: ${x2.toFixed(4)} (${(x2 * 100).toFixed(2)} %)`;
  },
  'pipe-12': (vals) => {
    const [Pt, Ps] = vals;
    const Vair = ((Pt - Ps) / Pt) * 100;
    return `에어 체적비: ${Vair.toFixed(2)} %`;
  },
  'pipe-13': (vals) => {
    const [k, Ti, Ta, r1, Q_allow] = vals;
    const r2 = r1 * Math.exp((2 * Math.PI * k * (Ti - Ta)) / Q_allow);
    const thickness = (r2 - r1) * 1000;
    return `보온재 포함 총 반경: ${r2.toFixed(4)} m (보온 두께: ${thickness.toFixed(1)} mm)`;
  }
};

const MATH_FORMULAS = {
  'math-proportion': (vals) => {
    const [A, B, C] = vals;
    if (A === 0) throw new Error('A 값은 0일 수 없습니다');
    const X = (B * C) / A;
    return `X의 값: ${Number(X.toFixed(4))}`;
  },
  'math-percentage': (vals) => {
    const [A, X] = vals;
    const result = A * (X / 100);
    return `결과: ${Number(result.toFixed(4))}`;
  },
  'math-percent-change': (vals) => {
    const [A, B] = vals;
    if (A === 0) throw new Error('이전 값 (A)은 0일 수 없습니다');
    const change = ((B - A) / A) * 100;
    return `증감율: ${Number(change.toFixed(2))} % (${change >= 0 ? '증가' : '감소'})`;
  }
};

const getDefaultsForCalc = (calcId) => {
  if (calcId === 'e1') return { 0: '2.5', 1: '30', 2: '1' };
  if (calcId === 'e2') return { 0: '단상 2선식', 3: '2.5', 4: '220' };
  if (calcId === 'e3') return { 0: '단상 (1-Phase)', 1: '220', 3: '0.9' };
  if (calcId === 'p1') return { 0: 'DIN2448', 1: '50A', 2: '2.0' };
  if (calcId === 'p2') return { 0: 'DIN2448', 1: '50A', 3: '2.0', 4: '0.02', 5: '1000' };
  if (calcId === 'p3') return { 0: 'DIN2448', 1: '50A', 2: '2.0', 4: '75', 5: '1000' };
  // 전기공사 신규 계산기 기본값
  if (calcId === 'elec-1') return { 0: '10', 1: '100' };
  if (calcId === 'elec-2') return { 0: '220', 1: '100' };
  if (calcId === 'elec-3') return { 0: '220', 1: '10' };
  if (calcId === 'elec-4') return { 0: '5', 1: '10', 2: '60' };
  if (calcId === 'elec-5') return { 0: '220', 1: '10', 2: '0.9' };
  if (calcId === 'elec-6') return { 0: '220', 1: '10' };
  if (calcId === 'elec-7') return { 0: '220', 1: '10', 2: '0.44' };
  if (calcId === 'elec-8') return { 0: '1980', 1: '2200' };
  if (calcId === 'elec-9') return { 0: '10', 1: '30', 2: '20' };
  if (calcId === 'elec-11') return { 0: '5', 1: '2.5', 2: '20' };
  if (calcId === 'elec-12') return { 0: '100', 1: '200' };
  if (calcId === 'elec-13') return { 0: '100', 1: '200' };
  if (calcId === 'elec-14') return { 0: '0.001', 1: '0.002' };
  if (calcId === 'elec-15') return { 0: '5', 1: '2', 2: '0.02' };
  if (calcId === 'elec-16') return { 0: '220', 1: '1000', 2: '100' };
  if (calcId === 'elec-17') return { 0: '3000', 1: '500' };
  if (calcId === 'elec-18') return { 0: '100' };
  if (calcId === 'elec-19') return { 0: '4', 1: '24' };
  // 배관공사 신규 계산기 기본값
  if (calcId === 'pipe-1') return { 0: '54.5', 1: '25', 2: '0.1944' };
  if (calcId === 'pipe-2') return { 0: '500', 1: '0.1944', 2: '54.5' };
  if (calcId === 'pipe-3') return { 0: '500', 1: '0.1944', 2: '25' };
  if (calcId === 'pipe-4') return { 0: '0.02', 1: '100', 2: '0.0545', 3: '5.15', 4: '25' };
  if (calcId === 'pipe-5') return { 0: '640', 1: '419', 2: '2257' };
  if (calcId === 'pipe-6') return { 0: '1.5', 1: '3' };
  if (calcId === 'pipe-7') return { 0: '5000', 1: '2706', 2: '419', 3: '200', 4: '41000' };
  if (calcId === 'pipe-8') return { 0: '800', 1: '10000', 2: '85' };
  if (calcId === 'pipe-9') return { 0: '800', 1: '660', 2: '100', 3: '10000', 4: '85' };
  if (calcId === 'pipe-10') return { 0: '0.95', 1: '640', 2: '2109', 3: '419', 4: '2257' };
  if (calcId === 'pipe-11') return { 0: '640', 1: '2109', 2: '419', 3: '2257' };
  if (calcId === 'pipe-12') return { 0: '0.5', 1: '0.45' };
  if (calcId === 'pipe-13') return { 0: '0.04', 1: '180', 2: '20', 3: '0.03', 4: '50' };
  // 수학 기초 신규 계산기 기본값
  if (calcId === 'math-proportion') return { 0: '10', 1: '20', 2: '30' };
  if (calcId === 'math-percentage') return { 0: '1000', 1: '15' };
  if (calcId === 'math-percent-change') return { 0: '100', 1: '120' };
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

const StandardCalculator = ({ isDarkMode }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [shouldReset, setShouldReset] = useState(false);

  const handleBtn = (val) => {
    if (val === 'AC' || val === 'C') {
      setDisplay('0');
      setEquation('');
      setShouldReset(false);
    } else if (val === '+/-') {
      if (display !== '0') {
        setDisplay(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev);
      }
    } else if (val === '%') {
      const num = parseFloat(display);
      if (!isNaN(num)) {
        setDisplay(Number((num / 100).toFixed(8)).toString());
      }
    } else if (['+', '-', '×', '÷'].includes(val)) {
      const currentNum = parseFloat(display);
      if (!isNaN(currentNum)) {
        if (shouldReset && equation) {
          // Replace last operator in equation
          setEquation(prev => prev.trim().replace(/[\+\-×÷]$/, val) + ' ');
        } else {
          setEquation(prev => prev ? `${prev} ${display} ${val}` : `${display} ${val}`);
          setShouldReset(true);
        }
      }
    } else if (val === '=') {
      if (equation) {
        try {
          const fullExpr = `${equation} ${display}`;
          const sanitizedExpr = fullExpr.replace(/×/g, '*').replace(/÷/g, '/');
          const evalResult = new Function(`return (${sanitizedExpr})`)();
          if (isNaN(evalResult) || !isFinite(evalResult)) {
            setDisplay('오류');
          } else {
            const formatted = Number(parseFloat(evalResult.toFixed(10)).toString());
            setDisplay(String(formatted));
          }
          setEquation('');
          setShouldReset(true);
        } catch (e) {
          setDisplay('오류');
          setEquation('');
          setShouldReset(true);
        }
      }
    } else if (val === '.') {
      if (shouldReset) {
        setDisplay('0.');
        setShouldReset(false);
      } else if (!display.includes('.')) {
        setDisplay(display + '.');
      }
    } else {
      // Digit
      if (display === '0' || shouldReset) {
        setDisplay(val);
        setShouldReset(false);
      } else {
        if (display.length < 15) {
          setDisplay(display + val);
        }
      }
    }
  };

  const buttons = [
    [equation || display !== '0' ? 'C' : 'AC', '+/-', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '=']
  ];

  return (
    <div className={`flex flex-col w-full max-w-[340px] mx-auto p-5 rounded-3xl shadow-md border transition-all duration-300 ${
      isDarkMode 
        ? 'bg-zinc-900 border-zinc-850' 
        : 'bg-white border-zinc-200'
    }`}>
      {/* Display Screen */}
      <div className={`flex flex-col justify-end items-end h-28 px-4 py-2 mb-5 rounded-2xl overflow-hidden select-all ${
        isDarkMode ? 'bg-zinc-950' : 'bg-zinc-50'
      }`}>
        <div className={`text-xs font-bold tracking-wide truncate max-w-full mb-1 h-5 ${
          isDarkMode ? 'text-zinc-500' : 'text-zinc-400'
        }`}>
          {equation}
        </div>
        <div className={`text-3xl font-black tracking-tight truncate max-w-full ${
          isDarkMode ? 'text-white' : 'text-zinc-950'
        }`}>
          {display}
        </div>
      </div>

      {/* Buttons Grid */}
      <div className="grid grid-cols-4 gap-2.5">
        {buttons.flat().map((btn) => {
          let btnClass = "";
          let colSpan = "";

          if (btn === '0') {
            colSpan = "col-span-2";
          }

          if (['÷', '×', '-', '+', '='].includes(btn)) {
            btnClass = "bg-orange-500 hover:bg-orange-450 active:bg-orange-600 text-white shadow-sm";
          } else if (['AC', 'C', '+/-', '%'].includes(btn)) {
            btnClass = isDarkMode
              ? "bg-zinc-800 hover:bg-zinc-750 active:bg-zinc-850 text-zinc-300"
              : "bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-250 text-zinc-600 border border-zinc-200/30";
          } else {
            btnClass = isDarkMode
              ? "bg-zinc-850 hover:bg-zinc-800 active:bg-zinc-900 text-white"
              : "bg-zinc-50 hover:bg-zinc-100 active:bg-zinc-150 text-zinc-900 border border-zinc-200/50 shadow-sm";
          }

          return (
            <button
              key={btn}
              onClick={() => handleBtn(btn)}
              className={`h-12 rounded-xl font-extrabold text-sm flex items-center justify-center cursor-pointer select-none transition-all duration-70 active:scale-[0.93] ${colSpan} ${btnClass}`}
            >
              {btn}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const CalculatorScreen = () => {
  const location = useLocation();
  const { isDarkMode, currentUser } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState(location.state?.category || null); // null means Home 4-boxes
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [selectedCalc, setSelectedCalc] = useState(null);
  const [activeMathTab, setActiveMathTab] = useState('standard'); // 'standard' or 'formulas'

  // Form State
  const [inputValues, setInputValues] = useState({});
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [cameFromHistory, setCameFromHistory] = useState(false);

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
          setCameFromHistory(true);
        }
      }
    }
  }, [location.state]);

  const handleCategorySelect = (key) => {
    setSelectedCategory(key);
    setViewMode('list');
    setSelectedCalc(null);
    if (key === 'math') {
      setActiveMathTab('standard');
    }
  };

  const handleCalcSelect = (calc) => {
    setSelectedCalc(calc);
    setViewMode('detail');
    setInputValues(getDefaultsForCalc(calc.id));
    setResult(null);
    setErrorMsg('');
    setViewCount(0);
    setCameFromHistory(false);
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
      else if (selectedCalc.id.startsWith('pipe-')) {
        const vals = selectedCalc.inputs.map((_, idx) => parseFloat(inputValues[idx]));
        if (vals.some(isNaN)) {
          throw new Error('모든 현장 데이터를 올바르게 입력해 주세요');
        }
        const formulaFn = PIPE_FORMULAS[selectedCalc.id];
        if (!formulaFn) {
          throw new Error('수식을 찾을 수 없습니다');
        }
        finalResult = formulaFn(vals);
      }
      else if (selectedCalc.id.startsWith('elec-')) {
        const vals = selectedCalc.inputs.map((_, idx) => parseFloat(inputValues[idx]));
        if (vals.some(isNaN)) {
          throw new Error('모든 현장 데이터를 올바르게 입력해 주세요');
        }
        const formulaFn = ELEC_FORMULAS[selectedCalc.id];
        if (!formulaFn) {
          throw new Error('수식을 찾을 수 없습니다');
        }
        finalResult = formulaFn(vals);
      }
      else if (selectedCalc.id.startsWith('math-')) {
        const vals = selectedCalc.inputs.map((_, idx) => parseFloat(inputValues[idx]));
        if (vals.some(isNaN)) {
          throw new Error('모든 현장 데이터를 올바르게 입력해 주세요');
        }
        const formulaFn = MATH_FORMULAS[selectedCalc.id];
        if (!formulaFn) {
          throw new Error('수식을 찾을 수 없습니다');
        }
        finalResult = formulaFn(vals);
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
        selectedCategory === 'math' ? (
          // Custom Math/Daily Life Screen (Standard Calculator UI or Formulas List)
          <div className="flex-1 p-5">
            {/* Tab Control */}
            <div className="flex justify-center mb-6">
              <div className={`flex p-1 rounded-2xl border ${
                isDarkMode ? 'bg-zinc-950 border-zinc-850' : 'bg-zinc-100 border-zinc-200'
              }`}>
                <button 
                  onClick={() => setActiveMathTab('standard')}
                  className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                    activeMathTab === 'standard'
                      ? (isDarkMode ? 'bg-zinc-800 text-white shadow-sm' : 'bg-white text-zinc-900 shadow-sm')
                      : (isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-700')
                  }`}
                >
                  일반 계산기
                </button>
                <button 
                  onClick={() => setActiveMathTab('formulas')}
                  className={`px-5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                    activeMathTab === 'formulas'
                      ? (isDarkMode ? 'bg-zinc-800 text-white shadow-sm' : 'bg-white text-zinc-900 shadow-sm')
                      : (isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-700')
                  }`}
                >
                  수학 기초 공식
                </button>
              </div>
            </div>

            {activeMathTab === 'standard' ? (
              <StandardCalculator isDarkMode={isDarkMode} />
            ) : (
              <div className="rounded-3xl border overflow-hidden transition-colors duration-300 border-transparent">
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
            )}
          </div>
        ) : (
          // Default Category List Mode
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
        )
      ) : (
        // Detail / Form Mode
        <div className={`flex-1 p-5 transition-colors duration-300 ${
          isDarkMode ? 'bg-black' : 'bg-[#F5F5F5]'
        }`}>
          
          {/* View Count Tooltip Speech Bubble */}
          {cameFromHistory && viewCount >= 3 && (
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
