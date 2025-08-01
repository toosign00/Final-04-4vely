// src/app/(purchase)/order/page.tsx 수정 버전 (TypeScript 오류 해결)

import { getTempOrderAction } from '@/lib/actions/order/orderServerActions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import OrderClientSection from './_components/orderClient';

export default async function OrderPage() {
  // 서버에서 임시 주문 데이터 가져오기
  const tempOrder = await getTempOrderAction();

  console.log('[OrderPage] 임시 주문 데이터 조회:', {
    존재여부: !!tempOrder,
    타입: tempOrder?.type,
    아이템수: tempOrder?.items?.length,
  });

  // 🔧 핵심 수정: 결제 진행 중인지 확인
  const cookieStore = await cookies();
  const isPaymentInProgress = cookieStore.get('payment-in-progress')?.value === 'true';

  console.log('[OrderPage] 결제 진행 상태 확인:', { isPaymentInProgress });

  // 임시 주문 데이터가 없고 결제 진행 중이 아닐 때만 리다이렉트
  if (!tempOrder && !isPaymentInProgress) {
    console.log('[OrderPage] 임시 주문 데이터 없고 결제 진행 중 아님 → 쇼핑 페이지로 리다이렉트');
    redirect('/shop?page=1');
  }

  // 임시 주문 데이터가 없지만 결제 진행 중인 경우 - 로딩 화면 표시
  if (!tempOrder && isPaymentInProgress) {
    console.log('[OrderPage] 결제 진행 중이므로 로딩 화면 표시');

    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='rounded-lg bg-white p-8 text-center shadow-lg'>
          <div className='border-primary mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-b-2' />
          <h2 className='mb-2 text-xl font-semibold text-gray-800'>결제 진행 중...</h2>
          <p className='text-gray-600'>잠시만 기다려주세요.</p>
          <p className='mt-4 text-sm text-gray-400'>페이지를 새로고침하지 마세요.</p>
        </div>
      </div>
    );
  }

  // 정상적인 경우: tempOrder가 확실히 존재하므로 타입 안전
  console.log('[OrderPage] 정상적인 주문 페이지 렌더링');
  return <OrderClientSection initialOrderData={tempOrder!} />;
}
