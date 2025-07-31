// 1. 내 반려식물 페이지 스켈레톤 (2x2 그리드)
export default function MyPlantsSkeletonUI() {
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
