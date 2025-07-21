import { Button } from '@/components/ui/Button';
import { Star } from 'lucide-react';
import React, { useState } from 'react';

interface ReviewFormProps {
  onSuccess: () => void;
}

export default function ReviewForm({ onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !content.trim()) return;
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
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
          className='focus-visible text-secondary t-small min-h-[6.25rem] w-full rounded-md border border-gray-300 bg-white p-3'
          placeholder='상품에 대한 솔직한 의견을 남겨주세요.'
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      <Button type='submit' variant='primary' fullWidth disabled={!rating || !content.trim()}>
        리뷰 등록
      </Button>
    </form>
  );
}
