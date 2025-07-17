import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import '@/styles/globals.css';
import localFont from 'next/font/local';

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
        <Header />
        <main className='p-8'>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
