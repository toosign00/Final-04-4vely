// src/app/shop/products/[id]/_components/ReviewSection.tsx

import { getCurrentUserAction } from '@/lib/actions/shop/reviewServerActions';
import { getProductReplies } from '@/lib/functions/shop/reviewServerFunctions';
import { Star } from 'lucide-react';
import ReviewItem from './ReviewItem';

interface ReviewSectionProps {
  productId: number;
}

export default async function ReviewSection({ productId }: ReviewSectionProps) {
  // 서버에서 리뷰 목록과 현재 사용자 정보 가져오기
  const [repliesResponse, currentUser] = await Promise.all([getProductReplies(productId), getCurrentUserAction()]);

  const reviews = repliesResponse.ok === 1 ? repliesResponse.item : [];

  // 평균 평점 계산
  const averageRating = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  // 평점별 개수 계산
  const ratingCounts = reviews.reduce(
    (acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>,
  );

  return (
    <section className='pb-8 sm:pb-10 md:pb-12'>
      <h2 className='text-secondary mb-6 text-xl font-semibold sm:mb-8 md:text-2xl lg:text-4xl lg:font-bold'>Review</h2>

      {reviews.length === 0 ? (
        <div className='py-12 text-center'>
          <p className='text-gray-500'>아직 리뷰가 없습니다.</p>
          <p className='mt-2 text-sm text-gray-400'>이 상품을 구매하신 분들의 첫 리뷰를 기다리고 있어요!</p>
        </div>
      ) : (
        <div className='space-y-8'>
          {/* 평점 요약 */}
          <div className='rounded-lg bg-gray-50 p-6'>
            <div className='flex flex-col items-center gap-4 sm:flex-row sm:gap-8'>
              {/* 평균 평점 */}
              <div className='text-center'>
                <p className='text-3xl font-bold text-gray-900'>{averageRating.toFixed(1)}</p>
                <div className='mt-1 flex gap-0.5'>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={20} className={i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                  ))}
                </div>
                <p className='mt-1 text-sm text-gray-500'>{reviews.length}개의 리뷰</p>
              </div>

              {/* 평점 분포 */}
              <div className='flex-1 space-y-2'>
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = ratingCounts[rating] || 0;
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

                  return (
                    <div key={rating} className='flex items-center gap-3'>
                      <div className='flex items-center gap-1'>
                        <span className='text-sm text-gray-600'>{rating}</span>
                        <Star size={14} className='fill-yellow-400 text-yellow-400' />
                      </div>
                      <div className='relative h-2 flex-1 overflow-hidden rounded-full bg-gray-200'>
                        <div className='absolute top-0 left-0 h-full bg-yellow-400 transition-all duration-300' style={{ width: `${percentage}%` }} />
                      </div>
                      <span className='min-w-[40px] text-right text-sm text-gray-600'>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 리뷰 목록 */}
          <div className='divide-y divide-gray-200'>
            {reviews.map((review) => (
              <ReviewItem key={review._id} review={review} isAuthor={currentUser.id === review.user._id} productId={productId} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
