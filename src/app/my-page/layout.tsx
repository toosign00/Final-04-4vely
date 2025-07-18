'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { name: '내 반려 식물', href: '/my-page/my-plants', title: 'My Plants' },
  { name: '주문 내역', href: '/my-page/order-history', title: 'Order History' },
  { name: '북마크', href: '/my-page/bookmarks', title: 'Bookmarks' },
  { name: '내 정보', href: '/my-page/profile', title: 'Profile' },
];

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // 현재 경로에 맞는 탭 찾기
  const currentTab = tabs.find((tab) => pathname.startsWith(tab.href));
  const title = currentTab ? currentTab.title : '';

  return (
    <section className='bg-surface flex min-h-screen flex-col'>
      {/* 타이틀 영역 */}
      <div className='flex w-full flex-col items-start pb-2'>
        <div className='text-secondary t-small font-medium'>| My Page</div>
        <h2 className='text-secondary t-h2 mt-2 font-light'>{title}</h2>
      </div>
      {/* 네비게이션 바 */}
      <nav className='bg-surface w-full pt-4 pb-2'>
        <div className='pb-4'>
          {/* 전체 너비 사용 */}
          <div className='w-full'>
            <div className='mx-auto w-full max-w-6xl overflow-hidden rounded-2xl bg-white p-1 shadow-lg backdrop-blur-md'>
              <ul className='flex w-full'>
                {tabs.map((tab) => {
                  const isActive = pathname.startsWith(tab.href);

                  return (
                    <li key={tab.href} className='flex-1'>
                      <Link
                        href={tab.href}
                        className={`focus-visible t-small relative block w-full rounded-xl px-4 py-2 text-center whitespace-nowrap transition-all duration-300 ease-out ${
                          isActive ? 'bg-primary text-secondary' : 'text-secondary/80 hover:text-secondary'
                        }`}
                      >
                        {tab.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </nav>
      {/* 실제 페이지 컨텐츠 */}
      <div>{children}</div>
    </section>
  );
}
