'use client';

import { useActivityTracker } from '@/hooks/useActivityTracker';

/**
 * 전역 활동 추적 컴포넌트
 * 일반 로그인 사용자의 2시간 비활성 로그아웃을 담당
 */
export default function ActivityTracker() {
  useActivityTracker();
  
  // UI를 렌더링하지 않는 컴포넌트
  return null;
}