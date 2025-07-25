// src/app/shop/_components/BookmarkButton.tsx
'use client';

import { toggleProductBookmarkAction } from '@/lib/actions/bookmarkActions';
import useUserStore from '@/store/authStore';
import { Bookmark } from 'lucide-react';
import { useState, useTransition, useEffect } from 'react';
import { toast } from 'sonner';

interface BookmarkButtonProps {
  productId: number;
  myBookmarkId?: number; // 북마크된 경우에만 존재
  size?: number;
  className?: string;
  variant?: 'default' | 'floating' | 'inline';
  onBookmarkChange?: (productId: number, isBookmarked: boolean, bookmarkId?: number) => void; // 콜백 추가
}

/**
 * 북마크 버튼 컴포넌트
 * - 로그인된 사용자만 북마크 가능
 * - 서버 액션을 통한 북마크 토글
 * - 로컬 상태로 즉시 UI 업데이트
 * - 상위 컴포넌트에 상태 변경 알림
 */
export default function BookmarkButton({ productId, myBookmarkId, size = 32, className = '', variant = 'default', onBookmarkChange }: BookmarkButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isProcessing, setIsProcessing] = useState(false);

  // 로그인 상태 확인 (authStore 사용)
  const { user } = useUserStore();
  const isLoggedIn = !!user;

  // 로컬 북마크 상태 (즉시 UI 업데이트용)
  const [localBookmarkId, setLocalBookmarkId] = useState<number | undefined>(myBookmarkId);

  // props가 변경되면 로컬 상태도 업데이트 (더 강력한 동기화)
  useEffect(() => {
    console.log(`[BookmarkButton] Props 변경 감지 - 상품 ${productId}:`, {
      이전상태: localBookmarkId,
      새로운상태: myBookmarkId,
      변경필요: localBookmarkId !== myBookmarkId,
    });

    // 서버에서 받은 상태가 로컬 상태와 다르면 업데이트
    if (localBookmarkId !== myBookmarkId) {
      console.log(`[BookmarkButton] 로컬 상태 업데이트: ${localBookmarkId} → ${myBookmarkId}`);
      setLocalBookmarkId(myBookmarkId);
    }
  }, [myBookmarkId, localBookmarkId, productId]);

  // 현재 북마크 상태 (로컬 상태 기준)
  const isCurrentlyBookmarked = !!localBookmarkId;

  // 디버깅을 위한 콘솔 로그
  console.log('BookmarkButton:', {
    productId,
    myBookmarkId, // 서버에서 받은 원본
    localBookmarkId, // 로컬 상태
    isLoggedIn: !!user,
    isCurrentlyBookmarked,
  });

  // 북마크 토글 핸들러
  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    console.log('[BookmarkButton] 클릭됨:', {
      productId,
      localBookmarkId,
      isLoggedIn,
      isCurrentlyBookmarked,
    });

    // 로그인되지 않은 경우
    if (!isLoggedIn) {
      console.log('[BookmarkButton] 로그인 필요');
      toast.error('로그인이 필요한 기능입니다.', {
        description: '로그인 후 북마크를 사용하실 수 있습니다.',
      });
      return;
    }

    // 이미 처리 중인 경우 중복 요청 방지
    if (isProcessing || isPending) {
      console.log('[BookmarkButton] 이미 처리 중');
      return;
    }

    console.log('[BookmarkButton] 북마크 토글 시작');
    setIsProcessing(true);

    // 낙관적 업데이트 (즉시 UI 변경)
    const previousBookmarkId = localBookmarkId;
    const willBeBookmarked = !isCurrentlyBookmarked;

    if (isCurrentlyBookmarked) {
      setLocalBookmarkId(undefined); // 북마크 제거 예상
    } else {
      setLocalBookmarkId(-1); // 임시 ID로 북마크 추가 예상 (-1은 임시값)
    }

    // 서버 액션 호출
    startTransition(async () => {
      try {
        const result = await toggleProductBookmarkAction(productId);
        console.log('[BookmarkButton] 서버 액션 결과:', result);

        if (result.ok) {
          // 성공한 경우 실제 결과로 상태 업데이트
          const action = result.item?.action;
          console.log('[BookmarkButton] 액션 타입:', action);

          if (action === 'added') {
            const newBookmarkId = result.item?.bookmarkId || -1;
            setLocalBookmarkId(newBookmarkId);

            // 상위 컴포넌트에 변경 알림
            onBookmarkChange?.(productId, true, newBookmarkId);

            toast.success('북마크에 추가되었습니다.', {
              description: '마이페이지에서 확인하실 수 있습니다.',
            });
          } else if (action === 'removed') {
            setLocalBookmarkId(undefined);

            // 상위 컴포넌트에 변경 알림
            onBookmarkChange?.(productId, false);

            toast.success('북마크에서 제거되었습니다.');
          }
        } else {
          // 실패한 경우 이전 상태로 롤백
          console.error('[BookmarkButton] 실패 - 상태 롤백:', result.message);
          setLocalBookmarkId(previousBookmarkId);
          toast.error(result.message || '북마크 처리에 실패했습니다.');
        }
      } catch (error) {
        // 에러 발생 시 이전 상태로 롤백
        console.error('[BookmarkButton] 에러 - 상태 롤백:', error);
        setLocalBookmarkId(previousBookmarkId);
        toast.error('북마크 처리 중 오류가 발생했습니다.');
      } finally {
        setIsProcessing(false);
      }
    });
  };

  // 공통 스타일 - 배경 제거, 아이콘만 사용
  const baseButtonClass = `
    relative flex items-center justify-center transition-all duration-200
    ${isCurrentlyBookmarked ? 'text-amber-500 hover:text-amber-600' : 'text-gray-400 hover:text-gray-600'}
    ${isProcessing || isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  // 버튼 크기
  const buttonSize = `w-[${size}px] h-[${size}px]`;
  const iconSize = Math.round(size * 0.8); // 아이콘 크기 조금 더 크게

  // 변형별 추가 스타일 (그림자 제거)
  const variantStyles = {
    default: '',
    floating: '',
    inline: '',
  };

  return (
    <button type='button' className={`${baseButtonClass} ${buttonSize} ${variantStyles[variant]}`} onClick={handleClick} disabled={isProcessing || isPending} aria-label={isCurrentlyBookmarked ? '북마크 제거' : '북마크 추가'}>
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
