'use client';

import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { ChevronDownIcon, ChevronUpIcon, PlusIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import ReviewForm from './ReviewForm';
import ReviewModal from './ReviewModal';

interface ProductDetail {
  id: number;
  name: string;
  imageUrl: string;
  option: string;
  quantity: number;
  price: number;
}

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
    products?: ProductDetail[];
    hasMultipleProducts?: boolean;
    cost?: {
      products: number;
      shippingFees: number;
      discount: {
        products: number;
        shippingFees: number;
      };
      total: number;
    };
  };
}

export default function OrderHistoryCard({ order }: OrderHistoryCardProps) {
  const [isReviewOpen, setReviewOpen] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [isExchangeDialogOpen, setExchangeDialogOpen] = useState(false);

  const hasMultipleProducts = order.hasMultipleProducts && order.products && order.products.length > 1;

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
          return 'bg-orange-500';
        case 2:
          return 'bg-blue-500';
        case 3:
          return 'bg-green-500';
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

  return (
    <TooltipProvider>
      <div className='group relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border bg-white shadow-md transition-all duration-300'>
        {/* 배송 프로그레스 바 - 모바일 */}
        <div className='absolute top-3 right-3 z-10 md:hidden'>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='flex cursor-pointer items-center gap-1 rounded-lg bg-white/90 px-2 py-1'>
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

        {/* 배송 프로그레스 바 - 데스크톱 */}
        <div className='absolute top-3 right-3 z-10 hidden md:block'>
          <div className='flex cursor-pointer items-center gap-2 rounded-lg bg-white/90 px-3 py-2'>
            <div className='flex items-center gap-2'>
              <div className={`relative flex h-4 w-4 items-center justify-center rounded-full ${getStepColor(1, currentStep)}`}>
                <div className='absolute inset-0 rounded-full bg-white/30' />
                <div className='relative h-2 w-2 rounded-full bg-white/90' />
              </div>
              <span className='text-secondary text-xs'>준비</span>
              <div className='h-px w-4 border-t border-dashed border-gray-300' />
              <div className={`relative flex h-4 w-4 items-center justify-center rounded-full ${getStepColor(2, currentStep)}`}>
                <div className='absolute inset-0 rounded-full bg-white/30' />
                <div className='relative h-2 w-2 rounded-full bg-white/90' />
              </div>
              <span className='text-secondary text-xs'>배송중</span>
              <div className='h-px w-4 border-t border-dashed border-gray-300' />
              <div className={`relative flex h-4 w-4 items-center justify-center rounded-full ${getStepColor(3, currentStep)}`}>
                <div className='absolute inset-0 rounded-full bg-white/30' />
                <div className='relative h-2 w-2 rounded-full bg-white/90' />
              </div>
              <span className='text-secondary text-xs'>완료</span>
            </div>
          </div>
        </div>

        <div className='mx-auto w-full max-w-7xl p-6'>
          <div className='flex flex-col gap-6 lg:flex-row lg:items-end'>
            {/* 좌측 상품 정보 */}
            <div className='flex-1 space-y-6'>
              {/* 단일 상품 표시 */}
              {!hasMultipleProducts && (
                <div className='flex gap-4'>
                  <div className='flex-shrink-0'>
                    <div className='h-20 w-20 overflow-hidden rounded-xl border border-gray-200 bg-gray-100'>
                      <Image src={order.imageUrl} alt={order.name} width={80} height={80} className='h-full w-full object-cover' />
                    </div>
                  </div>
                  <div className='min-w-0 flex-1'>
                    <h4 className='t-h4 text-secondary mb-2 line-clamp-2'>{order.name}</h4>
                    <div className='grid grid-cols-1 gap-3 text-sm sm:grid-cols-2'>
                      <div>
                        <span className='text-muted'>옵션:</span>
                        <span className='text-secondary ml-2'>{order.option}</span>
                      </div>
                      <div>
                        <span className='text-muted'>수량:</span>
                        <span className='text-secondary ml-2 font-medium'>{order.quantity}개</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 다중 상품 표시 */}
              {hasMultipleProducts && (
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <h4 className='t-h4 text-secondary'>주문 상품 ({order.products?.length}개)</h4>
                  </div>

                  {/* 기본 3개 상품 표시 */}
                  <div className='space-y-3'>
                    {order.products?.slice(0, 3).map((product) => (
                      <div key={product.id} className='flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 transition-colors hover:bg-gray-100'>
                        <div className='flex-shrink-0'>
                          <div className='h-14 w-14 overflow-hidden rounded-lg border border-gray-200 bg-white'>
                            <Image src={product.imageUrl} alt={product.name} width={56} height={56} className='h-full w-full object-cover' />
                          </div>
                        </div>
                        <div className='min-w-0 flex-1'>
                          <h5 className='t-body text-secondary mb-1 line-clamp-1 font-medium'>{product.name}</h5>
                          <p className='t-small text-muted mb-2'>
                            옵션: <span className='text-secondary'>{product.option}</span>
                          </p>
                          <div className='flex items-center justify-between'>
                            <span className='t-small text-muted'>{product.quantity}개</span>
                            <span className='text-secondary font-semibold'>{(product.price * product.quantity).toLocaleString()}원</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 3개 초과 상품 토글 버튼 */}
                  {order.products && order.products.length > 3 && !showAllProducts && (
                    <div className='flex justify-center py-3'>
                      <button type='button' onClick={() => setShowAllProducts(true)} className='hover:[&>*]:text-secondary flex cursor-pointer items-center gap-2 transition-colors'>
                        <PlusIcon className='text-muted h-4 w-4' />
                        <span className='t-small text-muted'>{order.products.length - 3}개 상품 더보기</span>
                        <ChevronDownIcon className='text-muted h-4 w-4' />
                      </button>
                    </div>
                  )}

                  {/* 추가 상품 목록 */}
                  {showAllProducts && order.products && order.products.length > 3 && (
                    <div className='space-y-3'>
                      {order.products.slice(3).map((product) => (
                        <div key={product.id} className='flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 transition-colors hover:bg-gray-100'>
                          <div className='flex-shrink-0'>
                            <div className='h-14 w-14 overflow-hidden rounded-lg border border-gray-200 bg-white'>
                              <Image src={product.imageUrl} alt={product.name} width={56} height={56} className='h-full w-full object-cover' />
                            </div>
                          </div>
                          <div className='min-w-0 flex-1'>
                            <h5 className='t-body text-secondary mb-1 line-clamp-1 font-medium'>{product.name}</h5>
                            <p className='t-small text-muted mb-2'>
                              옵션: <span className='text-secondary'>{product.option}</span>
                            </p>
                            <div className='flex items-center justify-between'>
                              <span className='t-small text-muted'>{product.quantity}개</span>
                              <span className='text-secondary font-semibold'>{product.price.toLocaleString()}원</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* 접기 버튼 */}
                      <div className='flex justify-center py-2'>
                        <button type='button' onClick={() => setShowAllProducts(false)} className='t-small text-muted hover:text-secondary flex cursor-pointer items-center gap-2 transition-colors'>
                          접기
                          <ChevronUpIcon className='h-4 w-4' />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 총계 */}
                  <div className='border-t border-gray-200 pt-3'>
                    <div className='space-y-2 text-sm'>
                      <div className='flex items-center justify-between'>
                        <span className='t-small text-muted'>총 주문 수량</span>
                        <span className='t-small text-secondary' style={{ fontWeight: '600' }}>
                          {order.quantity}개
                        </span>
                      </div>
                      {order.cost && (
                        <div className='flex items-center justify-between'>
                          <span className='t-small text-muted'>배송비</span>
                          <span className='t-small text-secondary' style={{ fontWeight: '600' }}>
                            {order.cost.shippingFees === 0 ? '무료' : `${order.cost.shippingFees.toLocaleString()}원`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 주문 정보 */}
              <div className='grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2'>
                <div className='flex items-center justify-between sm:flex-col sm:items-start sm:gap-1'>
                  <span className='t-small text-muted'>주문 일시</span>
                  <span className='text-secondary font-medium'>{order.orderDate}</span>
                </div>
                <div className='flex items-center justify-between sm:flex-col sm:items-start sm:gap-1'>
                  <span className='t-small text-muted'>총 결제 금액</span>
                  <span className='text-secondary text-lg font-bold'>{order.totalPrice}</span>
                </div>
              </div>
            </div>

            {/* 우측 액션 버튼 */}
            <div className='flex-shrink-0 lg:min-w-[200px]'>
              <div className='grid grid-cols-2 gap-3'>
                <Button variant='default' size='sm' onClick={() => setExchangeDialogOpen(true)}>
                  교환/환불
                </Button>
                <Button variant='primary' size='sm' disabled={order.deliveryStatus !== 'completed'} onClick={() => setReviewOpen(true)}>
                  리뷰 작성
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 리뷰 모달 */}
        <ReviewModal open={isReviewOpen} onOpenChange={setReviewOpen}>
          <ReviewForm onSuccess={() => setReviewOpen(false)} />
        </ReviewModal>

        {/* 교환/환불 다이얼로그 */}
        <Dialog open={isExchangeDialogOpen} onOpenChange={setExchangeDialogOpen}>
          <DialogContent className='max-w-md' showCloseButton={false}>
            <DialogHeader>
              <DialogTitle className='t-h4 text-secondary'>교환/환불 안내</DialogTitle>
              <DialogDescription className='text-muted text-sm md:text-base'>
                {order.deliveryStatus === 'shipping' ? '상품이 배송 중입니다. 배송완료 후 교환 및 환불을 진행하시기 바랍니다.' : '아직 교환/환불 기능을 제공하지 않습니다. 양해 부탁드립니다.'}
              </DialogDescription>
            </DialogHeader>
            <div className='mt-4 flex justify-end'>
              <Button variant='default' onClick={() => setExchangeDialogOpen(false)}>
                확인
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
