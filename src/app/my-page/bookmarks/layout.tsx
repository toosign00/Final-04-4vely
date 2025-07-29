'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

const subTabs = [
  { name: '상품', href: '/my-page/bookmarks/products' },
  { name: '게시글', href: '/my-page/bookmarks/posts' },
];

// 북마크 페이지 전용 스켈레톤 UI
function BookmarkLoadingUI() {
  return (
    <div className='grid gap-6 p-4 md:p-5 lg:p-6'>
      <div className='space-y-6'>
        {[...Array(3)].map((_, i) => (
          <div key={i} className='animate-pulse'>
            <div className='group relative mx-auto w-full max-w-6xl cursor-pointer rounded-2xl bg-white p-3 shadow-sm'>
              <div className='grid grid-cols-1 items-center gap-4 md:grid-cols-[auto_1fr_auto] md:gap-6'>
                {/* 상품 이미지 */}
                <div className='grid place-items-center'>
                  <div className='aspect-square w-[12.5rem]'>
                    <div className='h-full w-full rounded-xl border bg-gray-200' />
                  </div>
                </div>

                {/* 상품 정보 섹션 */}
                <div className='flex h-full flex-col justify-between gap-2'>
                  <div className='grid justify-items-start'>
                    <div className='mb-2 h-6 w-48 rounded bg-gray-200' />
                    <div className='mb-2 h-4 w-32 rounded bg-gray-200' />
                    <div className='h-5 w-20 rounded bg-gray-200' />
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className='flex flex-col gap-2 md:min-w-[140px]'>
                  <div className='h-9 rounded bg-gray-200' />
                  <div className='h-9 rounded bg-gray-200' />
                  <div className='h-9 rounded bg-gray-200' />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className='mt-8 flex justify-center'>
        <div className='h-10 w-64 animate-pulse rounded bg-gray-200' />
      </div>
    </div>
  );
}

export default function BookmarksLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(true);

  // 탭 변경 감지 및 로딩 상태 관리
  useEffect(() => {
    setIsLoading(true);
    setShowContent(false);

    // 스켈레톤을 보여주기 위한 최소 딜레이
    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowContent(true);
    }, 300); // 300ms 딜레이

    return () => clearTimeout(timer);
  }, [pathname]);

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
                      onClick={() => {
                        setIsLoading(true);
                        setShowContent(false);
                      }}
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
      <div>{isLoading || !showContent ? <BookmarkLoadingUI /> : <Suspense fallback={<BookmarkLoadingUI />}>{children}</Suspense>}</div>
    </div>
  );
}
