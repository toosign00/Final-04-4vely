'use client';

/**
 * @fileoverview 장바구니 추가 다이얼로그 컴포넌트
 * @description 사용자가 상품을 장바구니에 추가할 때 사용하는 모달 다이얼로그입니다.
 *              색상 선택, 수량 조절, 상품 정보 표시 등의 기능을 제공합니다.
 */

import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { addToCartAction } from '@/lib/actions/cartServerActions';
import { getProductById } from '@/lib/functions/productClientFunctions';
import { getImageUrlClient } from '@/lib/utils/auth.client';
import { getProductPotColors, Product } from '@/types/product.types';
import { Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

/**
 * 장바구니 추가 다이얼로그 컴포넌트의 Props 타입 정의
 * @interface AddToCartDialogProps
 */
interface AddToCartDialogProps {
  /** 상품 ID */
  productId: number;
  /** 다이얼로그 열림 상태 */
  isOpen: boolean;
  /** 다이얼로그 닫기 콜백 함수 */
  onClose: () => void;
  /** 장바구니 추가 성공 시 실행될 콜백 함수 */
  onSuccess?: () => void;
}

/** 수량 제한 상수 */
const QUANTITY_LIMITS = {
  MIN: 1,
  MAX: 99,
} as const;

/** 기본 플레이스홀더 이미지 경로 */
const DEFAULT_PLACEHOLDER_IMAGE = '/images/placeholder-plant.svg';

/**
 * 장바구니 추가 다이얼로그 컴포넌트
 * @description 상품 정보를 표시하고, 사용자가 색상과 수량을 선택하여 장바구니에 추가할 수 있는 다이얼로그
 * @param {AddToCartDialogProps} props - 컴포넌트 속성
 * @returns {JSX.Element} 렌더링된 다이얼로그 컴포넌트
 */
export default function AddToCartDialog({ productId, isOpen, onClose, onSuccess }: AddToCartDialogProps) {
  // 상태 관리
  const [quantity, setQuantity] = useState<number | string>(QUANTITY_LIMITS.MIN); // 선택된 수량
  const [selectedColor, setSelectedColor] = useState(''); // 선택된 색상
  const [selectedColorIndex, setSelectedColorIndex] = useState(0); // 선택된 색상의 인덱스
  const [isLoading, setIsLoading] = useState(false); // 장바구니 추가 로딩 상태
  const [product, setProduct] = useState<Product | null>(null); // 상품 정보
  const [isProductLoading, setIsProductLoading] = useState(false); // 상품 정보 로딩 상태

  /**
   * 다이얼로그가 열릴 때 상품 정보를 로드하는 Effect
   * 이미 로드된 상품이 있으면 재로드하지 않음
   */
  useEffect(() => {
    // 다이얼로그가 열려있고 상품 정보가 없는 경우에만 로드
    if (isOpen && !product) {
      setIsProductLoading(true);

      // 상품 정보 비동기 로드
      getProductById(productId)
        .then((response) => {
          if (response.ok && response.item) {
            // 상품 이미지 클라이언트에서 처리
            const processedProduct = {
              ...response.item,
              mainImages: response.item.mainImages?.map((imagePath) => getImageUrlClient(imagePath)) || [],
            };
            setProduct(processedProduct);

            // 첫 번째 색상을 기본 선택으로 설정
            const colors = getProductPotColors(processedProduct);
            if (colors.length > 0) {
              setSelectedColor(colors[0]);
              setSelectedColorIndex(0);
            }
          }
        })
        .catch((error) => {
          console.error('상품 정보 로드 실패:', error);
        })
        .finally(() => {
          setIsProductLoading(false);
        });
    }
  }, [isOpen, productId, product]);

  /**
   * 다이얼로그 닫기 핸들러
   * 상태를 초기화하고 부모 컴포넌트의 onClose 콜백을 호출
   */
  const handleDialogClose = useCallback(() => {
    onClose();
    // 상태 초기화
    setQuantity(QUANTITY_LIMITS.MIN);
    setSelectedColor('');
    setSelectedColorIndex(0);
    setProduct(null);
  }, [onClose]);

  /**
   * 수량 변경 핸들러 (+ / - 버튼용)
   * @param {number} change - 변경할 수량 (-1 또는 +1)
   */
  const handleQuantityChange = useCallback((change: number) => {
    setQuantity((prev) => {
      const currentQuantity = typeof prev === 'string' ? parseInt(prev, 10) || QUANTITY_LIMITS.MIN : prev;
      return Math.max(QUANTITY_LIMITS.MIN, Math.min(QUANTITY_LIMITS.MAX, currentQuantity + change));
    });
  }, []);

  /**
   * 수량 입력 필드 변경 핸들러
   * 사용자가 직접 입력할 때 실시간으로 값을 검증하고 업데이트
   * 숫자만 입력 가능하도록 엄격한 검증 적용
   * @param {React.ChangeEvent<HTMLInputElement>} e - 입력 이벤트
   */
  const handleQuantityInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 빈 문자열인 경우 빈 상태를 허용 (사용자가 입력 중일 수 있음)
    if (value === '') {
      setQuantity('');
      return;
    }

    // 숫자만 허용하는 정규식 검사 (양의 정수만)
    const numericRegex = /^[1-9]\d*$/;
    if (!numericRegex.test(value)) {
      // 숫자가 아니거나 0으로 시작하는 경우 입력을 무시
      return;
    }

    const numValue = parseInt(value, 10);
    // 유효한 숫자이고 범위 내에 있는 경우에만 업데이트
    if (!isNaN(numValue) && numValue >= QUANTITY_LIMITS.MIN && numValue <= QUANTITY_LIMITS.MAX) {
      setQuantity(numValue);
    }
  }, []);

  /**
   * 수량 입력 필드 키보드 입력 제어 핸들러
   * 숫자, 백스페이스, 삭제, 화살표 키 등만 허용
   * @param {React.KeyboardEvent<HTMLInputElement>} e - 키보드 이벤트
   */
  const handleQuantityKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // 허용할 키들: 숫자, 백스페이스, 삭제, 화살표, Tab, Enter
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter', 'Home', 'End'];

    // 숫자 키 (0-9)
    const isNumber = /^[0-9]$/.test(e.key);

    // Ctrl/Cmd + A, C, V, X (전체선택, 복사, 붙여넣기, 잘라내기)
    const isCtrlKey = (e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase());

    // 허용되지 않은 키는 입력 차단
    if (!isNumber && !allowedKeys.includes(e.key) && !isCtrlKey) {
      e.preventDefault();
    }
  }, []);

  /**
   * 수량 입력 필드 포커스 아웃 핸들러
   * 입력이 완료되었을 때 최종 검증을 수행하고 유효하지 않은 값을 수정
   * @param {React.FocusEvent<HTMLInputElement>} e - 포커스 아웃 이벤트
   */
  const handleQuantityInputBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseInt(value, 10);

    // 값이 비어있거나 유효하지 않으면 최소값으로 설정
    if (value === '' || isNaN(numValue) || numValue < QUANTITY_LIMITS.MIN) {
      setQuantity(QUANTITY_LIMITS.MIN);
    }
    // 최대값을 초과하면 최대값으로 설정
    else if (numValue > QUANTITY_LIMITS.MAX) {
      setQuantity(QUANTITY_LIMITS.MAX);
    }
  }, []);

  /**
   * 장바구니 추가 핸들러
   * 선택된 상품, 색상, 수량 정보를 서버로 전송하여 장바구니에 추가
   */
  const handleAddToCart = useCallback(async () => {
    // 상품 정보가 없으면 처리하지 않음
    if (!product) return;

    // 수량을 숫자로 변환 (빈 문자열이면 최소값 사용)
    const quantityNumber = typeof quantity === 'string' ? parseInt(quantity, 10) || QUANTITY_LIMITS.MIN : quantity;

    setIsLoading(true);

    try {
      // 장바구니 추가 API 호출
      const result = await addToCartAction({
        product_id: productId,
        quantity: quantityNumber,
        // 색상이 선택된 경우에만 size 정보 포함
        size: selectedColor || undefined,
      });

      if (result.success) {
        // 성공 시 콜백 실행 및 다이얼로그 닫기
        onSuccess?.();
        handleDialogClose();
      } else {
        // 실패 시 에러 메시지 표시
        alert(result.message || '장바구니 추가에 실패했습니다.');
      }
    } catch (error) {
      // 예외 발생 시 에러 로깅 및 사용자 알림
      console.error('장바구니 추가 오류:', error);
      toast.error('장바구니 추가 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [product, productId, quantity, selectedColor, onSuccess, handleDialogClose]);

  // 상품의 색상 옵션 목록 (메모이제이션으로 성능 최적화)
  const colors = useMemo(() => (product ? getProductPotColors(product) : []), [product]);

  /**
   * 현재 선택된 색상에 해당하는 이미지 URL을 계산
   * 색상별로 다른 이미지를 표시하거나, 기본 이미지를 폴백으로 사용
   */
  const currentImageUrl = useMemo(() => {
    // 상품이나 이미지가 없는 경우 플레이스홀더 이미지 반환
    if (!product || !product.mainImages || product.mainImages.length === 0) {
      return DEFAULT_PLACEHOLDER_IMAGE;
    }

    // 색상 옵션이 없는 경우 첫 번째 이미지 사용
    if (colors.length === 0) {
      return product.mainImages[0];
    }

    // 선택된 색상 인덱스에 해당하는 이미지 사용
    // 인덱스가 범위를 벗어나지 않도록 Math.min으로 제한
    const imageIndex = Math.min(selectedColorIndex, product.mainImages.length - 1);
    return product.mainImages[imageIndex] || product.mainImages[0];
  }, [product, selectedColorIndex, colors.length]);

  /**
   * 색상 선택 핸들러
   * 선택된 색상과 해당 인덱스를 동시에 업데이트
   */
  const handleColorSelect = useCallback((color: string, index: number) => {
    setSelectedColor(color);
    setSelectedColorIndex(index);
  }, []);

  /**
   * 총 가격 계산 (메모이제이션으로 성능 최적화)
   */
  const totalPrice = useMemo(() => {
    if (!product) return 0;
    const quantityNumber = typeof quantity === 'string' ? parseInt(quantity, 10) || QUANTITY_LIMITS.MIN : quantity;
    return product.price * quantityNumber;
  }, [product, quantity]);

  /**
   * 장바구니 추가 버튼 비활성화 조건 확인
   */
  const isAddButtonDisabled = useMemo(() => {
    return !product || (colors.length > 0 && !selectedColor);
  }, [product, colors.length, selectedColor]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDialogClose()}>
      <DialogContent className='w-[95vw] max-w-sm sm:max-w-md md:max-w-lg'>
        <DialogHeader className='pb-2 text-center'>
          <DialogTitle className='text-lg font-semibold'>장바구니에 추가</DialogTitle>
          <DialogDescription className='text-sm text-gray-500'>옵션과 수량을 선택해주세요.</DialogDescription>
        </DialogHeader>

        {isProductLoading ? (
          <div className='flex items-center justify-center py-6'>
            <div className='flex flex-col items-center text-center'>
              <div className='border-primary mb-3 h-6 w-6 animate-spin rounded-full border-2 border-t-transparent' />
              <p className='text-xs text-gray-600'>상품 정보를 불러오는 중...</p>
            </div>
          </div>
        ) : product ? (
          <div className='space-y-3 sm:space-y-6'>
            {/* 상품 정보 */}
            <div className='flex gap-3 sm:flex-row sm:gap-6'>
              <div className='relative h-40 w-40 flex-shrink-0 sm:h-51 sm:w-51'>
                <Image src={currentImageUrl} alt={product.name} fill sizes='(max-width: 640px) 100px, (max-width: 768px) 160px, 192px' className='rounded-lg object-cover' />
              </div>
              <div className='min-w-0 flex-1 space-y-2 sm:space-y-4'>
                <div>
                  <h3 className='text-sm font-semibold text-gray-900 sm:text-base'>{product.name}</h3>
                  <p className='mt-1 text-base font-bold text-gray-900 sm:text-xl'>{product.price.toLocaleString()}원</p>
                </div>

                {/* 색상 선택 */}
                {colors.length > 0 && (
                  <div className='space-y-1'>
                    <label className='block text-xs font-semibold text-gray-900 sm:text-sm'>색상</label>
                    <div className='flex flex-wrap gap-1.5'>
                      {colors.map((color, index) => (
                        <button
                          type='button'
                          key={color}
                          onClick={() => handleColorSelect(color, index)}
                          className={`cursor-pointer rounded border px-2 py-1 text-xs font-medium transition-all duration-200 sm:px-3 sm:py-1.5 sm:text-sm ${
                            selectedColor === color ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                          aria-pressed={selectedColor === color}
                          aria-label={`${color} 색상 선택`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 수량 선택 */}
                <div className='space-y-1'>
                  <label className='block text-xs font-semibold text-gray-900 sm:text-sm'>수량</label>
                  <div className='flex w-fit items-center gap-0 overflow-hidden rounded border border-gray-200'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleQuantityChange(-1)}
                      disabled={(typeof quantity === 'string' ? parseInt(quantity, 10) || QUANTITY_LIMITS.MIN : quantity) <= QUANTITY_LIMITS.MIN}
                      className='h-7 w-7 p-0 hover:bg-gray-100 disabled:opacity-30 sm:h-8 sm:w-8'
                      aria-label='수량 감소'
                    >
                      <Minus className='size-3' />
                    </Button>
                    <input
                      type='number'
                      min={QUANTITY_LIMITS.MIN}
                      max={QUANTITY_LIMITS.MAX}
                      value={quantity}
                      onChange={handleQuantityInputChange}
                      onKeyDown={handleQuantityKeyDown}
                      onBlur={handleQuantityInputBlur}
                      className='h-7 w-8 [appearance:textfield] border-x border-gray-200 bg-white text-center text-xs font-medium focus:ring-0 focus:outline-none sm:h-8 sm:w-10 sm:text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                      aria-label='수량 입력'
                    />
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleQuantityChange(1)}
                      disabled={(typeof quantity === 'string' ? parseInt(quantity, 10) || QUANTITY_LIMITS.MIN : quantity) >= QUANTITY_LIMITS.MAX}
                      className='h-7 w-7 p-0 hover:bg-gray-100 disabled:opacity-30 sm:h-8 sm:w-8'
                      aria-label='수량 증가'
                    >
                      <Plus className='size-3' />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* 총 가격 */}
            <div className='border-t border-gray-200 pt-3 sm:pt-4'>
              <div className='flex items-center justify-between'>
                <span className='text-xs text-gray-600 sm:text-sm'>총 {typeof quantity === 'string' ? parseInt(quantity, 10) || QUANTITY_LIMITS.MIN : quantity}개</span>
                <div className='text-right'>
                  <div className='text-xs text-gray-500'>
                    {product.price.toLocaleString()}원 × {typeof quantity === 'string' ? parseInt(quantity, 10) || QUANTITY_LIMITS.MIN : quantity}개
                  </div>
                  <div className='text-lg font-bold text-gray-900 sm:text-xl'>{totalPrice.toLocaleString()}원</div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className='flex flex-col gap-2 pt-3 sm:flex-row sm:gap-3 sm:pt-4'>
          <Button variant='default' onClick={handleDialogClose} className='order-2 w-full text-sm sm:order-1 sm:w-auto sm:flex-1'>
            취소
          </Button>
          <Button variant='primary' onClick={handleAddToCart} loading={isLoading} loadingText='추가 중...' disabled={isAddButtonDisabled} className='order-1 sm:order-2 sm:flex-1' fullWidth aria-label='선택한 상품을 장바구니에 추가'>
            장바구니에 추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
