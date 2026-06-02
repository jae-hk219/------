import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaThumbsUp, FaThumbsDown, FaPaperPlane, FaUserCircle, FaRegCommentDots, FaSync, FaTimes } from 'react-icons/fa';
import { useAppContext } from '../../context/AppContext';
import { getLocalPosts, syncPosts, getLocalComments, saveLocalComments, saveRemoteComments, syncComments } from '../../services/communitySync';
import { getLocalUsers } from '../../services/authSync';

const PostDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isDarkMode, t } = useAppContext();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState(null);

  // Clicks for like / dislike toggle mechanism
  const [likeClicks, setLikeClicks] = useState(0);
  const [dislikeClicks, setDislikeClicks] = useState(0);

  // Load post and comments dynamically
  useEffect(() => {
    loadPostAndComments();
  }, [id]);

  const loadPostAndComments = async () => {
    try {
      const posts = getLocalPosts();
      const matched = posts.find(p => p.id === parseInt(id));
      if (matched) {
        setPost(matched);
      }
      setComments(getLocalComments(id));
      setRegisteredUsers(getLocalUsers());
    } catch (err) {
      console.error(err);
    }

    setIsSyncing(true);
    try {
      const syncedPosts = await syncPosts();
      const matched = syncedPosts.find(p => p.id === parseInt(id));
      if (matched) {
        setPost(matched);
      }

      const syncedComments = await syncComments(id);
      setComments(syncedComments);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!post) {
    return (
      <div className={`p-8 text-center min-h-screen ${isDarkMode ? 'bg-black text-zinc-500' : 'bg-white text-gray-500'}`}>
        게시글을 찾을 수 없습니다.
      </div>
    );
  }

  // Toggle offset logic: odd click = +1, even click = +0
  const getLikeOffset = (clicks) => clicks % 2 !== 0 ? 1 : 0;
  
  const currentLikes = (post.likes || 0) + getLikeOffset(likeClicks);
  const currentDislikes = (post.dislikes || 0) + getLikeOffset(dislikeClicks);

  // Handle Comment Submission
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentItem = {
      id: Date.now(),
      author: currentUser?.nickname || '익명',
      userId: currentUser?.id || 'guest',
      content: newComment.trim(),
      date: new Date().toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const updatedComments = [...comments, commentItem];
    try {
      saveLocalComments(id, updatedComments);
      setComments(updatedComments);
      setNewComment('');

      saveRemoteComments(id, updatedComments).catch(err => {
        console.warn("Deferred Firebase upload for new comment:", err);
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`flex flex-col h-full min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Header */}
      <div className={`flex items-center p-4 border-b sticky top-0 z-10 transition-colors ${
        isDarkMode ? 'border-zinc-800 bg-zinc-950 text-white' : 'border-gray-100 bg-white text-black'
      }`}>
        <button 
          onClick={() => navigate('/community')} 
          className={`mr-3 p-1.5 rounded-full ${isDarkMode ? 'hover:bg-zinc-850' : 'hover:bg-gray-100'}`}
        >
          <FaChevronLeft size={20} />
        </button>
        <div>
          <span className="text-[10px] text-zinc-500 font-bold block mb-0.5">{t('app_title')}</span>
          <span className="text-[10px] text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md font-bold">{post.category}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 max-w-md mx-auto w-full pb-8">
        <h1 className="text-lg font-bold mb-4 leading-snug">{post.title}</h1>
        
        <div className={`flex items-center text-[10px] mb-6 pb-4 border-b ${
          isDarkMode ? 'border-zinc-800 text-zinc-500' : 'border-gray-100 text-gray-400'
        }`}>
          <button 
            type="button"
            onClick={() => {
              const userDetails = registeredUsers.find(u => u.id === post.userId) || { 
                id: post.userId || 'guest', 
                nickname: post.author, 
                specialty: '일반 전문가', 
                profileImage: null 
              };
              setSelectedAuthor(userDetails);
            }}
            className="flex items-center gap-1.5 hover:opacity-80 active:scale-95 transition-all text-left cursor-pointer mr-3"
          >
            {(() => {
              const userDetails = registeredUsers.find(u => u.id === post.userId);
              const img = userDetails?.profileImage;
              if (img) {
                return (
                  <img src={img} alt="Profile" className="w-5 h-5 rounded-full object-cover border border-zinc-800/10 shrink-0" />
                );
              }
              return (
                <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gray-200 text-gray-500 shrink-0">
                  <FaUserCircle size={12} />
                </div>
              );
            })()}
            <span className="font-bold text-blue-500">{post.author}</span>
          </button>
          <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '방금 전'}</span>
        </div>
        
        <p className={`text-xs font-light leading-relaxed whitespace-pre-wrap ${
          isDarkMode ? 'text-zinc-300' : 'text-gray-700'
        }`}>
          {post.content}
        </p>

        {/* Action Buttons (Like / Dislike) */}
        <div className="flex justify-center items-center py-8 gap-4">
          <button 
            onClick={() => setLikeClicks(prev => prev + 1)}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl border transition-all cursor-pointer ${
              likeClicks % 2 !== 0 
                ? 'bg-blue-500/10 border-blue-500 text-blue-500 shadow-md scale-95' 
                : (isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700' : 'bg-white border-gray-200 text-gray-450 hover:border-gray-300')
            }`}
          >
            <FaThumbsUp size={16} className="mb-1" />
            <span className="text-[10px] font-extrabold">{currentLikes}</span>
          </button>

          <button 
            onClick={() => setDislikeClicks(prev => prev + 1)}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl border transition-all cursor-pointer ${
              dislikeClicks % 2 !== 0 
                ? 'bg-red-500/10 border-red-500 text-red-500 shadow-md scale-95' 
                : (isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700' : 'bg-white border-gray-200 text-gray-450 hover:border-gray-300')
            }`}
          >
            <FaThumbsDown size={16} className="mb-1" />
            <span className="text-[10px] font-extrabold">{currentDislikes}</span>
          </button>
        </div>

        {/* Comment Section Divider */}
        <div className={`mt-6 pt-6 border-t ${
          isDarkMode ? 'border-zinc-800' : 'border-gray-150'
        }`}>
          <h3 className="text-xs font-bold flex items-center gap-1.5 mb-5">
            <FaRegCommentDots size={14} className="text-blue-500" />
            <span>댓글 의견 공유</span>
            <span className="text-blue-500 font-extrabold">({comments.length})</span>
            {isSyncing && (
              <FaSync className="text-blue-500 animate-spin" size={10} title="동기화 중..." />
            )}
          </h3>

          {/* Comment List */}
          {comments.length === 0 ? (
            <div className="text-center py-6">
              <p className={`text-[11px] font-bold ${isDarkMode ? 'text-zinc-700' : 'text-gray-300'}`}>
                첫 번째 댓글을 작성하여 서로의 의견을 공유해 보세요!
              </p>
            </div>
          ) : (
            <div className="space-y-4 mb-8">
              {comments.map((comm) => (
                <div 
                  key={comm.id}
                  className={`p-3.5 rounded-2xl border transition-colors ${
                    isDarkMode ? 'bg-zinc-950 border-zinc-900' : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <button 
                      type="button"
                      onClick={() => {
                        const userDetails = registeredUsers.find(u => u.id === comm.userId) || { 
                          id: comm.userId || 'guest', 
                          nickname: comm.author, 
                          specialty: '일반 전문가', 
                          profileImage: null 
                        };
                        setSelectedAuthor(userDetails);
                      }}
                      className="text-[10px] font-extrabold text-blue-500 flex items-center gap-1.5 hover:opacity-80 active:scale-95 transition-all text-left cursor-pointer"
                    >
                      {(() => {
                        const userDetails = registeredUsers.find(u => u.id === comm.userId);
                        const img = userDetails?.profileImage;
                        if (img) {
                          return (
                            <img src={img} alt="Profile" className="w-4.5 h-4.5 rounded-full object-cover border border-zinc-800/10 shrink-0" />
                          );
                        }
                        return (
                          <div className="w-4.5 h-4.5 rounded-full flex items-center justify-center bg-gray-200 text-gray-500 shrink-0">
                            <FaUserCircle size={10} />
                          </div>
                        );
                      })()}
                      <span>{comm.author}</span>
                    </button>
                    <span className={`text-[8px] ${isDarkMode ? 'text-zinc-650' : 'text-gray-400'}`}>
                      {comm.date}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>
                    {comm.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Comment Input Form */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2 items-center mt-4">
            <input 
              type="text"
              required
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="따뜻하고 건설적인 피드백을 남겨주세요."
              className={`flex-1 text-xs px-3.5 py-2.5 rounded-xl border outline-none font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-zinc-900 border-zinc-800 text-white focus:border-zinc-700' 
                  : 'bg-white border-gray-200 text-black focus:border-gray-300'
              }`}
            />
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl flex items-center justify-center cursor-pointer transition-colors active:scale-95 shrink-0"
              title="댓글 등록"
            >
              <FaPaperPlane size={12} />
            </button>
          </form>
        </div>
      </div>

      {/* ================= AUTHOR PROFILE MODAL ================= */}
      {selectedAuthor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className={`w-full max-w-xs rounded-3xl p-6 shadow-2xl animate-scale-up border transition-colors ${
            isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-gray-200 text-black'
          }`}>
            <div className="flex justify-end">
              <button 
                onClick={() => setSelectedAuthor(null)}
                className={`p-1.5 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <FaTimes size={16} />
              </button>
            </div>

            <div className="flex flex-col items-center text-center mt-2 mb-4">
              {selectedAuthor.profileImage ? (
                <img 
                  src={selectedAuthor.profileImage} 
                  alt="Author Profile" 
                  className="w-16 h-16 rounded-full object-cover mb-4 border border-gray-300 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-200 text-gray-400 mb-4 shadow-inner">
                  <FaUserCircle size={44} />
                </div>
              )}

              <h3 className="text-base font-extrabold tracking-tight mb-1">
                {selectedAuthor.nickname || '익명'}
              </h3>
              
              <span className="text-[9px] font-black text-blue-500 bg-blue-500/10 px-2.5 py-0.5 rounded-full mb-6 uppercase tracking-wider">
                {selectedAuthor.specialty || '일반 전문가'}
              </span>

              <div className={`w-full p-3.5 rounded-2xl border text-xs font-semibold space-y-2 text-left leading-relaxed ${
                isDarkMode ? 'bg-zinc-900 border-zinc-850' : 'bg-gray-50 border-gray-100'
              }`}>
                <div className="flex justify-between border-b border-dashed border-zinc-800/15 pb-1.5">
                  <span className="opacity-60 text-[10px]">계정 아이디 (ID)</span>
                  <span className="font-extrabold">{selectedAuthor.id || 'guest'}</span>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span className="opacity-60 text-[10px]">전문 분야</span>
                  <span className="font-bold">{selectedAuthor.specialty || '미등록'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetailScreen;

