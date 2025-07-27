// src/components/ui/BookmarkButton.tsx
'use client';

/**
 * 북마크 버튼 컴포넌트
 * @description 상품, 게시글, 사용자 등 다양한 타입의 북마크를 지원하는 범용 북마크 버튼
 * @module BookmarkButton
 */

import { toggleBookmarkAction } from '@/lib/actions/bookmarkServerActions';
import useUserStore from '@/store/authStore';
import { BookmarkType } from '@/types/bookmark.types';
import { Bookmark } from 'lucide-react';
import { useState, useTransition, useEffect } from 'react';
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

  // 북마크 상태를 로컬 state로 관리
  const [localBookmarkId, setLocalBookmarkId] = useState<number | undefined>(myBookmarkId);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(!!myBookmarkId);

  // Hook 호출 이후에 조건 체크
  const targetId = propTargetId || productId;
  const isLoggedIn = !!user;

  // 로그아웃 감지 - user가 null이 되면 북마크 상태 초기화
  useEffect(() => {
    if (!isLoggedIn) {
      setLocalBookmarkId(undefined);
      setIsBookmarked(false);
    }
  }, [isLoggedIn]);

  if (!targetId) {
    console.error('[BookmarkButton] targetId 또는 productId가 필요합니다.');
    return null;
  }

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

    // 낙관적 업데이트 (로컬 state 즉시 업데이트)
    const previousBookmarkId = localBookmarkId;
    const previousIsBookmarked = isBookmarked;

    if (isBookmarked) {
      setIsBookmarked(false);
      setLocalBookmarkId(undefined);
    } else {
      setIsBookmarked(true);
      setLocalBookmarkId(-1); // 임시 ID
    }

    // 서버 액션 호출
    startTransition(async () => {
      try {
        const result = await toggleBookmarkAction(targetId, type);

        if (result.ok) {
          const action = result.item?.action;

          if (action === 'added') {
            const newBookmarkId = result.item?.bookmarkId || -1;
            setLocalBookmarkId(newBookmarkId);
            setIsBookmarked(true);

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
            setLocalBookmarkId(undefined);
            setIsBookmarked(false);

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
          setLocalBookmarkId(previousBookmarkId);
          setIsBookmarked(previousIsBookmarked);
          toast.error(result.message || '북마크 처리에 실패했습니다.');
        }
      } catch (error) {
        // 에러 발생 시 이전 상태로 롤백
        setLocalBookmarkId(previousBookmarkId);
        setIsBookmarked(previousIsBookmarked);
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
    ${isBookmarked ? 'text-amber-500 hover:text-amber-600' : 'text-gray-400 hover:text-gray-600'}
    ${isProcessing || isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `.trim();

  return (
    <button type='button' onClick={handleClick} className={baseButtonClass} disabled={isProcessing || isPending} aria-label={isBookmarked ? '북마크 제거' : '북마크 추가'} aria-pressed={isBookmarked}>
      <Bookmark size={size} className={`transition-all duration-200 ${isBookmarked ? 'fill-current' : ''}`} />

      {/* 로딩 중 표시 */}
      {(isProcessing || isPending) && (
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent' />
        </div>
      )}
    </button>
  );
}
