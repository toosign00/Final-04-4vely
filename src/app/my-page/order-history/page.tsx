import { getOrders, Order, PaginationParams } from '@/lib/functions/orderFunctions';
import { redirect } from 'next/navigation';
import ErrorDisplay from '../_components/ErrorDisplay';
import OrderHistoryList from './_components/OrderHistoryList';
import type { OrderCardData, ProductDetail } from './_types';
import { formatOrderDate, formatPrice, getDeliveryStatus } from './utils/orderUtils';

/**
 * 화분 옵션을 포맷팅하는 메모이제이션된 함수 (성능 최적화)
 * @param potColors - 화분 색상 배열
 * @returns 포맷팅된 옵션 문자열
 */
const formatProductOption = (potColors?: string[]): string => {
  return potColors?.[0] ? `${potColors[0]} 화분` : '기본 옵션';
};

/**
 * 주문 데이터를 화면에 표시하기 위한 형태로 최적화하여 변환하는 함수
 * @param orders - 서버에서 받은 원본 주문 데이터 배열
 * @returns 화면 표시용으로 변환된 주문 카드 데이터 배열
 */
function transformOrderData(orders: Order[]): OrderCardData[] {
  return orders.map((order) => {
    const { products, _id: orderId, createdAt, state, cost } = order;
    const [mainProduct] = products;
    const hasMultipleProducts = products.length > 1;

    // 전체 주문 수량을 효율적으로 계산
    const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);

    // 상품 상세 정보를 화면 표시용 형태로 변환
    const productDetails: ProductDetail[] = products.map((product) => ({
      id: product._id,
      name: product.name,
      imageUrl: product.image,
      option: formatProductOption(product.extra.potColors),
      quantity: product.quantity,
      price: product.price,
    }));

    // 화면에 표시할 상품명 생성 (단일 상품 또는 다중 상품 표시 형태로)
    const displayName = hasMultipleProducts ? `${mainProduct.name} 외 ${products.length - 1}개` : mainProduct.name;

    return {
      id: orderId,
      image: mainProduct.image,
      name: displayName,
      option: formatProductOption(mainProduct.extra.potColors),
      quantity: totalQuantity,
      orderDate: formatOrderDate(createdAt),
      totalPrice: formatPrice(cost.total),
      deliveryStatus: getDeliveryStatus(state),
      products: productDetails,
      hasMultipleProducts,
      cost,
    };
  });
}

/**
 * 주문 내역 페이지 컴포넌트의 props 타입 정의
 */
interface OrderHistoryPageProps {
  searchParams: Promise<{
    page?: string; // URL 쿼리 파라미터로부터 받는 페이지 번호
  }>;
}

// 페이지당 표시할 주문 개수 설정
const ORDERS_PER_PAGE = 5;
// 기본 정렬 순서 (최신 주문부터 표시)
const DEFAULT_SORT = '{"createdAt": -1}';

/**
 * 주문 내역 페이지 컴포넌트
 * 사용자의 주문 내역을 페이지네이션과 함께 표시합니다.
 *
 * @param searchParams - URL 쿼리 파라미터 (페이지 번호 포함)
 * @returns 주문 내역 페이지 JSX
 */
export default async function OrderHistoryPage({ searchParams }: OrderHistoryPageProps) {
  // Promise 형태의 searchParams 를 해결하여 실제 값 추출
  const resolvedSearchParams = await searchParams;
  // 현재 페이지 번호 파싱 (기본값: 1)
  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);

  // 페이지네이션 파라미터 설정
  const paginationParams: PaginationParams = {
    page: currentPage,
    limit: ORDERS_PER_PAGE,
    sort: DEFAULT_SORT,
  };

  // 주문 데이터를 서버에서 가져오기 (사용자 ID는 서버에서 자동 처리)
  const ordersResponse = await getOrders(undefined, paginationParams);

  // API 응답이 실패한 경우 에러 화면 표시
  if (ordersResponse.ok === 0) {
    const errorMessage = ordersResponse.message || '일시적인 오류가 발생했어요.';
    return <ErrorDisplay title='주문 내역을 불러오지 못했습니다' message={errorMessage} />;
  }

  // 응답 데이터에서 주문 목록과 페이지네이션 정보 추출
  const orders: Order[] = ordersResponse.item?.orders || [];
  const pagination = ordersResponse.item?.pagination || {
    page: currentPage,
    limit: ORDERS_PER_PAGE,
    total: 0,
    totalPages: 0,
  };

  // 현재 페이지가 전체 페이지 수를 초과하는 경우 첫 페이지로 리다이렉트
  if (pagination.totalPages > 0 && currentPage > pagination.totalPages) {
    redirect('/my-page/order-history');
  }

  // 주문 내역이 없는 경우 빈 상태 화면 표시
  if (orders.length === 0) {
    return (
      <div className='grid w-full'>
        <div className='py-12 text-center'>
          <p className='text-gray-500'>주문 내역이 없습니다.</p>
        </div>
      </div>
    );
  }

  // 주문 데이터를 화면 표시용으로 변환하고 렌더링
  const transformedOrders = transformOrderData(orders);

  return (
    <div className='grid gap-6'>
      <OrderHistoryList orders={transformedOrders} pagination={pagination} />
    </div>
  );
}
