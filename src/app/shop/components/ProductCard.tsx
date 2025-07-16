// src/app/shop/components/ProductCard.tsx
'use client';

import { Card } from '@/components/ui/Card';
import { Product } from '@/types/product';
import Image from 'next/image';
import BookmarkButton from './BookmarkButton';

interface ProductCardProps {
  product: Product;
  onClick: (id: string) => void;
  isMobile?: boolean;
}

// src/app/shop/components/ProductCard.tsx
export default function ProductCard({ product, onClick, isMobile = false }: ProductCardProps) {
  if (isMobile) {
    return (
      <div className='my-6 gap-x-8 cursor-pointer transition-all'>
        <Card className='mb-2 w-full overflow-hidden transition-shadow hover:shadow-md'>
          <div className='relative'>
            <div className='bg-surface relative w-full overflow-hidden' style={{ aspectRatio: '1/1' }} onClick={() => onClick(product.id)}>
              <Image src={product.image || '/placeholder-plant.jpg'} alt={product.name} fill className='object-cover' sizes='(max-width: 640px) 48vw, (max-width: 1024px) 30vw, 200px' priority={false} />
            </div>

            {product.isNew && <div className='bg-secondary absolute top-0 left-0 z-10 rounded-ee-lg px-2 py-1 t-h4 font-semibold text-white'>NEW</div>}

            <div className='absolute top-1 right-1'>
              <BookmarkButton productId={product.id} initialBookmarked={product.isBookmarked} size={32} variant='default' />
            </div>
          </div>
        </Card>

        <div className='space-y-0.5 text-center' onClick={() => onClick(product.id)}>
          <h3 className='text-secondary truncate t-h2'>{product.name}</h3>
          <p className='text-secondary t-body'>₩ {product.price.toLocaleString()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='my-6 cursor-pointer transition-all' style={{ width: '280px' }}>
      <Card className='mb-4 w-full overflow-hidden transition-shadow hover:shadow-md'>
        <div className='relative'>
          <div
            className='bg-surface relative w-full overflow-hidden'
            style={{ aspectRatio: '1/1' }} // 데스크톱도 정사각형 유지
            onClick={() => onClick(product.id)}
          >
            <Image src={product.image || '/placeholder-plant.jpg'} alt={product.name} fill className='object-cover' sizes='280px' priority={false} />
          </div>

          {product.isNew && <div className='bg-secondary absolute top-0 left-0 z-10 rounded-ee-xl px-3 py-1.5 text-xs font-semibold text-white'>NEW</div>}

          <div className='absolute top-3 right-3'>
            <BookmarkButton productId={product.id} initialBookmarked={product.isBookmarked} size={32} variant='default' />
          </div>
        </div>
      </Card>

      <div className='space-y-1 text-center' onClick={() => onClick(product.id)}>
        <h3 className='text-secondary truncate text-base t-h4'>{product.name}</h3>
        <p className='text-secondary text-sm font-bold'>₩ {product.price.toLocaleString()}</p>
      </div>
    </div>
  );
}
