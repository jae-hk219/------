import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaThumbsUp, FaThumbsDown, FaPaperPlane, FaUserCircle, FaRegCommentDots } from 'react-icons/fa';
import { useAppContext } from '../../context/AppContext';

const PostDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isDarkMode, t } = useAppContext();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Clicks for like / dislike toggle mechanism
  const [likeClicks, setLikeClicks] = useState(0);
  const [dislikeClicks, setDislikeClicks] = useState(0);

  // Load post and comments dynamically
  useEffect(() => {
    try {
      const posts = JSON.parse(localStorage.getItem('custom_posts')) || [];
      const matched = posts.find(p => p.id === parseInt(id));
      if (matched) {
        setPost(matched);
      }

      const storedComments = JSON.parse(localStorage.getItem(`post_comments_${id}`)) || [];
      setComments(storedComments);
    } catch (err) {
      console.error(err);
    }
  }, [id]);

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
      localStorage.setItem(`post_comments_${id}`, JSON.stringify(updatedComments));
      setComments(updatedComments);
      setNewComment('');
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
          <span className="mr-3 font-bold text-blue-500">{post.author}</span>
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
                    <span className="text-[10px] font-extrabold text-blue-500 flex items-center gap-1">
                      <FaUserCircle size={12} className="text-zinc-500" />
                      {comm.author}
                    </span>
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
    </div>
  );
};

export default PostDetailScreen;

