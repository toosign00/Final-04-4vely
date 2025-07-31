// 내정보 페이지 스켈레톤
export default function ProfileSkeletonUI() {
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
