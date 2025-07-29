'use client';

/**
 * @fileoverview 장바구니 추가 확인 다이얼로그 컴포넌트
 * @description 상품이 장바구니에 성공적으로 추가된 후 사용자에게 장바구니로 이동할지 묻는 확인 다이얼로그입니다.
 */

import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/Dialog';
import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * 장바구니 추가 확인 다이얼로그 컴포넌트의 Props 타입 정의
 * @interface CartConfirmDialogProps
 */
interface CartConfirmDialogProps {
  /** 다이얼로그 열림 상태 */
  isOpen: boolean;
  /** 다이얼로그 닫기 콜백 함수 */
  onClose: () => void;
  /** 추가된 상품명 (선택사항) */
  productName?: string;
}

/**
 * 장바구니 추가 확인 다이얼로그 컴포넌트
 * @description 상품이 장바구니에 성공적으로 추가된 후 장바구니로 이동할지 묻는 다이얼로그
 * @param {CartConfirmDialogProps} props - 컴포넌트 속성
 * @returns {JSX.Element} 렌더링된 다이얼로그 컴포넌트
 */
export default function CartConfirmDialog({ isOpen, onClose }: CartConfirmDialogProps) {
  const router = useRouter();

  /**
   * 장바구니로 이동하는 핸들러
   * 다이얼로그를 닫고 장바구니 페이지로 라우팅
   */
  const handleGoToCart = useCallback(() => {
    onClose();
    router.push('/cart');
  }, [onClose, router]);

  /**
   * 쇼핑 계속하기 핸들러
   * 다이얼로그만 닫고 현재 페이지에 남아있음
   */
  const handleContinueShopping = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog open={isOpen}>
      <DialogContent className='w-[95vw] max-w-sm sm:max-w-sm' showCloseButton={false}>
        <DialogTitle className='text-lg font-semibold text-gray-900'>상품이 장바구니에 추가되었습니다!</DialogTitle>
        <DialogDescription className='text-sm text-gray-600'>장바구니로 이동하시겠습니까?</DialogDescription>

        <DialogFooter className='flex flex-col gap-2 pt-2 sm:flex-row sm:gap-3'>
          <Button variant='default' onClick={handleContinueShopping} className='order-2 w-full text-sm sm:order-1 sm:w-auto sm:flex-1'>
            닫기
          </Button>
          <Button variant='primary' onClick={handleGoToCart} className='order-1 sm:order-2 sm:flex-1' fullWidth>
            <ShoppingCart className='mr-2 h-4 w-4' />
            장바구니로 이동
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
