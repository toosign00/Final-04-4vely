'use server';

import { getAuthInfo } from '@/lib/utils/auth.server';
import { ApiRes } from '@/types/api.types';

const API_URL = process.env.API_URL || '';
const CLIENT_ID = process.env.CLIENT_ID || '';

interface OrderProduct {
  _id: number;
  quantity: number;
  seller_id: number;
  name: string;
  image: string;
  price: number;
  extra: {
    isNew: boolean;
    isBest: boolean;
    tags: string[];
    category: string[];
    potColors: string[];
    sort: number;
  };
  review_id?: number;
}

interface OrderAddress {
  name: string;
  value: string;
}

interface OrderCost {
  products: number;
  shippingFees: number;
  discount: {
    products: number;
    shippingFees: number;
  };
  total: number;
}

export interface Order {
  _id: number;
  products: OrderProduct[];
  address: OrderAddress;
  state: string;
  user_id: number;
  createdAt: string;
  updatedAt: string;
  cost: OrderCost;
}

export interface OrderState {
  code: string;
  name: string;
}

export async function getOrders(userId?: number): Promise<ApiRes<Order[]>> {
  try {
    const authInfo = await getAuthInfo();
    if (!authInfo) {
      return { ok: 0, message: '인증 정보가 없습니다.' };
    }

    const url = userId ? `${API_URL}/orders?userId=${userId}` : `${API_URL}/orders`;
    console.log('Fetching orders from:', url);
    console.log('Auth info:', { userId: authInfo.userId, hasToken: !!authInfo.accessToken });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        'Authorization': `Bearer ${authInfo.accessToken}`,
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return { ok: 0, message: `Failed to fetch orders: ${response.status} - ${errorText}` };
    }

    const data = await response.json();
    console.log('API Response data:', JSON.stringify(data, null, 2));
    
    // 다양한 응답 구조 처리
    let orders: Order[] = [];
    if (data.item) {
      console.log('Using data.item:', data.item.length, 'orders');
      orders = data.item;
    } else if (data.orders) {
      console.log('Using data.orders:', data.orders.length, 'orders');
      orders = data.orders;
    } else if (Array.isArray(data)) {
      console.log('Using data array:', data.length, 'orders');
      orders = data;
    } else {
      console.log('No orders found in response, returning empty array');
      orders = [];
    }
    
    return { ok: 1, item: orders };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { ok: 0, message: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

export async function getOrderById(orderId: number): Promise<ApiRes<Order>> {
  try {
    const authInfo = await getAuthInfo();
    if (!authInfo) {
      return { ok: 0, message: '인증 정보가 없습니다.' };
    }

    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        'Authorization': `Bearer ${authInfo.accessToken}`,
      },
    });

    if (!response.ok) {
      return { ok: 0, message: `Failed to fetch order: ${response.status}` };
    }

    const data = await response.json();
    return { ok: 1, item: data.item };
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    return { ok: 0, message: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

export async function getOrderStates(): Promise<ApiRes<OrderState[]>> {
  try {
    const authInfo = await getAuthInfo();
    if (!authInfo) {
      return { ok: 0, message: '인증 정보가 없습니다.' };
    }

    const response = await fetch(`${API_URL}/orders/state`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        'Authorization': `Bearer ${authInfo.accessToken}`,
      },
    });

    if (!response.ok) {
      return { ok: 0, message: `Failed to fetch order states: ${response.status}` };
    }

    const data = await response.json();
    return { ok: 1, item: data.item || [] };
  } catch (error) {
    console.error('Error fetching order states:', error);
    return { ok: 0, message: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

