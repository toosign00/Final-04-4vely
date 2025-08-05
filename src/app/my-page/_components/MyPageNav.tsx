// src/app/my-page/_components/MyPageNav.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { name: '내 반려 식물', href: '/my-page/my-plants', title: 'My Plants' },
  { name: '주문 내역', href: '/my-page/order-history', title: 'Order History' },
  { name: '북마크', href: '/my-page/bookmarks', title: 'Bookmarks' },
  { name: '내 정보', href: '/my-page/profile', title: 'Profile' },
];

export default function MyPageNav() {
  const pathname = usePathname();
  const currentTab = tabs.find((tab) => pathname.startsWith(tab.href));
  const title = currentTab ? currentTab.title : '';
  const isDiaryPage = pathname.includes('/my-plants/') && pathname !== '/my-page/my-plants';

  if (isDiaryPage) return null;

  return (
    <>
      <div className='mx-auto flex w-full max-w-6xl flex-col items-start pb-2'>
        <div className='text-secondary t-small font-medium'>| My Page</div>
        <h2 className='text-secondary t-h2 mt-2 font-light'>{title}</h2>
      </div>
      <nav className='bg-surface w-full pt-4 pb-4'>
        <div className='flex w-full items-center justify-center'>
          <div className='-mx-8 w-screen overflow-hidden rounded-none bg-white shadow-lg backdrop-blur-md sm:mx-auto sm:max-w-6xl'>
            <ul className='flex w-full'>
              {tabs.map((tab) => {
                const isActive = pathname.startsWith(tab.href);
                return (
                  <li key={tab.href} className='flex-1'>
                    <Link
                      href={tab.href}
                      className={`focus-visible t-small relative block w-full px-4 py-2 text-center whitespace-nowrap transition-all duration-300 ease-out ${isActive ? 'bg-primary text-secondary' : 'text-secondary/80 hover:text-secondary'}`}
                    >
                      {tab.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
