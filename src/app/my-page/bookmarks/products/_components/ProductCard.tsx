/**
 * @fileoverview 개별 북마크 상품 카드를 표시하는 UI 컴포넌트
 * @description 상품 이미지, 이름, 가격, 설명 및 관련 액션 버튼(삭제, 상세보기, 장바구니 담기)을 포함
 */
'use client';

import { Button } from '@/components/ui/Button';
import { deleteBookmark } from '@/lib/actions/mypage/bookmark/bookmarkActions';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import AddToCartDialog from './AddToCartDialog';

/**
 * @interface ProductCardProps
 * @description ProductCard 컴포넌트가 받는 props의 타입을 정의
 * @property {object} order - 상품 정보를 담고 있는 객체
 * @property {number} order.id - 상품의 고유 ID
 * @property {string} order.imageUrl - 상품 이미지 URL
 * @property {string} order.name - 상품명
 * @property {string} order.description - 상품 설명
 * @property {number} order.price - 상품 가격
 * @property {number} bookmarkId - 북마크 ID (삭제용)
 * @property {function} onDetailClick - 상세보기 클릭 핸들러
 * @property {function} onDelete - 삭제 완료 후 콜백
 */
interface ProductCardProps {
  order: {
    id: number;
    imageUrl: string;
    name: string;
    description: string;
    price: number;
  };
  bookmarkId: number;
  onDetailClick?: (id: number) => void;
  onDelete?: () => void;
  priority?: boolean;
}

/**
 * @function ProductCard
 * @description 개별 북마크 상품의 상세 정보를 시각적으로 표시하는 카드 컴포넌트
 * @param {ProductCardProps} props - 컴포넌트 props
 * @returns {JSX.Element} 렌더링된 상품 카드 컴포넌트를 반환
 */
export default function ProductCard({ order, bookmarkId, onDetailClick, onDelete, priority = false }: ProductCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCartDialogOpen, setIsCartDialogOpen] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const result = await deleteBookmark(bookmarkId);
      if (result.success) {
        onDelete?.();
      } else {
        alert(result.message || '북마크 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('북마크 삭제 오류:', error);
      alert('북마크 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className='group relative mx-auto w-full max-w-6xl rounded-2xl bg-white p-3 shadow-sm transition-shadow duration-300 hover:shadow-lg'>
      {/* 모바일 화면에서 표시되는 삭제 버튼 */}
      <div className='absolute top-3 right-3 z-10 md:hidden'>
        <Button variant='destructive' size='sm' onClick={handleDelete} disabled={isDeleting}>
          <Trash2 className='size-4' />
        </Button>
      </div>

      <div className='grid grid-cols-1 items-center gap-4 md:grid-cols-[auto_1fr_auto] md:gap-6'>
        <div className='grid place-items-center'>
          <div className='aspect-square w-[12.5rem]'>
            <Image
              src={order.imageUrl}
              alt={`${order.name} 상품 이미지`}
              width={200}
              height={200}
              className='h-full w-full rounded-xl border bg-gray-100 object-cover'
              sizes='(max-width: 640px) 110px, 170px'
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
            />
          </div>
        </div>

        {/* 상품 정보 섹션 */}
        <div className='flex h-full flex-col justify-between gap-2'>
          {/* 상품명 */}
          <div className='grid justify-items-start'>
            <span className='t-desc text-secondary/70'>상품명</span>
            <h3 className='text-secondary line-clamp-2 text-lg font-bold' title={order.name}>
              {order.name}
            </h3>
          </div>

          <div className='grid justify-items-start'>
            <span className='t-desc text-secondary/70'>가격</span>
            <p className='t-small text-gray-secondary line-clamp-2 font-medium'>{order.price.toLocaleString()}원</p>
          </div>

          {/* 상품 설명 */}
          <div className='grid justify-items-start'>
            <span className='t-desc text-secondary/70'>상품 설명</span>
            <p className='t-small text-gray-secondary line-clamp-2 font-medium' title={order.description}>
              {order.description}
            </p>
          </div>
        </div>

        {/* 액션 버튼 섹션: 상세보기, 장바구니 담기, 삭제 등 */}
        <div className='flex h-full min-w-[12.5rem] flex-col items-end justify-between gap-3'>
          {/* 데스크탑 화면에서 표시되는 삭제 버튼 */}
          <div className='hidden flex-col gap-3 md:flex'>
            <Button variant='destructive' size='sm' onClick={handleDelete} disabled={isDeleting}>
              <Trash2 className='size-4' />
            </Button>
          </div>

          {/* 모든 화면 크기에서 표시되는 버튼 그룹 */}
          <div className='flex w-full flex-row gap-3'>
            <Button variant='default' size='sm' fullWidth className='flex-1' onClick={() => onDetailClick?.(order.id)}>
              상세보기
            </Button>
            <Button variant='primary' size='sm' fullWidth className='flex-1' onClick={() => setIsCartDialogOpen(true)}>
              장바구니 담기
            </Button>
          </div>
        </div>
      </div>

      <AddToCartDialog
        productId={order.id}
        isOpen={isCartDialogOpen}
        onClose={() => setIsCartDialogOpen(false)}
        onSuccess={() => {
          toast.success('장바구니에 추가되었습니다.');
        }}
      />
    </div>
  );
}
