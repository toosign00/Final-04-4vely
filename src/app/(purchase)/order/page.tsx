// src/app/(purchase)/order/page.tsx (서버 컴포넌트)
import { getTempOrderAction } from '@/lib/actions/orderServerActions';
import { redirect } from 'next/navigation';
import OrderClientSection from './_components/OrderClient';

export default async function OrderPage() {
  // 서버에서 임시 주문 데이터 가져오기
  const tempOrder = await getTempOrderAction();

  console.log('[OrderPage] 임시 주문 데이터 조회:', {
    존재여부: !!tempOrder,
    타입: tempOrder?.type,
    아이템수: tempOrder?.items.length,
  });

  // 임시 주문 데이터가 없으면 쇼핑 페이지로 리다이렉트
  if (!tempOrder) {
    console.log('[OrderPage] 임시 주문 데이터 없음, 쇼핑 페이지로 리다이렉트');
    redirect('/shop');
  }

  // 클라이언트 컴포넌트에 데이터 전달
  return <OrderClientSection initialOrderData={tempOrder} />;
}
