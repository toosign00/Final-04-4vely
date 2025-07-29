'use client';

import { useOrderDeliveryStatus } from '@/app/my-page/order-history/_hooks/useOrderDeliveryStatus';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { getOrderReviewStatusAction } from '@/lib/actions/orderReviewServerActions';
import { getImageUrlClient } from '@/lib/utils/auth.client';
import { ChevronDownIcon, ChevronUpIcon, PlusIcon } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { OrderHistoryCardProps, ProductDetail } from '../_types';
import ReviewForm from './ReviewForm';
import ReviewModal from './ReviewModal';

export default function OrderHistoryCard({ order }: OrderHistoryCardProps) {
  const [isReviewOpen, setReviewOpen] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [isExchangeDialogOpen, setExchangeDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [reviewedProductIds, setReviewedProductIds] = useState<number[]>([]);
  const [isLoadingReviewStatus, setIsLoadingReviewStatus] = useState(false);

  const hasMultipleProducts = order.hasMultipleProducts && order.products && order.products.length > 1;

  // 서버에서 리뷰 상태 확인
  useEffect(() => {
    const fetchReviewStatus = async () => {
      if (order.deliveryStatus === 'completed') {
        setIsLoadingReviewStatus(true);
        try {
          const result = await getOrderReviewStatusAction(order.id);
          if (result.success) {
            setReviewedProductIds(result.reviewedProductIds);
          }
        } finally {
          setIsLoadingReviewStatus(false);
        }
      }
    };

    fetchReviewStatus();
  }, [order.id, order.deliveryStatus]);

  // 리뷰 작성 가능한 상품이 있는지 확인
  const hasReviewableProducts = order.products?.some((product) => !reviewedProductIds.includes(product.id)) ?? false;

  const { currentStep, statusText, getStepColor } = useOrderDeliveryStatus(order.deliveryStatus);

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
              <p>{statusText}</p>
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
                      <Image src={getImageUrlClient(order.image)} alt={order.name} width={80} height={80} className='h-full w-full object-cover' />
                    </div>
                  </div>
                  <div className='min-w-0 flex-1'>
                    <h4 className='t-h4 text-secondary mb-2 line-clamp-2'>{order.name}</h4>
                    <div className='grid grid-cols-1 gap-3 text-sm sm:grid-cols-2'>
                      <div>
                        <span className='text-muted text-sm sm:text-base'>옵션:</span>
                        <span className='text-secondary ml-2 text-sm sm:text-base'>{order.option}</span>
                      </div>
                      <div>
                        <span className='text-muted text-sm sm:text-base'>수량:</span>
                        <span className='text-secondary ml-2 text-sm sm:text-base'>{order.quantity}개</span>
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
                            <Image src={getImageUrlClient(product.imageUrl)} alt={product.name} width={56} height={56} className='h-full w-full object-cover' />
                          </div>
                        </div>
                        <div className='min-w-0 flex-1'>
                          <h5 className='t-body text-secondary mb-1 line-clamp-1 font-medium'>{product.name}</h5>
                          <p className='text-muted mb-2 text-sm sm:text-base'>
                            옵션: <span className='text-secondary mb-2 text-sm sm:text-base'>{product.option}</span>
                          </p>
                          <div className='flex items-center justify-between'>
                            <span className='t-small text-muted'>{product.quantity}개</span>
                            <span className='text-secondary text-sm font-semibold sm:text-base'>{(product.price * product.quantity).toLocaleString()}원</span>
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
                              <Image src={getImageUrlClient(product.imageUrl)} alt={product.name} width={56} height={56} className='h-full w-full object-cover' />
                            </div>
                          </div>
                          <div className='min-w-0 flex-1'>
                            <h5 className='t-body text-secondary mb-1 line-clamp-1 font-medium'>{product.name}</h5>
                            <p className='text-muted mb-2 text-sm sm:text-base'>
                              옵션: <span className='text-secondary mb-2 text-sm sm:text-base'>{product.option}</span>
                            </p>
                            <div className='flex items-center justify-between'>
                              <span className='t-small text-muted'>{product.quantity}개</span>
                              <span className='text-secondary text-sm font-semibold sm:text-base'>{product.price.toLocaleString()}원</span>
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
                        <span className='text-muted text-sm sm:text-base'>총 주문 수량</span>
                        <span className='text-secondary text-sm font-semibold sm:text-base'>{order.quantity}개</span>
                      </div>
                      {order.cost && (
                        <div className='flex items-center justify-between'>
                          <span className='text-muted text-sm sm:text-base'>배송비</span>
                          <span className='text-secondary text-sm font-semibold sm:text-base'>{order.cost.shippingFees === 0 ? '무료' : `${order.cost.shippingFees.toLocaleString()}원`}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 주문 정보 */}
              <div className='grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2'>
                <div className='flex items-center justify-between sm:flex-col sm:items-start sm:gap-1'>
                  <span className='text-muted text-sm sm:text-base'>주문 일시</span>
                  <span className='text-secondary text-sm font-semibold sm:text-base'>{order.orderDate}</span>
                </div>
                <div className='flex items-center justify-between sm:flex-col sm:items-start sm:gap-1'>
                  <span className='text-muted text-sm sm:text-base'>총 결제 금액</span>
                  <span className='text-secondary text-sm font-semibold sm:text-base'>{order.totalPrice}</span>
                </div>
              </div>
            </div>

            {/* 우측 액션 버튼 */}
            <div className='flex-shrink-0 lg:min-w-[200px]'>
              <div className='grid grid-cols-2 gap-3'>
                <Button variant='default' size='sm' onClick={() => setExchangeDialogOpen(true)}>
                  교환/환불
                </Button>
                <Button
                  variant='primary'
                  size='sm'
                  disabled={order.deliveryStatus !== 'completed' || !hasReviewableProducts || isLoadingReviewStatus}
                  onClick={() => {
                    // 단일 상품인 경우에만 자동 선택 (리뷰 가능한 상품만)
                    if (!hasMultipleProducts) {
                      const product = order.products?.[0];
                      if (product && !reviewedProductIds.includes(product.id)) {
                        setSelectedProduct(product);
                      } else {
                        const productToReview = {
                          id: 0,
                          name: order.name,
                          imageUrl: order.image,
                          option: order.option,
                          quantity: order.quantity,
                          price: 0,
                        };
                        if (!reviewedProductIds.includes(productToReview.id)) {
                          setSelectedProduct(productToReview);
                        }
                      }
                    } else {
                      // 다중 상품인 경우 선택하지 않고 모달만 열기
                      setSelectedProduct(null);
                    }
                    setReviewOpen(true);
                  }}
                >
                  {isLoadingReviewStatus ? '확인 중...' : hasReviewableProducts ? '리뷰 작성' : '리뷰 완료'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 리뷰 모달 */}
        <ReviewModal open={isReviewOpen} onOpenChange={setReviewOpen}>
          <div className='space-y-4'>
            {/* 단일 상품 정보 */}
            {!hasMultipleProducts && selectedProduct && (
              <div className='flex items-center gap-3 border-b border-gray-200 pb-4'>
                <div className='h-12 w-12 overflow-hidden rounded-lg border border-gray-200 bg-gray-100'>
                  <Image src={getImageUrlClient(selectedProduct.imageUrl)} alt={selectedProduct.name} width={48} height={48} className='h-full w-full object-cover' />
                </div>
                <div className='flex-1'>
                  <h4 className='text-secondary t-body line-clamp-1 font-medium'>{selectedProduct.name}</h4>
                  <p className='text-muted t-small'>{selectedProduct.option}</p>
                </div>
              </div>
            )}

            {/* 다중 상품 - 통합된 리뷰 폼 */}
            {hasMultipleProducts && order.products && (
              <div className='space-y-4'>
                <h3 className='text-secondary t-h4 font-medium'>상품 리뷰 작성</h3>

                <ReviewForm
                  productId={selectedProduct?.id || 0}
                  orderId={order.id}
                  products={order.products}
                  reviewedProductIds={reviewedProductIds}
                  selectedProduct={selectedProduct}
                  onProductSelect={setSelectedProduct}
                  onSuccess={async (productId) => {
                    // 즉시 UI 업데이트
                    setReviewedProductIds((prev) => [...prev, productId]);
                    setReviewOpen(false);
                    setSelectedProduct(null);

                    // 백그라운드에서 서버 상태 동기화
                    try {
                      const result = await getOrderReviewStatusAction(order.id);
                      if (result.success) {
                        setReviewedProductIds(result.reviewedProductIds);
                      }
                    } catch (error) {
                      toast.error('리뷰 작성 후 서버 상태 동기화에 실패했습니다.');
                      console.error('서버 상태 동기화 오류:', error);
                    }
                  }}
                />
              </div>
            )}

            {/* 단일 상품 리뷰 폼 */}
            {!hasMultipleProducts && selectedProduct && (
              <ReviewForm
                productId={selectedProduct.id}
                orderId={order.id}
                onSuccess={async (productId) => {
                  // 즉시 UI 업데이트 (낙관적 업데이트)
                  setReviewedProductIds((prev) => [...prev, productId]);
                  setReviewOpen(false);
                  setSelectedProduct(null);

                  // 백그라운드에서 서버 상태 동기화
                  try {
                    const result = await getOrderReviewStatusAction(order.id);
                    if (result.success) {
                      setReviewedProductIds(result.reviewedProductIds);
                    }
                  } catch (error) {
                    console.error('서버 상태 동기화 오류:', error);
                  }
                }}
              />
            )}
          </div>
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
