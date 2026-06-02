import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTrash, FaChevronLeft, FaStickyNote, FaCheck, FaFolderOpen, FaArrowRight, FaSync } from 'react-icons/fa';
import { useAppContext } from '../../context/AppContext';
import { getLocalRecords, saveLocalRecords, saveRemoteRecords, syncRecords, migrateLegacyRecords } from '../../services/recordSync';

const RecordScreen = () => {
  const navigate = useNavigate();
  const { isDarkMode, t, currentUser } = useAppContext();

  // Dynamic state
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMemoId, setEditingMemoId] = useState(null);
  const [memoText, setMemoText] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [viewCounts, setViewCounts] = useState({});
  const [isSyncing, setIsSyncing] = useState(false);

  // Load calculations & view counts
  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    const userId = currentUser?.id || 'guest';
    
    // 1. Load local cache immediately
    try {
      const storedRecords = getLocalRecords(userId);
      setRecords(storedRecords);

      const storedViews = JSON.parse(localStorage.getItem('calculation_views')) || {};
      setViewCounts(storedViews);
    } catch (e) {
      console.error("Failed to load local records:", e);
    }

    if (userId === 'guest') return;

    setIsSyncing(true);
    try {
      // 2. Perform Migration of any legacy records
      const migrated = await migrateLegacyRecords(userId);
      if (migrated) {
        setRecords(getLocalRecords(userId));
      }

      // 3. Bidirectional Sync
      const synced = await syncRecords(userId);
      setRecords(synced);
    } catch (e) {
      console.error("Failed to sync records with Firebase:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Show a premium auto-dismissing toast alert
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg('');
    }, 2000);
  };

  // Handle Memo Save
  const handleSaveMemo = (recordId) => {
    try {
      const userId = currentUser?.id || 'guest';
      const updatedRecords = records.map(rec => {
        if (rec.id === recordId) {
          return { 
            ...rec, 
            memo: memoText.trim(),
            updatedAt: new Date().toISOString()
          };
        }
        return rec;
      });
      saveLocalRecords(userId, updatedRecords);
      setRecords(updatedRecords);
      setEditingMemoId(null);
      showToast("📝 메모가 저장되었습니다!");
      
      if (userId !== 'guest') {
        saveRemoteRecords(userId, updatedRecords).catch(e => {
          console.warn("Deferred Firebase sync for memo update:", e);
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Start Editing Memo
  const startEditingMemo = (rec) => {
    setEditingMemoId(rec.id);
    setMemoText(rec.memo || '');
  };

  // Handle Delete Record
  const handleDeleteRecord = (e, recordId) => {
    e.stopPropagation(); // Avoid card click navigation
    try {
      const userId = currentUser?.id || 'guest';
      const updatedRecords = records.filter(rec => rec.id !== recordId);
      saveLocalRecords(userId, updatedRecords);
      setRecords(updatedRecords);
      showToast("🗑️ 계산 기록이 삭제되었습니다.");
      
      if (userId !== 'guest') {
        saveRemoteRecords(userId, updatedRecords).catch(e => {
          console.warn("Deferred Firebase sync for delete:", e);
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Click card to restore and populate Calculator
  const handleRestoreCalculation = (rec) => {
    navigate('/calculator', {
      state: {
        category: rec.category,
        calcId: rec.calcId,
        inputValues: rec.inputValues,
        result: rec.result
      }
    });
  };

  // Filter records based on search
  const filteredRecords = records.filter(rec => {
    const query = searchQuery.toLowerCase();
    const matchCalcName = rec.calcName?.toLowerCase().includes(query);
    const matchCategory = rec.categoryName?.toLowerCase().includes(query);
    const matchMemo = rec.memo?.toLowerCase().includes(query);
    return matchCalcName || matchCategory || matchMemo;
  });

  // Format date helper
  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '알 수 없는 시간';
    }
  };

  return (
    <div className={`flex flex-col h-full min-h-screen pb-24 transition-colors duration-300 ${
      isDarkMode ? 'bg-black text-white' : 'bg-[#F5F5F5] text-black'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b sticky top-0 z-10 transition-colors ${
        isDarkMode ? 'border-zinc-800 bg-zinc-950 text-white' : 'border-gray-100 bg-white text-black'
      }`}>
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/home')} 
            className={`mr-3 p-1.5 rounded-full ${isDarkMode ? 'hover:bg-zinc-850' : 'hover:bg-gray-100'}`}
          >
            <FaChevronLeft size={20} />
          </button>
          <div>
            <span className={`text-[10px] uppercase tracking-wider block mb-0.5 ${
              isDarkMode ? 'text-zinc-550' : 'text-gray-400'
            }`}>스마트 보관소</span>
            <h1 className="text-base font-extrabold leading-tight flex items-center gap-1.5">
              <span>계산 기록</span>
              {isSyncing && (
                <FaSync className="text-blue-500 animate-spin" size={11} title="동기화 중..." />
              )}
            </h1>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-lg border border-blue-500 animate-scale-up">
          {toastMsg}
        </div>
      )}

      {/* Main Contents */}
      <div className="p-4 flex-1">
        {/* Search Bar */}
        <div className={`rounded-2xl p-3 flex items-center mb-5 border transition-colors shadow-sm ${
          isDarkMode ? 'bg-zinc-900 border-zinc-850 text-white' : 'bg-white border-gray-150 text-black'
        }`}>
          <FaSearch className={`mr-2.5 shrink-0 ${isDarkMode ? 'text-zinc-650' : 'text-gray-400'}`} size={16} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="수식명, 대분류, 메모 내용 검색..."
            className="w-full outline-none text-xs bg-transparent placeholder-zinc-500 font-medium"
          />
        </div>

        {/* List of Calculation records */}
        {filteredRecords.length === 0 ? (
          <div className="text-center py-20 animate-fade-in flex flex-col items-center justify-center">
            <FaFolderOpen size={40} className={isDarkMode ? 'text-zinc-800 mb-4' : 'text-gray-300 mb-4'} />
            <p className={`text-xs font-extrabold mb-1.5 ${isDarkMode ? 'text-zinc-600' : 'text-gray-400'}`}>
              {searchQuery ? '검색 결과에 맞는 계산 기록이 없습니다.' : '저장된 계산 기록이 존재하지 않습니다.'}
            </p>
            <p className={`text-[10px] mb-6 ${isDarkMode ? 'text-zinc-700' : 'text-gray-400 font-light'}`}>
              계산기에서 수식을 계산하면 기록 보관소에 안전하게 자동 저장됩니다.
            </p>
            {!searchQuery && (
              <button 
                onClick={() => navigate('/calculator')}
                className="bg-blue-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs active:scale-95 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>계산기 이동</span>
                <FaArrowRight size={10} />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((rec) => {
              const viewCount = viewCounts[rec.calcId] || 0;
              return (
                <div 
                  key={rec.id}
                  onClick={() => handleRestoreCalculation(rec)}
                  className={`p-4 rounded-3xl border shadow-sm relative cursor-pointer active:scale-[0.995] hover:shadow-md transition-all group overflow-hidden ${
                    isDarkMode 
                      ? 'bg-zinc-900/60 border-zinc-850 hover:border-zinc-800 text-white' 
                      : 'bg-white border-gray-150 hover:border-gray-200 text-black'
                  }`}
                >
                  
                  {/* Top: Category Tag and View Count Speech Bubble */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[9px] font-black text-blue-500 bg-blue-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {rec.categoryName.replace(" 계산기", "")}
                    </span>
                    
                    {/* View Count Tooltip (말꼬리 멘트) */}
                    {viewCount >= 3 && (
                      <div className={`px-2 py-0.5 rounded-lg text-[8px] font-extrabold border shrink-0 relative ${
                        isDarkMode 
                          ? 'bg-gradient-to-r from-blue-950 to-indigo-950 border-blue-900 text-blue-200' 
                          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 text-blue-600'
                      }`}>
                        <span>💡 이 수식 {viewCount}번 이상 봤어요!</span>
                      </div>
                    )}
                  </div>

                  {/* Header: Title and Delete Button */}
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-extrabold text-xs tracking-tight leading-snug flex-1">
                      {rec.calcName}
                    </h3>
                    <button 
                      onClick={(e) => handleDeleteRecord(e, rec.id)}
                      className={`p-1.5 rounded-lg shrink-0 cursor-pointer transition-colors ${
                        isDarkMode ? 'hover:bg-zinc-800 text-zinc-550 hover:text-red-400' : 'hover:bg-gray-100 text-gray-400 hover:text-red-500'
                      }`}
                      title="기록 삭제"
                    >
                      <FaTrash size={11} />
                    </button>
                  </div>

                  {/* Inputs List */}
                  <div className={`p-2.5 rounded-xl text-[10px] space-y-1 mb-2 font-medium leading-relaxed ${
                    isDarkMode ? 'bg-zinc-950/60 text-zinc-400' : 'bg-gray-50 text-gray-500'
                  }`}>
                    {rec.inputs.map((label, idx) => (
                      <div key={idx} className="flex justify-between border-b border-dashed border-zinc-800/10 pb-0.5 last:border-0 last:pb-0">
                        <span className="opacity-80">{label}</span>
                        <span className={`font-black ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
                          {rec.inputValues[idx]}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Result Box */}
                  <div className={`flex items-center justify-between p-2.5 rounded-xl text-[11px] font-extrabold mb-3.5 border ${
                    isDarkMode ? 'bg-blue-950/10 border-blue-950 text-blue-300' : 'bg-blue-50/50 border-blue-100/70 text-blue-600'
                  }`}>
                    <span>최종 결과값</span>
                    <span>{rec.result}</span>
                  </div>

                  {/* Divider */}
                  <div className={`h-[1px] mb-3.5 ${
                    isDarkMode ? 'bg-zinc-850' : 'bg-gray-100'
                  }`} />

                  {/* Bottom: Date and Memo Field */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[8px] opacity-60 font-medium">
                      <span>계산 시점</span>
                      <span>{formatDate(rec.timestamp)}</span>
                    </div>

                    {/* Memo Form / View */}
                    <div 
                      onClick={(e) => e.stopPropagation()} // Stop recovery navigation on memo interactions
                      className="mt-1"
                    >
                      {editingMemoId === rec.id ? (
                        <div className="flex gap-2 items-center">
                          <input 
                            type="text"
                            maxLength={80}
                            value={memoText}
                            onChange={(e) => setMemoText(e.target.value)}
                            placeholder="이 계산을 왜 했는지 메모해 두세요 (예: 3층 화장실 압력)"
                            className={`flex-1 text-[10px] font-semibold px-3 py-2 rounded-xl border outline-none ${
                              isDarkMode 
                                ? 'bg-zinc-950 border-zinc-800 text-white focus:border-zinc-700' 
                                : 'bg-white border-gray-300 text-black focus:border-blue-500'
                            }`}
                            autoFocus
                          />
                          <button 
                            onClick={() => handleSaveMemo(rec.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl cursor-pointer flex items-center justify-center shrink-0 active:scale-95 transition-all shadow-sm"
                            title="메모 저장"
                          >
                            <FaCheck size={10} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <FaStickyNote size={10} className="text-blue-500 shrink-0" />
                            <span className={`text-[10px] leading-tight truncate ${
                              rec.memo 
                                ? (isDarkMode ? 'text-zinc-300 font-semibold' : 'text-zinc-700 font-semibold')
                                : (isDarkMode ? 'text-zinc-650 font-light' : 'text-gray-400 font-light')
                            }`}>
                              {rec.memo || "계산 목적 기록을 위한 메모를 추가해 보세요."}
                            </span>
                          </div>
                          
                          <button 
                            onClick={() => startEditingMemo(rec)}
                            className={`text-[9px] font-bold shrink-0 cursor-pointer hover:underline border border-dashed rounded-md px-1.5 py-0.5 transition-colors ${
                              rec.memo
                                ? (isDarkMode ? 'text-zinc-400 border-zinc-800 hover:text-zinc-200' : 'text-gray-500 border-gray-300 hover:text-gray-800')
                                : 'text-blue-500 border-blue-500/30'
                            }`}
                          >
                            {rec.memo ? "수정" : "메모 추가"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordScreen;
