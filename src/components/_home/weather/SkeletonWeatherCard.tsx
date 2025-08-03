'use client';

export default function SkeletonWeatherCard() {
  return (
    <div className='w-full animate-pulse'>
      {/* 메인 카드 스켈레톤 */}
      <div className='relative min-w-[21rem] overflow-hidden rounded-xl bg-stone-200 shadow-md md:min-w-[48rem] lg:min-w-[64rem]'>
        <div className='absolute inset-0 rounded-xl bg-stone-300/20' />

        <div className='relative h-full rounded-xl p-4'>
          <div className='grid h-full grid-cols-1 gap-4 md:grid-cols-2'>
            {/* 날씨 정보 */}
            <div className='flex min-w-[200px] flex-col items-center justify-center'>
              {/* 도시명과 위치 아이콘 */}
              <div className='mb-3 flex flex-row items-center gap-3'>
                <div className='h-5 w-5 rounded bg-slate-400 md:h-6 md:w-6' />
                <div className='h-7 w-24 rounded bg-slate-400 md:h-8 md:w-28' />
              </div>

              {/* 날씨 설명, 온도, 아이콘 */}
              <div className='mb-3 flex flex-row items-center gap-3'>
                <div className='h-6 w-16 rounded bg-slate-400' />
                <div className='h-6 w-12 rounded bg-stone-300' />
                <div className='h-12 w-12 rounded bg-stone-300 md:h-16 md:w-16' />
              </div>

              {/* 습도와 풍속 */}
              <div className='flex min-w-[180px] flex-row items-center justify-center gap-6'>
                <div className='flex items-center gap-2'>
                  <div className='h-4 w-4 rounded bg-slate-400' />
                  <div className='h-4 w-10 rounded bg-stone-300' />
                </div>
                <div className='flex items-center gap-2'>
                  <div className='h-4 w-4 rounded bg-slate-400' />
                  <div className='h-4 w-14 rounded bg-stone-300' />
                </div>
              </div>
            </div>

            {/* 식물 팁 정보 */}
            <div className='min-w-[250px] rounded-lg bg-stone-100 p-5 md:min-w-[280px]'>
              {/* 팁 제목 */}
              <div className='mb-3 h-5 w-36 rounded bg-slate-400 md:h-6 md:w-40' />

              {/* 팁 내용 */}
              <div className='mb-4 space-y-2'>
                <div className='h-4 w-full rounded bg-stone-300' />
                <div className='h-4 w-11/12 rounded bg-stone-200' />
              </div>

              {/* 추천 식물 제목 */}
              <div className='mb-3 h-5 w-20 rounded bg-slate-400 md:h-6 md:w-24' />

              {/* 추천 식물 태그들 */}
              <div className='flex min-h-[32px] flex-wrap gap-2 md:gap-3'>
                <div className='h-7 w-16 rounded-full bg-stone-300 md:h-8 md:w-20' />
                <div className='h-7 w-20 rounded-full bg-stone-200 md:h-8 md:w-24' />
                <div className='h-7 w-14 rounded-full bg-stone-200 md:h-8 md:w-18' />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className='mt-4 flex min-h-[40px] justify-end'>
        <div className='h-9 w-32 rounded bg-stone-300 md:h-10 md:w-36 lg:h-11 lg:w-40' />
      </div>
    </div>
  );
}
