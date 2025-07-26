// src/components/ui/BookmarkButton.tsx
'use client';

/**
 * 북마크 버튼 컴포넌트
 * @description 상품, 게시글, 사용자 등 다양한 타입의 북마크를 지원하는 범용 북마크 버튼
 * @module BookmarkButton
 */

import { toggleBookmarkAction } from '@/lib/actions/bookmarkServerActions';
import useUserStore from '@/store/authStore';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { BookmarkType } from '@/types/bookmark.types';
import { Bookmark } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

/**
 * 북마크 버튼 Props
 */
interface BookmarkButtonProps {
  /** 북마크 대상 ID (상품 ID, 게시글 ID 등) */
  targetId?: number;
  /** 북마크 타입 */
  type?: BookmarkType;
  /** 상품 ID (product 타입에서만 사용) */
  productId?: number;
  /** 서버에서 전달받은 북마크 ID (북마크된 경우에만 존재) */
  myBookmarkId?: number;
  /** 버튼 크기 */
  size?: number;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 북마크 변경 시 콜백 */
  onBookmarkChange?: (isBookmarked: boolean, bookmarkId?: number) => void;
}

/**
 * 북마크 버튼 컴포넌트
 * @param {BookmarkButtonProps} props - 컴포넌트 props
 * @returns {JSX.Element} 북마크 버튼
 * @example
 * // 상품 북마크 버튼
 * <BookmarkButton
 *   targetId={123}
 *   type="product"
 *   myBookmarkId={456}
 * />
 *
 * // 게시글 북마크 버튼
 * <BookmarkButton
 *   targetId={789}
 *   type="post"
 *   size={24}
 *   className="custom-class"
 * />
 */
export default function BookmarkButton({ targetId: propTargetId, type = 'product', productId, myBookmarkId, size = 32, className = '', onBookmarkChange }: BookmarkButtonProps) {
  // 모든 Hook을 최상위에서 호출 (조건문 이전)
  const [isPending, startTransition] = useTransition();
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useUserStore();
  const { isBookmarked, getBookmarkId, setBookmark } = useBookmarkStore();

  // Hook 호출 이후에 조건 체크
  const targetId = propTargetId || productId;
  const isLoggedIn = !!user;

  // 초기 렌더링 시 서버 상태를 Zustand에 동기화
  useEffect(() => {
    if (!targetId) return;

    console.log(`[BookmarkButton] ${type} ${targetId} 초기화:`, {
      myBookmarkId,
      isLoggedIn,
      현재스토어값: getBookmarkId(targetId, type),
    });

    // 서버에서 실제 북마크 ID를 받았을 때만 스토어에 저장
    if (myBookmarkId !== undefined) {
      const storedBookmarkId = getBookmarkId(targetId, type);

      // 스토어에 없거나 다른 값일 때 업데이트
      if (storedBookmarkId !== myBookmarkId) {
        console.log(`[BookmarkButton] 스토어 업데이트: ${type} ${targetId}: ${storedBookmarkId} → ${myBookmarkId}`);
        setBookmark(targetId, myBookmarkId, type);
      }
    }
  }, [targetId, type, myBookmarkId, getBookmarkId, setBookmark, isLoggedIn]);

  if (!targetId) {
    console.error('[BookmarkButton] targetId 또는 productId가 필요합니다.');
    return null;
  }

  // 현재 북마크 상태 (Zustand 스토어 기준)
  const isCurrentlyBookmarked = isBookmarked(targetId, type);
  const currentBookmarkId = getBookmarkId(targetId, type);

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
      setBookmark(targetId, undefined, type);
    } else {
      setBookmark(targetId, -1, type);
    }

    // 서버 액션 호출
    startTransition(async () => {
      try {
        const result = await toggleBookmarkAction(targetId, type);

        if (result.ok) {
          const action = result.item?.action;

          if (action === 'added') {
            const newBookmarkId = result.item?.bookmarkId || -1;
            setBookmark(targetId, newBookmarkId, type);

            const messages = {
              product: '상품을 북마크에 추가했습니다.',
              post: '게시글을 북마크에 추가했습니다.',
              user: '사용자를 북마크에 추가했습니다.',
            };

            toast.success(messages[type], {
              description: '마이페이지에서 확인하실 수 있습니다.',
            });

            onBookmarkChange?.(true, newBookmarkId);
          } else if (action === 'removed') {
            setBookmark(targetId, undefined, type);

            const messages = {
              product: '상품을 북마크에서 제거했습니다.',
              post: '게시글을 북마크에서 제거했습니다.',
              user: '사용자를 북마크에서 제거했습니다.',
            };

            toast.success(messages[type]);
            onBookmarkChange?.(false);
          }
        } else {
          // 실패한 경우 이전 상태로 롤백
          setBookmark(targetId, previousBookmarkId, type);
          toast.error(result.message || '북마크 처리에 실패했습니다.');
        }
      } catch (error) {
        // 에러 발생 시 이전 상태로 롤백
        setBookmark(targetId, previousBookmarkId, type);
        toast.error('북마크 처리 중 오류가 발생했습니다.');
        console.error('[BookmarkButton] 에러:', error);
      } finally {
        setIsProcessing(false);
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

/**
 * 상품 전용 북마크 버튼
 */
export function ProductBookmarkButton(props: Omit<BookmarkButtonProps, 'type'>) {
  return <BookmarkButton {...props} type='product' />;
}

/**
 * 게시글 전용 북마크 버튼
 */
export function PostBookmarkButton(props: Omit<BookmarkButtonProps, 'type'>) {
  return <BookmarkButton {...props} type='post' />;
}

/**
 * 사용자 전용 북마크 버튼
 */
export function UserBookmarkButton(props: Omit<BookmarkButtonProps, 'type'>) {
  return <BookmarkButton {...props} type='user' />;
}
