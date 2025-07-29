export interface ProductDetail {
  id: number;
  name: string;
  imageUrl: string;
  option: string;
  quantity: number;
  price: number;
}

export interface OrderHistoryCardProps {
  order: {
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
  };
}

export interface OrderCardData {
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

export interface OrderHistoryListProps {
  orders: OrderCardData[];
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
