'use client';

import { Button } from '@/components/ui/Button';
import { getOrderByIdAction } from '@/lib/actions/orderServerActions';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// 주문 완료 페이지용 주문 정보 타입
interface OrderCompleteInfo {
  orderId: number;
  productName: string;
  productImage: string;
  totalAmount: number;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
}

export default function OrderComplete() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [orderInfo, setOrderInfo] = useState<OrderCompleteInfo | null>(null);
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

        const result = await getOrderByIdAction(parseInt(orderId));

        if (!result.success) {
          console.error('[주문 완료] 주문 조회 실패:', result.message);
          toast.error('주문 정보를 불러올 수 없습니다');
          router.replace('/shop');
          return;
        }

        // TODO: 실제 주문 API에서 데이터를 받아와서 설정
        // 현재는 기본값으로 설정 (API 응답 구조에 따라 수정 필요)
        const mockOrderInfo: OrderCompleteInfo = {
          orderId: parseInt(orderId),
          productName: '식물 구매', // 실제로는 API에서 받아온 데이터 사용
          productImage: '/images/placeholder-plant.jpg', // 실제 이미지 경로
          totalAmount: 36000, // 실제 결제 금액
          orderDate: new Date().toLocaleString('ko-KR'),
          items: [
            {
              name: '호야 하트',
              quantity: 3,
              price: 12000,
              image: '/images/placeholder-plant.jpg',
            },
          ],
        };

        setOrderInfo(mockOrderInfo);
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
      <div className='bg-surface flex min-h-screen flex-col items-center justify-center px-4 py-20'>
        <div className='text-center'>
          <p className='text-xl'>주문 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 주문 정보가 없는 경우
  if (!orderInfo) {
    return (
      <div className='bg-surface flex min-h-screen flex-col items-center justify-center px-4 py-20'>
        <div className='text-center'>
          <p className='text-xl text-red-500'>주문 정보를 찾을 수 없습니다</p>
          <Link href='/shop' className='mt-4 inline-block'>
            <Button variant='primary' size='lg'>
              쇼핑 계속하기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-surface flex min-h-screen flex-col items-center px-4 py-20'>
      <h1 className='mb-20 text-4xl font-bold lg:mb-40'>결제가 완료되었습니다!</h1>

      {/* 흰색 배경 카드 */}
      <div className='mb-12 w-full max-w-md rounded-2xl bg-white p-6 shadow-md'>
        <div className='mb-8 flex flex-col items-center gap-8 lg:flex-row-reverse lg:items-center lg:justify-between'>
          {/* 결제된 상품 이미지 */}
          <div className='flex h-40 w-40 items-center justify-center rounded'>
            <Image src={orderInfo.productImage} alt={orderInfo.productName} className='h-40 w-40 rounded object-cover' width={160} height={160} />
          </div>

          {/* 주문 정보 */}
          <div className='space-y-4 text-left text-lg'>
            <div className='flex items-center gap-2'>
              <span>주문 번호:</span>
              <span className='font-semibold'>#{orderInfo.orderId}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span>주문 상품:</span>
              <span className='font-semibold'>{orderInfo.productName}</span>
            </div>
            <p>
              결제 일시: <span className='font-medium'>{orderInfo.orderDate}</span>
            </p>
            <p>
              결제 금액: <span className='font-medium'>₩ {orderInfo.totalAmount.toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* 주문 상세 정보 (임시 ui) */}
        {orderInfo.items.length > 0 && (
          <div className='mb-6 border-t pt-4'>
            <h3 className='mb-3 text-lg font-semibold'>주문 상품 목록</h3>
            <div className='space-y-2'>
              {orderInfo.items.map((item, index) => (
                <div key={index} className='flex justify-between text-sm'>
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>₩ {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 버튼*/}
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

      {/* 추가 안내 메시지 */}
      <div className='text-center text-gray-600'>
        <p className='mb-2'>주문이 정상적으로 처리되었습니다.</p>
        <p>배송 관련 문의는 고객센터로 연락해주세요.</p>
      </div>
    </div>
  );
}
