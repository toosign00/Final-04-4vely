import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot='input'
      // 디자인 시스템에 맞춘 스타일 적용
      className={cn(
        // 폰트, 배경, 테두리, 컬러 등
        'font-pretendard border-border-default placeholder:text-surface0 text-secondary border bg-white',
        // 크기 및 패딩
        'flex h-10 w-full min-w-0 rounded-md px-4 py-2 text-base md:text-sm',
        // 포커스 스타일
        'focus-visible:border-primary-500 focus-visible:ring-primary-100 focus-visible:ring-2 focus-visible:outline-none',
        // 에러 상태
        'aria-invalid:border-error aria-invalid:ring-error/20',
        // 비활성화
        'disabled:text-secondary disabled:placeholder:text-secondary disabled:cursor-not-allowed disabled:bg-white',
        // 선택 영역
        'selection:bg-primary-100 selection:text-primary-700',
        // 추가 커스텀 클래스
        className,
      )}
      {...props}
    />
  );
}

export { Input };
