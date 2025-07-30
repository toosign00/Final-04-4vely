'use client';

import { useSignUpStore } from '@/store/signUpStore';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function RouteChangeHandler() {
  const pathname = usePathname();
  const reset = useSignUpStore((state) => state.reset);
  const prevPathnameRef = useRef<string>('');

  // 컴포넌트 언마운트 시 처리
  useEffect(() => {
    return () => {
      // 현재 경로가 sign-up이 아닌 곳으로 이동하는 경우
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/sign-up')) {
        // 세션스토리지 직접 삭제
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('signup-storage');
        }

        // 스토어 리셋 (세션스토리지 삭제 후)
        reset();
      }
    };
  }, [reset]);

  // pathname 변경 감지
  useEffect(() => {
    // 이전 경로가 sign-up이었고, 현재 경로가 sign-up이 아닌 경우
    if (prevPathnameRef.current.startsWith('/sign-up') && !pathname.startsWith('/sign-up')) {
      // 세션스토리지 직접 삭제
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('signup-storage');
      }

      // 스토어 리셋
      reset();
    }

    prevPathnameRef.current = pathname;
  }, [pathname, reset]);

  // 페이지를 벗어날 때 처리 (브라우저 닫기, 새로고침 등)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pathname.startsWith('/sign-up')) {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('signup-storage');
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname]);

  return null;
}
