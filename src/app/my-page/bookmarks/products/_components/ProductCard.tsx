import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';

interface ProductCardProps {
  order: {
    id: number;
    imageUrl: string;
    name: string;
    description: string;
  };
}

export default function ProductCard({ order }: ProductCardProps) {
  return (
    <div className='group relative mx-auto w-full max-w-6xl cursor-pointer rounded-2xl bg-white p-3 shadow-sm transition-shadow duration-300 hover:shadow-lg'>
      {/* 삭제버튼 */}
      <div className='absolute top-3 right-3 z-10 md:hidden'>
        <Button variant='destructive' size='sm'>
          <Trash2 className='size-4' />
        </Button>
      </div>

      <div className='grid grid-cols-1 items-center gap-4 md:grid-cols-[auto_1fr_auto] md:gap-6'>
        {/* 상품 이미지 */}
        <div className='grid place-items-center'>
          <div className='aspect-square w-[10.625rem]'>
            <Image src={order.imageUrl} alt='product-image' width={170} height={170} className='h-full w-full rounded-xl border bg-gray-100 object-cover' sizes='(max-width: 640px) 110px, 170px' priority />
          </div>
        </div>
        {/* 상품 정보 */}
        <div className='flex h-full flex-col justify-start gap-3'>
          {/* 상품명 */}
          <div className='grid justify-items-start'>
            <span className='t-desc text-gray-400'>상품명</span>
            <h3 className='text-secondary line-clamp-2 text-lg font-bold'>{order.name}</h3>
          </div>

          {/* 상품 설명 */}
          <div className='grid justify-items-start'>
            <span className='t-desc text-gray-400'>상품 설명</span>
            <p className='t-small line-clamp-2 font-medium text-gray-700'>{order.description}</p>
          </div>
        </div>
        {/* 액션 버튼 - md 이상에서만 표시 */}
        <div className='flex h-full min-w-[12.5rem] flex-col items-end justify-between gap-3'>
          <div className='hidden flex-col gap-3 md:flex'>
            <Button variant='destructive' size='sm'>
              <Trash2 className='size-4' />
            </Button>
          </div>
          <div className='flex w-full flex-col gap-3'>
            <Button variant='default' size='sm' fullWidth>
              상세보기
            </Button>
            <Button variant='primary' size='sm' fullWidth>
              장바구니 담기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
