// src/app/(purchase)/cart/page.tsx (서버 컴포넌트)
import { getCartItemsAction } from '@/lib/actions/cartServerActions';
import CartClientSection from './_components/CartClient';

export default async function CartPage() {
  // 서버에서 장바구니 데이터 가져오기
  const cartItems = await getCartItemsAction();

  console.log('[CartPage] 장바구니 데이터 조회:', {
    아이템수: cartItems.length,
    총금액: cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  });

  // 장바구니가 비어있는 경우
  if (cartItems.length === 0) {
    return (
      <div className='bg-surface mx-auto w-full max-w-[1500px] p-4 md:p-6 lg:p-8'>
        {/* 헤더 영역 */}
        <div className='mt-2 mb-6 flex items-center md:mb-8 lg:mt-0 lg:mb-24'>
          <h1 className='font-regular flex flex-col items-start gap-1 text-3xl md:text-4xl'>
            <span className='text-base'>|Shopping Cart</span>
            <span>CART</span>
          </h1>
        </div>

        {/* 빈 장바구니 메시지 */}
        <div className='flex min-h-[400px] flex-col items-center justify-center'>
          <p className='mb-8 text-xl text-gray-600'>장바구니가 비어있습니다.</p>
          <a href='/shop' className='bg-primary hover:bg-primary/90 rounded-lg px-6 py-3 text-white transition-colors'>
            쇼핑 계속하기
          </a>
        </div>
      </div>
    );
  }

  // 장바구니 데이터를 클라이언트 컴포넌트에 전달
  return <CartClientSection initialCartItems={cartItems} />;
}
