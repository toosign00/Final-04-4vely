'use client';

import { usePathname } from 'next/navigation';
import BookmarkSkeletonUI from './skeletons/BookmarkSkeletonUI';
import MyPlantsSkeletonUI from './skeletons/MyPlantsSkeletonUI';
import OrderHistorySkeletonUI from './skeletons/OrderHistorySkeletonUI';
import ProfileSkeletonUI from './skeletons/ProfileSkeletonUI';

export default function LoadingRouter() {
  const pathname = usePathname();

  // 현재 경로에 따라 적절한 스켈레톤 UI 표시
  if (pathname.startsWith('/my-page/order-history')) {
    return <OrderHistorySkeletonUI />;
  }

  if (pathname.startsWith('/my-page/bookmarks')) {
    return <BookmarkSkeletonUI />;
  }

  if (pathname.startsWith('/my-page/profile')) {
    return <ProfileSkeletonUI />;
  }

  // 기본값: 내 반려식물 페이지 (마이페이지 기본)
  return <MyPlantsSkeletonUI />;
}
