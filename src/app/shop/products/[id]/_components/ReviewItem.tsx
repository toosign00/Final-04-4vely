// src/app/shop/products/[id]/_components/ReviewItem.tsx

'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import { deleteReplyAction, updateReplyAction } from '@/lib/actions/shop/reviewServerActions';
import { getImageUrl } from '@/types/product.types';
import { ProductReply } from '@/types/review.types';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';

interface ReviewItemProps {
  review: ProductReply;
  isAuthor: boolean;
  productId: number;
}

export default function ReviewItem({ review, isAuthor, productId }: ReviewItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(review.content);
  const [editRating, setEditRating] = useState(review.rating);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 평점 표시
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => <Star key={i} size={16} className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />);
  };

  // 수정 핸들러
  const handleUpdate = async () => {
    if (!editContent.trim()) {
      toast.error('리뷰 내용을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateReplyAction(review._id, {
        content: editContent,
        rating: editRating,
      });

      if (result.success) {
        toast.success(result.message);
        setIsEditing(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`리뷰 작성에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    setShowDeleteAlert(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteAlert(false);
    setIsLoading(true);
    try {
      const result = await deleteReplyAction(review._id, productId);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`리뷰 삭제에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 수정 취소
  const handleCancel = () => {
    setEditContent(review.content);
    setEditRating(review.rating);
    setIsEditing(false);
  };

  return (
    <>
      {/* 리뷰 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className='px-12 sm:max-w-md'>
          <AlertDialogHeader>
            <AlertDialogTitle className='t-h3 text-center'>리뷰를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription className='text-center text-base'>삭제된 리뷰는 복구할 수 없습니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='mt-6 gap-3 sm:justify-between'>
            <AlertDialogCancel onClick={() => setShowDeleteAlert(false)} className='text-secondary hover:bg-secondary border-[0.5px] border-gray-300 bg-white px-7 shadow-sm hover:text-white'>
              아니오
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className='bg-primary text-secondary active:bg-primary px-10 shadow-sm hover:bg-[#AEBB2E]'>
              예
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className='border-b border-gray-200 py-6 last:border-b-0'>
        {/* 리뷰 헤더 */}
        <div className='mb-3 flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            {/* 사용자 프로필 이미지 */}
            <div className='relative h-10 w-10 overflow-hidden rounded-full bg-gray-200'>
              {review.user.image ? (
                <Image src={getImageUrl(review.user.image)} alt={review.user.name} fill className='object-cover' />
              ) : (
                <div className='flex h-full w-full items-center justify-center bg-gray-300 text-sm font-medium text-white'>{review.user.name.charAt(0).toUpperCase()}</div>
              )}
            </div>

            <div>
              <p className='font-medium text-gray-900'>{review.user.name}</p>
              <div className='flex items-center gap-2'>
                {isEditing ? (
                  <div className='flex gap-1'>
                    {Array.from({ length: 5 }, (_, i) => (
                      <button key={i} type='button' onClick={() => setEditRating(i + 1)} className='transition-transform hover:scale-110'>
                        <Star size={16} className={i < editRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className='flex gap-0.5'>{renderStars(review.rating)}</div>
                )}
                <span className='text-sm text-gray-500'>{formatDate(review.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          {isAuthor && !isEditing && (
            <div className='flex gap-2'>
              <Button className='text-xs md:text-sm lg:text-base' variant='ghost' size='icon' onClick={() => setIsEditing(true)} disabled={isLoading}>
                수정
              </Button>
              <Button className='text-error text-xs md:text-sm lg:text-base' variant='ghost' size='icon' onClick={handleDelete} disabled={isLoading}>
                삭제
              </Button>
            </div>
          )}
        </div>

        {/* 리뷰 내용 */}
        {isEditing ? (
          <div className='space-y-4'>
            <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className='focus:border-primary w-full resize-none rounded-lg border border-gray-300 p-3 focus:outline-none' rows={4} placeholder='리뷰 내용을 입력하세요.' />
            <div className='flex justify-end gap-2'>
              <Button variant='outline' size='sm' onClick={handleCancel} disabled={isLoading}>
                취소
              </Button>
              <Button variant='primary' size='sm' onClick={handleUpdate} disabled={isLoading}>
                {isLoading ? '수정 중...' : '수정'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className='whitespace-pre-wrap text-gray-700'>{review.content}</p>
            {review.extra?.potColor && (
              <p className='mt-2 text-sm text-gray-500'>
                선택한 색상: <span className='font-medium'>{review.extra.potColor}</span>
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}
