'use client';

import { usePathname } from 'next/navigation';

// 1. 내 반려식물 페이지 스켈레톤 (2x2 그리드)
function MyPlantsSkeletonUI() {
  return (
    <>
      <div className='mx-auto max-w-4xl px-4 md:px-5 lg:px-6'>
        <div className='mt-4 flex justify-end'>
          <div className='h-10 w-32 animate-pulse rounded bg-gray-200' />
        </div>
      </div>
      <div className='mx-auto grid max-w-4xl auto-rows-fr grid-cols-1 gap-6 p-4 md:grid-cols-2 md:p-5 lg:p-6'>
        {[...Array(4)].map((_, i) => (
          <div key={i} className='animate-pulse'>
            <div className='max-h-[28.1rem] overflow-hidden rounded-2xl border bg-white shadow-md'>
              {/* 이미지 영역 */}
              <div className='h-48 bg-gray-200 sm:h-56' />

              {/* 컨텐츠 영역 */}
              <div className='space-y-4 p-4 sm:p-5'>
                {/* 헤더 정보 */}
                <div className='flex items-start justify-between'>
                  <div className='min-w-0 flex-1'>
                    <div className='mb-1 h-6 w-24 rounded bg-gray-200' />
                    <div className='h-4 w-20 rounded bg-gray-200' />
                  </div>
                  <div className='ml-3 text-right'>
                    <div className='mb-1 h-4 w-16 rounded bg-gray-200' />
                    <div className='h-3 w-20 rounded bg-gray-200' />
                  </div>
                </div>

                {/* 메모 영역 */}
                <div className='rounded-lg border border-gray-300 bg-gray-50 p-3'>
                  <div className='mb-1 h-4 w-32 rounded bg-gray-200' />
                  <div className='h-4 w-full rounded bg-gray-200' />
                </div>

                {/* 액션 버튼들 */}
                <div className='flex gap-2'>
                  <div className='h-8 flex-1 rounded bg-gray-200' />
                  <div className='h-8 w-20 rounded bg-gray-200' />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className='mt-8 flex justify-center'>
        <div className='h-10 w-64 animate-pulse rounded bg-gray-200' />
      </div>
    </>
  );
}

// 2. 주문내역 페이지 스켈레톤 (세로 리스트)
function OrderHistorySkeletonUI() {
  return (
    <div className='grid gap-6 p-4 md:p-5 lg:p-6'>
      <div className='space-y-6'>
        {[...Array(3)].map((_, i) => (
          <div key={i} className='animate-pulse'>
            <div className='group relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border bg-white shadow-md'>
              <div className='mx-auto w-full max-w-7xl p-6'>
                <div className='flex flex-col gap-6 lg:flex-row lg:items-end'>
                  {/* 좌측 상품 정보 */}
                  <div className='flex-1 space-y-6'>
                    <div className='flex gap-4'>
                      <div className='h-20 w-20 flex-shrink-0 rounded-xl bg-gray-200' />
                      <div className='min-w-0 flex-1'>
                        <div className='mb-2 h-6 w-48 rounded bg-gray-200' />
                        <div className='grid grid-cols-1 gap-3 text-sm sm:grid-cols-2'>
                          <div className='h-4 w-32 rounded bg-gray-200' />
                          <div className='h-4 w-24 rounded bg-gray-200' />
                        </div>
                      </div>
                    </div>

                    {/* 주문 정보 */}
                    <div className='grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2'>
                      <div className='space-y-1'>
                        <div className='h-4 w-16 rounded bg-gray-200' />
                        <div className='h-4 w-24 rounded bg-gray-200' />
                      </div>
                      <div className='space-y-1'>
                        <div className='h-4 w-20 rounded bg-gray-200' />
                        <div className='h-4 w-28 rounded bg-gray-200' />
                      </div>
                    </div>
                  </div>

                  {/* 우측 액션 버튼 */}
                  <div className='flex-shrink-0 lg:min-w-[200px]'>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='h-8 rounded bg-gray-200' />
                      <div className='h-8 rounded bg-gray-200' />
                    </div>
                  </div>
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

// 3. 북마크 페이지 스켈레톤 (상품/게시글 공통)
function BookmarkSkeletonUI() {
  return (
    <div className='grid gap-6 p-4 md:p-5 lg:p-6'>
      <div className='grid gap-8'>
        {[...Array(3)].map((_, i) => (
          <div key={i} className='animate-pulse'>
            <div className='group relative mx-auto w-full max-w-6xl cursor-pointer rounded-2xl bg-white p-3 shadow-sm'>
              {/* 모바일 삭제 버튼 */}
              <div className='absolute top-3 right-3 z-10 md:hidden'>
                <div className='h-8 w-8 rounded bg-gray-200' />
              </div>

              <div className='grid grid-cols-1 items-center gap-4 md:grid-cols-[auto_1fr_auto] md:gap-6'>
                {/* 이미지 */}
                <div className='grid place-items-center'>
                  <div className='aspect-square w-[12.5rem]'>
                    <div className='h-full w-full rounded-xl border bg-gray-200' />
                  </div>
                </div>

                {/* 콘텐츠 정보 섹션 */}
                <div className='flex h-full flex-col justify-between gap-2'>
                  {/* 제목/상품명 */}
                  <div className='grid justify-items-start'>
                    <div className='h-4 w-12 rounded bg-gray-200' />
                    <div className='h-6 w-48 rounded bg-gray-200' />
                  </div>

                  {/* 내용/가격 */}
                  <div className='grid justify-items-start'>
                    <div className='h-4 w-8 rounded bg-gray-200' />
                    <div className='h-4 w-32 rounded bg-gray-200' />
                  </div>

                  {/* 상품 설명 또는 게시글 메타 정보 */}
                  <div className='grid justify-items-start'>
                    <div className='h-4 w-16 rounded bg-gray-200' />
                    <div className='h-4 w-full max-w-md rounded bg-gray-200' />
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className='flex h-full min-w-[12.5rem] flex-col items-end justify-between gap-3'>
                  {/* 데스크탑 삭제 버튼 (상단) */}
                  <div className='hidden flex-col gap-3 md:flex'>
                    <div className='h-8 w-20 rounded bg-gray-200' />
                  </div>

                  {/* 하단 액션 버튼들 - 상품용(가로 2개) / 게시글용(세로 1개) */}
                  <div className='flex w-full flex-row gap-3'>
                    <div className='h-8 flex-1 rounded bg-gray-200' />
                    <div className='h-8 flex-1 rounded bg-gray-200' />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className='mt-6 flex justify-center'>
        <div className='h-10 w-64 animate-pulse rounded bg-gray-200' />
      </div>
    </div>
  );
}

// 4. 내정보 페이지 스켈레톤
function ProfileSkeletonUI() {
  return (
    <div className='bg-surface min-h-screen'>
      <div className='mx-auto max-w-2xl p-6'>
        {/* 헤더 */}
        <div className='mb-8'>
          <div className='t-h2 mb-2 h-8 w-32 animate-pulse rounded bg-gray-200' />
          <div className='t-desc h-5 w-48 animate-pulse rounded bg-gray-200' />
        </div>

        {/* 프로필 카드*/}
        <div className='mb-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm'>
          <div className='mb-8 flex items-center space-x-6'>
            <div className='relative'>
              {/* 프로필 이미지 */}
              <div className='size-20 animate-pulse rounded-full bg-gray-200 ring-4 ring-gray-100' />
              <div className='absolute -right-1 -bottom-1 size-8 animate-pulse rounded-full bg-gray-200' />
            </div>
            <div className='flex-1'>
              <div className='t-h3 mb-1 h-6 w-32 animate-pulse rounded bg-gray-200' />
              <div className='t-body mb-2 h-5 w-48 animate-pulse rounded bg-gray-200' />
              <div className='t-small flex items-center gap-2'>
                <div className='size-4 animate-pulse rounded bg-gray-200' />
                <div className='h-4 w-24 animate-pulse rounded bg-gray-200' />
              </div>
            </div>
          </div>

          {/* 개인정보 섹션 */}
          <div className='space-y-6'>
            <div className='t-h4 mb-4 h-6 w-20 animate-pulse rounded bg-gray-200' />
            <div className='space-y-5'>
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className='t-small mb-5 flex items-center gap-3'>
                    <div className='size-4 animate-pulse rounded bg-gray-200' />
                    <div className='h-4 w-16 animate-pulse rounded bg-gray-200' />
                  </div>
                  <div className='t-body h-12 w-full animate-pulse rounded-xl border border-gray-200 bg-gray-50' />
                  <div className='min-h-[1.5rem]' />
                </div>
              ))}
            </div>
            {/* 저장 버튼 영역 */}
            <div className='flex justify-end pt-2'>
              <div className='h-9 w-16 animate-pulse rounded-md bg-gray-200 px-4' />
            </div>
          </div>
        </div>

        {/* 계정 설정 카드 */}
        <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
          <div className='border-b border-gray-200 px-8 py-6'>
            <div className='t-h4 h-6 w-24 animate-pulse rounded bg-gray-200' />
          </div>

          <div className='divide-y divide-gray-200 bg-white'>
            {/* 비밀번호 변경 */}
            <div className='flex h-auto w-full items-center justify-between px-8 py-6'>
              <div className='flex-1'>
                <div className='t-body mb-1 h-5 w-32 animate-pulse rounded bg-gray-200' />
                <div className='t-small h-4 w-48 animate-pulse rounded bg-gray-200' />
              </div>
              <div className='size-5 animate-pulse rounded bg-gray-200' />
            </div>

            {/* 이메일 알림 */}
            <div className='flex h-auto w-full items-center justify-between border-t border-gray-100 px-8 py-6 opacity-50'>
              <div className='flex-1'>
                <div className='t-body mb-1 h-5 w-24 animate-pulse rounded bg-gray-200' />
                <div className='t-small h-4 w-56 animate-pulse rounded bg-gray-200' />
              </div>
            </div>

            {/* 계정 삭제 */}
            <div className='flex h-auto w-full items-center justify-between border-t border-gray-100 px-8 py-6 opacity-50'>
              <div className='flex-1'>
                <div className='t-body mb-1 h-5 w-20 animate-pulse rounded bg-gray-200' />
                <div className='t-small h-4 w-52 animate-pulse rounded bg-gray-200' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyPageLoading() {
  const pathname = usePathname();

  // 현재 경로에 따라 적절한 스켈레톤 UI 표시
  if (pathname.startsWith('/my-page/order-history')) {
    return <OrderHistorySkeletonUI />;
  }

  if (pathname.startsWith('/my-page/bookmarks')) {
    return <BookmarkSkeletonUI />;
  }

  if (pathname.startsWith('/my-page/profile')) {
    return <ProfileSkeletonUI />;
  }

  // 기본값: 내 반려식물 페이지 (마이페이지 기본)
  return <MyPlantsSkeletonUI />;
}
