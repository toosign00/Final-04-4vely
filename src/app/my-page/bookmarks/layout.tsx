'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const subTabs = [
  { name: '상품', href: '/my-page/bookmarks/products' },
  { name: '게시글', href: '/my-page/bookmarks/posts' },
];

export default function BookmarksLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div>
      {/* 네비게이션 바 */}
      <nav className='bg-surface w-full pb-4'>
        {/* 전체 너비 사용 */}
        <div className='flex w-full items-center justify-center'>
          <div className='-mx-8 w-screen overflow-hidden rounded-none bg-white shadow-lg backdrop-blur-md sm:mx-auto sm:max-w-6xl'>
            <ul className='flex w-full'>
              {subTabs.map((tab) => {
                const isActive = pathname.startsWith(tab.href);
                return (
                  <li key={tab.href} className='flex-1'>
                    <Link
                      href={tab.href}
                      className={`focus-visible t-small relative block w-full px-4 py-2 text-center whitespace-nowrap transition-all duration-300 ease-out ${isActive ? 'bg-primary text-secondary' : 'text-secondary/80 hover:text-secondary'}`}
                      style={{ borderRadius: 0 }}
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
      <div>{children}</div>
    </div>
  );
}
