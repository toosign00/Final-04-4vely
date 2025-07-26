'use client';

import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { createOrderAction } from '@/lib/actions/orderServerActions';
import { usePurchaseStore } from '@/store/orderStore';
import { CreateOrderRequest } from '@/types/order.types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function OrderPage() {
  const router = useRouter();
  const { currentPurchase, updateShippingAddress, updateDeliveryMemo, calculateTotalAmount, clearPurchase } = usePurchaseStore();

  const [showItems, setShowItems] = useState(false);
  const [activeTab, setActiveTab] = useState<'select' | 'new'>('select');
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // 구매 데이터가 없으면 쇼핑 페이지로 리다이렉트
  useEffect(() => {
    if (!currentPurchase) {
      console.log('[결제 페이지] 구매 데이터 없음, 쇼핑 페이지로 리다이렉트');
      toast.error('구매할 상품을 선택해주세요');
      router.replace('/shop');
    }
  }, [currentPurchase, router]);

  // 구매 데이터가 없으면 로딩 표시
  if (!currentPurchase) {
    return (
      <div className='bg-surface flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <p className='text-lg'>구매 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const totalProductAmount = currentPurchase.totalAmount;
  const shippingFee = currentPurchase.shippingFee;
  const finalAmount = calculateTotalAmount();

  // 결제 처리 함수
  const handlePayment = async () => {
    try {
      setIsProcessingOrder(true);
      console.log('[결제 처리] 시작');

      // 배송지 정보 확인
      if (!currentPurchase.address) {
        toast.error('배송지 정보를 입력해주세요');
        return;
      }

      // 주문 생성 요청 데이터 준비
      const orderData: CreateOrderRequest = {
        products: currentPurchase.items.map((item) => ({
          _id: item.productId,
          quantity: item.quantity,
          size: item.selectedColor?.colorName,
        })),
        address: currentPurchase.address,
        memo: currentPurchase.memo,
      };

      console.log('[결제 처리] 주문 생성 요청:', orderData);

      // 주문 생성 API 호출
      const result = await createOrderAction(orderData);

      if (!result.success) {
        console.error('[결제 처리] 주문 생성 실패:', result.message);
        toast.error('주문 생성 실패', {
          description: result.message,
          duration: 4000,
        });
        return;
      }

      console.log('[결제 처리] 주문 생성 성공');

      // 구매 데이터 초기화
      clearPurchase();

      // 성공 알림
      toast.success('주문이 완료되었습니다!', {
        description: '주문 완료 페이지로 이동합니다.',
        duration: 2000,
      });

      // 주문 완료 페이지로 이동
      if (result.data?.redirectUrl) {
        setTimeout(() => {
          router.push(result.data.redirectUrl);
        }, 1000);
      } else {
        setTimeout(() => {
          router.push('/order/order-complete');
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
          {currentPurchase.items.length > 1 && (
            <Button variant='primary' size='sm' type='button' onClick={() => setShowItems(!showItems)} aria-label={showItems ? '상품 숨기기' : '추가 상품 보기'}>
              {showItems ? '접기' : '전체보기'}
            </Button>
          )}
        </div>
        <div className='space-y-6'>
          {/* 항상 첫 번째 상품만 보여줌 */}
          {currentPurchase.items.slice(0, 1).map((item, index) => (
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
            currentPurchase.items.slice(1).map((item, index) => (
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
            {currentPurchase.address ? (
              <>
                <div className='flex justify-between lg:justify-start lg:gap-4'>
                  <span className='w-24 shrink-0 lg:w-48'>받는 사람</span>
                  <span className='break-words'>{currentPurchase.address.name}</span>
                </div>
                <div className='flex justify-between lg:justify-start lg:gap-4'>
                  <span className='w-24 shrink-0 lg:w-48'>연락처</span>
                  <span className='break-words'>{currentPurchase.address.phone}</span>
                </div>
                <div className='flex items-start justify-between lg:justify-start lg:gap-4'>
                  <span className='w-24 shrink-0 lg:w-48'>주소</span>
                  <span className='break-words'>
                    {currentPurchase.address.zipCode && `(${currentPurchase.address.zipCode}) `}
                    {currentPurchase.address.address}
                    {currentPurchase.address.detailAddress && ` ${currentPurchase.address.detailAddress}`}
                  </span>
                </div>
              </>
            ) : (
              <div className='text-gray-500'>
                <p>배송지 정보를 입력해주세요.</p>
              </div>
            )}
          </div>

          {/* 변경 버튼 클릭시 배송정보 모달창 */}
          <div className='mt-4 text-right lg:mt-0'>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant='primary' size='lg'>
                  {currentPurchase.address ? '변경' : '입력'}
                </Button>
              </DialogTrigger>
              <DialogContent className='flex items-center justify-center p-4'>
                <div className='w-full max-w-lg overflow-auto bg-white p-6'>
                  <DialogHeader className='flex justify-center'>
                    <DialogTitle className='w-full text-center text-lg font-semibold'>배송지 설정</DialogTitle>
                  </DialogHeader>

                  {/* 탭 네비게이션 */}
                  <div className='mt-4 flex w-full'>
                    <Button variant='ghost' onClick={() => setActiveTab('select')} className={`flex-1 py-3 transition-colors ${activeTab === 'select' ? 'bg-[#c1d72f] text-black' : 'bg-white'}`}>
                      배송지 선택
                    </Button>
                    <Button variant='ghost' onClick={() => setActiveTab('new')} className={`flex-1 py-3 transition-colors ${activeTab === 'new' ? 'bg-[#c1d72f] text-black' : 'bg-white'}`}>
                      신규 입력
                    </Button>
                  </div>

                  {/* 탭 컨텐츠 - 기존 코드와 동일하지만 실제 기능 연결 필요 */}
                  {activeTab === 'new' && (
                    <form
                      className='mt-4 grid gap-4'
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const addressData = {
                          name: formData.get('name') as string,
                          phone: formData.get('phone') as string,
                          zipCode: formData.get('zipCode') as string,
                          address: formData.get('address') as string,
                          detailAddress: formData.get('detailAddress') as string,
                        };

                        if (addressData.name && addressData.phone && addressData.address) {
                          updateShippingAddress(addressData);
                          toast.success('배송지 정보가 저장되었습니다');
                          // 모달 닫기 로직 추가 필요
                        } else {
                          toast.error('필수 정보를 모두 입력해주세요');
                        }
                      }}
                    >
                      <div>
                        <label className='block text-sm font-medium'>이름 *</label>
                        <input name='name' type='text' className='mt-1 w-full rounded border p-2' placeholder='받는 분 이름' defaultValue={currentPurchase.address?.name || ''} required />
                      </div>
                      <div>
                        <label className='block text-sm font-medium'>전화번호 *</label>
                        <input name='phone' type='text' className='mt-1 w-full rounded border p-2' placeholder='010-1234-5678' defaultValue={currentPurchase.address?.phone || ''} required />
                      </div>
                      <div>
                        <label className='block text-sm font-medium'>우편번호</label>
                        <input name='zipCode' type='text' className='mt-1 w-full rounded border p-2' placeholder='03706' defaultValue={currentPurchase.address?.zipCode || ''} />
                      </div>
                      <div className='mt-4'>
                        <label className='block text-sm font-medium'>도로명 주소 *</label>
                        <div className='mt-1 flex gap-2'>
                          <input name='address' type='text' className='flex-1 rounded border p-2' placeholder='서울특별시 서대문구 성산로7길 89-8(연희동)' defaultValue={currentPurchase.address?.address || ''} required />
                          <Button
                            size='lg'
                            variant='default'
                            type='button'
                            onClick={() => {
                              // TODO: 주소 검색 API 연동
                              toast.info('주소 검색 기능은 곧 출시예정입니다');
                            }}
                          >
                            주소 찾기
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className='block text-sm font-medium'>상세 주소</label>
                        <input name='detailAddress' type='text' className='mt-1 w-full rounded border p-2' placeholder='1층 아임웹' defaultValue={currentPurchase.address?.detailAddress || ''} />
                      </div>

                      {/* 배송 메모 select */}
                      <div className='mt-4 space-y-2'>
                        <Label htmlFor='deliveryNote'>배송 메모</Label>
                        <Select onValueChange={(value) => updateDeliveryMemo(value)}>
                          <SelectTrigger id='deliveryNote' className='w-full'>
                            <SelectValue placeholder='배송 메모를 선택해 주세요.' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>추천 메모</SelectLabel>
                              <SelectItem value='부재 시 경비실에 맡겨주세요.'>부재 시 경비실에 맡겨주세요.</SelectItem>
                              <SelectItem value='배송 전 연락 바랍니다.'>배송 전 연락 바랍니다.</SelectItem>
                              <SelectItem value='문 앞에 보관해주세요.'>문 앞에 보관해주세요.</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* 적용 버튼 */}
                      <div className='mt-6 flex justify-end'>
                        <Button type='submit' variant='primary'>
                          적용하기
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* 결제 방법 */}
      <section className='mt-7 rounded-xl border bg-white p-6'>
        <h2 className='mb-7 text-xl font-semibold'>결제 방법</h2>
        <div className='grid grid-cols-3 gap-7 text-sm lg:w-[700px]'>
          {['신용카드', '계좌이체', '무통장 입금', '휴대폰', '토스페이', '카카오페이'].map((method, idx) => (
            <Button key={idx} size='lg' className='rounded-full border-black px-4 py-2'>
              {method}
            </Button>
          ))}
        </div>
      </section>

      {/* 총 결제 금액 */}
      <section className='mt-7 rounded-xl border bg-white p-6 text-sm lg:flex lg:items-end lg:justify-between'>
        <div className='w-full lg:w-[500px]'>
          <h2 className='mb-7 text-xl font-semibold'>총 결제 금액</h2>
          <div className='space-y-4'>
            <div className='flex justify-between'>
              <span>총 상품 금액</span>
              <span>₩ {totalProductAmount.toLocaleString()}</span>
            </div>
            <div className='flex justify-between'>
              <span>배송비</span>
              <span>₩ {shippingFee.toLocaleString()}</span>
            </div>
            <hr className='border-gray-300' />
            <div className='mt-2 flex justify-between text-lg font-semibold'>
              <span>합계</span>
              <span>₩ {finalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 결제버튼 */}
        <Button onClick={handlePayment} disabled={isProcessingOrder || !currentPurchase.address} fullWidth variant='primary' size='lg' className='mt-6 rounded-lg px-6 py-2 lg:w-auto'>
          {isProcessingOrder ? '결제 처리 중...' : '결제하기'}
        </Button>
      </section>
    </div>
  );
}
