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

export default function BookmarkButton({ productId, initialBookmarked = false, size = 28, className = '', variant = 'default', onToggle }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);

  // initialBookmarked 값이 변경될 때 상태 업데이트
  useEffect(() => {
    setIsBookmarked(initialBookmarked);
  }, [initialBookmarked]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newBookmarked = !isBookmarked;
    setIsBookmarked(newBookmarked);

    onToggle?.(productId, newBookmarked);
  };

  const baseClasses = 'cursor-pointer transition-all hover:scale-110';
  const variantClasses = {
    default: 'p-0.5',
    floating: 'p-1.5 sm:p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm',
    inline: 'p-0.5 sm:p-1',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} onClick={handleClick}>
      <Bookmark size={size} className={`transition-colors ${isBookmarked ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 hover:text-gray-600'}`} />
    </div>
  );
}
