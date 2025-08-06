// src/app/(purchase)/cart/page.tsx (서버 컴포넌트)
import { Button } from '@/components/ui/Button';
import { getCartItemsActionOptimized } from '@/lib/actions/cartServerActions';
import Link from 'next/link';
import CartClientSection from './_components/CartClient';

export default async function CartPage() {
  // 서버에서 장바구니 데이터 가져오기
  const cartItems = await getCartItemsActionOptimized();

  // 장바구니가 비어있는 경우
  if (cartItems.length === 0) {
    return (
      <div className='bg-surface min-h-screen w-full p-4 sm:p-6 lg:p-8'>
        {/* 헤더 영역 */}
        <div className='mx-auto mb-8 max-w-6xl'>
          <div className='text-secondary t-small font-medium'>| Shopping Cart</div>
          <h2 className='text-secondary t-h2 mt-2 font-light'>Cart</h2>
        </div>

        {/* 빈 장바구니 메시지 */}
        <div className='flex min-h-[400px] flex-col items-center justify-center'>
          <p className='mb-8 text-xl text-gray-600'>장바구니가 비어있습니다.</p>
          <Button asChild variant='primary' size='lg'>
            <Link href='/shop?page=1'>쇼핑 계속하기</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 장바구니 데이터를 클라이언트 컴포넌트에 전달
  return <CartClientSection initialCartItems={cartItems} />;
}
