import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import MyPageNav from './_components/MyPageNav';

export default async function MyPageLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  if (!cookieStore.get('user-auth')) {
    redirect('/login');
  }
  return (
    <section className='bg-surface flex min-h-screen flex-col p-4 md:p-6 lg:p-8'>
      <MyPageNav />
      <div>{children}</div>
    </section>
  );
}
