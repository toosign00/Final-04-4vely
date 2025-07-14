import Link from 'next/link';

export default function NavigationPage() {
  return (
    <div className='min-h-screen bg-neutral-50 p-8'>
      <div className='mx-auto max-w-6xl'>
        {/* 페이지 제목 */}
        <div className='mb-8 text-center'>
          <h1 className='text-3xl font-bold text-neutral-900'>🪴 네비게이션</h1>
          <p className='mt-2 text-neutral-700'>개발 및 테스트를 위한 페이지 링크 모음</p>
        </div>

        {/* 메인 네비게이션 그리드 */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {/* 홈 & 인증 섹션 */}
          <div className='border-border-light rounded-lg border bg-neutral-100 p-6'>
            <h2 className='mb-4 text-xl font-semibold text-neutral-900'>🏠 홈 & 인증</h2>
            <div className='space-y-2'>
              <Link href='/' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                홈페이지
              </Link>
              <Link href='/login' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                로그인
              </Link>
              <Link href='/sign-up' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                회원가입
              </Link>
              <Link href='/find-account' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                계정 찾기
              </Link>
            </div>
          </div>

          {/* 쇼핑 섹션 */}
          <div className='border-border-light rounded-lg border bg-neutral-100 p-6'>
            <h2 className='mb-4 text-xl font-semibold text-neutral-900'>🛍️ 쇼핑</h2>
            <div className='space-y-2'>
              <Link href='/shop' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                쇼핑 메인
              </Link>
              <Link href='/shop/products/1' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                상품 상세
              </Link>
              <Link href='/cart' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                장바구니
              </Link>
              <Link href='/order' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                주문/결제
              </Link>
            </div>
          </div>

          {/* 커뮤니티 섹션 */}
          <div className='border-border-light rounded-lg border bg-neutral-100 p-6'>
            <h2 className='mb-4 text-xl font-semibold text-neutral-900'>🌿 커뮤니티</h2>
            <div className='space-y-2'>
              <Link href='/community' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                커뮤니티 메인
              </Link>
              <Link href='/community/1' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                커뮤니티 상세
              </Link>
              <Link href='/community/write' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                글쓰기
              </Link>
              <Link href='/community/1/edit' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                글 수정
              </Link>
            </div>
          </div>
        </div>

        {/* 하단 섹션들 */}
        <div className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
          {/* 마이페이지 섹션 */}
          <div className='border-border-light rounded-lg border bg-neutral-100 p-6'>
            <h2 className='mb-4 text-xl font-semibold text-neutral-900'>👤 마이페이지</h2>
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
              <Link href='/my-page' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                마이페이지
              </Link>
              <Link href='/my-page/profile' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                프로필
              </Link>
              <Link href='/my-page/my-plants' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                내 식물 관리
              </Link>
              <Link href='/my-page/order-history' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                주문 내역
              </Link>
              <Link href='/my-page/bookmarks' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                북마크
              </Link>
            </div>
          </div>

          {/* 관리자 섹션 */}
          <div className='border-border-light rounded-lg border bg-neutral-100 p-6'>
            <h2 className='mb-4 text-xl font-semibold text-neutral-900'>🔧 관리자</h2>
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
              <Link href='/admin' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                관리자 대시보드
              </Link>
              <Link href='/admin/users' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                사용자 관리
              </Link>
              <Link href='/admin/products' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                상품 관리
              </Link>
              <Link href='/admin/products/1' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                상품 상세 관리
              </Link>
              <Link href='/admin/orders' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                주문 관리
              </Link>
              <Link href='/admin/analytics' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                분석
              </Link>
            </div>
          </div>
        </div>

        {/* 컴포넌트 섹션 */}
        <div className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
          <div className='border-border-light rounded-lg border bg-neutral-100 p-6'>
            <h2 className='mb-4 text-xl font-semibold text-neutral-900'>💡 컴포넌트</h2>
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
              <Link href='/example/button' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                버튼
              </Link>
              <Link href='/example/avatar' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                아바타
              </Link>
              <Link href='/example/card' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                카드
              </Link>
              <Link href='/example/select' className='hover:border-primary-100 hover:bg-primary-50 hover:text-primary-600 block rounded border border-transparent bg-neutral-200 px-3 py-2 text-neutral-700 transition-colors'>
                드롭다운 셀렉트
              </Link>
            </div>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className='border-border-light mt-8 rounded-lg border bg-neutral-100 p-4 text-center'>
          <p className='text-sm text-neutral-700'>💡 개발 중인 페이지입니다. 각 링크를 클릭하여 페이지를 확인하세요.</p>
        </div>
      </div>
    </div>
  );
}
