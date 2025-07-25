// src/app/shop/products/[id]/page.tsx (서버 컴포넌트)
import { getServerProductById } from '@/lib/functions/productServerFunctions';
import { getImageUrl } from '@/types/product';
import { notFound } from 'next/navigation';
import ProductDetailClient from './_components/ProductDetailClient';

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

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  try {
    const { id } = await params;
    console.log(`[상품 상세 페이지] 상품 ID: ${id} 로딩 시작`);

    // 서버 함수 사용으로 변경 (북마크 정보 포함)
    const productResponse = await getServerProductById(parseInt(id));

    console.log(`[상품 상세 페이지] API 응답:`, {
      ok: productResponse.ok,
      hasItem: !!productResponse.item,
      myBookmarkId: productResponse.item?.myBookmarkId,
    });

    // 상품이 없으면 404
    if (!productResponse.ok || !productResponse.item) {
      console.log(`[상품 상세 페이지] 상품을 찾을 수 없음: ${id}`);
      notFound();
    }

    return (
      <div className='bg-surface min-h-screen'>
        <ProductDetailClient productData={productResponse.item} productId={id} />
      </div>
    );
  } catch (error) {
    console.error('상품 페이지 로딩 실패:', error);
    notFound();
  }
}
