'use client';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/Carousel';
import Image from 'next/image';
import Link from 'next/link';

interface GreenMagazineItem {
  title: string;
  explain: string;
  image: string;
  href: string;
}

interface Props {
  greenMagazineItems: GreenMagazineItem[];
}

// 매거진 소개글
export function GreenMagazineCarousel({ greenMagazineItems }: Props) {
  return (
    <section className='mx-auto w-full max-w-screen-xl px-4'>
      <h2 className='mb-7 text-center text-2xl font-bold md:text-3xl lg:text-5xl'>Green Magazine</h2>

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
                <Link href={item.href} className='group h-full'>
                  {/* 슬라이드 카드 - 콘텐츠 부분 */}
                  <article className='relative aspect-square w-full overflow-hidden rounded-2xl shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg'>
                    {/* 이미지 */}
                    <Image src={item.image} alt={item.title} fill sizes='(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw' className='object-cover' />

                    {/* 글 제목 & 내용 */}
                    <div className='absolute bottom-0 left-0 flex w-full flex-col justify-center bg-white/80 px-4 py-3'>
                      <h3 className='text-secondary mb-2 line-clamp-1 text-base font-semibold md:text-lg'>{item.title}</h3>
                      <p className='text-muted line-clamp-2 text-sm md:text-base'>{item.explain}</p>
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
    </section>
  );
}
