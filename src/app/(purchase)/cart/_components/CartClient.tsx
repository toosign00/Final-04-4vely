// src/app/(purchase)/cart/_components/CartClient.tsx
'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { removeFromCartAction, updateCartOptionAction, updateCartQuantityAction } from '@/lib/actions/cart/cartServerActions';
import { createCartPurchaseTempOrderAction } from '@/lib/actions/order/orderServerActions';
import { CartItem } from '@/types/cart.types';
import { DirectPurchaseItem } from '@/types/order.types';
import { getImageUrl } from '@/types/product.types';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
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
  const [showDeleteAllAlert, setShowDeleteAllAlert] = useState(false);
  const [showDeleteSingleAlert, setShowDeleteSingleAlert] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // 초기 선택된 옵션 설정
  useState(() => {
    const options: Record<number, string> = {};
    cartItems.forEach((item) => {
      if (item.size) {
        options[item._id] = item.size;
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

  // 배송비 계산
  const calculateShippingFee = (totalAmount: number) => {
    return totalAmount >= 50000 ? 0 : 3000;
  };

  // 색상 매핑
  const getColorKoreanName = (color: string) => {
    const colorMap: Record<string, string> = {
      흑색: '블랙',
      갈색: '브라운',
      백색: '화이트',
      황색: '옐로우',
      회색: '그레이',
      흰색: '화이트',
      남색: '블루',
    };
    return colorMap[color] || color;
  };

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(cartItems.map((item) => item._id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  // 개별 선택
  const handleSelectItem = (itemId: number, checked: boolean) => {
    const newSelectedItems = new Set(selectedItems);
    if (checked) {
      newSelectedItems.add(itemId);
    } else {
      newSelectedItems.delete(itemId);
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

  // 모두 삭제
  const handleRemoveAll = async () => {
    if (cartItems.length === 0) {
      toast.error('삭제할 상품이 없습니다.');
      return;
    }
    setShowDeleteAllAlert(true);
  };

  // 실제 모두 삭제 처리
  const confirmRemoveAll = async () => {
    const deletePromises = cartItems.map((item) => removeFromCartAction(item._id));

    try {
      const results = await Promise.all(deletePromises);
      const successCount = results.filter((r) => r.success).length;

      if (successCount > 0) {
        setCartItems([]);
        setSelectedItems(new Set());
        toast.success('모든 상품이 삭제되었습니다.');
      }
    } catch (error) {
      toast.error(`삭제에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsLoading(null);
      setShowDeleteAllAlert(false);
    }
  };

  // 옵션 변경 처리
  // size 속성을 통한 필드 직접 수정(옵션 변경)을 지원하지 않는 것 같아서, 기존 상품을 삭제하고 옵션 변경된 상품으로 재등록 하는 로직 사용.
  const handleOptionChange = async (itemId: number) => {
    const newColor = selectedOptions[itemId];
    const item = cartItems.find((item) => item._id === itemId);

    if (!item || !newColor || newColor === item.size) {
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
                image: newImage, // 올바른 색상 이미지로 설정
                mainImages: item.product.mainImages, // mainImages
                extra: item.product.extra, // extra
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

        // router.refresh로는 새로고침이 되지 않는 현상이 발생하여, 확실한 페이지 새로고침을 위해 location.href 사용.
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

    const selectedCartItems = cartItems.filter((item) => selectedItems.has(item._id));

    // 선택된 상품을 DirectPurchaseItem 형태로 변환
    const purchaseItems: DirectPurchaseItem[] = selectedCartItems.map((item) => ({
      productId: item.product._id,
      productName: item.product.name,
      productImage: getImageUrl(item.product.image),
      price: item.product.price,
      quantity: item.quantity,
      selectedColor: item.size
        ? {
            colorIndex: 0,
            colorName: item.size,
          }
        : undefined,
    }));

    const success = await createCartPurchaseTempOrderAction(purchaseItems);

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
      {/* 전체 컨테이너 */}
      <div className='mx-auto max-w-6xl'>
        {/* 헤더 영역 */}
        <div className='mb-8'>
          <div className='text-secondary t-small font-medium'>| Shopping Cart</div>
          <h2 className='text-secondary t-h2 mt-2 font-light'>Cart</h2>
        </div>

        {/* 컨텐츠 영역 - flex로 좌우 배치 */}
        <div className='flex flex-col gap-8 lg:flex-row lg:gap-8'>
          {/* 왼쪽: 장바구니 아이템 목록 */}
          <div className='flex-1'>
            {/* 선택 영역 */}
            <div className='flex items-center justify-start border-b-2 pb-3 text-base lg:text-xl'>
              <div className='flex items-center gap-2'>
                <Checkbox id='select-all' className='ml-1 bg-white md:ml-2 lg:ml-0' checked={isAllSelected} onCheckedChange={handleSelectAll} />
                <label htmlFor='select-all' className='cursor-pointer'>
                  모두 선택
                </label>
              </div>
              <Button variant='ghost' className='mr-3 ml-auto text-base md:mr-6 lg:mr-2 lg:text-xl xl:mr-4' onClick={handleRemoveAll}>
                모두 삭제
              </Button>
            </div>

            {/* 장바구니 아이템 목록 */}
            {cartItems.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-20'>
                <p className='text-lg text-gray-500'>장바구니가 비어있습니다.</p>
                <Button variant='primary' className='mt-4' onClick={() => router.push('/shop')}>
                  쇼핑 계속하기
                </Button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item._id}>
                  {/* 카드 */}
                  <div className='lg:bg-surface md:border-gray-300-1 mt-5 flex items-stretch justify-between rounded-2xl border-b bg-white px-4 py-5 md:mt-6 md:px-5 md:py-6 lg:mt-7 lg:rounded-none lg:px-3 lg:py-7'>
                    {/* 이미지 + 텍스트 */}
                    <div className='flex h-full items-start gap-3 md:gap-4'>
                      <div className='relative'>
                        <div className='relative ml-4 h-28 w-20 shrink-0 sm:h-32 sm:w-24 md:h-36 md:w-28 lg:h-40 lg:w-40'>
                          <Image src={getImageUrl(item.product.image)} alt={item.product.name} fill className='rounded object-cover' />
                        </div>
                        <Checkbox
                          id={`item-${item._id}`}
                          className='absolute -top-0 -left-3 bg-white'
                          checked={selectedItems.has(item._id)}
                          onCheckedChange={(checked) => handleSelectItem(item._id, checked as boolean)}
                          disabled={isLoading === item._id}
                        />
                      </div>
                      <div className='flex h-28 flex-col justify-between py-1 sm:h-32 md:h-36 lg:h-40'>
                        <div className='space-y-1'>
                          <h2 className='text-sm leading-tight font-semibold sm:text-lg md:text-lg xl:text-xl'>{item.product.name}</h2>
                          {item.size && <p className='text-muted-foreground text-xs sm:text-sm md:text-sm lg:text-base'>화분 색상 : {getColorKoreanName(item.size)}</p>}
                        </div>
                        <p className='text-sm font-semibold sm:text-base md:text-lg xl:text-xl'>₩ {(item.product.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* 버튼들 */}
                    <div className='flex h-full flex-col items-end justify-between lg:gap-20'>
                      <div className='flex flex-col gap-2 md:gap-3 lg:flex-row lg:gap-5'>
                        {/* 옵션 변경 버튼 */}
                        {item.product.extra?.potColors && item.product.extra.potColors.length > 0 && (
                          <Dialog open={openDialogId === item._id} onOpenChange={(open) => setOpenDialogId(open ? item._id : null)}>
                            <DialogTrigger asChild>
                              <Button size='sm' variant='outline' className='order-2 h-8 w-20 text-xs md:h-9 md:w-24 md:text-sm lg:order-1 lg:h-10 lg:w-22 lg:text-base xl:w-28' disabled={isLoading === item._id}>
                                옵션 변경
                              </Button>
                            </DialogTrigger>
                            <DialogContent className='h-[480px] w-[500px] gap-0'>
                              <DialogHeader>
                                <DialogTitle className='mb-5 text-left text-2xl font-semibold'>옵션 변경</DialogTitle>
                              </DialogHeader>
                              <div className='flex items-start gap-4'>
                                <div className='relative h-[100px] w-[100px] shrink-0'>
                                  <Image src={getPreviewImageUrl(item, selectedOptions[item._id] || item.size || '')} alt={item.product.name} fill className='rounded object-cover' />
                                </div>
                                <div>
                                  <h2 className='text-base font-bold md:text-2xl'>{item.product.name}</h2>
                                </div>
                              </div>
                              <hr className='my-2 border-gray-300' />
                              <p className='t-h2 font-semibold'>화분 색상</p>

                              {/* 색상 선택 UI - 색상 원으로 변경 */}
                              <div className='flex gap-3 pb-5'>
                                {item.product.extra?.potColors?.map((color) => {
                                  const { hexColor } = getColorMapping(color);
                                  const isSelected = selectedOptions[item._id] === color;

                                  return (
                                    <button
                                      key={color}
                                      type='button'
                                      aria-label={color}
                                      onClick={() => setSelectedOptions((prev) => ({ ...prev, [item._id]: color }))}
                                      className={`h-10 w-10 rounded-full border-2 transition ${isSelected ? 'border-secondary scale-110 border-3' : 'border-gray-300'} ${color === '백색' || color === '흰색' ? 'ring-1 ring-gray-200' : ''}`}
                                      style={{ backgroundColor: hexColor }}
                                    />
                                  );
                                })}
                              </div>

                              <Button fullWidth variant='primary' className='mx-auto block h-11 text-xl font-bold' onClick={() => handleOptionChange(item._id)}>
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
                        >
                          <Trash2 className='mr-1' size={14} />
                          삭제
                        </Button>
                      </div>

                      {/* 수량 버튼 */}
                      <div className='mt-2 flex h-10 w-20 items-center rounded-4xl border bg-white sm:mt-3 md:mt-4 md:h-10 md:w-24 lg:mt-0 lg:h-12 lg:w-28'>
                        <Button variant='ghost' size='icon' className='hover:bg-transparent' onClick={() => handleQuantityChange(item._id, item.quantity - 1)} disabled={item.quantity <= 1 || isLoading === item._id}>
                          -
                        </Button>
                        <span className='flex-1 text-center text-sm md:text-base'>{item.quantity}</span>
                        <Button variant='ghost' size='icon' className='hover:bg-transparent' onClick={() => handleQuantityChange(item._id, item.quantity + 1)} disabled={isLoading === item._id}>
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 오른쪽: 결제 정보 영역 */}
          {cartItems.length > 0 && (
            <div className='w-full lg:w-[358px]'>
              <div className='rounded-2xl bg-white p-6 shadow-md'>
                <h3 className='mb-6 text-xl font-bold lg:text-2xl'>결제 금액</h3>

                <div className='space-y-4'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>상품 금액</span>
                    <span className='font-semibold'>₩ {calculateSelectedTotal().toLocaleString()}</span>
                  </div>

                  <div className='flex justify-between'>
                    <span className='text-gray-600'>배송비</span>
                    <span className='font-semibold'>{calculateShippingFee(calculateSelectedTotal()) === 0 ? '무료' : `₩ ${calculateShippingFee(calculateSelectedTotal()).toLocaleString()}`}</span>
                  </div>

                  <div className='my-4 border-t pt-4'>
                    <div className='flex justify-between'>
                      <span className='text-lg font-bold lg:text-xl'>총 결제 금액</span>
                      <span className='text-secondary text-lg font-bold lg:text-xl'>₩ {(calculateSelectedTotal() + calculateShippingFee(calculateSelectedTotal())).toLocaleString()}</span>
                    </div>
                  </div>

                  <Button variant='primary' className='mt-6 w-full py-6 text-lg font-bold' onClick={handleOrder} disabled={selectedItems.size === 0}>
                    주문하기
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 단일 상품 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteSingleAlert} onOpenChange={setShowDeleteSingleAlert}>
        <AlertDialogContent className='px-12 sm:max-w-md'>
          <AlertDialogHeader>
            <AlertDialogTitle className='t-h3 text-center'>정말로 이 상품을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription className='text-center text-base'>장바구니에서 상품이 삭제됩니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='mt-6 gap-3 sm:justify-between'>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteSingleAlert(false);
                setDeleteTargetId(null);
              }}
              className='text-secondary hover:bg-secondary border-[0.5px] border-gray-300 bg-white px-10 shadow-sm hover:text-white'
            >
              취소
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveSingleItem} className='bg-error hover:bg-error/90 active:bg-error/80 px-10 text-white shadow-sm'>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 모든 상품 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteAllAlert} onOpenChange={setShowDeleteAllAlert}>
        <AlertDialogContent className='px-12 sm:max-w-md'>
          <AlertDialogHeader>
            <AlertDialogTitle className='t-h3 text-center'>정말로 상품을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription className='text-center text-base'>장바구니의 모든 상품이 삭제됩니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='mt-6 gap-3 sm:justify-between'>
            <AlertDialogCancel className='text-secondary hover:bg-secondary border-[0.5px] border-gray-300 bg-white px-10 shadow-sm hover:text-white'>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveAll} className='bg-error hover:bg-error/90 active:bg-error/80 px-10 text-white shadow-sm'>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
