import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function NavigationPage() {
  return (
    <div className='bg-surface min-h-screen p-8'>
      <div className='mx-auto max-w-6xl'>
        {/* 페이지 제목 */}
        <div className='mb-8 text-center'>
          <h1 className='text-secondary text-3xl font-bold'>🪴 네비게이션</h1>
          <p className='text-secondary mt-2'>개발 및 테스트를 위한 페이지 링크 모음</p>
        </div>

        {/* 메인 네비게이션 그리드 */}
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {/* 홈 & 인증 섹션 */}
          <div className='border-border-light rounded-lg border bg-white p-6'>
            <h2 className='text-secondary mb-4 text-xl font-semibold'>🏠 홈 & 인증</h2>
            <div className='space-y-2'>
              <Button variant='default' asChild fullWidth>
                <Link href='/'>홈페이지</Link>
              </Button>
              <Button variant='default' asChild fullWidth>
                <Link href='/login'>로그인</Link>
              </Button>
              <Button variant='default' asChild fullWidth>
                <Link href='/sign-up'>회원가입</Link>
              </Button>
              <Button variant='default' asChild fullWidth>
                <Link href='/find-account'>계정 찾기</Link>
              </Button>
            </div>
          </div>

          {/* 쇼핑 섹션 */}
          <div className='border-border-light rounded-lg border bg-white p-6'>
            <h2 className='text-secondary mb-4 text-xl font-semibold'>🛍️ 쇼핑</h2>
            <div className='space-y-2'>
              <Button variant='default' asChild fullWidth>
                <Link href='/shop'>쇼핑 메인</Link>
              </Button>
              <Button variant='default' asChild fullWidth>
                <Link href='/shop/products/1'>상품 상세</Link>
              </Button>
              <Button variant='default' asChild fullWidth>
                <Link href='/cart'>장바구니</Link>
              </Button>
              <Button variant='default' asChild fullWidth>
                <Link href='/order'>주문/결제</Link>
              </Button>
            </div>
          </div>

          {/* 커뮤니티 섹션 */}
          <div className='border-border-light rounded-lg border bg-white p-6'>
            <h2 className='text-secondary mb-4 text-xl font-semibold'>🌿 커뮤니티</h2>
            <div className='space-y-2'>
              <Button variant='default' asChild fullWidth>
                <Link href='/community'>커뮤니티 메인</Link>
              </Button>
              <Button variant='default' asChild fullWidth>
                <Link href='/community/1'>커뮤니티 상세</Link>
              </Button>
              <Button variant='default' asChild fullWidth>
                <Link href='/community/write'>글쓰기</Link>
              </Button>
              <Button variant='default' asChild fullWidth>
                <Link href='/community/1/edit'>글 수정</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 하단 섹션들 */}
        <div className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
          {/* 마이페이지 섹션 */}
          <div className='border-border-light rounded-lg border bg-white p-6'>
            <h2 className='text-secondary mb-4 text-xl font-semibold'>👤 마이페이지</h2>
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
              <Button variant='default' asChild fullWidth>
                <Link href='/my-page'>마이페이지</Link>
              </Button>
              <Button variant='default' asChild fullWidth>
                <Link href='/my-page/profile'>프로필</Link>
              </Button>
              <Button variant='default' asChild fullWidth>
                <Link href='/my-page/my-plants'>내 식물 관리</Link>
              </Button>
              <Button variant='default' asChild fullWidth>
                <Link href='/my-page/order-history'>주문 내역</Link>
              </Button>
              <Button variant='default' asChild fullWidth>
                <Link href='/my-page/bookmarks'>북마크</Link>
              </Button>
            </div>
          </div>

          {/* 관리자 섹션 */}
          <div className='border-border-light rounded-lg border bg-white p-6'>
            <h2 className='text-secondary mb-4 text-xl font-semibold'>🔧 관리자</h2>
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
              <Button variant='default' asChild fullWidth>
                <Link href='/admin'>관리자 대시보드</Link>
              </Button>
              <Button variant='default' asChild fullWidth>
                <Link href='/admin/users'>사용자 관리</Link>
              </Button>
              <Button variant='default' asChild fullWidth>
                <Link href='/admin/products'>상품 관리</Link>
              </Button>
              <Button variant='default' asChild fullWidth>
                <Link href='/admin/products/1'>상품 상세 관리</Link>
              </Button>
              <Button variant='default' asChild fullWidth>
                <Link href='/admin/orders'>주문 관리</Link>
              </Button>
              <Button variant='default' asChild fullWidth>
                <Link href='/admin/analytics'>분석</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 컴포넌트 섹션 */}
        <div className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
          <div className='border-border-light rounded-lg border bg-white p-6'>
            <h2 className='text-secondary mb-4 text-xl font-semibold'>💡 컴포넌트</h2>
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
              <Button variant='default' asChild fullWidth>
                <Link href='/example/button'>버튼</Link>
              </Button>
              <Button variant='default' asChild fullWidth>
                <Link href='/example/avatar'>아바타</Link>
              </Button>
              <Button variant='default' asChild fullWidth>
                <Link href='/example/card'>카드</Link>
              </Button>
              <Button variant='default' asChild fullWidth>
                <Link href='/example/select'>드롭다운 셀렉트</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className='border-border-light mt-8 rounded-lg border bg-white p-4 text-center'>
          <p className='text-secondary text-sm'>💡 개발 중인 페이지입니다. 각 링크를 클릭하여 페이지를 확인하세요.</p>
        </div>
      </div>
    </div>
  );
}
