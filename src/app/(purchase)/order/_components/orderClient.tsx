// src/app/(purchase)/order/_components/OrderClientSection.tsx
'use client';

import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { createOrderAction, updateTempOrderAddressAction, updateTempOrderMemoAction } from '@/lib/actions/orderServerActions';
import { CreateOrderRequest, OrderPageData } from '@/types/order.types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface OrderClientSectionProps {
  initialOrderData: OrderPageData;
}

export default function OrderClientSection({ initialOrderData }: OrderClientSectionProps) {
  const router = useRouter();

  // 상태 관리
  const [orderData, setOrderData] = useState<OrderPageData>(initialOrderData);
  const [showItems, setShowItems] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // 배송 정보 폼 상태
  const [addressForm, setAddressForm] = useState({
    name: orderData.address?.name || '',
    phone: orderData.address?.phone || '',
    address: orderData.address?.address || '',
    detailAddress: orderData.address?.detailAddress || '',
    zipCode: orderData.address?.zipCode || '',
  });

  const [deliveryMemo, setDeliveryMemo] = useState(orderData.memo || '');

  const totalProductAmount = orderData.totalAmount;
  const shippingFee = orderData.shippingFee;
  const finalAmount = totalProductAmount + shippingFee;

  // 배송 정보 저장
  const handleSaveAddress = async () => {
    try {
      const address = {
        name: addressForm.name,
        phone: addressForm.phone,
        address: addressForm.address,
        detailAddress: addressForm.detailAddress,
        zipCode: addressForm.zipCode,
      };

      const success = await updateTempOrderAddressAction(address);

      if (success) {
        setOrderData((prev) => ({ ...prev, address }));
        toast.success('배송지 정보가 저장되었습니다.');
      } else {
        toast.error('배송지 정보 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('[배송지 저장] 오류:', error);
      toast.error('배송지 정보 저장 중 오류가 발생했습니다.');
    }
  };

  // 배송 메모 저장
  const handleSaveMemo = async (memo: string) => {
    try {
      setDeliveryMemo(memo);
      const success = await updateTempOrderMemoAction(memo);

      if (success) {
        setOrderData((prev) => ({ ...prev, memo }));
      }
    } catch (error) {
      console.error('[배송 메모 저장] 오류:', error);
    }
  };

  // 결제 처리 함수
  const handlePayment = async () => {
    try {
      setIsProcessingOrder(true);
      console.log('[결제 처리] 시작');

      // 배송지 정보 확인
      if (!orderData.address || !addressForm.name || !addressForm.phone || !addressForm.address) {
        toast.error('배송지 정보를 입력해주세요');
        return;
      }

      // 주문 생성 요청 데이터 준비
      const createOrderData: CreateOrderRequest = {
        products: orderData.items.map((item) => ({
          _id: item.productId,
          quantity: item.quantity,
          size: item.selectedColor?.colorName,
        })),
        address: orderData.address,
        memo: orderData.memo,
      };

      console.log('[결제 처리] 주문 생성 요청:', createOrderData);

      // 주문 생성 API 호출
      const result = await createOrderAction(createOrderData);

      if (!result.success) {
        console.error('[결제 처리] 주문 생성 실패:', result.message);
        toast.error('주문 생성 실패', {
          description: result.message,
          duration: 4000,
        });
        return;
      }

      console.log('[결제 처리] 주문 생성 성공');

      // 성공 알림
      toast.success('주문이 완료되었습니다!', {
        description: '주문 완료 페이지로 이동합니다.',
        duration: 2000,
      });

      // 주문 완료 페이지로 이동
      if (result.data?.redirectUrl) {
        setTimeout(() => {
          router.push(result.data?.redirectUrl || '/');
        }, 1000);
      }
    } catch (error) {
      console.error('[결제 처리] 예상치 못한 오류:', error);
      toast.error('결제 처리 중 오류가 발생했습니다', {
        description: '잠시 후 다시 시도해주세요.',
        duration: 4000,
      });
    } finally {
      setIsProcessingOrder(false);
    }
  };

  return (
    <div className='bg-surface mx-auto w-full max-w-[1500px] gap-5 px-4 py-8 lg:px-6'>
      {/* 헤더 영역 */}
      <div className='flex items-center lg:mb-24'>
        <Button variant='ghost' size='icon' className='mr-2 text-4xl lg:hidden' aria-label='뒤로 가기' onClick={() => router.back()}>
          ←
        </Button>
        <h1 className='font-regular text-3xl md:text-4xl'>
          <span>Purchase</span>
          <span className='hidden text-base lg:block'>| PAYMENT</span>
        </h1>
      </div>
      <hr className='mt-3 mb-10 border bg-gray-300 lg:hidden' />

      {/* 결제 상품 정보 */}
      <section className='rounded-xl border bg-white p-6'>
        <div className='mb-7 flex items-center justify-between'>
          <h2 className='text-xl font-semibold'>결제 상품 정보</h2>
          {orderData.items.length > 1 && (
            <Button variant='primary' size='sm' type='button' onClick={() => setShowItems(!showItems)} aria-label={showItems ? '상품 숨기기' : '추가 상품 보기'}>
              {showItems ? '접기' : '전체보기'}
            </Button>
          )}
        </div>
        <div className='space-y-6'>
          {/* 항상 첫 번째 상품만 보여줌 */}
          {orderData.items.slice(0, 1).map((item, index) => (
            <div key={`${item.productId}-${index}`} className='flex items-center gap-4 lg:gap-8'>
              <div className='relative h-30 w-40 shrink-0'>
                <Image src={item.productImage} alt={item.productName} fill className='rounded object-cover' />
              </div>
              <div>
                <p className='mb-8 text-xl font-semibold'>{item.productName}</p>
                {item.selectedColor && <p className='text-muted-foreground mb-1'>옵션: {item.selectedColor.colorName}</p>}
                <p>수량: {item.quantity}개</p>
                <p className='text-lg font-medium'>₩ {(item.price * item.quantity).toLocaleString()}</p>
              </div>
            </div>
          ))}

          {/* 토글 시 나머지 상품들 노출 */}
          {showItems &&
            orderData.items.slice(1).map((item, index) => (
              <div key={`${item.productId}-${index + 1}`} className='flex items-center gap-8 opacity-80'>
                <div className='relative h-30 w-40 shrink-0'>
                  <Image src={item.productImage} alt={item.productName} fill className='rounded object-cover' />
                </div>
                <div>
                  <p className='mb-2 text-xl font-semibold'>{item.productName}</p>
                  {item.selectedColor && <p className='text-muted-foreground mb-1'>옵션: {item.selectedColor.colorName}</p>}
                  <p>수량: {item.quantity}개</p>
                  <p className='text-lg font-medium'>₩ {(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* 배송지 정보 */}
      <section className='mt-7 rounded-xl border bg-white p-6'>
        <h2 className='mb-7 text-xl font-semibold'>배송지 정보</h2>
        <div className='text-sm lg:flex lg:items-end lg:justify-between'>
          {/* 현재 배송지 */}
          <div className='space-y-4'>
            {orderData.address ? (
              <>
                <p className='text-lg font-medium'>{orderData.address.name}</p>
                <p>{orderData.address.phone}</p>
                <p>{orderData.address.address}</p>
                {orderData.address.detailAddress && <p>{orderData.address.detailAddress}</p>}
              </>
            ) : (
              <p className='text-gray-500'>배송지를 입력해주세요.</p>
            )}
          </div>

          {/* 배송지 변경 다이얼로그 */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant='primary' size='sm' className='mt-4 lg:mt-0'>
                배송지 {orderData.address ? '변경' : '입력'}
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle className='text-2xl'>배송지 정보</DialogTitle>
              </DialogHeader>

              <div className='space-y-6 p-6'>
                <div className='grid gap-8'>
                  <div>
                    <Label htmlFor='name'>받는 사람</Label>
                    <input id='name' type='text' className='mt-1 w-full rounded-lg border p-2' value={addressForm.name} onChange={(e) => setAddressForm((prev) => ({ ...prev, name: e.target.value }))} placeholder='이름을 입력하세요' />
                  </div>

                  <div>
                    <Label htmlFor='phone'>연락처</Label>
                    <input id='phone' type='tel' className='mt-1 w-full rounded-lg border p-2' value={addressForm.phone} onChange={(e) => setAddressForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder='010-0000-0000' />
                  </div>

                  <div>
                    <Label htmlFor='address'>주소</Label>
                    <input id='address' type='text' className='mt-1 w-full rounded-lg border p-2' value={addressForm.address} onChange={(e) => setAddressForm((prev) => ({ ...prev, address: e.target.value }))} placeholder='주소를 입력하세요' />
                  </div>

                  <div>
                    <Label htmlFor='detailAddress'>상세 주소</Label>
                    <input
                      id='detailAddress'
                      type='text'
                      className='mt-1 w-full rounded-lg border p-2'
                      value={addressForm.detailAddress}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, detailAddress: e.target.value }))}
                      placeholder='상세 주소를 입력하세요'
                    />
                  </div>

                  <div>
                    <Label htmlFor='zipCode'>우편번호</Label>
                    <input id='zipCode' type='text' className='mt-1 w-full rounded-lg border p-2' value={addressForm.zipCode} onChange={(e) => setAddressForm((prev) => ({ ...prev, zipCode: e.target.value }))} placeholder='00000' />
                  </div>
                </div>

                <Button onClick={handleSaveAddress} fullWidth variant='primary'>
                  저장하기
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* 배송 메모 */}
      <section className='mt-7 rounded-xl border bg-white p-6'>
        <h2 className='mb-6 text-xl font-semibold'>배송 메모</h2>
        <Select value={deliveryMemo} onValueChange={handleSaveMemo}>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='배송 메모를 선택해주세요' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>배송 메모</SelectLabel>
              <SelectItem value='부재시 문 앞에 놓아주세요'>부재시 문 앞에 놓아주세요</SelectItem>
              <SelectItem value='부재시 경비실에 맡겨주세요'>부재시 경비실에 맡겨주세요</SelectItem>
              <SelectItem value='부재시 택배함에 넣어주세요'>부재시 택배함에 넣어주세요</SelectItem>
              <SelectItem value='배송 전 연락 부탁드립니다'>배송 전 연락 부탁드립니다</SelectItem>
              <SelectItem value='파손 위험이 있으니 조심히 다뤄주세요'>파손 위험이 있으니 조심히 다뤄주세요</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </section>

      {/* 결제 정보 */}
      <section className='mt-7 rounded-xl border bg-white p-6'>
        <h2 className='mb-7 text-xl font-semibold'>결제 정보</h2>
        <div className='mb-6 space-y-4'>
          <div className='flex justify-between'>
            <span className='text-gray-600'>상품 금액</span>
            <span className='font-medium'>₩ {totalProductAmount.toLocaleString()}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-600'>배송비</span>
            <span className='font-medium'>{shippingFee === 0 ? '무료' : `₩ ${shippingFee.toLocaleString()}`}</span>
          </div>
          <hr className='my-4' />
          <div className='flex justify-between text-lg'>
            <span className='font-semibold'>총 결제 금액</span>
            <span className='text-primary font-bold'>₩ {finalAmount.toLocaleString()}</span>
          </div>
        </div>

        <Button fullWidth variant='primary' size='lg' onClick={handlePayment} disabled={isProcessingOrder || !orderData.address} className='mt-8'>
          {isProcessingOrder ? '처리 중...' : '결제하기'}
        </Button>
      </section>
    </div>
  );
}
