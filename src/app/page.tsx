import hero from '@/assets/images/hero.webp';
import CommunityPop from '@/components/_home/CommunityPop';
import GreenMagazineSection from '@/components/_home/green-magazine/GreenMagazineSection';
import NewProductSection from '@/components/_home/new-product/NewProductSection';
import ReviewCarousel from '@/components/_home/ReviewCarousel';
import WeatherWidget from '@/components/_home/WeatherWidget';
import { getReviewPopPosts } from '@/lib/functions/home/getReviewPopPosts';
import Image from 'next/image';

export default async function Home() {
  const reviews = await getReviewPopPosts();

  return (
    // gap-15
    <div className='text-secondary flex flex-col md:text-2xl lg:text-3xl'>
      {/* 배너 이미지 - 임시 */}
      <Image className='mb-4 h-[13rem] w-full border-4 object-cover md:h-[15rem] lg:h-[19.75rem]' src={hero} alt='배너 이미지' priority />
      {/* 배너 영상 - 임시 */}
      {/* <section className='relative h-[13rem] w-full md:h-[17rem] lg:h-[25rem]'>
        <iframe className='pointer-events-none h-full w-full' src='https://www.youtube.com/embed/V2voCiBjqdU?autoplay=1&mute=1&loop=1&controls=0&playlist=V2voCiBjqdU' title='배너 영상' allow='autoplay; encrypted-media' allowFullScreen />
      </section> */}

      {/* 날씨 정보 */}
      <WeatherWidget />

      {/* New Product */}
      <NewProductSection />

      {/* Green Magazine (최신순 기준) */}
      <GreenMagazineSection />

      {/* 인기 반려 식물 (커뮤니티 -> 조회수 기준) */}
      <CommunityPop />

      {/* 사용자의 생생한 후기*/}
      <ReviewCarousel reviews={reviews} />
    </div>
  );
}
