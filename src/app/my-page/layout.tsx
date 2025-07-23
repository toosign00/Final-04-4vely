import { getUserFromCookie } from '@/lib/utils/auth.server';
import { redirect } from 'next/navigation';
import MyPageNav from './_components/MyPageNav';

export default async function MyPageLayout({ children }: { children: React.ReactNode }) {
  const user = await getUserFromCookie();
  if (!user) {
    redirect('/login'); // 로그인하지 않은 상태에서는 로그인 페이지로 리다이렉트
  }
  return (
    <section className='bg-surface flex min-h-screen flex-col p-4 md:p-6 lg:p-8'>
      <MyPageNav />
      <div>{children}</div>
    </section>
  );
}
