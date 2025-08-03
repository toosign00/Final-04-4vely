// src/app/(purchase)/cart/_components/CartClient.tsx
'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { removeFromCartAction, updateCartOptionAction, updateCartQuantityAction } from '@/lib/actions/cartServerActions';
import { createCartPurchaseTempOrderAction } from '@/lib/actions/order/orderServerActions';
import { CartItem } from '@/types/cart.types';
import { getImageUrl } from '@/types/product.types';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

interface CartClientSectionProps {
  initialCartItems: CartItem[];
}

/**
 * 한국어 색상명을 영어명과 HEX 색상 코드로 매핑
 */
const getColorMapping = (koreanColor: string): { englishName: string; hexColor: string } => {
  const colorMap: Record<string, { englishName: string; hexColor: string }> = {
    흑색: { englishName: 'black', hexColor: '#000000' },
    갈색: { englishName: 'brown', hexColor: '#8B4513' },
    백색: { englishName: 'white', hexColor: '#FFFFFF' },
    황색: { englishName: 'yellow', hexColor: '#FFD700' },
    회색: { englishName: 'gray', hexColor: '#808080' },
    흰색: { englishName: 'white', hexColor: '#FFFFFF' },
    남색: { englishName: 'blue', hexColor: '#4169E1' },
  };

  return colorMap[koreanColor] || { englishName: koreanColor.toLowerCase(), hexColor: '#808080' };
};

