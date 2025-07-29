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

        // 임시 주문 데이터에서 정보 가져오기 (API 호출 전 임시 방안)
        const tempOrderData = sessionStorage.getItem('lastOrderData');
        if (tempOrderData) {
          const parsedData = JSON.parse(tempOrderData);
          const mockOrderInfo: Order = {
            _id: parseInt(orderId),
            user_id: 1,
            state: 'paid',
            products: parsedData.items.map((item: any) => ({
              _id: Date.now() + Math.random(),
              product_id: item.productId,
              quantity: item.quantity,
              price: item.price,
              size: item.selectedColor?.colorName,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })),
            cost: {
              total: parsedData.totalAmount + (parsedData.shippingFee || 0),
              products: parsedData.totalAmount,
              shippingFees: parsedData.shippingFee || 0,
            },
            address: parsedData.address,
            memo: parsedData.memo,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setOrderInfo(mockOrderInfo);
          sessionStorage.removeItem('lastOrderData');
        } else {
          // API에서 주문 정보 조회 시도
          const result = await getOrderByIdAction(parseInt(orderId));
          if (!result.success) {
            console.error('[주문 완료] 주문 조회 실패:', result.message);
            toast.error('주문 정보를 불러올 수 없습니다');
            router.replace('/shop');
            return;
          }
          // 실제 API 응답을 사용할 수 있게 되면 여기서 처리
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

  // 첫 번째 상품 정보 가져오기 (sessionStorage 데이터 사용 시)
  const tempOrderData = sessionStorage.getItem('lastOrderData');
  let firstProductName = '식물 구매';
  let firstProductImage = '/images/placeholder-plant.jpg';
  let productCount = orderInfo.products.length;

  if (tempOrderData) {
    try {
      const parsedData = JSON.parse(tempOrderData);
      const firstItem = parsedData.items[0];
      if (firstItem) {
        firstProductName = firstItem.productName;
        firstProductImage = getImageUrl(firstItem.productImage);
        productCount = parsedData.items.length;
      }
    } catch (error) {
      console.error('임시 주문 데이터 파싱 오류:', error);
    }
  }

  // 여러 상품인 경우 표시 텍스트 조정
  const displayProductName = productCount > 1 ? `${firstProductName} 외 ${productCount - 1}건` : firstProductName;

  return (
    <div className='bg-surface flex min-h-screen flex-col items-center px-4 py-20'>
      <h1 className='mb-20 text-4xl font-bold lg:mb-40'>결제가 완료되었습니다!</h1>

      {/* 흰색 배경 카드 */}
      <div className='mb-12 w-full max-w-md rounded-2xl bg-white p-6 shadow-md'>
        <div className='mb-8 flex flex-col items-center gap-8 lg:flex-row-reverse lg:items-center lg:justify-between'>
          {/* 결제된 상품 이미지 */}
          <div className='flex h-40 w-40 items-center justify-center rounded'>
            <Image src={firstProductImage} alt={firstProductName} width={160} height={160} className='h-40 w-40 rounded object-cover' />
          </div>

          {/* 주문 정보 */}
          <div className='space-y-4 text-left text-lg'>
            <div className='flex items-center gap-2'>
              <span>주문 상품:</span>
              <span className='font-semibold'>{displayProductName}</span>
            </div>
            <p>
              결제 일시: <span className='font-medium'>{formatDate(orderInfo.createdAt)}</span>
            </p>
            <p>
              결제 금액: <span className='font-medium'>₩ {orderInfo.cost.total.toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* 버튼 */}
        <div className='flex justify-center gap-4'>
          <Link href='/shop'>
            <Button variant='primary' size='lg'>
              쇼핑 계속하기
            </Button>
          </Link>
          <Link href='/my-page/order-history'>
            <Button variant='default' size='lg'>
              상세 주문 보기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
