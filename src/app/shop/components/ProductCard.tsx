// src/components/ui/ProductCard.tsx
'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Product } from '@/types/product';
import { Bookmark } from 'lucide-react';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
  onBookmarkToggle: (id: string) => void;
  onClick: (id: string) => void;
}

export default function ProductCard({ product, onBookmarkToggle, onClick }: ProductCardProps) {
  return (
    <Card className='cursor-pointer overflow-hidden transition-shadow hover:shadow-md'>
      <div className='relative'>
        {/* 상품 이미지 */}
        <div className='bg-surface relative aspect-square w-full overflow-hidden' onClick={() => onClick(product.id)}>
          <Image src={product.image || '/placeholder-plant.jpg'} alt={product.name} fill className='object-cover' sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' priority={false} />
        </div>

        {/* NEW 태그 - 커스텀 디자인 유지 */}
        {product.isNew && <div className='bg-secondary absolute top-0 left-0 z-10 rounded-ee-xl px-4 py-2 text-xs font-semibold text-white'>NEW</div>}

        {/* 북마크 버튼 - Shadcn Button 사용 */}
        <Button
          variant='ghost'
          size='sm'
          className='absolute top-3 right-3 z-10 transition-transform hover:scale-110 hover:bg-transparent'
          onClick={(e) => {
            e.stopPropagation();
            onBookmarkToggle(product.id);
          }}
        >
          <Bookmark size={70} className={product.isBookmarked ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400 hover:text-gray-600'} />
        </Button>
      </div>

      {/* 상품 정보 - CardContent 사용 */}
      <CardContent className='p-4'>
        <h3 className='t-body text-secondary mb-1 truncate font-medium'>{product.name}</h3>
        <p className='t-desc text-surface0 mb-2 truncate'>{product.category}</p>
        <p className='t-body text-secondary font-bold'>₩ {product.price.toLocaleString()}</p>
      </CardContent>
    </Card>
  );
}
