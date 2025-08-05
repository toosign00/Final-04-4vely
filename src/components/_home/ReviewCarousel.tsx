'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/Carousel';
import { ReviewPopCard } from '@/types/reviewPop.types';
import Image from 'next/image';
import Link from 'next/link';

interface ReviewCarouselProps {
  reviews: ReviewPopCard[];
}

// 리뷰 슬라이드
export default function ReviewCarousel({ reviews }: ReviewCarouselProps) {
  return (
    <section className='bg-[#f2f0eb] py-8 lg:py-12'>
      <div className='mb-15 flex w-full flex-col justify-items-center px-4'>
        <h2 className='mb-2 text-center text-2xl font-bold md:text-3xl lg:text-4xl'>실사용자의 생생한 후기</h2>
        <p className='text-muted mb-7 text-center text-sm md:text-lg lg:mb-9'>식물 집사들이 실제로 구매하고 만족한 상품 후기 모음</p>

        <div className='relative mx-auto w-full max-w-[63rem]'>
          <Carousel opts={{ loop: true, align: 'start', containScroll: 'trimSnaps' }}>
            <CarouselContent>
              {reviews.map((review, index) => (
                <CarouselItem key={index} className='mb-3 flex min-h-[14rem] basis-full place-content-center md:px-6'>
                  <Link href={`/shop/products/${review.product_id}`} className='flex w-full max-w-[60rem] items-stretch gap-6 rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-lg md:gap-8 lg:h-[20rem]'>
                    {/* 좌측 상품 이미지 */}
                    <div className='relative h-full w-[80%] overflow-hidden rounded-l-xl'>
                      <Image src={review.product?.image ?? '/images/default_image.webp'} alt={`${review.product?.name}  상품 이미지`} sizes='(max-width: 768px) 100vw, 700px' fill className='object-cover' />
                    </div>

                    {/* 우측 텍스트 영역 */}
                    <div className='flex w-full flex-col justify-between py-4 pr-4 md:gap-4 lg:pt-6 lg:pr-8'>
                      <div className='flex flex-col gap-1 md:gap-4'>
                        <h3 className='mb-2 text-lg font-semibold md:mb-0 lg:text-2xl'>{review.product?.name}</h3>
                        <p className='text-muted line-clamp-3 max-w-[43ch] text-sm leading-relaxed md:text-base lg:line-clamp-4 lg:text-lg'>{review.content}</p>
                      </div>

                      <div className='mt-4 flex items-center gap-2 border-t pt-4'>
                        <Avatar className='h-8 w-8 md:h-12 md:w-12'>
                          <AvatarImage src={review.user?.image} alt={`${review.user.name} 프로필 이미지`} className='border-muted rounded-3xl border' />
                          <AvatarFallback>{review.user.name}</AvatarFallback>
                        </Avatar>
                        <span className='text-secondary text-sm md:text-base'>{review.user.name}</span>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* 슬라이드 좌우 버튼 */}
            <CarouselPrevious className='left-[-5]' />
            <CarouselNext className='right-[-15] md:right-[-5]' />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
