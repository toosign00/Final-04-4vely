import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';

export default function FooterPage() {
  return (
    <div>
      <Header />

      <div className='flex min-h-screen items-center justify-center bg-[#F3F1EA]'>
        <h3 className='t-h3 text-color-[#3D3D3D]'>콘텐츠입니다~ 헤더와 푸터가 있습니다~~~~</h3>
      </div>
      <Footer />
    </div>
  );
}
