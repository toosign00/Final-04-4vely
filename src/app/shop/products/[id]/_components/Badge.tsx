// src/app/shop/products/[id]/_components/Badge.tsx (서버 컴포넌트)
import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline';
  children: React.ReactNode;
}

/**
 * 뱃지 컴포넌트 (서버 컴포넌트)
 * - 상품 태그 표시용
 * - 다양한 variant 스타일 지원
 * - 디자인 시스템 색상 사용
 */
export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  const baseStyles = 'inline-flex items-center rounded-full text-xs font-medium px-3 py-1';

  const variantStyles = {
    default: 'bg-white text-secondary',
    secondary: 'bg-surface text-secondary',
    outline: 'border border-gray-300 text-secondary',
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
