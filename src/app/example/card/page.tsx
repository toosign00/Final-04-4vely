'use client';

import { Card, CardAvatar, CardContent, CardDescription, CardFooter, CardImage, CardTitle } from '@/components/ui/Card';
import { useState } from 'react';

// TODO: 좋아요 버튼 클릭 시 좋아요 필요
// TODO: 모든 데이터 API 연동 필요
export default function CardTestPage() {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    console.log('좋아요');
  };

  return (
    <div className='flex min-h-screen flex-col items-center bg-neutral-50 p-8'>
      <h1 className='t-h1 mb-10'>Card 컴포넌트 예시</h1>
      <Card>
        <CardImage src='https://placehold.co/400x300/4ade80/ffffff' alt='식물 사진' priority />
        <CardContent>
          {/* 제목 */}
          <CardTitle title='식물 병원 다녀온 후기' />
          {/* 본문 */}
          <CardDescription description='저희 집 고무나무가 잎마름 병에 걸려서 식물 병원에 다녀왔어요. 치료 과정과 비용, 그리고 치료 후 회복 상태를 알려드릴게요.' />
          {/* 사용자명 */}
          <CardAvatar src='https://placehold.co/32x32/4ade80/ffffff' alt='식물맘' fallback='식물맘' username='식물맘' />
          {/* 하단 정보 */}
          <CardFooter likes={143} isLiked={isLiked} comments={22} views={389} timeAgo='1일 전' onLike={handleLike} />
        </CardContent>
      </Card>
    </div>
  );
}
