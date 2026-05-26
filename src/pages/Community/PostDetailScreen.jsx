import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { MOCK_POSTS } from './CommunityScreen';

const PostDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = MOCK_POSTS.find(p => p.id === parseInt(id));

  // Like / Dislike state logic based on prompt:
  // "좋아요,싫어요를 한 번 누르면 +1 한 번 더 누르면 -1이 되고, 불연속 주기함수를 사용하여 정수인 함수로 홀수 클릭은 +1 짝수 클릭은 -1이 되도록 함."
  // Basically, it's a toggle that increments by 1 on odd clicks (1st, 3rd) and decrements by 1 on even clicks (2nd, 4th).
  // Effectively, it cycles between +0 and +1.
  const [likeClicks, setLikeClicks] = useState(0);
  const [dislikeClicks, setDislikeClicks] = useState(0);

  if (!post) return <div className="p-4">게시글을 찾을 수 없습니다.</div>;

  const getLikeOffset = (clicks) => clicks % 2 !== 0 ? 1 : 0;
  
  const currentLikes = post.likes + getLikeOffset(likeClicks);
  const currentDislikes = post.dislikes + getLikeOffset(dislikeClicks);

  return (
    <div className="flex flex-col h-full bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <button onClick={() => navigate('/community')} className="mr-3 text-gray-700">
          <FaChevronLeft size={20} />
        </button>
        <div>
          <span className="text-xs text-gray-500 font-bold block mb-1">계산 생태계</span>
          <span className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded-md">{post.category}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1">
        <h1 className="text-xl font-bold text-gray-900 mb-4 leading-relaxed">{post.title}</h1>
        <div className="flex items-center text-xs text-gray-500 mb-6 pb-4 border-b border-gray-100">
          <span className="mr-3 font-medium text-gray-700">{post.author}</span>
          <span>{post.time}</span>
        </div>
        
        <p className="text-gray-800 font-thin leading-loose whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center items-center py-8 pb-32 gap-4 bg-white">
        <button 
          onClick={() => setLikeClicks(prev => prev + 1)}
          className={`flex flex-col items-center justify-center w-20 h-20 rounded-xl border transition-colors ${
            likeClicks % 2 !== 0 ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-500'
          }`}
        >
          <FaThumbsUp size={24} className="mb-2" />
          <span className="text-xs font-medium">{currentLikes}</span>
        </button>

        <button 
          onClick={() => setDislikeClicks(prev => prev + 1)}
          className={`flex flex-col items-center justify-center w-20 h-20 rounded-xl border transition-colors ${
            dislikeClicks % 2 !== 0 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-500'
          }`}
        >
          <FaThumbsDown size={24} className="mb-2" />
          <span className="text-xs font-medium">{currentDislikes}</span>
        </button>
      </div>
    </div>
  );
};

export default PostDetailScreen;
