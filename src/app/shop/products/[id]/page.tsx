// src/app/shop/products/[id]/page.tsx (서버 컴포넌트)
import { getProductDetailWithRecommendations, getServerProductById } from '@/lib/functions/shop/productServerFunctions';
import { getImageUrl } from '@/lib/utils/product.utils';
import { notFound } from 'next/navigation';
import ProductDetailClient from './_components/ProductDetailClient';
import ReviewSection from './_components/ReviewSection';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

// 메타데이터 생성 (SEO 최적화)
export async function generateMetadata({ params }: ProductDetailPageProps) {
  try {
    const { id } = await params;
    const productResponse = await getServerProductById(parseInt(id));

    if (!productResponse.ok || !productResponse.item) {
      return {
        title: '상품 상세 | GreenMate',
        description: '상품 상세 정보',
      };
    }

    const productData = productResponse.item;

    return {
      title: `${productData.name} | GreenMate`,
      description: productData.content ? productData.content.replace(/<[^>]*>/g, '').substring(0, 160) : `${productData.name} 상품 상세 정보`,
      openGraph: {
        title: productData.name,
        description: productData.content?.replace(/<[^>]*>/g, '').substring(0, 160),
        images: [getImageUrl(productData.mainImages?.[0] || '')],
      },
    };
  } catch {
    return {
      title: '상품 상세 | GreenMate',
      description: '상품 상세 정보',
    };
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  try {
    const { id } = await params;

    // 서버에서 상품 정보와 추천 상품 함께 가져오기
    const { product, recommendProducts } = await getProductDetailWithRecommendations(id);

    if (!product) {
      notFound();
    }

    return (
      <div className='bg-surface min-h-screen'>
        <ProductDetailClient productData={product} productId={id} recommendProducts={recommendProducts}>
          <ReviewSection productId={product._id} />
        </ProductDetailClient>
      </div>
    );
  } catch {
    notFound();
  }
}
