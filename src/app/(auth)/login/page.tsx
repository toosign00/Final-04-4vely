export default function LoginPage() {
  return (
    <div className='bg-surface flex min-h-screen flex-col items-center justify-center p-8'>
      <div className='mx-auto max-w-2xl text-center'>
        <h1 className='text-secondary mb-6 text-4xl font-bold'>🔐 로그인</h1>

        <div className='space-y-4'>
          <p className='text-secondary text-lg'>계정에 로그인하여 서비스를 이용할 수 있는 페이지입니다.</p>

          <div className='border-gary-300 mt-6 border-t pt-4'>
            <p className='text-surface0 text-sm'>💡 이 영역에서 로그인 기능을 개발해주세요</p>
          </div>
        </div>
      </div>
    </div>
  );
}
