import Link from 'next/link';

export default function Home() {
  return (
    <div className='flex h-screen flex-col items-center justify-center'>
      <h1 className='mb-4 text-5xl font-bold text-neutral-800'>Final-04-4vely</h1>

      <p className='mb-8 text-xl font-medium text-neutral-700'>메인 페이지입니다</p>

      <Link href='/navigation' className='rounded-lg bg-green-500 px-6 py-3 font-semibold text-neutral-50 shadow-md transition-colors duration-200 hover:bg-green-700 hover:shadow-lg'>
        네비게이션으로 이동
      </Link>
    </div>
  );
}
