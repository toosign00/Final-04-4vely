'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/Carousel';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface Review {
  id: number;
  productName: string;
  productImg: string;
  avatarImg: string;
  userName: string;
  content: string;
  fallback: string;
}

interface ReviewCarouselProps {
  reviews: Review[];
}

// 리뷰 슬라이드
export default function ReviewCarousel({ reviews }: ReviewCarouselProps) {
  return (
    <section className='mb-15 w-full justify-items-center px-4'>
      <h2 className='mb-2 text-center text-2xl font-bold md:text-3xl lg:text-4xl'>사용자 리얼 후기</h2>
      <p className='text-muted mb-7 text-center text-sm md:text-lg'>실제 식물 집사들의 생생한 키우기 경험담</p>

      <div className='relative w-full max-w-[63rem]'>
        <Carousel
          opts={{
            loop: true,
            align: 'start',
            containScroll: 'trimSnaps',
          }}
        >
          {/* 상품 상세 페이지로 연결 필요 */}
          <Link href='/shop'>
            <CarouselContent>
              {reviews.map((review) => (
                <ReviewSlide key={review.id} review={review} />
              ))}
            </CarouselContent>
          </Link>

          {/* 슬라이드 좌우 버튼 */}
          <CarouselPrevious className='left-0' />
          <CarouselNext className='right-0' />
        </Carousel>
      </div>
    </section>
  );
}

// 이미지 & 텍스트 & 사용자 정보
function ReviewSlide({ review }: { review: Review }) {
  const [imageError, setImageError] = useState(false);

  return (
    <CarouselItem className='mb-3 flex basis-full place-content-center'>
      <div className='flex w-full max-w-[60rem] items-start gap-6 rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl md:gap-8 lg:h-[20rem]'>
        {/* 왼쪽 이미지 */}
        <div className='relative h-full w-[80%] overflow-hidden rounded-l-xl'>
          {!imageError ? (
            <Image src={review.productImg} alt={review.productName} fill className='object-cover' sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' onError={() => setImageError(true)} />
          ) : (
            <div className='absolute inset-0 flex items-center justify-center bg-gray-400'>
              <span className='text-secondary text-base'>이미지를 불러올 수 없습니다</span>
            </div>
          )}
        </div>

        {/* 오른쪽 텍스트 */}
        <div className='flex w-full flex-col justify-between gap-6 py-4 pr-4'>
          <div className='border-b pr-5 pb-4'>
            <h3 className='mb-2 text-lg font-semibold lg:text-2xl'>{review.productName}</h3>
            <p className='text-muted mb-4 line-clamp-4 text-sm leading-relaxed md:text-base lg:text-lg'>{review.content}</p>
          </div>

          {/* 사용자 정보 */}
          <div className='flex items-center gap-2'>
            <Avatar className='h-8 w-8 md:h-12 md:w-12'>
              <AvatarImage src={review.avatarImg} alt={review.userName} className='border-muted rounded-3xl border' />
              <AvatarFallback>{review.fallback}</AvatarFallback>
            </Avatar>
            <span className='text-secondary text-sm md:text-base'>{review.userName}</span>
          </div>
        </div>
      </div>
    </CarouselItem>
  );
}
