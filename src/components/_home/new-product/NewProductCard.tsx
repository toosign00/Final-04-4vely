import { NewProduct } from '@/types/newproduct.types';
import { getImageUrl } from '@/types/product.types';
import Image from 'next/image';

interface NewProductProps {
  product: NewProduct;
}

export default function NewProductCard({ product }: NewProductProps) {
  const imageUrl = getImageUrl(product.mainImages?.[0]);
  return (
    <div className='relative aspect-square w-full rounded-2xl shadow-2xl'>
      {product.isNew && <div className='bg-secondary absolute top-0 left-0 z-1 rounded-ee-xl rounded-tl-xl px-3 py-1.5 text-xs font-semibold text-white md:text-base lg:text-lg'>NEW</div>}
      <Image src={imageUrl} alt={product.name} width={400} height={400} className='h-full w-full rounded-xl object-cover' priority />
      <div className='absolute bottom-0 left-0 flex h-[30%] w-full flex-col justify-center rounded-b-xl bg-black/40 text-center text-white md:h-[25%]'>
        <p className='text-sm font-semibold sm:text-base md:text-lg'>{product.name}</p>
        <p className='mt-0.5 text-xs sm:text-sm md:text-base'>₩{product.price.toLocaleString()}</p>
      </div>
    </div>
  );
}
