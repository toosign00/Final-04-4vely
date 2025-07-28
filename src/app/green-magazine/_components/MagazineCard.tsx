'use client';

import { formatDate } from '@/app/my-page/my-plants/_utils/diaryUtils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import BookmarkButton from '@/components/ui/BookmarkButton';
import { Button } from '@/components/ui/Button';
import { Post } from '@/types/post.types';
import Image from 'next/image';
import Link from 'next/link';

interface MagazineCardProps {
  post: Pick<Post, '_id' | 'type' | 'title' | 'content' | 'createdAt' | 'updatedAt' | 'views' | 'user'> & {
    bookmarks: number;
    myBookmarkId: number | null;
    image: string;
    extra?: {
      contents: {
        content: string;
        postImage: string;
      }[];
    };
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
          <h3 className='text-lg font-semibold md:mt-2 md:text-xl'>{post.title}</h3>
          {/* 북마크 버튼 */}
          <BookmarkButton targetId={post._id} myBookmarkId={post.myBookmarkId ?? undefined} type='post' />
        </div>
        <p className='text-muted my-3 line-clamp-2 max-w-[52rem] text-sm md:mt-0 md:mb-10 md:text-base'>{post.content}</p>
        <div className='mt-4 flex items-center justify-between'>
          {/* 작성자 & 작성 날짜 & 조회 수 */}
          <div className='flex items-center gap-2 text-center text-sm text-gray-500'>
            <Avatar className='border-muted h-8 w-8 rounded-3xl border'>
              <AvatarImage src={post.user.image} alt={post.user.name} />
              <AvatarFallback>{post.user.name}</AvatarFallback>
            </Avatar>
            <span>{post.user.name}</span>
            <span>·</span>
            <span>{formatDate(post.createdAt)}</span>
            <span>·</span>
            <span>조회 수 {post.views}</span>
          </div>
          {/* 상세보기 버튼 */}
          <Button asChild variant='primary' className='self-end px-4 py-2 text-sm lg:px-6 lg:py-3 lg:text-base'>
            <Link href={`/green-magazine/${post._id}`}>상세보기</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
