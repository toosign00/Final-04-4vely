// src/app/shop/products/[id]/_components/ReviewItem.tsx

'use client';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import { deleteReplyAction, updateReplyAction } from '@/lib/actions/shop/reviewServerActions';
import { getImageUrl } from '@/lib/utils/product.utils';
import { ProductReply } from '@/types/review.types';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
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

  // 접근성을 위한 refs
  const reviewAnnouncementRef = useRef<HTMLDivElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

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
    return Array.from({ length: 5 }, (_, i) => <Star key={i} size={16} className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} aria-hidden='true' />);
  };

  // 키보드 네비게이션을 위한 별점 선택 핸들러
  const handleStarKeyDown = (e: React.KeyboardEvent, starIndex: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setEditRating(starIndex + 1);

      // 별점 변경 알림
      if (reviewAnnouncementRef.current) {
        reviewAnnouncementRef.current.textContent = `별점이 ${starIndex + 1}점으로 변경되었습니다.`;
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const direction = e.key === 'ArrowLeft' ? -1 : 1;
      const newRating = Math.max(1, Math.min(5, editRating + direction));
      setEditRating(newRating);

      // 별점 변경 알림
      if (reviewAnnouncementRef.current) {
        reviewAnnouncementRef.current.textContent = `별점이 ${newRating}점으로 변경되었습니다.`;
      }
    }
  };

  // 수정 핸들러
  const handleUpdate = async () => {
    if (!editContent.trim()) {
      toast.error('리뷰 내용을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    // 수정 진행 상황 알림
    if (reviewAnnouncementRef.current) {
      reviewAnnouncementRef.current.textContent = '리뷰를 수정하고 있습니다.';
    }

    try {
      const result = await updateReplyAction(review._id, {
        content: editContent,
        rating: editRating,
      });

      if (result.success) {
        toast.success(result.message);
        setIsEditing(false);

        // 수정 완료 알림
        if (reviewAnnouncementRef.current) {
          reviewAnnouncementRef.current.textContent = '리뷰가 성공적으로 수정되었습니다.';
        }
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

    // 삭제 진행 상황 알림
    if (reviewAnnouncementRef.current) {
      reviewAnnouncementRef.current.textContent = '리뷰를 삭제하고 있습니다.';
    }

    try {
      const result = await deleteReplyAction(review._id, productId);

      if (result.success) {
        toast.success(result.message);

        // 삭제 완료 알림
        if (reviewAnnouncementRef.current) {
          reviewAnnouncementRef.current.textContent = '리뷰가 삭제되었습니다.';
        }
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

    // 수정 취소 알림
    if (reviewAnnouncementRef.current) {
      reviewAnnouncementRef.current.textContent = '리뷰 수정이 취소되었습니다.';
    }
  };

  // 수정 모드 진입 핸들러
  const handleEditStart = () => {
    setIsEditing(true);

    // 수정 모드 진입 알림
    if (reviewAnnouncementRef.current) {
      reviewAnnouncementRef.current.textContent = '리뷰 수정 모드로 전환되었습니다.';
    }

    // 포커스를 textarea로 이동
    setTimeout(() => {
      editTextareaRef.current?.focus();
    }, 100);
  };

  return (
    <>
      {/* 스크린 리더용 실시간 알림 영역 */}
      <div aria-live='polite' aria-atomic='true' className='sr-only'>
        <div ref={reviewAnnouncementRef} />
      </div>

      {/* 리뷰 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className='px-12 sm:max-w-md' role='alertdialog' aria-labelledby='delete-review-title' aria-describedby='delete-review-description'>
          <AlertDialogHeader>
            <AlertDialogTitle id='delete-review-title' className='t-h3 text-center'>
              리뷰를 삭제하시겠습니까?
            </AlertDialogTitle>
            <AlertDialogDescription id='delete-review-description' className='text-center text-base'>
              삭제된 리뷰는 복구할 수 없습니다.
            </AlertDialogDescription>
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

      <article className='border-b border-gray-200 py-6 last:border-b-0' role='article' aria-labelledby={`review-${review._id}-author`} aria-describedby={`review-${review._id}-content`}>
        {/* 리뷰 헤더 */}
        <header className='mb-3 flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            {/* 사용자 프로필 이미지 */}
            <div className='relative h-10 w-10 overflow-hidden rounded-full bg-gray-200' role='img' aria-label={`${review.user.name}의 프로필 이미지`}>
              {review.user.image ? (
                <Image src={getImageUrl(review.user.image)} alt={`${review.user.name}의 프로필 이미지`} fill className='object-cover' />
              ) : (
                <div className='flex h-full w-full items-center justify-center bg-gray-300 text-sm font-medium text-white' aria-label={`${review.user.name}의 기본 프로필 이미지`}>
                  {review.user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <p id={`review-${review._id}-author`} className='font-medium text-gray-900'>
                {review.user.name}
              </p>
              <div className='flex items-center gap-2'>
                {isEditing ? (
                  <div className='flex gap-1' role='group' aria-labelledby={`edit-rating-${review._id}-label`}>
                    <span id={`edit-rating-${review._id}-label`} className='sr-only'>
                      별점 수정, 현재 {editRating}점. 방향키로 조절하거나 별을 클릭하세요.
                    </span>
                    {Array.from({ length: 5 }, (_, i) => (
                      <button
                        key={i}
                        type='button'
                        onClick={() => setEditRating(i + 1)}
                        onKeyDown={(e) => handleStarKeyDown(e, i)}
                        className='focus-visible:ring-secondary rounded transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1'
                        aria-label={`${i + 1}점 선택${i + 1 === editRating ? ', 현재 선택됨' : ''}`}
                        aria-pressed={i + 1 === editRating}
                        tabIndex={i + 1 === editRating ? 0 : -1}
                      >
                        <Star size={16} className={i < editRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} aria-hidden='true' />
                      </button>
                    ))}
                    <span className='sr-only'>현재 선택된 별점: {editRating}점</span>
                  </div>
                ) : (
                  <div className='flex gap-0.5' role='img' aria-label={`평점 ${review.rating}점 (5점 만점)`}>
                    {renderStars(review.rating)}
                    <span className='sr-only'>5점 만점에 {review.rating}점</span>
                  </div>
                )}
                <time className='text-sm text-gray-500' dateTime={review.createdAt} aria-label={`작성일: ${formatDate(review.createdAt)}`}>
                  {formatDate(review.createdAt)}
                </time>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          {isAuthor && !isEditing && (
            <div className='flex gap-2' role='group' aria-label='리뷰 관리'>
              <Button className='text-xs md:text-sm lg:text-base' variant='ghost' size='icon' onClick={handleEditStart} disabled={isLoading} aria-label='리뷰 수정' aria-describedby={`review-${review._id}-edit-desc`}>
                수정
              </Button>
              <span id={`review-${review._id}-edit-desc`} className='sr-only'>
                리뷰 내용과 별점을 수정할 수 있습니다
              </span>

              <Button className='text-error text-xs md:text-sm lg:text-base' variant='ghost' size='icon' onClick={handleDelete} disabled={isLoading} aria-label='리뷰 삭제' aria-describedby={`review-${review._id}-delete-desc`}>
                삭제
              </Button>
              <span id={`review-${review._id}-delete-desc`} className='sr-only'>
                이 리뷰를 영구적으로 삭제합니다
              </span>
            </div>
          )}
        </header>

        {/* 리뷰 내용 */}
        <div id={`review-${review._id}-content`}>
          {isEditing ? (
            <form
              className='space-y-4'
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdate();
              }}
              role='form'
              aria-labelledby={`edit-form-${review._id}-title`}
            >
              <h3 id={`edit-form-${review._id}-title`} className='sr-only'>
                리뷰 수정 폼
              </h3>
              <div>
                <label htmlFor={`edit-textarea-${review._id}`} className='sr-only'>
                  리뷰 내용 수정
                </label>
                <textarea
                  id={`edit-textarea-${review._id}`}
                  ref={editTextareaRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className='focus:border-primary focus:ring-secondary w-full resize-none rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-offset-1 focus:outline-none'
                  rows={4}
                  placeholder='리뷰 내용을 입력하세요.'
                  aria-describedby={`edit-textarea-${review._id}-desc`}
                  required
                />
                <span id={`edit-textarea-${review._id}-desc`} className='sr-only'>
                  리뷰 내용을 수정하세요. 최소 1자 이상 입력해야 합니다.
                </span>
              </div>
              <div className='flex justify-end gap-2' role='group' aria-label='수정 작업'>
                <Button type='button' variant='outline' size='sm' onClick={handleCancel} disabled={isLoading} aria-label='수정 취소'>
                  취소
                </Button>
                <Button type='submit' variant='primary' size='sm' disabled={isLoading || !editContent.trim()} aria-label={isLoading ? '리뷰 수정 중' : '리뷰 수정 완료'} aria-describedby={`update-button-${review._id}-desc`}>
                  {isLoading ? '수정 중...' : '수정'}
                </Button>
                <span id={`update-button-${review._id}-desc`} className='sr-only'>
                  {isLoading ? '리뷰를 수정하는 중입니다' : '수정된 내용을 저장합니다'}
                </span>
              </div>
            </form>
          ) : (
            <div>
              <p className='whitespace-pre-wrap text-gray-700' role='text'>
                {review.content
                  .split('.')
                  .filter((s) => s.trim().length > 0)
                  .map((sentence, idx) => (
                    <span key={idx}>
                      {sentence.trim()}.
                      <br />
                    </span>
                  ))}
              </p>
              {review.extra?.potColor && (
                <p className='mt-2 text-sm text-gray-500' role='note'>
                  선택한 색상: <span className='font-medium'>{review.extra.potColor}</span>
                </p>
              )}
              <div className='sr-only'>
                {review.user.name}님이 {formatDate(review.createdAt)}에 작성한 {review.rating}점 리뷰입니다.
                {review.extra?.potColor && ` 선택한 화분 색상: ${review.extra.potColor}`}
              </div>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