export default function CartClientSection({ initialCartItems }: CartClientSectionProps) {
  const router = useRouter();

  // 상태 관리
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState<number | null>(null);
  const [openDialogId, setOpenDialogId] = useState<number | null>(null);

  // 옵션 변경 상태
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});

  // AlertDialog 상태
  const [showDeleteSingleAlert, setShowDeleteSingleAlert] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // 접근성을 위한 refs
  const cartAnnouncementRef = useRef<HTMLDivElement>(null);
  const colorOptionsRef = useRef<Record<number, (HTMLButtonElement | null)[]>>({});

  // 초기 선택된 옵션 설정
  useState(() => {
    const options: Record<number, string> = {};
    cartItems.forEach((item) => {
      if (item.color) {
        options[item._id] = item.color;
      }
    });
    setSelectedOptions(options);
  });

  // 전체 선택 상태
  const isAllSelected = cartItems.length > 0 && selectedItems.size === cartItems.length;

  // 선택된 아이템들의 총 금액 계산
  const calculateSelectedTotal = useCallback(() => {
    return cartItems.filter((item) => selectedItems.has(item._id)).reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cartItems, selectedItems]);

  // 색상 매핑
  const getColorKoreanName = (color: string) => {
    const colorMap: Record<string, string> = {
      흑색: '흑색',
      갈색: '갈색',
      백색: '흰색',
      회색: '회색',
      흰색: '흰색',
      남색: '남색',
    };
    return colorMap[color] || color;
  };

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(cartItems.map((item) => item._id)));

      // 접근성: 전체 선택 알림
      if (cartAnnouncementRef.current) {
        cartAnnouncementRef.current.textContent = `모든 상품 ${cartItems.length}개가 선택되었습니다.`;
      }
    } else {
      setSelectedItems(new Set());

      // 접근성: 전체 해제 알림
      if (cartAnnouncementRef.current) {
        cartAnnouncementRef.current.textContent = '모든 상품 선택이 해제되었습니다.';
      }
    }
  };

  // 개별 선택
  const handleSelectItem = (itemId: number, checked: boolean) => {
    const newSelectedItems = new Set(selectedItems);
    const item = cartItems.find((item) => item._id === itemId);

    if (checked) {
      newSelectedItems.add(itemId);

      // 접근성: 개별 선택 알림
      if (cartAnnouncementRef.current && item) {
        cartAnnouncementRef.current.textContent = `${item.product.name}가 선택되었습니다.`;
      }
    } else {
      newSelectedItems.delete(itemId);

      // 접근성: 개별 선택 해제 알림
      if (cartAnnouncementRef.current && item) {
        cartAnnouncementRef.current.textContent = `${item.product.name} 선택이 해제되었습니다.`;
      }
    }
    setSelectedItems(newSelectedItems);
  };

  // 단일 아이템 삭제
  const handleRemoveItem = async (itemId: number) => {
    setDeleteTargetId(itemId);
    setShowDeleteSingleAlert(true);
  };

  // 실제 단일 아이템 삭제 처리
  const confirmRemoveSingleItem = async () => {
    if (!deleteTargetId) return;

    setIsLoading(deleteTargetId);
    try {
      const result = await removeFromCartAction(deleteTargetId);
      if (result.success) {
        setCartItems((prevItems) => prevItems.filter((item) => item._id !== deleteTargetId));
        setSelectedItems((prevSelected) => {
          const newSelected = new Set(prevSelected);
          newSelected.delete(deleteTargetId);
          return newSelected;
        });
        toast.success('상품이 삭제되었습니다.');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`삭제에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsLoading(null);
      setShowDeleteSingleAlert(false);
      setDeleteTargetId(null);
    }
  };

  // 수량 변경
  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setIsLoading(itemId);
    try {
      const result = await updateCartQuantityAction(itemId, newQuantity);
      if (result.success) {
        setCartItems((prevItems) => prevItems.map((item) => (item._id === itemId ? { ...item, quantity: newQuantity } : item)));

        // 접근성: 수량 변경 알림
        const item = cartItems.find((item) => item._id === itemId);
        if (cartAnnouncementRef.current && item) {
          cartAnnouncementRef.current.textContent = `${item.product.name}의 수량이 ${newQuantity}개로 변경되었습니다.`;
        }

        toast.success('수량이 변경되었습니다.');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`수량 변경에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsLoading(null);
    }
  };

  // 선택 삭제
  const handleRemoveSelected = async () => {
    if (selectedItems.size === 0) {
      toast.error('삭제할 상품을 선택해주세요.');
      return;
    }

    const deletePromises = Array.from(selectedItems).map((itemId) => removeFromCartAction(itemId));

    try {
      const results = await Promise.all(deletePromises);
      const successCount = results.filter((r) => r.success).length;

      if (successCount > 0) {
        const successIds = Array.from(selectedItems).filter((_, index) => results[index].success);
        setCartItems((prevItems) => prevItems.filter((item) => !successIds.includes(item._id)));
        setSelectedItems(new Set());

        toast.success(`${successCount}개의 상품이 삭제되었습니다.`);
      }
    } catch (error) {
      toast.error(`삭제에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsLoading(null);
    }
  };

  // 키보드 네비게이션을 위한 핸들러
  const handleColorKeyDown = (event: React.KeyboardEvent, itemId: number, colorIndex: number, colors: string[]) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setSelectedOptions((prev) => ({ ...prev, [itemId]: colors[colorIndex] }));
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      const nextIndex = (colorIndex + direction + colors.length) % colors.length;
      colorOptionsRef.current[itemId]?.[nextIndex]?.focus();
    }
  };

  // 옵션 변경 처리
  // color 속성을 통한 필드 직접 수정(옵션 변경)을 지원하지 않는 것 같아서, 기존 상품을 삭제하고 옵션 변경된 상품으로 재등록 하는 로직 사용.
  const handleOptionChange = async (itemId: number) => {
    const newColor = selectedOptions[itemId];
    const item = cartItems.find((item) => item._id === itemId);

    if (!item || !newColor || newColor === item.color) {
      setOpenDialogId(null);
      return;
    }

    setIsLoading(itemId);
    try {
      const result = await updateCartOptionAction(itemId, item.product._id, item.quantity, newColor);

      if (result.success && result.data) {
        const newItemId = result.data._id;

        // 옵션 변경 (ID가 변경됨)
        setCartItems((prevItems) => {
          // 기존 아이템을 찾아서 새 아이템으로 교체
          const itemIndex = prevItems.findIndex((cartItem) => cartItem._id === itemId);
          if (itemIndex !== -1) {
            const newItems = [...prevItems];
            // 선택한 색상의 인덱스를 찾아서 이미지 업데이트
            const colorIndex = item.product.extra?.potColors?.findIndex((color) => color === newColor) || 0;
            const newImage = item.product.mainImages?.[colorIndex] || item.product.mainImages?.[0] || result.data!.product.image;

            newItems[itemIndex] = {
              ...result.data!, // 서버에서 반환된 새 아이템 데이터 사용
              product: {
                ...result.data!.product,
                image: newImage,
                mainImages: item.product.mainImages,
                extra: item.product.extra,
              },
            };
            return newItems;
          }
          return prevItems;
        });

        // 선택 상태 업데이트 (새 아이템 ID로)
        if (selectedItems.has(itemId)) {
          setSelectedItems((prev) => {
            const newSet = new Set(prev);
            newSet.delete(itemId);
            newSet.add(newItemId);
            return newSet;
          });
        }

        // 옵션 상태도 새 ID로 업데이트
        setSelectedOptions((prev) => {
          const newOptions = { ...prev };
          delete newOptions[itemId];
          newOptions[newItemId] = newColor;
          return newOptions;
        });

        setOpenDialogId(null);

        setTimeout(() => {
          window.location.href = '/cart';
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`옵션 변경에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsLoading(null);
    }
  };

  // 현재 선택된 색상에 해당하는 이미지 URL 계산
  const getPreviewImageUrl = (item: CartItem, selectedColor: string) => {
    if (!item.product.mainImages || !item.product.extra?.potColors) {
      return getImageUrl(item.product.image);
    }

    const colorIndex = item.product.extra.potColors.findIndex((color) => color === selectedColor);
    const previewImage = item.product.mainImages[colorIndex] || item.product.mainImages[0] || item.product.image;
    return getImageUrl(previewImage);
  };

  // 주문하기
  const handleOrder = async () => {
    if (selectedItems.size === 0) {
      toast.error('상품을 선택해주세요');
      return;
    }

    // 선택된 장바구니 아이템 ID들을 배열로 변환
    const selectedCartIds = Array.from(selectedItems);

    const success = await createCartPurchaseTempOrderAction(selectedCartIds);

    if (!success) {
      toast.error('주문 처리에 실패했습니다', {
        description: '잠시 후 다시 시도해주세요.',
        duration: 4000,
      });
      return;
    }

    toast.success('주문 페이지로 이동합니다.');
    router.push('/order');
  };

  return (
    <div className='bg-surface min-h-screen w-full p-4 sm:p-6 lg:p-8'>
      {/* 스크린 리더용 실시간 알림 영역 */}
      <div aria-live='polite' aria-atomic='true' className='sr-only'>
        <div ref={cartAnnouncementRef} />
      </div>

      {/* 전체 컨테이너 */}
      <div className='mx-auto max-w-6xl'>
        {/* 헤더 영역 */}
        <div className='mb-8'>
          <div className='text-secondary t-small font-medium'>| Shopping Cart</div>
          <h1 className='text-secondary t-h2 mt-2 font-light' role='heading' aria-level={1}>
            Cart
          </h1>
        </div>

        {/* 컨텐츠 영역 */}
        <div className='flex flex-col gap-8 lg:flex-row lg:gap-8'>
          {/* 장바구니 아이템 목록 */}
          <div className='flex-1'>
            {/* 선택 영역 */}
            <div className='flex items-center justify-start border-b-2 pb-3 text-base lg:text-xl' role='toolbar' aria-label='장바구니 아이템 관리'>
              <div className='flex items-center gap-2'>
                <Checkbox id='select-all' className='ml-1 bg-white md:ml-2 lg:ml-0' checked={isAllSelected} onCheckedChange={handleSelectAll} aria-describedby='select-all-description' />
                <label htmlFor='select-all' className='cursor-pointer'>
                  모두 선택
                </label>
                <span id='select-all-description' className='sr-only'>
                  장바구니의 모든 상품을 선택하거나 선택 해제합니다
                </span>
              </div>
              <Button variant='ghost' className='mr-3 ml-auto text-base md:mr-6 lg:mr-2 lg:text-xl xl:mr-4' onClick={handleRemoveSelected} aria-label={`선택된 ${selectedItems.size}개 상품 삭제`} disabled={selectedItems.size === 0}>
                선택 삭제
              </Button>
            </div>

            {/* 장바구니 아이템 목록 */}
            {cartItems.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-20' role='status'>
                <p className='text-lg text-gray-500'>장바구니가 비어있습니다.</p>
                <Button variant='primary' className='mt-4' onClick={() => router.push('/shop?page=1')} aria-label='쇼핑 페이지로 이동하여 상품 보기'>
                  쇼핑 계속하기
                </Button>
              </div>
            ) : (
              <div role='list' aria-label={`장바구니 상품 ${cartItems.length}개`}>
                {cartItems.map((item) => (
                  <div key={item._id} role='listitem'>
                    {/* 카드 */}
                    <div className='lg:bg-surface md:border-gray-300-1 mt-5 flex items-stretch justify-between rounded-2xl bg-white px-4 py-5 md:mt-6 md:px-5 md:py-6 lg:mt-7 lg:px-3 lg:py-7'>
                      {/* 이미지 + 텍스트 */}
                      <div className='flex h-full items-start gap-3 md:gap-4'>
                        <div className='relative'>
                          <div className='relative ml-4 h-28 w-20 shrink-0 sm:h-32 sm:w-24 md:h-36 md:w-28 lg:h-40 lg:w-40'>
                            <Image src={getImageUrl(item.product.image)} alt={`${item.product.name}${item.color ? ` ${getColorKoreanName(item.color)} 색상` : ''} 상품 이미지`} fill className='rounded object-cover' />
                          </div>
                          <Checkbox
                            id={`item-${item._id}`}
                            className='absolute -top-0 -left-3 bg-white'
                            checked={selectedItems.has(item._id)}
                            onCheckedChange={(checked) => handleSelectItem(item._id, checked as boolean)}
                            disabled={isLoading === item._id}
                            aria-label={`${item.product.name} 선택${selectedItems.has(item._id) ? ', 현재 선택됨' : ''}`}
                          />
                        </div>
                        <div className='flex h-28 flex-col justify-between py-1 sm:h-32 md:h-36 lg:h-40'>
                          <div className='space-y-1'>
                            <h2 className='text-sm leading-tight font-semibold sm:text-lg md:text-lg xl:text-xl'>{item.product.name}</h2>
                            {item.color && (
                              <p className='text-muted-foreground text-xs sm:text-sm md:text-sm lg:text-base'>
                                <span aria-label={`화분 색상: ${getColorKoreanName(item.color)}`}>화분 색상 : {getColorKoreanName(item.color)}</span>
                              </p>
                            )}
                          </div>
                          <p className='text-sm font-semibold sm:text-base md:text-lg xl:text-xl' aria-label={`상품 금액 ${(item.product.price * item.quantity).toLocaleString()}원`}>
                            ₩ {(item.product.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* 버튼들 */}
                      <div className='flex h-full flex-col items-end justify-between lg:gap-20'>
                        <div className='flex flex-col gap-2 md:gap-3 lg:flex-row lg:gap-5' role='group' aria-label='상품 관리 옵션'>
                          {/* 옵션 변경 버튼 */}
                          {item.product.extra?.potColors && item.product.extra.potColors.length > 0 && (
                            <Dialog open={openDialogId === item._id} onOpenChange={(open) => setOpenDialogId(open ? item._id : null)}>
                              <DialogTrigger asChild>
                                <Button
                                  size='sm'
                                  variant='outline'
                                  className='order-2 h-8 w-20 text-xs md:h-9 md:w-24 md:text-sm lg:order-1 lg:h-10 lg:w-22 lg:text-base xl:w-28'
                                  disabled={isLoading === item._id}
                                  aria-label={`${item.product.name} 옵션 변경`}
                                >
                                  옵션 변경
                                </Button>
                              </DialogTrigger>
                              <DialogContent className='h-[480px] w-[500px] gap-0' role='dialog' aria-labelledby={`option-dialog-title-${item._id}`}>
                                <DialogHeader>
                                  <DialogTitle id={`option-dialog-title-${item._id}`} className='mb-5 text-left text-2xl font-semibold'>
                                    옵션 변경
                                  </DialogTitle>
                                </DialogHeader>
                                <div className='flex items-start gap-4'>
                                  <div className='relative h-[100px] w-[100px] shrink-0'>
                                    <Image src={getPreviewImageUrl(item, selectedOptions[item._id] || item.color || '')} alt={`${item.product.name} 미리보기 이미지`} fill className='rounded object-cover' />
                                  </div>
                                  <div>
                                    <h3 className='text-base font-bold md:text-2xl'>{item.product.name}</h3>
                                  </div>
                                </div>
                                <hr className='my-2 border-gray-300' />
                                <h4 className='t-h2 font-semibold' id={`color-selection-${item._id}`}>
                                  화분 색상
                                </h4>

                                {/* 색상 선택 UI */}
                                <div className='flex gap-3 pb-5' role='radiogroup' aria-labelledby={`color-selection-${item._id}`}>
                                  {item.product.extra?.potColors?.map((color, colorIndex) => {
                                    const { hexColor } = getColorMapping(color);
                                    const isSelected = selectedOptions[item._id] === color;

                                    return (
                                      <button
                                        key={color}
                                        ref={(el) => {
                                          if (!colorOptionsRef.current[item._id]) {
                                            colorOptionsRef.current[item._id] = [];
                                          }
                                          colorOptionsRef.current[item._id][colorIndex] = el;
                                        }}
                                        type='button'
                                        role='radio'
                                        aria-checked={isSelected}
                                        aria-label={`화분 색상 ${color} 선택${isSelected ? ', 현재 선택됨' : ''}`}
                                        onClick={() => setSelectedOptions((prev) => ({ ...prev, [item._id]: color }))}
                                        onKeyDown={(e) => handleColorKeyDown(e, item._id, colorIndex, item.product.extra?.potColors || [])}
                                        className={`focus-visible:ring-secondary h-10 w-10 rounded-full border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${isSelected ? 'border-secondary scale-110 border-3' : 'border-gray-300'} ${color === '백색' || color === '흰색' ? 'ring-1 ring-gray-200' : ''}`}
                                        style={{ backgroundColor: hexColor }}
                                        tabIndex={isSelected ? 0 : -1}
                                      />
                                    );
                                  })}
                                </div>
                                <span className='sr-only'>방향키로 색상 옵션을 탐색할 수 있습니다. 엔터 또는 스페이스바로 선택하세요.</span>

                                <Button
                                  fullWidth
                                  variant='primary'
                                  className='mx-auto block h-11 text-xl font-bold'
                                  onClick={() => handleOptionChange(item._id)}
                                  aria-label={`${item.product.name} 옵션을 ${selectedOptions[item._id] || ''}로 변경하기`}
                                >
                                  변경하기
                                </Button>
                              </DialogContent>
                            </Dialog>
                          )}

                          {/* 삭제 버튼 */}
                          <Button
                            size='sm'
                            variant='destructive'
                            fullWidth
                            className='order-1 flex h-8 w-20 items-center justify-center text-xs md:h-9 md:w-24 md:text-sm lg:order-2 lg:h-10 lg:w-22 lg:text-base xl:w-28'
                            onClick={() => handleRemoveItem(item._id)}
                            disabled={isLoading === item._id}
                            aria-label={`${item.product.name} 삭제`}
                          >
                            <Trash2 className='mr-1' size={14} aria-hidden='true' />
                            삭제
                          </Button>
                        </div>

                        {/* 수량 버튼 */}
                        <div className='mt-2 flex h-10 w-20 items-center rounded-4xl border bg-white sm:mt-3 md:mt-4 md:h-10 md:w-24 lg:mt-0 lg:h-12 lg:w-28' role='group' aria-labelledby={`quantity-label-${item._id}`}>
                          <span id={`quantity-label-${item._id}`} className='sr-only'>
                            수량 조절
                          </span>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='hover:bg-transparent'
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isLoading === item._id}
                            aria-label={`${item.product.name} 수량 1개 감소. 현재 ${item.quantity}개`}
                          >
                            <span aria-hidden='true'>-</span>
                          </Button>
                          <span className='flex-1 text-center text-sm md:text-base' aria-label={`현재 수량 ${item.quantity}개`} role='status'>
                            {item.quantity}
                          </span>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='hover:bg-transparent'
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            disabled={isLoading === item._id}
                            aria-label={`${item.product.name} 수량 1개 증가. 현재 ${item.quantity}개`}
                          >
                            <span aria-hidden='true'>+</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 결제 정보 영역 */}
          {cartItems.length > 0 && (
            <div className='w-full lg:w-[358px]'>
              <div className='rounded-2xl bg-white p-6 shadow-md' role='region' aria-labelledby='payment-summary-title'>
                <h2 id='payment-summary-title' className='mb-6 text-xl font-bold lg:text-2xl'>
                  결제 금액
                </h2>

                <div className='space-y-4'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>상품 금액</span>
                    <span className='font-semibold' aria-label={`상품 금액 ${calculateSelectedTotal().toLocaleString()}원`}>
                      ₩ {calculateSelectedTotal().toLocaleString()}
                    </span>
                  </div>

                  <div className='flex justify-between'>
                    <span className='text-gray-600'>배송비</span>
                    <span className='font-semibold' aria-label='배송비 3천원'>
                      ₩ 3,000
                    </span>
                  </div>

                  <div className='my-4 border-t pt-4'>
                    <div className='flex justify-between'>
                      <span className='text-lg font-bold lg:text-xl'>총 결제 금액</span>
                      <span className='text-secondary text-lg font-bold lg:text-xl' aria-label={`총 결제 금액 ${(calculateSelectedTotal() + 3000).toLocaleString()}원`}>
                        ₩ {(calculateSelectedTotal() + 3000).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant='primary'
                    className='mt-6 w-full py-6 text-lg font-bold'
                    onClick={handleOrder}
                    disabled={selectedItems.size === 0}
                    aria-label={`선택된 ${selectedItems.size}개 상품 주문하기`}
                    aria-describedby='order-button-description'
                  >
                    주문하기
                  </Button>
                  <span id='order-button-description' className='sr-only'>
                    {selectedItems.size > 0 ? `총 ${(calculateSelectedTotal() + 3000).toLocaleString()}원을 결제하고 주문을 진행합니다` : '주문하려면 상품을 선택해주세요'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 단일 상품 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteSingleAlert} onOpenChange={setShowDeleteSingleAlert}>
        <AlertDialogContent className='px-12 sm:max-w-md' role='alertdialog' aria-labelledby='delete-dialog-title' aria-describedby='delete-dialog-description'>
          <AlertDialogHeader>
            <AlertDialogTitle id='delete-dialog-title' className='t-h3 text-center'>
              정말로 이 상품을 삭제하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription id='delete-dialog-description' className='text-center text-base'>
              장바구니에서 상품이 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='mt-6 gap-3 sm:justify-between'>
            <AlertDialogAction onClick={confirmRemoveSingleItem} className='bg-primary text-secondary active:bg-primary px-10 shadow-sm hover:bg-[#AEBB2E]'>
              삭제
            </AlertDialogAction>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteSingleAlert(false);
                setDeleteTargetId(null);
              }}
              className='text-secondary hover:bg-secondary border-[0.5px] border-gray-300 bg-white px-7 shadow-sm hover:text-white'
            >
              취소
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
