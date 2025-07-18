'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const subTabs = [
  { name: '상품', href: '/my-page/bookmarks/products' },
  { name: '북마크', href: '/my-page/bookmarks/posts' },
];

export default function BookmarksLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div>
      <nav className='mb-6 w-full'>
        <div className='mx-auto w-full max-w-6xl'>
          <ul className='flex w-full border-b border-gray-300'>
            {subTabs.map((tab) => {
              const isActive = pathname.startsWith(tab.href);
              return (
                <li key={tab.href} className='flex-1'>
                  <Link
                    href={tab.href}
                    className={`block w-full px-2 py-2 text-center text-sm font-medium transition-all duration-200 hover:bg-gray-50 ` + (isActive ? 'border-primary text-secondary border-b-2 bg-white' : 'hover:text-secondary text-gray-600')}
                    style={{ borderRadius: 0 }}
                  >
                    {tab.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
      <div>{children}</div>
    </div>
  );
}
