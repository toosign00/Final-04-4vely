'use client';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/Carousel';
import { useIsMobile } from '@/hooks/useMobile';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export default function HomeHero() {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const autoplay = useRef<ReturnType<typeof Autoplay> | null>(null);

  useEffect(() => {
    autoplay.current = Autoplay({
      delay: 4000, // 자동으로 넘어가는 간격
      stopOnInteraction: false, // 사용자 조작 시 중지 여부
      stopOnMouseEnter: true, // 마우스 올리면 멈춤
    });
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const slides = isMobile
    ? [
        { src: '/images/m_banner_1.svg', alt: '모바일 배너 1' },
        { src: '/images/m_banner_2.svg', alt: '모바일 배너 2' },
        { src: '/images/m_banner_3.svg', alt: '모바일 배너 3' },
      ]
    : [
        { src: '/images/banner_1.svg', alt: '태블릿과 PC 배너 1' },
        { src: '/images/banner_2.svg', alt: '태블릿과 PC 배너 2' },
        { src: '/images/banner_3.svg', alt: '태블릿과 PC 배너 3' },
      ];

  return (
    <section className='mx-auto mb-4 w-full bg-white'>
      <Carousel opts={{ align: 'start', slidesToScroll: 1 }} plugins={autoplay.current ? [autoplay.current] : []} className='relative w-full'>
        <CarouselContent>
          {slides.map((slide, i) => (
            <CarouselItem key={i} className='!w-full !p-0'>
              <div className={`relative w-full ${isMobile ? 'aspect-[3/2]' : 'aspect-[16/6]'}`}>
                <Image src={slide.src} alt={slide.alt} fill className='object-cover' priority={i === 0} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* 좌우 버튼 */}
        <div className='absolute right-2 bottom-1 flex gap-4'>
          <CarouselPrevious className={`relative !top-auto !left-auto size-10 !translate-y-0 border bg-white/80 shadow-md lg:size-12`} />
          <CarouselNext className={`!relative !top-auto !right-auto size-10 !translate-y-0 border bg-white/80 shadow-md lg:size-12`} />
        </div>
      </Carousel>
    </section>
  );
}
