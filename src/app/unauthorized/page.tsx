import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import UnauthorizedClient from './_components/UnauthorizedClient';

export default async function UnauthorizedPage() {
  const cookieStore = await cookies();
  const fromMiddleware = cookieStore.get('from-middleware');

  // 쿠키가 없으면 홈으로 리다이렉트
  if (!fromMiddleware) {
    redirect('/');
  }
  return (
    <div className='bg-surface flex min-h-screen items-center justify-center p-4 md:p-6 lg:p-8'>
      <UnauthorizedClient />
    </div>
  );
}
