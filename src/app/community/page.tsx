// src/app/community/page.tsx
'use client';

import hoyaImg from '@/assets/images/hoya_heart_brown.webp';
import BookmarkButton from '@/components/ui/BookmarkButton';
import { Button } from '@/components/ui/Button';
import { Card, CardAvatar, CardContent, CardDescription, CardFooter, CardImage, CardTitle } from '@/components/ui/Card';
import PaginationWrapper from '@/components/ui/PaginationWrapper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';
import { useState } from 'react';

const CardData = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  title: '식물 병원 다녀온 후기',
  description: '저희 집 고무나무가 잎마름 병에 걸려서 식물 병원에 다녀왔어요. 치료 과정과 비용, 그리고 치료 후 회복 상태를 알려드릴게요.',
  avatar: 'https://placehold.co/32x32/4ade80/ffffff',
  username: '식물맘',
  image: hoyaImg,
  likes: 143,
  comments: 22,
  views: 389,
  timeAgo: '1일 전',
}));

export default function CommunityPage() {
  // 페이지 레벨에서 북마크된 ID 리스트 관리
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const toggleBookmark = (id: string, bookmarked: boolean) => {
    setBookmarkedIds((prev) => (bookmarked ? [...prev, id] : prev.filter((x) => x !== id)));
  };
  // — 좋아요(하트) 상태 관리
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const toggleLike = (id: string) => {
    setLikedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // 페이징 상태
  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(CardData.length / ITEMS_PER_PAGE);

  // 현재 페이지에 표시할 데이터 슬라이스
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const postsToShow = CardData.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  return (
    <div className='bg-surface mx-auto w-full max-w-[1500px] p-4 md:p-6 lg:p-8'>
      {/* 헤더 */}
      <div className='mb-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center lg:mb-24'>
            <Button variant='ghost' size='icon' className='mr-2 text-4xl lg:hidden' aria-label='뒤로 가기' onClick={() => window.history.back()}>
              ←
            </Button>
            <h1 className='font-regular flex items-baseline gap-2 text-3xl md:text-4xl lg:flex-col lg:items-start lg:gap-1'>
              <span className='hidden text-base lg:inline-block'>| community</span>
              <span>Community</span>
            </h1>
          </div>
          <div className='flex items-center gap-3 self-end sm:self-auto'>
            <label className='flex h-8 items-center gap-2 self-start'>
              <span className='text-sm font-medium'>내가 쓴 글</span>
              <Switch />
            </label>
            <div className='flex flex-col gap-2'>
              <Link href='/community/write'>
                <Button variant='primary' fullWidth className='h-8 px-5'>
                  글쓰기
                </Button>
              </Link>
              <Select>
                <SelectTrigger className='h-5 w-[100px]'>
                  <SelectValue placeholder='최신순' />
                </SelectTrigger>
                <SelectContent align='start'>
                  <SelectItem value='recent'>최신순</SelectItem>
                  <SelectItem value='old'>오래된순</SelectItem>
                  <SelectItem value='popular'>인기순</SelectItem>
                  <SelectItem value='priceHigh'>높은 가격순</SelectItem>
                  <SelectItem value='priceLow'>낮은 가격순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className='grid grid-cols-1 justify-items-center gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {postsToShow.map((post) => {
          const isBookmarked = bookmarkedIds.includes(String(post.id));
          const isLiked = likedIds.includes(String(post.id));
          return (
            <Link key={post.id} href={`/community/${post.id}`}>
              <Card className='relative cursor-pointer'>
                <div className='relative'>
                  <BookmarkButton productId={String(post.id)} initialBookmarked={isBookmarked} variant='default' className='absolute top-2 right-2 z-10 sm:top-3 sm:right-3 md:top-4 md:right-4' onToggle={toggleBookmark} />
                  <CardImage src={post.image} alt={post.title} />
                </div>
                <CardContent>
                  <CardTitle title={post.title} />
                  <CardDescription description={post.description} />
                  <CardAvatar src={post.avatar} alt={post.username} fallback={post.username.charAt(0)} username={post.username} />
                  <CardFooter
                    likes={post.likes}
                    isLiked={isLiked}
                    comments={post.comments}
                    views={post.views}
                    timeAgo={post.timeAgo}
                    onLike={(e?: React.MouseEvent) => {
                      e?.preventDefault();
                      e?.stopPropagation();
                      toggleLike(String(post.id));
                    }}
                  />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* 페이징 (lg 이상 중앙) */}
      <div className='hidden lg:mt-8 lg:flex lg:justify-center'>
        <PaginationWrapper currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
      </div>
    </div>
  );
}
