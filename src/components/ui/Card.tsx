import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import type { CardAvatarProps, CardContentProps, CardDescriptionProps, CardFooterProps, CardImageProps, CardProps, CardTitleProps } from '@/types/card.types';
import { Eye, Heart, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

// 레이아웃 관련 컴포넌트
// 카드의 기본 구조와 콘텐츠 영역 레이아웃
function Card({ className, ...props }: CardProps) {
  return (
    <div
      data-slot='card'
      className={cn('flex w-full max-w-[22rem] min-w-[16rem] cursor-pointer flex-col gap-6 overflow-hidden rounded-2xl border-0 bg-neutral-50 text-neutral-900 shadow-lg transition-all duration-300 hover:shadow-xl', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: CardContentProps) {
  return <div data-slot='card-content' className={cn('px-5 pb-5', className)} {...props} />;
}

// 이미지 관련 컴포넌트
// 이미지 렌더링, 에러 처리
function CardImage({ className, alt = '', sizes = '(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw', fill = true, onError, src, ...props }: CardImageProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      onError?.();
    }
  };

  return (
    <div className='relative h-48 w-full overflow-hidden'>
      {!hasError && src && <Image data-slot='card-image' className={cn('object-cover transition-opacity duration-300', className)} alt={alt} sizes={sizes} fill={fill} src={src} onError={handleError} {...props} />}
      {hasError && (
        <div className='absolute inset-0 flex items-center justify-center bg-neutral-200'>
          <span className='text-sm text-neutral-500'>이미지를 불러올 수 없습니다</span>
        </div>
      )}
    </div>
  );
}

// 텍스트 콘텐츠 관련 컴포넌트
// 제목과 설명 텍스트 렌더링
function CardTitle({ className, title = '', ...props }: CardTitleProps) {
  return (
    <h4 data-slot='card-title' className={cn('t-h4 mb-2 line-clamp-2', className)} {...props}>
      {title}
    </h4>
  );
}

function CardDescription({ className, description = '', ...props }: CardDescriptionProps) {
  return (
    <p data-slot='card-description' className={cn('t-body mb-10 line-clamp-3', className)} {...props}>
      {description}
    </p>
  );
}

// 사용자 정보 관련 컴포넌트
// 사용자 아바타와 사용자명 표시
function CardAvatar({ className, src, alt = '사용자 아바타', fallback = '사용자', username = '사용자', ...props }: CardAvatarProps) {
  return (
    <div className={cn('mb-2 flex items-center gap-2', className)} {...props}>
      <Avatar className='h-8 w-8'>
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback className='bg-primary-500 text-xs text-neutral-50'>{fallback}</AvatarFallback>
      </Avatar>
      <span className='t-small text-neutral-600'>{username}</span>
    </div>
  );
}

// 상호작용 관련 컴포넌트
// 좋아요, 댓글, 조회수 등의 상호작용 요소
function CardFooter({ className, likes = 0, comments = 0, views = 0, timeAgo = '', onLike, isLiked = false, dateTime, ...props }: CardFooterProps) {
  return (
    <div className={cn('t-desc flex items-center justify-between border-t pt-3', className)} {...props}>
      <div className='flex items-center gap-3'>
        {/* 좋아요 버튼/표시 */}
        {onLike ? (
          <button type='button' onClick={onLike} className='focus-visible flex cursor-pointer items-center gap-1 rounded-sm' aria-label={`좋아요 ${likes}개${isLiked ? ' (눌러진 상태)' : ''}`} aria-pressed={isLiked}>
            <Heart className={cn('transition-all duration-200', isLiked ? 'fill-red-500 text-red-500' : 'text-red-400')} size={14} aria-hidden='true' />
            <span>{likes}</span>
          </button>
        ) : (
          <span className='flex items-center gap-1' aria-label={`좋아요 ${likes}개`}>
            <Heart className='text-red-400' size={14} aria-hidden='true' />
            <span>{likes}</span>
          </span>
        )}

        {/* 댓글 수 표시 */}
        <span className='flex items-center gap-1' aria-label={`댓글 ${comments}개`}>
          <MessageCircle size={14} aria-hidden='true' />
          <span>{comments}</span>
        </span>

        {/* 조회수 표시 */}
        <span className='flex items-center gap-1' aria-label={`조회수 ${views}회`}>
          <Eye size={14} aria-hidden='true' />
          <span>{views}</span>
        </span>
      </div>

      {/* 시간 정보 */}
      <time dateTime={dateTime || timeAgo} className='text-neutral-500'>
        {timeAgo}
      </time>
    </div>
  );
}

export { Card, CardAvatar, CardContent, CardDescription, CardFooter, CardImage, CardTitle };
