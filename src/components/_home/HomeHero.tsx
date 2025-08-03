'use client';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/Carousel';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import { useRef } from 'react';

export default function HomeHero() {
  const autoplay = useRef(
    Autoplay({
      delay: 4000, // 자동으로 넘어가는 간격
      stopOnInteraction: false, // 사용자 조작 시 중지 여부
      stopOnMouseEnter: true, // 마우스 올리면 멈춤
    }),
  );

  return (
    <section className='relative mb-4 w-full border'>
      {/* 태블릿 & PC 전용 배너 */}
      <div className='hidden md:block'>
        <Carousel
          opts={{
            align: 'start',
            slidesToScroll: 1,
          }}
          plugins={[autoplay.current]}
          className='relative w-full'
        >
          <CarouselContent>
            {/* 배너 1 */}
            <CarouselItem className='!w-full !p-0'>
              <Image src='/images/banner_1.svg' alt='배너 1' width={1440} height={600} className='h-full w-full object-cover' priority />
            </CarouselItem>
            {/* 배너 2 */}
            <CarouselItem className='!w-full !p-0'>
              <Image src='/images/banner_2.svg' alt='배너 2' width={1440} height={600} className='h-full w-full object-cover' />
            </CarouselItem>
            {/* 배너 3 */}
            <CarouselItem className='!w-full !p-0'>
              <Image src='/images/banner_3.svg' alt='배너 3' width={1440} height={600} className='h-full w-full object-cover' />
            </CarouselItem>
          </CarouselContent>

          {/* 좌우 버튼 */}
          <div className='absolute right-2 bottom-1 flex gap-4'>
            <CarouselPrevious className='!relative !top-auto !left-auto size-10 !translate-y-0 rounded-full border bg-white/80 shadow-md lg:size-12' />
            <CarouselNext className='!relative !top-auto !right-auto size-10 !translate-y-0 rounded-full border bg-white/80 shadow-md lg:size-12' />
          </div>
        </Carousel>
      </div>
      {/* 모바일 전용 배너 */}
      <div className='block md:hidden'>
        <Carousel
          opts={{
            align: 'start',
            slidesToScroll: 1,
          }}
          plugins={[autoplay.current]}
          className='relative w-full'
        >
          <CarouselContent>
            {/* 배너 1 */}
            <CarouselItem className='!w-full !p-0'>
              <Image src='/images/m_banner_1.svg' alt='모바일 배너 1' width={720} height={900} className='h-full w-full object-cover' priority />
            </CarouselItem>
            {/* 배너 2 */}
            <CarouselItem className='!w-full !p-0'>
              <Image src='/images/m_banner_2.svg' alt='모바일 배너 2' width={720} height={900} className='h-full w-full object-cover' />
            </CarouselItem>
            {/* 배너 3 */}
            <CarouselItem className='!w-full !p-0'>
              <Image src='/images/m_banner_3.svg' alt='모바일 배너 3' width={720} height={900} className='h-full w-full object-cover' />
            </CarouselItem>
          </CarouselContent>

          {/* 좌우 버튼 */}
          <div className='absolute right-2 bottom-1 flex gap-4'>
            <CarouselPrevious className='!relative !top-auto !left-auto size-10 !translate-y-0 rounded-full border bg-white/80 shadow-md' />
            <CarouselNext className='!relative !top-auto !right-auto size-10 !translate-y-0 rounded-full border bg-white/80 shadow-md' />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
