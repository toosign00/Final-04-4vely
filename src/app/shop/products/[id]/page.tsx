// src/app/shop/products/[id]/page.tsx (서버 컴포넌트)
import { getImageUrl, getProduct, getProductDetailWithRelatedData } from '@/lib/functions/productFunctions';
import { notFound } from 'next/navigation';
import ProductDetailClient from './_components/ProductDetailClient';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// 메타데이터 생성 (SEO 최적화)
export async function generateMetadata({ params }: ProductDetailPageProps) {
  try {
    const { id } = await params;
    const productResponse = await getProduct(parseInt(id));

    // API 응답 구조에 맞게 처리
    if (!productResponse.ok || !productResponse.item) {
      return {
        title: '상품 상세 | 4vely Plant Shop',
        description: '식물 상품 상세 정보',
      };
    }

    const productData = productResponse.item;

    return {
      title: `${productData.name} | 4vely Plant Shop`,
      description: productData.content ? productData.content.replace(/<[^>]*>/g, '').substring(0, 160) : `${productData.name} 상품 상세 정보`,
      openGraph: {
        title: productData.name,
        description: productData.content?.replace(/<[^>]*>/g, '').substring(0, 160),
        images: [getImageUrl(productData.mainImages?.[0] || '')],
      },
    };
  } catch (error) {
    console.error('메타데이터 생성 실패:', error);
    return {
      title: '상품 상세 | 4vely Plant Shop',
      description: '식물 상품 상세 정보',
    };
  }
}

// 메인 컴포넌트
export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  try {
    const { id } = await params;

    // 서버에서 모든 필요한 데이터 미리 로딩
    const { product, recommendProducts, initialReviews, reviewsPagination } = await getProductDetailWithRelatedData(id);

    // 상품이 없으면 404
    if (!product) {
      notFound();
    }

    return (
      <div className='bg-surface min-h-screen'>
        {/* 클라이언트 컴포넌트에 서버 데이터 전달 */}
        <ProductDetailClient product={product} recommendProducts={recommendProducts} initialReviews={initialReviews} initialReviewsPagination={reviewsPagination} productId={id} />
      </div>
    );
  } catch (error) {
    console.error('상품 페이지 로딩 실패:', error);
    notFound();
  }
}
