'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Card, CardContent, CardDescription, CardFooter, CardImage, CardTitle } from '@/components/ui/Card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/Carousel';
import Link from 'next/link';
import { useState } from 'react';

interface PlantPost {
  id: number;
  title: string;
  description: string;
  image: string;
  userName: string;
  avatar: string;
  likes: number;
  comments: number;
  views: number;
  timeAgo: string;
  href: string;
  fallback: string;
}

interface Props {
  popularPosts: PlantPost[];
}

// 커뮤니티 인기글
export default function CommunityPop({ popularPosts }: Props) {
  // 좋아요 상태 개별 관리
  const [isLiked, setIsLiked] = useState<{ [id: number]: boolean }>({});

  const handleLike = (id: number) => {
    setIsLiked((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    console.log('좋아요');
  };

  return (
    <section className='mx-auto w-full max-w-screen-xl md:px-4'>
      <h2 className='mb-2 text-center text-2xl font-bold md:text-3xl lg:text-4xl'>이번 주 인기 반려 식물</h2>
      <p className='text-muted mb-7 text-center text-sm md:text-lg'>커뮤니티에서 가장 많은 사랑을 받은 식물 이야기들</p>

      <Carousel
        opts={{
          loop: true,
          align: 'start',
          containScroll: 'trimSnaps',
        }}
      >
        <CarouselContent>
          {popularPosts.map((post) => (
            <CarouselItem key={post.id} className='mb-3 px-5 sm:px-7'>
              <Card className='max-w-none shadow-md'>
                <Link href={post.href} className='block'>
                  {/* 인기 반려식물 이미지 */}
                  <CardImage src={post.image} alt={post.title} priority />
                  {/* 콘텐츠 - 제목 & 본문 */}
                  <CardContent>
                    <CardTitle title={`[ 제목 ] ${post.title}`} className='text-secondary text-base font-semibold sm:line-clamp-1 md:text-lg' />
                    <CardDescription description={`[ 본문 내용 ] ${post.description}`} className='text-muted mr-3 text-sm md:mr-0 md:text-base' />
                  </CardContent>
                </Link>
                {/* 아바타 이미지 & 닉네임 */}
                <div className='mb-5 px-5'>
                  <div className='mb-2 flex items-center gap-2'>
                    <Avatar className='mb-2 h-8 w-8 md:h-12 md:w-12'>
                      <AvatarImage src={post.avatar} alt={post.userName} className='border-muted rounded-3xl border' />
                      <AvatarFallback>{post.fallback}</AvatarFallback>
                    </Avatar>
                    <span className='text-secondary text-sm md:text-lg'>{post.userName}</span>
                  </div>

                  {/* 카드 하단 좋아요 & 댓글 & 조회수 */}
                  <CardFooter likes={post.likes} comments={post.comments} views={post.views} timeAgo={post.timeAgo} isLiked={isLiked[post.id] !== undefined && isLiked[post.id] !== null ? isLiked[post.id] : false} onLike={() => handleLike(post.id)} />
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* 슬라이드 좌우 버튼 */}
        <CarouselPrevious className='left-0' />
        <CarouselNext className='right-0' />
      </Carousel>
    </section>
  );
}
