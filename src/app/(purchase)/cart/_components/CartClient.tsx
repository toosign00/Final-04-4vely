// src/app/(purchase)/cart/_components/CartClientSection.tsx
'use client';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { removeFromCartAction, updateCartQuantityAction } from '@/lib/actions/cartServerActions';
import { createCartPurchaseTempOrderAction } from '@/lib/actions/orderServerActions';
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

export default function CartClientSection({ initialCartItems }: CartClientSectionProps) {
  const router = useRouter();

  // 상태 관리
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState<number | null>(null);
  const [openDialogId, setOpenDialogId] = useState<number | null>(null);

  // 옵션 변경 상태
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});

  // 초기 선택된 옵션 설정
  useState(() => {
    const options: Record<number, string> = {};
    cartItems.forEach((item) => {
      if (item.extra?.potColor) {
        options[item._id] = item.extra.potColor;
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

  const selectedTotal = calculateSelectedTotal();
  const shippingFee = calculateShippingFee(selectedTotal);
  const finalTotal = selectedTotal + shippingFee;

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
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  // 수량 변경
  const handleQuantityChange = async (itemId: number, change: number) => {
    const item = cartItems.find((item) => item._id === itemId);
    if (!item) return;

    const newQuantity = item.quantity + change;
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

  // 아이템 삭제
  const handleRemoveItem = async (itemId: number) => {
    setIsLoading(itemId);
    try {
      const result = await removeFromCartAction(itemId);

      if (result.success) {
        setCartItems((prevItems) => prevItems.filter((item) => item._id !== itemId));
        setSelectedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
        toast.success('상품이 삭제되었습니다.');
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

    const confirmDelete = confirm(`선택한 ${selectedItems.size}개의 상품을 삭제하시겠습니까?`);
    if (!confirmDelete) return;

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
      toast.error(`수량 변경에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsLoading(null);
    }
  };

  // 옵션 변경 처리
  const handleOptionChange = async (itemId: number) => {
    const newColor = selectedOptions[itemId];
    const item = cartItems.find((item) => item._id === itemId);

    if (!item || !newColor || newColor === item.extra?.potColor) {
      setOpenDialogId(null);
      return;
    }

    // TODO: 옵션 변경 API 호출 (서버 액션 필요)
    toast.info('옵션 변경 기능은 준비 중입니다.');
    setOpenDialogId(null);
  };

  // 주문하기
  const handleOrder = async () => {
    if (selectedItems.size === 0) {
      toast.error('주문할 상품을 선택해주세요.');
      return;
    }

    const selectedCartItems = cartItems.filter((item) => selectedItems.has(item._id));
    const purchaseItems: DirectPurchaseItem[] = selectedCartItems.map((item) => ({
      productId: item.product._id,
      productName: item.product.name,
      productImage: getImageUrl(item.product.mainImages?.[0] || ''),
      price: item.product.price,
      quantity: item.quantity,
      selectedColor: item.extra?.potColor
        ? {
            colorIndex: 0,
            colorName: item.extra.potColor,
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

  return (
    <div className='bg-surface mx-auto w-full max-w-[1500px] p-4 md:p-6 lg:p-8'>
      {/* 헤더 영역 */}
      <div className='mt-2 mb-6 flex items-center md:mb-8 lg:mt-0 lg:mb-24'>
        <h1 className='font-regular flex flex-col items-start gap-1 text-3xl md:text-4xl'>
          <span className='text-base'>|Shopping Cart</span>
          <span>CART</span>
        </h1>
      </div>

      <div className='mx-1 sm:mx-8 lg:flex lg:gap-6'>
        {/* 왼쪽: 장바구니 아이템 목록 */}
        <div className='flex-1'>
          {/* 선택 영역 */}
          <div className='flex items-center justify-start border-b-2 pb-3 text-base lg:text-2xl'>
            <div className='flex items-center gap-2'>
              <Checkbox id='select-all' className='bg-white' checked={isAllSelected} onCheckedChange={handleSelectAll} />
              <label htmlFor='select-all' className='cursor-pointer'>
                모두 선택
              </label>
            </div>
            <Button variant='ghost' className='ml-auto lg:text-2xl' onClick={handleRemoveSelected}>
              선택 삭제
            </Button>
          </div>

          {/* 장바구니 아이템 목록 */}
          {cartItems.map((item, idx) => (
            <div key={item._id}>
              {/* 카드 */}
              <div className='lg:bg-surface md:border-gray-300-1 mt-5 flex items-stretch justify-between rounded-2xl bg-white px-4 py-5 md:mt-6 md:px-5 md:py-6 lg:mt-7 lg:px-3 lg:py-7'>
                {/* 이미지 + 텍스트 */}
                <div className='flex h-full items-start gap-3 md:gap-4'>
                  <div className='relative'>
                    <div className='relative h-28 w-20 shrink-0 sm:h-32 sm:w-24 md:h-36 md:w-28 lg:h-40 lg:w-40'>
                      <Image src={getImageUrl(item.product.mainImages?.[0] || '')} alt={item.product.name} fill className='rounded object-cover' />
                    </div>
                    <Checkbox
                      id={`item-${item._id}`}
                      className='absolute -top-2 -left-2 bg-white'
                      checked={selectedItems.has(item._id)}
                      onCheckedChange={(checked) => handleSelectItem(item._id, checked as boolean)}
                      disabled={isLoading === item._id}
                    />
                  </div>
                  <div className='flex h-28 flex-col justify-between py-1 sm:h-32 md:h-36 lg:h-40'>
                    <div className='space-y-1'>
                      <h2 className='text-base leading-tight font-semibold sm:text-lg md:text-xl lg:text-3xl'>{item.product.name}</h2>
                      {item.extra?.potColor && <p className='text-muted-foreground text-xs sm:text-sm md:text-sm lg:text-base'>화분 색상 : {getColorKoreanName(item.extra.potColor)}</p>}
                    </div>
                    <p className='text-sm font-semibold sm:text-base md:text-lg lg:text-2xl'>₩ {(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>

                {/* 버튼들 */}
                <div className='flex h-full flex-col items-end justify-between lg:gap-20'>
                  <div className='flex flex-col gap-2 md:gap-3 lg:flex-row lg:gap-5'>
                    {/* 옵션 변경 버튼 */}
                    {item.product.extra?.potColors && item.product.extra.potColors.length > 0 && (
                      <Dialog open={openDialogId === item._id} onOpenChange={(open) => setOpenDialogId(open ? item._id : null)}>
                        <DialogTrigger asChild>
                          <Button size='sm' variant='primary' className='order-2 h-8 w-20 text-xs md:h-9 md:w-24 md:text-sm lg:order-1 lg:h-10 lg:w-28 lg:text-base' disabled={isLoading === item._id}>
                            옵션 변경
                          </Button>
                        </DialogTrigger>
                        <DialogContent className='h-[580px] w-[500px]'>
                          <DialogHeader>
                            <DialogTitle className='text-2xl font-semibold'>옵션 변경</DialogTitle>
                          </DialogHeader>
                          <div className='flex items-start gap-4'>
                            <div className='relative h-[100px] w-[100px] shrink-0'>
                              <Image src={getImageUrl(item.product.mainImages?.[0] || '')} alt={item.product.name} fill className='rounded object-cover' />
                            </div>
                            <div>
                              <h2 className='text-2xl font-bold'>{item.product.name}</h2>
                            </div>
                          </div>
                          <hr className='my-2 border-gray-300' />
                          <p className='text-[20px] font-medium'>화분 색상</p>
                          <RadioGroup
                            value={selectedOptions[item._id] || item.extra?.potColor}
                            onValueChange={(value) => setSelectedOptions((prev) => ({ ...prev, [item._id]: value }))}
                            className='mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4'
                          >
                            {item.product.extra?.potColors?.map((color) => (
                              <div key={color} className='mr-4 flex h-[34px] w-[94px] items-center rounded-2xl border-1'>
                                <RadioGroupItem className='mx-1 h-[20px] w-[20px]' value={color} id={`${item._id}-${color}`} />
                                <label htmlFor={`${item._id}-${color}`} className='mx-2 text-base'>
                                  {getColorKoreanName(color)}
                                </label>
                              </div>
                            ))}
                          </RadioGroup>
                          <Button fullWidth variant='primary' className='mx-auto block h-11 font-bold lg:w-25' onClick={() => handleOptionChange(item._id)}>
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
                      className='order-1 flex h-8 w-20 items-center justify-center text-xs md:h-9 md:w-24 md:text-sm lg:order-2 lg:h-10 lg:w-28 lg:text-base'
                      onClick={() => handleRemoveItem(item._id)}
                      disabled={isLoading === item._id}
                    >
                      <Trash2 className='mr-1' size={14} />
                      삭제
                    </Button>
                  </div>

                  {/* 수량 버튼 */}
                  <div className='mt-2 flex h-10 w-20 items-center rounded-4xl border bg-white sm:mt-3 md:mt-4 md:h-10 md:w-24 lg:h-12 lg:w-28'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-6 w-6 text-base md:h-6 md:w-8 md:text-base lg:h-7 lg:w-10 lg:text-lg'
                      aria-label='수량 감소'
                      onClick={() => handleQuantityChange(item._id, -1)}
                      disabled={item.quantity <= 1 || isLoading === item._id}
                    >
                      -
                    </Button>

                    <span className='mx-2 text-center text-sm md:text-sm lg:text-base'>{item.quantity}</span>

                    <Button variant='ghost' size='icon' className='h-6 w-6 text-base md:h-6 md:w-8 md:text-base lg:h-7 lg:w-10 lg:text-lg' aria-label='수량 증가' onClick={() => handleQuantityChange(item._id, 1)} disabled={isLoading === item._id}>
                      +
                    </Button>
                  </div>
                </div>
              </div>

              {idx !== cartItems.length - 1 && <div className='my-6 hidden h-px w-full bg-gray-300 md:my-7 lg:my-8 lg:block' />}
            </div>
          ))}
        </div>

        {/* 주문 내역 */}
        <hr className='mt-8 mb-6 border-gray-300 md:mt-10 md:mb-8 lg:hidden' />
        <div className='bg-surface h-auto w-full shrink-0 p-4 md:p-6 lg:mt-0 lg:h-119 lg:w-1/3 lg:bg-white'>
          <h2 className='mb-8 text-xl font-bold md:mb-10 md:text-2xl lg:mb-12'>주문 내역</h2>

          <div className='mb-4 flex justify-between text-sm md:mb-5 md:text-base lg:mb-6 lg:text-[16px]'>
            <span>상품 금액</span>
            <span>₩ {selectedTotal.toLocaleString()}</span>
          </div>

          <div className='mb-4 flex justify-between text-sm md:mb-5 md:text-base lg:mb-10 lg:text-[16px]'>
            <span>배송비</span>
            <span>{shippingFee === 0 ? '무료' : `₩ ${shippingFee.toLocaleString()}`}</span>
          </div>

          <hr className='mb-4 border-gray-300 md:mb-5 lg:mb-10' />

          <div className='mb-6 flex justify-between text-base font-semibold md:mb-8 md:text-lg lg:mb-10'>
            <span>총 결제 금액</span>
            <span>₩ {finalTotal.toLocaleString()}</span>
          </div>

          <Button fullWidth variant='primary' className='h-[45px] text-lg md:h-[48px] md:text-xl lg:h-[50px] lg:text-3xl' onClick={handleOrder} disabled={selectedItems.size === 0}>
            주문하기
          </Button>
        </div>
      </div>
    </div>
  );
}
