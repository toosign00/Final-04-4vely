// src/components/ui/BookmarkButton.tsx
'use client';

import { Bookmark } from 'lucide-react';
import { useState } from 'react';

interface BookmarkButtonProps {
  productId: string;
  initialBookmarked?: boolean;
  size?: number;
  className?: string;
  variant?: 'default' | 'floating' | 'inline';
  onToggle?: (productId: string, isBookmarked: boolean) => void; // 나중에 API 연동용
}

export default function BookmarkButton({ productId, initialBookmarked = false, size = 28, className = '', variant = 'default', onToggle }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newBookmarked = !isBookmarked;
    setIsBookmarked(newBookmarked);

    // 나중에 API 연동할 때 사용할 콜백
    onToggle?.(productId, newBookmarked);
  };

  const baseClasses = 'cursor-pointer transition-all hover:scale-110';
  const variantClasses = {
    default: 'absolute top-3 right-3 z-10 p-1',
    floating: 'absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm',
    inline: 'p-1',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} onClick={handleClick}>
      <Bookmark size={size} className={`transition-colors ${isBookmarked ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 hover:text-gray-600'}`} />
    </div>
  );
}
