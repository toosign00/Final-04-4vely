// src/app/(purchase)/order/order-complete/page.tsx
'use client';

import { Button } from '@/components/ui/Button';
import { getOrderByIdAction } from '@/lib/actions/order/orderServerActions';
import { Order } from '@/types/order.types';
import { getImageUrl } from '@/types/product.types';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function OrderComplete() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [orderInfo, setOrderInfo] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 접근성을 위한 refs
  const pageAnnouncementRef = useRef<HTMLDivElement>(null);

  // 주문 정보 조회
  useEffect(() => {
    const fetchOrderInfo = async () => {
      try {
        if (!orderId) {
          console.log('[주문 완료] orderId 파라미터 없음');

          // 오류 상태 알림
          if (pageAnnouncementRef.current) {
            pageAnnouncementRef.current.textContent = '주문 정보를 찾을 수 없습니다. 쇼핑 페이지로 이동합니다.';
          }

          toast.error('주문 정보를 찾을 수 없습니다');
          router.replace('/shop?page=1');
          return;
        }

        console.log('[주문 완료] 주문 정보 조회 시작:', orderId);

        // 로딩 상태 알림
        if (pageAnnouncementRef.current) {
          pageAnnouncementRef.current.textContent = '주문 정보를 불러오고 있습니다.';
        }

        // API에서 주문 정보 조회 시도
        const result = await getOrderByIdAction(parseInt(orderId));

        if (result.success && result.orderData) {
          console.log('[주문 완료] 주문 정보 조회 성공:', result.orderData);
          setOrderInfo(result.orderData);

          // 주문 완료 상태 알림
          if (pageAnnouncementRef.current) {
            pageAnnouncementRef.current.textContent = `주문번호 ${orderId}번 주문이 성공적으로 완료되었습니다.`;
          }
        } else {
          // API 조회 실패 시 임시 주문 데이터에서 정보 가져오기 (fallback)
          const tempOrderData = sessionStorage.getItem('lastOrderData');
          if (tempOrderData) {
            const parsedData = JSON.parse(tempOrderData);
            console.log('[주문 완료] 임시 주문 데이터 사용:', parsedData);

            interface TempOrderItem {
              productId: number;
              productName: string;
              productImage: string;
              quantity: number;
              price: number;
              selectedColor?: {
                colorName: string;
              };
            }

            interface TempOrderData {
              items: TempOrderItem[];
              totalAmount: number;
              shippingFee: number;
              address: {
                name: string;
                phone: string;
                address: string;
                detailAddress?: string;
                zipCode?: string;
              };
              memo?: string;
            }

            const orderData = parsedData as TempOrderData;

            const mockOrderInfo: Order = {
              _id: parseInt(orderId),
              user_id: 1,
              state: 'OS020', // 결제완료 상태
              products: orderData.items.map((item, index) => ({
                _id: index + 1,
                quantity: item.quantity,
                price: item.price,
                color: item.selectedColor?.colorName,
                name: item.productName || '상품명 없음',
                image: item.productImage || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })),
              cost: {
                total: orderData.totalAmount + (orderData.shippingFee || 0),
                products: orderData.totalAmount,
                shippingFees: orderData.shippingFee || 0,
              },
              address: {
                name: orderData.address.name,
                phone: orderData.address.phone,
                value: `${orderData.address.zipCode || ''} ${orderData.address.address} ${orderData.address.detailAddress || ''}`.trim(),
                address: orderData.address.address,
                detailAddress: orderData.address.detailAddress,
                zipCode: orderData.address.zipCode,
              },
              memo: {
                selectedMemo: orderData.memo || '',
                selectedImage: orderData.items.length === 1 ? orderData.items[0]?.productImage || '' : orderData.items.map((item) => item.productImage || ''),
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setOrderInfo(mockOrderInfo);
            sessionStorage.removeItem('lastOrderData');

            // 주문 완료 상태 알림
            if (pageAnnouncementRef.current) {
              pageAnnouncementRef.current.textContent = `주문번호 ${orderId}번 주문이 성공적으로 완료되었습니다.`;
            }
          } else {
            console.error('[주문 완료] 주문 조회 실패:', result.message);

            // 오류 상태 알림
            if (pageAnnouncementRef.current) {
              pageAnnouncementRef.current.textContent = '주문 정보를 불러올 수 없습니다. 쇼핑 페이지로 이동합니다.';
            }

            toast.error('주문 정보를 불러올 수 없습니다');
            router.replace('/shop?page=1');
            return;
          }
        }
        console.log('[주문 완료] 주문 정보 설정 완료');
      } catch (error) {
        console.error('[주문 완료] 주문 정보 조회 오류:', error);

        // 오류 상태 알림
        if (pageAnnouncementRef.current) {
          pageAnnouncementRef.current.textContent = '주문 정보를 불러오는 중 오류가 발생했습니다. 쇼핑 페이지로 이동합니다.';
        }

        toast.error('주문 정보를 불러오는 중 오류가 발생했습니다');
        router.replace('/shop?page=1');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderInfo();
  }, [orderId, router]);

  // 로딩 중
  if (isLoading) {
    return (
      <div className='bg-surface flex min-h-screen flex-col items-center px-4 py-20'>
        {/* 스크린 리더용 실시간 알림 영역 */}
        <div aria-live='polite' aria-atomic='true' className='sr-only'>
          <div ref={pageAnnouncementRef} />
        </div>

        <div role='status' aria-live='polite'>
          <div className='border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' aria-hidden='true' />
          <p className='text-xl'>주문 정보를 불러오는 중...</p>
          <span className='sr-only'>잠시만 기다려 주세요. 주문 정보를 확인하고 있습니다.</span>
        </div>
      </div>
    );
  }

  // 주문 정보가 없는 경우
  if (!orderInfo) {
    return (
      <div className='bg-surface flex min-h-screen flex-col items-center px-4 py-20'>
        {/* 스크린 리더용 실시간 알림 영역 */}
        <div aria-live='polite' aria-atomic='true' className='sr-only'>
          <div ref={pageAnnouncementRef} />
        </div>

        <div role='alert' aria-labelledby='error-title'>
          <p id='error-title' className='mb-4 text-xl text-red-500'>
            주문 정보를 찾을 수 없습니다
          </p>
          <Link href='/shop?page=1'>
            <Button variant='primary' size='lg' aria-label='쇼핑 페이지로 돌아가기'>
              쇼핑 계속하기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 첫 번째 상품 정보 가져오기
  const firstProduct = orderInfo.products[0];

  let displayProductName = '식물 구매';
  let displayProductImage = '/images/placeholder-plant.jpg';

  if (firstProduct) {
    // API 응답에 상품명과 이미지가 직접 포함되어 있음
    displayProductName = firstProduct.name || firstProduct.product?.name || '상품명 없음';

    let productImage = '';

    // memo.selectedImage 처리
    if (!productImage && typeof orderInfo.memo === 'object' && orderInfo.memo?.selectedImage) {
      if (typeof orderInfo.memo.selectedImage === 'string') {
        productImage = orderInfo.memo.selectedImage;
      } else if (Array.isArray(orderInfo.memo.selectedImage) && orderInfo.memo.selectedImage.length > 0) {
        productImage = orderInfo.memo.selectedImage[0];
      }
    }

    displayProductImage = getImageUrl(productImage);

    // 선택한 색상 정보
    const selectedColor = firstProduct.color || firstProduct.size;
    if (selectedColor) {
      displayProductName = `${displayProductName} (${selectedColor})`;
    }
  }

  // 여러 상품인 경우 표시 텍스트 조정
  if (orderInfo.products.length > 1) {
    const firstName = firstProduct?.name || firstProduct?.product?.name || '상품';
    displayProductName = `${firstName} 외 ${orderInfo.products.length - 1}건`;
  }

  return (
    <div className='bg-surface flex min-h-screen flex-col items-center px-4 py-10 md:py-14 lg:py-20'>
      {/* 스크린 리더용 실시간 알림 영역 */}
      <div aria-live='polite' aria-atomic='true' className='sr-only'>
        <div ref={pageAnnouncementRef} />
      </div>

      {/* 완료 아이콘 */}
      <div className='mb-8 flex size-14 items-center justify-center rounded-full bg-gradient-to-r from-[#7ECBD5] to-[#92D399] md:size-18 lg:size-24' role='img' aria-label='주문 완료 체크 아이콘'>
        <svg className='size-8 text-white md:size-10 lg:size-12' fill='none' stroke='currentColor' viewBox='0 0 24 24' aria-hidden='true'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M5 13l4 4L19 7' />
        </svg>
      </div>

      {/* 완료 메시지 */}
      <header className='mb-8 text-center'>
        <h1 className='text-secondary mb-2 text-xl font-bold md:text-2xl lg:text-3xl' role='heading' aria-level={1}>
          주문이 완료되었습니다!
        </h1>
        <p className='text-base text-gray-600 lg:text-lg' aria-label={`주문번호 ${orderInfo._id}번`}>
          주문번호: <span className='font-mono'>{orderInfo._id}</span>
        </p>
        <div className='sr-only'>주문이 성공적으로 처리되었습니다. 주문번호 {orderInfo._id}번으로 주문 내역을 확인하실 수 있습니다.</div>
      </header>

      {/* 주문 정보 카드 */}
      <main className='mb-8 w-full max-w-2xl rounded-2xl bg-white p-8 shadow-md' role='main' aria-labelledby='order-details-title'>
        <h2 id='order-details-title' className='mb-6 text-xl font-semibold'>
          주문 정보
        </h2>

        {/* 상품 정보 */}
        <section className='mb-6 flex items-start space-x-4' aria-labelledby='product-info-title'>
          <h3 id='product-info-title' className='sr-only'>
            주문 상품 정보
          </h3>
          <div className='relative h-20 w-20 overflow-hidden rounded-lg' role='img' aria-labelledby='product-image-desc'>
            <Image
              src={displayProductImage}
              alt={`${displayProductName} 상품 이미지`}
              fill
              className='object-cover'
              onError={(e) => {
                e.currentTarget.src = '/images/placeholder-plant.jpg';
                e.currentTarget.alt = '상품 이미지를 불러올 수 없습니다';
              }}
            />
            <span id='product-image-desc' className='sr-only'>
              주문하신 {displayProductName}의 상품 이미지입니다
            </span>
          </div>
          <div className='flex-1'>
            <h4 className='mb-1 font-semibold'>{displayProductName}</h4>
            <p className='text-sm text-gray-600'>
              <time dateTime={orderInfo.createdAt} aria-label={`주문 일시: ${formatDate(orderInfo.createdAt)}`}>
                주문일시: {formatDate(orderInfo.createdAt)}
              </time>
            </p>
            <div className='sr-only'>
              총 {orderInfo.products.reduce((sum, product) => sum + product.quantity, 0)}개의 상품을 {formatDate(orderInfo.createdAt)}에 주문하셨습니다.
            </div>
          </div>
        </section>

        {/* 구분선 */}
        <hr className='my-6 border-t border-gray-200' aria-hidden='true' />

        {/* 배송 정보 */}
        {orderInfo.address && (
          <section aria-labelledby='shipping-info-title'>
            <div className='mb-4'>
              <h3 id='shipping-info-title' className='mb-2 font-semibold'>
                배송 정보
              </h3>
              <div className='text-gray-600' role='group' aria-labelledby='recipient-info'>
                <span id='recipient-info' className='sr-only'>
                  받는 사람 정보
                </span>
                <p aria-label={`받는 사람: ${orderInfo.address.name}, 연락처: ${orderInfo.address.phone}`}>
                  {orderInfo.address.name} | {orderInfo.address.phone}
                </p>
                <p aria-label={`배송 주소: ${orderInfo.address.value || orderInfo.address.address || '주소 정보 없음'}`}>{orderInfo.address.value || orderInfo.address.address || '주소 정보 없음'}</p>
              </div>
            </div>

            {orderInfo.memo && ((typeof orderInfo.memo === 'string' && orderInfo.memo) || (typeof orderInfo.memo === 'object' && orderInfo.memo.selectedMemo)) && (
              <div className='mb-4'>
                <h3 className='mb-2 font-semibold'>배송 메모</h3>
                <p className='text-gray-600' role='note' aria-label={`배송 요청사항: ${typeof orderInfo.memo === 'string' ? orderInfo.memo : orderInfo.memo.selectedMemo}`}>
                  {typeof orderInfo.memo === 'string' ? orderInfo.memo : orderInfo.memo.selectedMemo}
                </p>
              </div>
            )}

            {/* 구분선 */}
            <hr className='my-6 border-t border-gray-200' aria-hidden='true' />
          </section>
        )}

        {/* 결제 정보 */}
        <section aria-labelledby='payment-info-title'>
          <h3 id='payment-info-title' className='mb-2 font-semibold'>
            결제 정보
          </h3>
          <div className='space-y-1' role='list' aria-label='결제 내역'>
            <div className='flex justify-between' role='listitem'>
              <span className='text-gray-600'>상품 금액</span>
              <span aria-label={`상품 금액 ${orderInfo.cost.products.toLocaleString()}원`}>{orderInfo.cost.products.toLocaleString()}원</span>
            </div>
            <div className='flex justify-between' role='listitem'>
              <span className='text-gray-600'>배송비</span>
              <span aria-label={`배송비 ${orderInfo.cost.shippingFees.toLocaleString()}원`}>{orderInfo.cost.shippingFees.toLocaleString()}원</span>
            </div>
            <div className='mt-2 flex justify-between border-t pt-2 font-semibold' role='listitem'>
              <span>총 결제 금액</span>
              <span className='text-primary' aria-label={`총 결제 금액 ${orderInfo.cost.total.toLocaleString()}원`}>
                {orderInfo.cost.total.toLocaleString()}원
              </span>
            </div>
          </div>
          <div className='sr-only'>
            상품 금액 {orderInfo.cost.products.toLocaleString()}원에 배송비 {orderInfo.cost.shippingFees.toLocaleString()}원을 합하여 총 {orderInfo.cost.total.toLocaleString()}원이 결제되었습니다.
          </div>
        </section>
      </main>

      {/* 액션 버튼들 */}
      <nav className='flex w-full max-w-2xl justify-between space-x-4' role='navigation' aria-label='주문 완료 후 이동 옵션'>
        <Link href='/my-page/order-history'>
          <Button variant='outline' size='lg' className='font-semibold' aria-label='마이페이지에서 주문 내역 확인하기' aria-describedby='order-history-desc'>
            주문 내역 보기
          </Button>
        </Link>
        <span id='order-history-desc' className='sr-only'>
          마이페이지로 이동하여 이번 주문을 포함한 모든 주문 내역을 확인할 수 있습니다
        </span>

        <Link href='/shop?page=1' className='items-start'>
          <Button variant='primary' size='lg' className='font-semibold' aria-label='쇼핑 페이지로 돌아가서 다른 상품 둘러보기' aria-describedby='continue-shopping-desc'>
            쇼핑 계속하기
          </Button>
        </Link>
        <span id='continue-shopping-desc' className='sr-only'>
          쇼핑 페이지로 돌아가서 다른 식물과 원예용품을 둘러볼 수 있습니다
        </span>
      </nav>
    </div>
  );
}
