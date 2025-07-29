import { Button } from '@/components/ui/Button';
import { createReviewAction } from '@/lib/actions/orderReviewServerActions';
import { Star } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { ReviewFormProps } from '../_types';

export default function ReviewForm({ productId, orderId, onSuccess, products, reviewedProductIds = [], selectedProduct, onProductSelect }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMultiProduct = Boolean(products && products.length > 1);
  const currentProductId = selectedProduct?.id || productId;

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      const isActive = starValue <= (hoverRating || rating);
      return (
        <button key={starValue} type='button' className='cursor-pointer transition-colors' onClick={() => setRating(starValue)} onMouseEnter={() => setHoverRating(starValue)} onMouseLeave={() => setHoverRating(0)} aria-label={`${starValue}점`}>
          <Star fill={isActive ? '#facc15' : 'none'} stroke={isActive ? '#facc15' : '#d1d5db'} className='size-5 md:size-6' />
        </button>
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !content.trim() || isSubmitting) return;

    // Multi-product의 경우 선택된 상품이 없으면 처리하지 않음
    if (isMultiProduct && !selectedProduct) {
      toast.error('리뷰를 작성할 상품을 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createReviewAction(currentProductId, orderId, content.trim(), rating);

      if (result.success) {
        toast.success('리뷰가 성공적으로 등록되었습니다.');
        // 리뷰 작성 후 초기화
        setRating(0);
        setContent('');
        // 즉시 부모 컴포넌트에 상품 ID 전달하여 UI 업데이트
        onSuccess(currentProductId);
      } else {
        console.error('리뷰 작성 실패:', result.message);
        toast.error(result.message || '리뷰 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('리뷰 작성 오류:', error);
      toast.error('리뷰 작성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='space-y-4'>
      {/* Multi-product selector */}
      {isMultiProduct && products && (
        <div className='space-y-3'>
          <label className='text-secondary t-body block' style={{ fontWeight: '600' }}>
            리뷰할 상품 선택
          </label>
          <div className='max-h-40 space-y-2 overflow-y-auto'>
            {products.map((product) => {
              const isReviewed = reviewedProductIds.includes(product.id);
              const isSelected = selectedProduct?.id === product.id;
              return (
                <button
                  key={product.id}
                  type='button'
                  disabled={isReviewed}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    isReviewed ? 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-60' : isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => !isReviewed && onProductSelect?.(product)}
                >
                  <div className='h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100'>
                    <Image src={product.image} alt={product.name} width={40} height={40} className='h-full w-full object-cover' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <h4 className='text-secondary t-small line-clamp-1 font-medium'>{product.name}</h4>
                    <p className='text-muted text-xs'>
                      {product.option} · {product.quantity}개
                    </p>
                  </div>
                  {isReviewed ? (
                    <div className='text-gray-500'>
                      <span className='text-xs'>완료</span>
                    </div>
                  ) : isSelected ? (
                    <div className='text-primary'>
                      <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
                        <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                      </svg>
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Review form */}
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <div>
          <label className='text-secondary t-body mb-2 block' style={{ fontWeight: '600' }}>
            별점
          </label>
          <div className='flex gap-1'>{renderStars()}</div>
        </div>
        <div>
          <label htmlFor='review-content' className='text-secondary t-body mb-2 block' style={{ fontWeight: '600' }}>
            리뷰 내용
          </label>
          <textarea
            id='review-content'
            className='focus-visible text-secondary t-small min-h-[4.5rem] w-full rounded-md border border-gray-300 bg-white p-3'
            placeholder='상품에 대한 솔직한 의견을 남겨주세요.'
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <Button type='submit' variant='primary' fullWidth disabled={!rating || !content.trim() || isSubmitting || (isMultiProduct && !selectedProduct)}>
          {isSubmitting ? '등록 중...' : '리뷰 등록'}
        </Button>
      </form>
    </div>
  );
}
