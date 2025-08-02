import Notice from '@/app/notice';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import '@/styles/globals.css';
import localFont from 'next/font/local';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Green Mate',
  description: 'Green Mate',
  icons: {
    icon: '/favicon.svg',
  },
};

const pretendard = localFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ko' className={pretendard.variable}>
      <body className={`${pretendard.className} bg-surface`}>
        <Notice />
        <Header />
        <main>
          <Toaster
            position='top-center'
            richColors={true}
            theme='light'
            closeButton={false}
            toastOptions={{
              duration: 2500,
              style: {
                fontFamily: 'var(--font-pretendard)',
              },
            }}
          />
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
