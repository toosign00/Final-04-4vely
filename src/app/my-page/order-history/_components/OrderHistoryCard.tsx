import { Button } from '@/components/ui/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import Image from 'next/image';
import { useState } from 'react';
import ReviewForm from './ReviewForm';
import ReviewModal from './ReviewModal';

interface OrderHistoryCardProps {
  order: {
    id: number;
    imageUrl: string;
    name: string;
    option: string;
    quantity: number;
    orderDate: string;
    totalPrice: string;
    deliveryStatus: 'preparing' | 'shipping' | 'completed';
  };
}

export default function OrderHistoryCard({ order }: OrderHistoryCardProps) {
  // 배송 상태에 따른 프로그레스 계산
  const getProgressStep = (status: string) => {
    switch (status) {
      case 'preparing':
        return 1;
      case 'shipping':
        return 2;
      case 'completed':
        return 3;
      default:
        return 1;
    }
  };

  // 각 단계별 색상 반환
  const getStepColor = (step: number, currentStep: number) => {
    if (currentStep >= step) {
      switch (step) {
        case 1:
          return 'bg-orange-500'; // 준비 - 주황색
        case 2:
          return 'bg-blue-500'; // 배송중 - 파란색
        case 3:
          return 'bg-green-500'; // 완료 - 초록색
        default:
          return 'bg-gray-300';
      }
    }
    return 'bg-gray-300';
  };

  // 현재 상태에 따른 툴팁 텍스트 반환
  const getCurrentStatusText = (status: string) => {
    switch (status) {
      case 'preparing':
        return '준비 중';
      case 'shipping':
        return '배송 중';
      case 'completed':
        return '배송 완료';
      default:
        return '준비 중';
    }
  };

  const currentStep = getProgressStep(order.deliveryStatus);
  const [isReviewOpen, setReviewOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className='group relative mx-auto w-full max-w-6xl rounded-2xl bg-white p-3 shadow-sm transition-shadow duration-300 hover:shadow-lg'>
        {/* 배송 프로그레스 바 - 모바일 */}
        <div className='absolute top-3 right-3 z-10 md:hidden'>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='flex cursor-pointer items-center gap-1 rounded-lg bg-white/90 px-2 py-1 shadow-sm'>
                <div className='flex items-center gap-1'>
                  <div className={`relative flex h-2.5 w-2.5 items-center justify-center rounded-full ${getStepColor(1, currentStep)}`}>
                    <div className='absolute inset-0 rounded-full bg-white/30' />
                    <div className='relative h-1 w-1 rounded-full bg-white/90' />
                  </div>
                  <div className='h-px w-1.5 border-t border-dashed border-gray-300' />
                  <div className={`relative flex h-2.5 w-2.5 items-center justify-center rounded-full ${getStepColor(2, currentStep)}`}>
                    <div className='absolute inset-0 rounded-full bg-white/30' />
                    <div className='relative h-1 w-1 rounded-full bg-white/90' />
                  </div>
                  <div className='h-px w-1.5 border-t border-dashed border-gray-300' />
                  <div className={`relative flex h-2.5 w-2.5 items-center justify-center rounded-full ${getStepColor(3, currentStep)}`}>
                    <div className='absolute inset-0 rounded-full bg-white/30' />
                    <div className='relative h-1 w-1 rounded-full bg-white/90' />
                  </div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{getCurrentStatusText(order.deliveryStatus)}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className='grid grid-cols-1 items-center gap-4 md:grid-cols-[auto_1fr_auto] md:gap-6'>
          {/* 상품 이미지 */}
          <div className='grid place-items-center'>
            <div className='aspect-square w-[10.625rem]'>
              <Image src={order.imageUrl} alt='order-history' width={170} height={170} className='h-full w-full rounded-xl border bg-gray-100 object-cover' sizes='(max-width: 640px) 110px, 170px' priority />
            </div>
          </div>
          {/* 주문 정보 */}
          <div className='flex h-full flex-col justify-between gap-3'>
            {/* 상품명 */}
            <div className='grid justify-items-start'>
              <span className='t-desc text-gray-400'>상품명</span>
              <h3 className='text-secondary line-clamp-2 text-lg font-bold'>{order.name}</h3>
            </div>

            {/* 옵션 및 수량 정보 */}
            <div className='grid grid-cols-2 gap-6'>
              <div className='grid justify-items-start'>
                <span className='t-desc text-gray-400'>옵션</span>
                <p className='t-small line-clamp-2 font-medium text-gray-700'>{order.option}</p>
              </div>
              <div className='grid justify-items-start'>
                <span className='t-desc text-gray-400'>수량</span>
                <p className='t-body font-medium text-gray-700'>{order.quantity}개</p>
              </div>
            </div>

            {/* 주문일 및 결제 금액 정보 */}
            <div className='grid grid-cols-2 gap-6'>
              <div className='grid justify-items-start'>
                <span className='t-desc text-gray-400'>주문일</span>
                <p className='t-body font-medium text-gray-700'>{order.orderDate}</p>
              </div>
              <div className='grid justify-items-start'>
                <span className='t-desc text-gray-400'>총 결제 금액</span>
                <p className='text-secondary t-body font-semibold'>{order.totalPrice}</p>
              </div>
            </div>
          </div>
          {/* 액션 버튼 - md 이상에서만 표시되는 프로그레스 바 */}
          <div className='flex h-full min-w-[12.5rem] flex-col items-end justify-between gap-3'>
            <div className='hidden flex-col gap-3 md:flex'>
              <div className='flex items-center gap-2'>
                <div className='flex items-center gap-2'>
                  <div className={`relative flex h-4 w-4 items-center justify-center rounded-full ${getStepColor(1, currentStep)}`}>
                    <div className='absolute inset-0 rounded-full bg-white/30' />
                    <div className='relative h-2 w-2 rounded-full bg-white/90' />
                  </div>
                  <span className='text-xs text-gray-600'>준비</span>
                  <div className='h-px w-4 border-t border-dashed border-gray-300' />
                  <div className={`relative flex h-4 w-4 items-center justify-center rounded-full ${getStepColor(2, currentStep)}`}>
                    <div className='absolute inset-0 rounded-full bg-white/30' />
                    <div className='relative h-2 w-2 rounded-full bg-white/90' />
                  </div>
                  <span className='text-xs text-gray-600'>배송중</span>
                  <div className='h-px w-4 border-t border-dashed border-gray-300' />
                  <div className={`relative flex h-4 w-4 items-center justify-center rounded-full ${getStepColor(3, currentStep)}`}>
                    <div className='absolute inset-0 rounded-full bg-white/30' />
                    <div className='relative h-2 w-2 rounded-full bg-white/90' />
                  </div>
                  <span className='text-xs text-gray-600'>완료</span>
                </div>
              </div>
            </div>
            <div className='flex w-full flex-col gap-3'>
              <Button variant='default' size='sm' fullWidth>
                교환/환불
              </Button>
              <Button variant='primary' size='sm' fullWidth onClick={() => setReviewOpen(true)}>
                리뷰 작성
              </Button>
              <ReviewModal open={isReviewOpen} onOpenChange={setReviewOpen}>
                <ReviewForm onSuccess={() => setReviewOpen(false)} />
              </ReviewModal>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
