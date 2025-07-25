// src/app/shop/_components/BookmarkButton.tsx
'use client';

import { useBookmarkStore } from '@/store/bookmarkStore';
import { Bookmark } from 'lucide-react';

interface BookmarkButtonProps {
  productId: number;
  initialBookmarked?: boolean;
  size?: number;
  className?: string;
  variant?: 'default' | 'floating' | 'inline';
  onToggle?: (productId: number, isBookmarked: boolean) => void;
}

// initialBookmarked : 추후에 북마크 기능이 모든 페이지에 연결될 때 완성할 예정
export default function BookmarkButton({
  productId,
  initialBookmarked: _initialBookmarked = false, // eslint-disable-line @typescript-eslint/no-unused-vars
  size = 32,
  className = '',
  variant = 'default',
  onToggle,
}: BookmarkButtonProps) {
  // Zustand 스토어에서 북마크 상태 및 함수들 가져오기
  const { isBookmarked, toggleBookmark } = useBookmarkStore();

  // 현재 상품의 북마크 상태 확인
  const currentBookmarked = isBookmarked(productId);

  // 북마크 토글 핸들러
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Zustand 스토어의 북마크 상태 토글
    toggleBookmark(productId);

    // 토글 후의 새로운 상태
    const newBookmarked = !currentBookmarked;

    // 외부 콜백 호출 (선택적)
    onToggle?.(productId, newBookmarked);

    // TODO: 여기서 서버에 북마크 상태 업데이트 API 호출
    // updateBookmarkOnServer(productId, newBookmarked);
  };

  // 기본 스타일 클래스
  const baseClasses = 'cursor-pointer transition-all hover:scale-110 rounded-full';

  // variant별 스타일 클래스
  const variantClasses = {
    default: 'p-1',
    floating: 'p-1.5 sm:p-2 bg-white/80 backdrop-blur-sm shadow-sm',
    inline: 'p-0.5 sm:p-1',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} onClick={handleClick} role='button' aria-label={currentBookmarked ? '북마크 제거' : '북마크 추가'}>
      <Bookmark size={size} className={`transition-colors ${currentBookmarked ? 'fill-warning text-secondary' : 'hover:text-secondary text-gray-500'}`} />
    </div>
  );
}
