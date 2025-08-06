import MyPageNav from './_components/MyPageNav';

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className='bg-surface flex min-h-screen flex-col overflow-hidden p-4 md:p-6 lg:p-8'>
      <MyPageNav />
      <div>{children}</div>
    </section>
  );
}
