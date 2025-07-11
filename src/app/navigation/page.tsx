import Link from 'next/link';

export default function NavigationPage() {
  return (
    <div className='min-h-screen bg-neutral-50 p-8'>
      <div className='mx-auto max-w-6xl'>
        {/* 페이지 제목 */}
        <div className='mb-8 text-center'>
          <h1 className='text-3xl font-bold text-neutral-800'>🪴 네비게이션</h1>
          <p className='mt-2 text-neutral-600'>개발 및 테스트를 위한 페이지 링크 모음</p>
        </div>

        {/* 메인 네비게이션 그리드 */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {/* 홈 & 인증 섹션 */}
          <div className='rounded-lg border border-neutral-200 bg-neutral-50 p-6'>
            <h2 className='mb-4 text-xl font-semibold text-neutral-800'>🏠 홈 & 인증</h2>
            <div className='space-y-2'>
              <Link href='/' className='block rounded border border-transparent bg-neutral-100 px-3 py-2 text-neutral-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700'>
                홈페이지
              </Link>
              <Link href='/login' className='block rounded border border-transparent bg-neutral-100 px-3 py-2 text-neutral-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700'>
                로그인
              </Link>
              <Link href='/sign-up' className='block rounded border border-transparent bg-neutral-100 px-3 py-2 text-neutral-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700'>
                회원가입
              </Link>
              <Link href='/find-account' className='block rounded border border-transparent bg-neutral-100 px-3 py-2 text-neutral-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700'>
                계정 찾기
              </Link>
            </div>
          </div>

          {/* 쇼핑 섹션 */}
          <div className='rounded-lg border border-neutral-200 bg-neutral-50 p-6'>
            <h2 className='mb-4 text-xl font-semibold text-neutral-800'>🛍️ 쇼핑</h2>
            <div className='space-y-2'>
              <Link href='/shop' className='block rounded border border-transparent bg-neutral-100 px-3 py-2 text-neutral-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700'>
                쇼핑 메인
              </Link>
              <Link href='/shop/products/1' className='block rounded border border-transparent bg-neutral-100 px-3 py-2 text-neutral-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700'>
                상품 상세
              </Link>
              <Link href='/cart' className='block rounded border border-transparent bg-neutral-100 px-3 py-2 text-neutral-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700'>
                장바구니
              </Link>
              <Link href='/order' className='block rounded border border-transparent bg-neutral-100 px-3 py-2 text-neutral-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700'>
                주문/결제
              </Link>
            </div>
          </div>

          {/* 커뮤니티 섹션 */}
          <div className='rounded-lg border border-neutral-200 bg-neutral-50 p-6'>
            <h2 className='mb-4 text-xl font-semibold text-neutral-800'>🌿 커뮤니티</h2>
            <div className='space-y-2'>
              <Link href='/community' className='block rounded border border-transparent bg-neutral-100 px-3 py-2 text-neutral-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700'>
                커뮤니티 메인
              </Link>
              <Link href='/community/1' className='block rounded border border-transparent bg-neutral-100 px-3 py-2 text-neutral-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700'>
                커뮤니티 상세
              </Link>
              <Link href='/community/write' className='block rounded border border-transparent bg-neutral-100 px-3 py-2 text-neutral-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700'>
                글쓰기
              </Link>
              <Link href='/community/1/edit' className='block rounded border border-transparent bg-neutral-100 px-3 py-2 text-neutral-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700'>
                글 수정
              </Link>
            </div>
          </div>
        </div>

        {/* 하단 섹션들 */}
        <div className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
          {/* 마이페이지 섹션 */}
          <div className='rounded-lg border border-neutral-200 bg-neutral-50 p-6'>
            <h2 className='mb-4 text-xl font-semibold text-neutral-800'>👤 마이페이지</h2>
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
              <Link href='/my-page' className='block rounded border border-transparent bg-neutral-100 px-3 py-2 text-neutral-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700'>
                마이페이지
              </Link>
              <Link href='/my-page/profile' className='block rounded border border-transparent bg-neutral-100 px-3 py-2 text-neutral-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700'>
                프로필
              </Link>
              <Link href='/my-page/my-plants' className='block rounded border border-transparent bg-neutral-100 px-3 py-2 text-neutral-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700'>
                내 식물 관리
              </Link>
              <Link href='/my-page/order-history' className='block rounded border border-transparent bg-neutral-100 px-3 py-2 text-neutral-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700'>
                주문 내역
              </Link>
              <Link href='/my-page/bookmarks' className='block rounded border border-transparent bg-neutral-100 px-3 py-2 text-neutral-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700'>
                북마크
              </Link>
            </div>
          </div>

          {/* 관리자 섹션 */}
          <div className='rounded-lg border border-neutral-200 bg-neutral-50 p-6'>
            <h2 className='mb-4 text-xl font-semibold text-neutral-800'>🔧 관리자</h2>
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
              <Link href='/admin' className='block rounded border border-transparent bg-neutral-100 px-3 py-2 text-neutral-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700'>
                관리자 대시보드
              </Link>
              <Link href='/admin/users' className='block rounded border border-transparent bg-neutral-100 px-3 py-2 text-neutral-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700'>
                사용자 관리
              </Link>
              <Link href='/admin/products' className='block rounded border border-transparent bg-neutral-100 px-3 py-2 text-neutral-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700'>
                상품 관리
              </Link>
              <Link href='/admin/products/1' className='block rounded border border-transparent bg-neutral-100 px-3 py-2 text-neutral-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700'>
                상품 상세 관리
              </Link>
              <Link href='/admin/orders' className='block rounded border border-transparent bg-neutral-100 px-3 py-2 text-neutral-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700'>
                주문 관리
              </Link>
              <Link href='/admin/analytics' className='block rounded border border-transparent bg-neutral-100 px-3 py-2 text-neutral-700 hover:border-green-200 hover:bg-green-50 hover:text-green-700'>
                분석
              </Link>
            </div>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className='mt-8 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center'>
          <p className='text-sm text-neutral-600'>💡 개발 중인 페이지입니다. 각 링크를 클릭하여 페이지를 확인하세요.</p>
        </div>
      </div>
    </div>
  );
}
