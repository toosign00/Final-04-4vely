// Core types for order history functionality
export type DeliveryStatus = 'preparing' | 'shipping' | 'completed';

export interface ProductDetail {
  id: number;
  name: string;
  imageUrl: string;
  option: string;
  quantity: number;
  price: number;
  color?: string;
  image?: string;
}

export interface OrderCost {
  products: number;
  shippingFees: number;
  discount: {
    products: number;
    shippingFees: number;
  };
  total: number;
}

export interface OrderCardData {
  id: number;
  image: string;
  name: string;
  option: string;
  quantity: number;
  orderDate: string;
  totalPrice: string;
  deliveryStatus: DeliveryStatus;
  products?: ProductDetail[];
  hasMultipleProducts?: boolean;
  cost?: OrderCost;
  memo?: {
    selectedMemo: string;
    selectedImage: string[];
  };
}

export interface OrderHistoryCardProps {
  order: OrderCardData;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OrderHistoryListProps {
  orders: OrderCardData[];
  pagination: PaginationInfo;
}

export interface ReviewFormProps {
  productId: number;
  orderId: number;
  onSuccess: (productId: number) => void;
  products?: ProductDetail[];
  reviewedProductIds?: number[];
  selectedProduct?: ProductDetail | null;
  onProductSelect?: (product: ProductDetail) => void;
}
