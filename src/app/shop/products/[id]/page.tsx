// src/app/shop/products/[id]/page.tsx (서버 컴포넌트)
import { getProductDetailWithRecommendations, getServerProductById } from '@/lib/functions/shop/productServerFunctions';
import { getImageUrl } from '@/types/product.types';
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
  } catch (error) {
    console.error('메타데이터 생성 실패:', error);
    return {
      title: '상품 상세 | GreenMate',
      description: '상품 상세 정보',
    };
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  try {
    const { id } = await params;
    console.log(`[상품 상세 페이지] 상품 ID: ${id} 로딩 시작`);

    // 서버에서 상품 정보와 추천 상품 함께 가져오기
    const { product, recommendProducts } = await getProductDetailWithRecommendations(id);

    if (!product) {
      console.log(`[상품 상세 페이지] 상품을 찾을 수 없음`);
      notFound();
    }

    console.log(`[상품 상세 페이지] 데이터 로드 완료:`, {
      상품명: product.name,
      추천상품수: recommendProducts.length,
      북마크상태: !!product.myBookmarkId,
    });

    return (
      <div className='bg-surface min-h-screen'>
        <ProductDetailClient productData={product} productId={id} recommendProducts={recommendProducts}>
          <ReviewSection productId={product._id} />
        </ProductDetailClient>
      </div>
    );
  } catch (error) {
    console.error('상품 페이지 로딩 실패:', error);
    notFound();
  }
}
