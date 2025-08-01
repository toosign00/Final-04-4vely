// src/app/(purchase)/order/order-complete/page.tsx
'use client';

import { Button } from '@/components/ui/Button';
import { getOrderByIdAction } from '@/lib/actions/order/orderServerActions';
import { Order } from '@/types/order.types';
import { getImageUrl } from '@/types/product.types';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function OrderComplete() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [orderInfo, setOrderInfo] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 주문 정보 조회
  useEffect(() => {
    const fetchOrderInfo = async () => {
      try {
        if (!orderId) {
          console.log('[주문 완료] orderId 파라미터 없음');
          toast.error('주문 정보를 찾을 수 없습니다');
          router.replace('/shop');
          return;
        }

        console.log('[주문 완료] 주문 정보 조회 시작:', orderId);

        // API에서 주문 정보 조회 시도
        const result = await getOrderByIdAction(parseInt(orderId));

        if (result.success && result.orderData) {
          console.log('[주문 완료] 주문 정보 조회 성공:', result.orderData);
          setOrderInfo(result.orderData);
        } else {
          // API 조회 실패 시 임시 주문 데이터에서 정보 가져오기 (폴백)
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
          } else {
            console.error('[주문 완료] 주문 조회 실패:', result.message);
            toast.error('주문 정보를 불러올 수 없습니다');
            router.replace('/shop');
            return;
          }
        }
        console.log('[주문 완료] 주문 정보 설정 완료');
      } catch (error) {
        console.error('[주문 완료] 주문 정보 조회 오류:', error);
        toast.error('주문 정보를 불러오는 중 오류가 발생했습니다');
        router.replace('/shop');
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
        <p className='text-xl'>주문 정보를 불러오는 중...</p>
      </div>
    );
  }

  // 주문 정보가 없는 경우
  if (!orderInfo) {
    return (
      <div className='bg-surface flex min-h-screen flex-col items-center px-4 py-20'>
        <p className='mb-4 text-xl text-red-500'>주문 정보를 찾을 수 없습니다</p>
        <Link href='/shop'>
          <Button variant='primary' size='lg'>
            쇼핑 계속하기
          </Button>
        </Link>
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

    // 이미지는 products[0].image 또는 memo.selectedImage 사용
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
    <div className='bg-surface flex min-h-screen flex-col items-center px-4 py-20'>
      {/* 완료 아이콘 */}
      <div className='mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-100'>
        <svg className='h-12 w-12 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
        </svg>
      </div>

      {/* 완료 메시지 */}
      <h1 className='text-secondary mb-2 text-3xl font-bold'>주문이 완료되었습니다!</h1>
      <p className='mb-8 text-lg text-gray-600'>주문번호: {orderInfo._id}</p>

      {/* 주문 정보 카드 */}
      <div className='mb-8 w-full max-w-2xl rounded-2xl bg-white p-8 shadow-md'>
        <h2 className='mb-6 text-xl font-semibold'>주문 정보</h2>

        {/* 상품 정보 */}
        <div className='mb-6 flex items-start space-x-4'>
          <div className='relative h-20 w-20 overflow-hidden rounded-lg'>
            <Image
              src={displayProductImage}
              alt={displayProductName}
              fill
              className='object-cover'
              onError={(e) => {
                e.currentTarget.src = '/images/placeholder-plant.jpg';
              }}
            />
          </div>
          <div className='flex-1'>
            <h3 className='mb-1 font-semibold'>{displayProductName}</h3>
            <p className='text-sm text-gray-600'>주문일시: {formatDate(orderInfo.createdAt)}</p>
          </div>
        </div>

        {/* 구분선 */}
        <div className='my-6 border-t border-gray-200' />

        {/* 배송 정보 */}
        {orderInfo.address && (
          <>
            <div className='mb-4'>
              <h3 className='mb-2 font-semibold'>배송 정보</h3>
              <p className='text-gray-600'>
                {orderInfo.address.name} | {orderInfo.address.phone}
              </p>
              <p className='text-gray-600'>{orderInfo.address.value || orderInfo.address.address || '주소 정보 없음'}</p>
            </div>

            {orderInfo.memo && ((typeof orderInfo.memo === 'string' && orderInfo.memo) || (typeof orderInfo.memo === 'object' && orderInfo.memo.selectedMemo)) && (
              <>
                <div className='mb-4'>
                  <h3 className='mb-2 font-semibold'>배송 요청사항</h3>
                  <p className='text-gray-600'>{typeof orderInfo.memo === 'string' ? orderInfo.memo : orderInfo.memo.selectedMemo}</p>
                </div>
              </>
            )}

            {/* 구분선 */}
            <div className='my-6 border-t border-gray-200' />
          </>
        )}

        {/* 결제 정보 */}
        <div>
          <h3 className='mb-2 font-semibold'>결제 정보</h3>
          <div className='space-y-1'>
            <div className='flex justify-between'>
              <span className='text-gray-600'>상품 금액</span>
              <span>{orderInfo.cost.products.toLocaleString()}원</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>배송비</span>
              <span>{orderInfo.cost.shippingFees.toLocaleString()}원</span>
            </div>
            <div className='mt-2 flex justify-between border-t pt-2 font-semibold'>
              <span>총 결제 금액</span>
              <span className='text-primary'>{orderInfo.cost.total.toLocaleString()}원</span>
            </div>
          </div>
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className='flex w-full max-w-2xl space-x-4'>
        <Link href='/my-page/order-history' className='flex-1'>
          <Button variant='outline' size='lg' className='w-full'>
            주문 내역 보기
          </Button>
        </Link>
        <Link href='/shop' className='flex-1'>
          <Button variant='primary' size='lg' className='w-full'>
            쇼핑 계속하기
          </Button>
        </Link>
      </div>
    </div>
  );
}
