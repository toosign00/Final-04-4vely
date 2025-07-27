'use client';

import BookmarkButton from '@/components/ui/BookmarkButton';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

interface MagazineCardProps {
  post: {
    _id: number;
    type: string;
    title: string;
    content: string;
    image: string;
    createdAt: string;
    bookmarks: number;
    myBookmarkId: number | null;
    author: string;
    href: string;
  };
}

export default function MagazineCard({ post }: MagazineCardProps) {
  return (
    <div className='flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm hover:shadow-md md:flex-row md:gap-10'>
      {/* 이미지 */}
      <div className='relative h-40 w-full overflow-hidden rounded-lg md:h-50 md:w-1/5'>
        <Image src={post.image} alt={post.title} fill sizes='(max-width: 768px) 100vw, 20vw' className='object-cover' priority />
      </div>

      {/* 콘텐츠 영역 */}
      <div className='flex flex-1 flex-col justify-between md:max-w-[80%]'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold md:mt-5 md:text-xl'>{post.title}</h3>
          {/* 북마크 버튼 */}
          <BookmarkButton targetId={post._id} myBookmarkId={post.myBookmarkId ?? undefined} type='post' />
        </div>
        <p className='text-muted my-2 line-clamp-2 max-w-[52rem] text-sm md:mb-10 md:text-base'>{post.content}</p>
        <Button variant='primary' className='self-end px-4 py-2 text-sm lg:px-6 lg:py-3 lg:text-base'>
          상세보기
        </Button>
      </div>
    </div>
  );
}
