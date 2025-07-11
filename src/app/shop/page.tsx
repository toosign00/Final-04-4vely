export default function ShopPage() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-neutral-50 p-8'>
      <div className='mx-auto max-w-2xl text-center'>
        <h1 className='mb-6 text-4xl font-bold text-neutral-800'>🛍️ 쇼핑 메인</h1>

        <div className='space-y-4'>
          <p className='text-lg text-neutral-600'>다양한 식물과 관련 상품들을 구매할 수 있는 페이지입니다.</p>

          <div className='mt-6 border-t border-neutral-200 pt-4'>
            <p className='text-sm text-neutral-500'>💡 이 영역에서 쇼핑 메인 기능을 개발해주세요</p>
          </div>
        </div>
      </div>
    </div>
  );
}
