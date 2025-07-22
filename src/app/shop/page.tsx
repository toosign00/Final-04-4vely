// src/app/shop/page.tsx (서버 컴포넌트)
import { getProducts, getImageUrl } from '@/lib/api/market';
import { ProductApiData, Product } from '@/types/product';
import ShopClientContent from './_components/ShopClientContent';

// 카테고리 매핑 헬퍼 함수
function mapCategoryValue(categories: string[], targetCategories: string[], defaultValue: string) {
  const found = categories?.find((cat) => targetCategories.includes(cat));
  return found || defaultValue;
}

// 서버에서 데이터 페칭
async function fetchAllProducts(): Promise<Product[]> {
  try {
    // 첫 번째 페이지 로드
    const response = await getProducts({ limit: 100 });
    const productsData = (response.item || response.items || []) as ProductApiData[];

    let allProducts = [...productsData];

    // 추가 페이지가 있다면 모두 가져오기
    if (response.pagination && response.pagination.totalPages > 1) {
      const additionalRequests = [];

      for (let page = 2; page <= response.pagination.totalPages; page++) {
        additionalRequests.push(getProducts({ limit: 100, page: page }));
      }

      const additionalResponses = await Promise.allSettled(additionalRequests);

      additionalResponses.forEach((result) => {
        if (result.status === 'fulfilled') {
          const additionalData = (result.value.item || result.value.items || []) as ProductApiData[];
          allProducts = [...allProducts, ...additionalData];
        }
      });
    }

    // API 데이터를 Product 타입으로 변환
    const transformedProducts: Product[] = allProducts.map((product: ProductApiData) => {
      const categories = product.extra?.category || [];

      return {
        id: product._id.toString(),
        name: product.name,
        image: getImageUrl(product.mainImages?.[0] || ''),
        price: product.price,
        category: categories[0] || '식물',
        size: mapCategoryValue(categories, ['소형', '중형', '대형'], 'medium'),
        difficulty: mapCategoryValue(categories, ['쉬움', '보통', '어려움'], 'easy'),
        light: mapCategoryValue(categories, ['음지', '간접광', '직사광'], 'medium'),
        space: mapCategoryValue(categories, ['거실', '침실', '욕실', '주방', '사무실', '실외'], 'indoor'),
        season: mapCategoryValue(categories, ['봄', '여름', '가을', '겨울'], 'spring'),
        isNew: product.extra?.isNew || false,
        isBookmarked: false, // 추후 북마크 API로 확인
        recommend: product.extra?.isBest || false,
      };
    });

    return transformedProducts;
  } catch (error) {
    console.error('상품 로딩 실패:', error);
    throw new Error('상품을 불러오는데 실패했습니다.');
  }
}

export default async function ShopPage() {
  // 서버에서 데이터 미리 로딩
  const products = await fetchAllProducts();

  return (
    <div className='bg-surface min-h-screen p-4'>
      {/* 클라이언트 컴포넌트에 서버 데이터 전달 */}
      <ShopClientContent initialProducts={products} />
    </div>
  );
}
