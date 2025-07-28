'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Eye } from 'lucide-react';
import Image from 'next/image';

export default function GreenMagazineDetailPage() {
  return (
    <div className='text-secondary w-full'>
      {/* 대표 이미지 */}
      <div className='relative h-50 w-full md:h-60'>
        <Image src='/images/acadia_palenopsis_orchid.webp' alt='대표 이미지' fill className='object-cover' priority />
      </div>

      <main className='mx-auto w-full max-w-4xl px-4 py-10 md:p-6 lg:p-8'>
        {/* 제목 & 작성자 & 작성일 & 조회 수 */}
        <section className='mb-8 border-b-2 pb-6'>
          <h1 className='mb-4 text-xl font-semibold md:text-2xl'>해피트리, 물 주는 타이밍이 중요해요</h1>
          <div className='flex items-center justify-between text-sm text-gray-500 md:text-base'>
            <div className='flex items-center gap-2'>
              <Avatar className='border-muted h-8 w-8 rounded-3xl border'>
                <AvatarImage src='/favicon.svg' alt='관리자 아바타' />
                <AvatarFallback>관리자</AvatarFallback>
              </Avatar>
              <span>초록이</span>
              <span>·</span>
              <span>2025-07-28</span>
            </div>
            <span className='flex items-center gap-1'>
              <Eye size={14} />
              123
            </span>
          </div>
        </section>

        {/* 내용 */}
        <section className='mx-auto mb-10 max-w-[50rem] px-5 text-center'>
          {/* 콘텐츠 1 */}
          <div className='mb-10'>
            <Image src='/images/acadia_palenopsis_orchid.webp' alt='콘텐츠 이미지 1' width={300} height={400} className='mx-auto w-full max-w-[30rem] rounded-xl border' />
            <p className='mt-6 lg:text-lg'>해피트리는 잎이 축 처지기 전에 물을 주는 것이 가장 중요합니다. 과습보다는 건조한 편이 좋기 때문에, 겉흙이 마른 것을 확인하고 물을 주세요.</p>
          </div>

          {/* 콘텐츠 2 */}
          <div className='mb-10'>
            <Image src='/images/acadia_palenopsis_orchid.webp' alt='콘텐츠 이미지 2' width={300} height={400} className='mx-auto w-full max-w-[30rem] rounded-xl border' />
            <p className='mt-6 lg:text-lg'>
              해피트리는 창가나 밝은 실내에 두는 것이 좋습니다. <br />
              직사광선은 피해주세요.
            </p>
          </div>
        </section>

        <div className='flex justify-end border-t-2 pt-6'>
          <Button size='sm' className='px-4 py-2 text-sm lg:px-6 lg:py-3 lg:text-base'>
            북마크
          </Button>
        </div>
      </main>
    </div>
  );
}
