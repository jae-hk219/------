import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaSearch, FaEllipsisV, FaPen, FaCommentAlt } from 'react-icons/fa';

// Placeholder mock data
export const MOCK_POSTS = [
  {
    id: 1,
    category: '전기공사',
    title: 'KEC 2026 개정 규격 확인 방법 공유',
    content: '최신 KEC 규격 변경 사항에 대해 궁금하신 분들은 이 글을 확인해 주세요. 특히 제123조와 관련된 접지 규정의 변경이 현장에 큰 영향을 미칠 것으로 보입니다. 주의 깊게 살펴볼 필요가 있습니다.',
    time: '5분 전',
    author: '익명',
    comments: 12,
    likes: 5,
    dislikes: 1
  },
  {
    id: 2,
    category: '질문/답변',
    title: '현장에서 사용하는 차단기 트립 관련 질문',
    content: '메인 차단기가 자주 트립되는데, 절연 저항 측정 시 이상이 없습니다. 부하 측의 문제인지, 아니면 차단기 자체의 노후화인지 확인하기 위해 어떤 테스트를 더 해봐야 할까요?',
    time: '12분 전',
    author: '익명',
    comments: 8,
    likes: 2,
    dislikes: 0
  },
  {
    id: 3,
    category: '배관공사',
    title: '접지 시스템 설계 시 주의사항',
    content: '이번 프로젝트에서 접지 설계를 맡았는데, KEC 규정에 맞춘 효과적인 접지 저항 값을 얻기 위해 토양 저항률 측정과 대지 파라미터 분석이 필수적임을 깨달았습니다.',
    time: '34분 전',
    author: '익명',
    comments: 15,
    likes: 20,
    dislikes: 2
  },
  {
    id: 4,
    category: '일반공학',
    title: '현장 안전 규칙: 반드시 지켜야 할 5가지',
    content: '우리 모두의 안전을 위해 이것만은 꼭 지킵시다. 1. 하이바 필수 착용, 2. 안전화 착용, 3. 작업 전 스트레칭, 4. 위험 구역 접근 금지, 5. 장비 점검 철저',
    time: '1시간 전',
    author: '현장안전팀',
    comments: 20,
    likes: 45,
    dislikes: 0
  }
];

const CATEGORIES = ['전체', '전기공사', '배관공사', '일반공학', '질문/답변'];

const CommunityScreen = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('전체');

  const filteredPosts = activeCategory === '전체' 
    ? MOCK_POSTS 
    : MOCK_POSTS.filter(post => post.category === activeCategory);

  return (
    <div className="flex flex-col h-full bg-white pb-24 relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center">
          <button onClick={() => navigate('/home')} className="mr-3 text-gray-700">
            <FaChevronLeft size={20} />
          </button>
          <div>
            <span className="text-xs text-gray-500">커뮤니티 /</span>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">현장 소통방</h1>
          </div>
        </div>
        <div className="flex space-x-4 text-gray-600">
          <button><FaSearch size={18} /></button>
          <button><FaEllipsisV size={18} /></button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto whitespace-nowrap border-b border-gray-100 scrollbar-hide bg-white sticky top-[60px] z-10 px-2">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeCategory === category 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Post List */}
      <div className="flex-1 bg-[#F5F5F5] p-2 space-y-2">
        {filteredPosts.map(post => (
          <div 
            key={post.id} 
            onClick={() => navigate(`/community/${post.id}`)}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer active:bg-gray-50 transition-colors"
          >
            <h2 className="font-bold text-base text-gray-900 mb-1 line-clamp-1">{post.title}</h2>
            <p className="text-sm text-gray-600 line-clamp-1 mb-3">{post.content}</p>
            <div className="flex items-center text-xs text-gray-500">
              <span className="mr-2">{post.time}</span>
              <span className="mr-2">| {post.author} |</span>
              <span className="mr-2">border-t</span>
              <div className="flex items-center ml-auto">
                <FaCommentAlt className="mr-1" size={12} />
                <span>{post.comments}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-20 right-4 w-14 h-14 bg-red-500 rounded-full shadow-lg flex flex-col items-center justify-center text-white z-40 hover:scale-105 transition-transform">
        <FaPen size={16} className="mb-1" />
        <span className="text-[10px]">글 쓰기</span>
      </button>
    </div>
  );
};

export default CommunityScreen;
