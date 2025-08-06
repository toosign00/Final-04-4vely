'use client';

import { MagazinePostData } from '@/app/green-magazine/_types/magazine.types';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/Carousel';
import { AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface HomeMagazineProps {
  greenMagazineItems: MagazinePostData[];
}

// 매거진 슬라이드
export function GreenMagazineCarousel({ greenMagazineItems }: HomeMagazineProps) {
  return (
    <section className='bg-[#f8f7f3] py-8 lg:py-12'>
      <div className='mx-auto w-full max-w-screen-xl px-4'>
        <h2 className='mb-7 text-center text-2xl font-bold md:text-3xl lg:mb-9 lg:text-5xl'>Green Magazine</h2>
        {/* fallback 처리 */}
        {greenMagazineItems.length === 0 ? (
          <div className='flex min-h-[19.4375rem] flex-col items-center justify-center gap-4 rounded-xl bg-white p-6 text-center shadow-md lg:min-h-[25rem]'>
            <AlertTriangle className='h-10 w-10 text-yellow-500 md:h-12 md:w-12' />
            <div>
              <p className='text-lg font-semibold text-gray-800 md:text-xl lg:text-2xl'>매거진 콘텐츠를 불러오지 못했습니다.</p>
              <p className='mt-1 text-sm text-gray-500 md:text-base'>잠시 후에 다시 시도해주세요.</p>
            </div>
          </div>
        ) : (
          <div className='relative w-full'>
            <Carousel
              opts={{
                loop: true,
                align: 'start',
                containScroll: 'trimSnaps', // 첫 슬라이드랑 마지막 슬라이드 경계 맞춤
              }}
            >
              <CarouselContent>
                {greenMagazineItems.map((item, index) => (
                  <CarouselItem key={index} className='mb-4 px-4'>
                    <Link href={`/green-magazine/${item._id}`} className='group h-full'>
                      {/* 슬라이드 카드 - 콘텐츠 부분 */}
                      <article className='relative aspect-square w-full overflow-hidden rounded-2xl shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg'>
                        {/* 이미지 */}
                        <Image src={item.image} alt={item.title} fill sizes='(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw' className='object-cover' />

                        {/* 글 제목 & 내용 */}
                        <div className='absolute bottom-0 left-0 flex w-full flex-col justify-center bg-white/80 px-4 py-3'>
                          <h3 className='text-secondary mb-2 line-clamp-1 text-base font-semibold md:text-lg'>{item.title}</h3>
                          <p className='text-muted line-clamp-2 text-sm md:text-base'>{item.extra?.contents?.[0].content ?? item.content}</p>
                        </div>
                      </article>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* 슬라이드 좌우 버튼 */}
              <CarouselPrevious className='left-0' />
              <CarouselNext className='right-0' />
            </Carousel>
          </div>
        )}
      </div>
    </section>
  );
}
