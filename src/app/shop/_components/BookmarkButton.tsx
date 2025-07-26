// src/app/shop/_components/BookmarkButton.tsx
'use client';

import { toggleProductBookmarkAction } from '@/lib/actions/bookmarkActions';
import useUserStore from '@/store/authStore';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { Bookmark } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

interface BookmarkButtonProps {
  productId: number;
  myBookmarkId?: number; // 북마크된 경우에만 존재
  size?: number;
  className?: string;
}

/**
 * 북마크 버튼 컴포넌트 (Zustand 전역 상태 사용)
 * - 로그인된 사용자만 북마크 가능
 * - 서버 액션을 통한 북마크 토글
 * - Zustand 스토어로 상태 관리 (페이지 이동 후에도 유지)
 * - 낙관적 업데이트로 즉시 UI 반영
 * - ShopClientContent 수정 없이 독립적으로 작동
 */
export default function BookmarkButton({ productId, myBookmarkId, size = 32, className = '' }: BookmarkButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isProcessing, setIsProcessing] = useState(false);

  // 로그인 상태 확인
  const { user } = useUserStore();
  const isLoggedIn = !!user;

  // Zustand 북마크 스토어 사용
  const { isBookmarked, getBookmarkId, setBookmark } = useBookmarkStore();

  // 초기 렌더링 시 서버 상태를 Zustand에 동기화
  useEffect(() => {
    console.log(`[BookmarkButton] 상품 ${productId} 초기화:`, {
      myBookmarkId,
      isLoggedIn,
      현재스토어값: getBookmarkId(productId),
    });

    // 서버에서 실제 북마크 ID를 받았을 때만 스토어에 저장
    if (myBookmarkId !== undefined) {
      const storedBookmarkId = getBookmarkId(productId);

      // 스토어에 없거나 다른 값일 때 업데이트
      if (storedBookmarkId !== myBookmarkId) {
        console.log(`[BookmarkButton] 스토어 업데이트: 상품 ${productId}: ${storedBookmarkId} → ${myBookmarkId}`);
        setBookmark(productId, myBookmarkId);
      }
    }
  }, [productId, myBookmarkId, getBookmarkId, setBookmark, isLoggedIn]);

  // 현재 북마크 상태 (Zustand 스토어 기준)
  const isCurrentlyBookmarked = isBookmarked(productId);
  const currentBookmarkId = getBookmarkId(productId);

  // 북마크 토글 핸들러
  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // 로그인되지 않은 경우
    if (!isLoggedIn) {
      toast.error('로그인이 필요한 기능입니다.', {
        description: '로그인 후 북마크를 사용하실 수 있습니다.',
      });
      return;
    }

    // 이미 처리 중인 경우 중복 요청 방지
    if (isProcessing || isPending) {
      return;
    }

    setIsProcessing(true);

    // 낙관적 업데이트 (Zustand 스토어 즉시 업데이트)
    const previousBookmarkId = currentBookmarkId;

    if (isCurrentlyBookmarked) {
      setBookmark(productId, undefined); // 북마크 제거 예상
    } else {
      setBookmark(productId, -1); // 임시 ID로 북마크 추가 예상
    }

    // 서버 액션 호출
    startTransition(async () => {
      try {
        const result = await toggleProductBookmarkAction(productId);

        if (result.ok) {
          const action = result.item?.action;

          if (action === 'added') {
            const newBookmarkId = result.item?.bookmarkId || -1;
            setBookmark(productId, newBookmarkId);

            toast.success('북마크에 추가되었습니다.', {
              description: '마이페이지에서 확인하실 수 있습니다.',
            });
          } else if (action === 'removed') {
            setBookmark(productId, undefined);
            toast.success('북마크에서 제거되었습니다.');
          }
        } else {
          // 실패한 경우 이전 상태로 롤백
          setBookmark(productId, previousBookmarkId);
          toast.error(result.message || '북마크 처리에 실패했습니다.');
        }
      } catch (error) {
        // 에러 발생 시 이전 상태로 롤백
        setBookmark(productId, previousBookmarkId);
        toast.error('북마크 처리 중 오류가 발생했습니다.');
        console.error('[BookmarkButton] 에러:', error);
      }
    });
  };

  // 버튼 스타일
  const baseButtonClass = `
    relative flex items-center justify-center transition-all duration-200
    ${isCurrentlyBookmarked ? 'text-amber-500 hover:text-amber-600' : 'text-gray-400 hover:text-gray-600'}
    ${isProcessing || isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  const buttonSize = `w-[${size}px] h-[${size}px]`;
  const iconSize = Math.round(size * 0.8);

  return (
    <button type='button' className={`${baseButtonClass} ${buttonSize}`} onClick={handleClick} disabled={isProcessing || isPending} aria-label={isCurrentlyBookmarked ? '북마크 제거' : '북마크 추가'}>
      <Bookmark size={iconSize} fill={isCurrentlyBookmarked ? 'currentColor' : 'none'} className='transition-all duration-200' />

      {/* 로딩 인디케이터 */}
      {(isProcessing || isPending) && (
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-50' />
        </div>
      )}
    </button>
  );
}
