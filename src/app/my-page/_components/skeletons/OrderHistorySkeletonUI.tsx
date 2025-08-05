// 주문내역 페이지 스켈레톤 (세로 리스트)
export default function OrderHistorySkeletonUI() {
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
