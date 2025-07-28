import { getOrders, Order } from '@/lib/functions/orderFunctions';
import { getImageUrl } from '@/lib/utils/auth.server';
import OrderHistoryList from './_components/OrderHistoryList';
import { formatOrderDate, formatPrice, getDeliveryStatus } from './utils/orderUtils';

interface ProductDetail {
  id: number;
  name: string;
  imageUrl: string;
  option: string;
  quantity: number;
  price: number;
}

interface OrderCardData {
  id: number;
  imageUrl: string;
  name: string;
  option: string;
  quantity: number;
  orderDate: string;
  totalPrice: string;
  deliveryStatus: 'preparing' | 'shipping' | 'completed';
  products?: ProductDetail[];
  hasMultipleProducts?: boolean;
  cost?: {
    products: number;
    shippingFees: number;
    discount: {
      products: number;
      shippingFees: number;
    };
    total: number;
  };
}

async function transformOrderData(orders: Order[]): Promise<OrderCardData[]> {
  const transformedOrders = await Promise.all(
    orders.map(async (order) => {
      // 대표 상품 정보 (첫 번째 상품)
      const mainProduct = order.products[0];
      const totalQuantity = order.products.reduce((sum, product) => sum + product.quantity, 0);
      const hasMultipleProducts = order.products.length > 1;

      // 상품 상세 정보 변환
      const productDetails: ProductDetail[] = await Promise.all(
        order.products.map(async (product) => ({
          id: product._id,
          name: product.name,
          imageUrl: await getImageUrl(product.image),
          option: product.extra.potColors?.[0] ? `${product.extra.potColors[0]} 화분` : '기본 옵션',
          quantity: product.quantity,
          price: product.price,
        })),
      );

      return {
        id: order._id,
        imageUrl: await getImageUrl(mainProduct.image),
        name: hasMultipleProducts ? `${mainProduct.name} 외 ${order.products.length - 1}개` : mainProduct.name,
        option: mainProduct.extra.potColors?.[0] ? `${mainProduct.extra.potColors[0]} 화분` : '기본 옵션',
        quantity: totalQuantity,
        orderDate: formatOrderDate(order.createdAt),
        totalPrice: formatPrice(order.cost.total),
        deliveryStatus: getDeliveryStatus(order.state),
        products: productDetails,
        hasMultipleProducts,
        cost: order.cost,
      };
    }),
  );

  return transformedOrders;
}

export default async function OrderHistoryPage() {
  // API에서 주문 데이터 가져오기
  const ordersResponse = await getOrders();

  let ordersData: OrderCardData[] = [];
  if (ordersResponse.ok === 1) {
    // 최신순으로 정렬 (createdAt 기준 내림차순)
    const sortedOrders = ordersResponse.item.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    ordersData = await transformOrderData(sortedOrders);
  }

  if (ordersResponse.ok === 0) {
    return (
      <div className='grid gap-6 p-4 md:p-5 lg:p-6'>
        <div className='py-12 text-center'>
          <p className='text-gray-500'>주문 내역을 불러올 수 없습니다.</p>
          <p className='mt-2 text-sm text-gray-400'>{ordersResponse.message}</p>
        </div>
      </div>
    );
  }

  if (ordersData.length === 0) {
    return (
      <div className='grid gap-6 p-4 md:p-5 lg:p-6'>
        <div className='py-12 text-center'>
          <p className='text-gray-500'>주문 내역이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='grid gap-6 p-4 md:p-5 lg:p-6'>
      <OrderHistoryList orders={ordersData} />
    </div>
  );
}
