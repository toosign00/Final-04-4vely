export default function AnalyticsPage() {
  return (
    <div className='bg-surface flex min-h-screen flex-col items-center justify-center p-8'>
      <div className='mx-auto max-w-2xl text-center'>
        <h1 className='text-secondary mb-6 text-4xl font-bold'>📊 분석 대시보드</h1>

        <div className='space-y-4'>
          <p className='text-secondary text-lg'>매출, 주문, 사용자 행동 등 다양한 데이터를 분석할 수 있는 페이지입니다.</p>

          <div className='border-gary-300 mt-6 border-t pt-4'>
            <p className='text-surface0 text-sm'>💡 이 영역에서 분석 기능을 개발해주세요</p>
          </div>
        </div>
      </div>
    </div>
  );
}
