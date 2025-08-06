// 북마크 페이지 스켈레톤 (상품/게시글 공통)
export default function BookmarkSkeletonUI() {
  return (
    <div className='grid gap-6 p-4 md:p-5 lg:p-6'>
      <div className='grid gap-8'>
        {[...Array(3)].map((_, i) => (
          <div key={i} className='animate-pulse'>
            <div className='group relative mx-auto w-full max-w-6xl rounded-2xl bg-white p-3 shadow-sm'>
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
