'use client';

import PaginationWrapper from '@/components/ui/PaginationWrapper';
import { useState } from 'react';
import PostCard from './_components/PostCard';

export default function PostsPage() {
  // 예시 북마크 게시글 데이터
  const postsData = [
    {
      id: 1,
      imageUrl: '/images/insam_black.webp',
      title: '인삼 키우기 팁 공유합니다',
      content: '인삼을 키우면서 배운 노하우를 공유합니다. 물 관리와 햇빛 조절이 가장 중요해요.',
      author: '식물러버',
      viewCount: 1250,
      commentCount: 23,
    },
    {
      id: 2,
      imageUrl: '/images/african_violet_black.webp',
      title: '아프리카 바이올렛 꽃 피우는 방법',
      content: '아프리카 바이올렛이 꽃을 피우지 않을 때 해결 방법을 알려드려요. 온도와 습도 관리가 핵심입니다.',
      author: '꽃사랑',
      viewCount: 890,
      commentCount: 15,
    },
    {
      id: 3,
      imageUrl: '/images/aglaonema_siam_black.webp',
      title: '공기정화식물 추천 TOP 5',
      content: '실내 공기를 깨끗하게 만들어주는 식물들을 소개합니다. NASA에서도 인증받은 식물들이에요.',
      author: '그린라이프',
      viewCount: 2100,
      commentCount: 42,
    },
    {
      id: 4,
      imageUrl: '/images/acadia_palenopsis_orchid.webp',
      title: '난초 관리 완벽 가이드',
      content: '난초를 오래 키우는 비법을 알려드립니다. 물주기와 통풍이 가장 중요한 포인트예요.',
      author: '난초전문가',
      viewCount: 1560,
      commentCount: 31,
    },
  ];

  // 한 페이지에 보여줄 아이템 개수
  const ITEMS_PER_PAGE = 3;

  // 현재 페이지 번호 (1부터 시작)
  const [currentPage, setCurrentPage] = useState(1);

  // 전체 페이지 수
  const totalPages = Math.ceil(postsData.length / ITEMS_PER_PAGE);

  // 현재 페이지의 첫 아이템 인덱스
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;

  // 현재 페이지에 보여줄 데이터 배열
  const displayItems = postsData.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  return (
    <div className='grid gap-6 p-4 md:p-5 lg:p-6'>
      {/* 북마크 게시글 카드 - 여러 개일 경우 map으로 반복 */}
      {displayItems.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {/* 페이지네이션 UI */}
      <div className='mt-8 flex justify-center'>
        <PaginationWrapper currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
      </div>
    </div>
  );
}
