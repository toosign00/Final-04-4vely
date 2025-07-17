// src/app/shop/components/BookmarkButton.tsx
'use client';

import { Bookmark } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BookmarkButtonProps {
  productId: string;
  initialBookmarked?: boolean;
  size?: number;
  className?: string;
  variant?: 'default' | 'floating' | 'inline';
  onToggle?: (productId: string, isBookmarked: boolean) => void;
}

/**
 * 북마크 버튼 컴포넌트
 * - 상품 즐겨찾기 토글 기능
 * - 시각적 상태 피드백
 * - 다양한 variant 지원
 */
export default function BookmarkButton({ productId, initialBookmarked = false, size = 28, className = '', variant = 'default', onToggle }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);

  // 초기 북마크 상태 동기화
  useEffect(() => {
    setIsBookmarked(initialBookmarked);
  }, [initialBookmarked]);

  // 북마크 토글 핸들러
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newBookmarked = !isBookmarked;
    setIsBookmarked(newBookmarked);
    onToggle?.(productId, newBookmarked);
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
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} onClick={handleClick}>
      <Bookmark size={size} className={`transition-colors ${isBookmarked ? 'fill-warning text-secondary' : 'hover:text-secondary text-gray-500'}`} />
    </div>
  );
}
