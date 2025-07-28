import hero from '@/assets/images/hero.webp';
import CommunityPop from '@/components/_home/CommunityPop';
import { GreenMagazineCarousel } from '@/components/_home/GreenMagazineCarousel';
import NewProductSection from '@/components/_home/NewProductSection';
import ReviewCarousel from '@/components/_home/ReviewCarousel';
import WeatherWidget from '@/components/_home/WeatherWidget';
import Image from 'next/image';

export default function Home() {
  // 신상품 리스트
  const newProductList = [
    {
      _id: 1,
      name: '히비스커스',
      image: '/images/hibiscus_white.webp',
      price: 18000,
      isNew: true,
    },
    {
      _id: 2,
      name: '고양이 야자수',
      image: '/images/cat_palm_gray.webp',
      price: 25000,
      isNew: true,
    },
    {
      _id: 3,
      name: '버건디 고무나무',
      image: '/images/burgundy_rubber_tree_blue.webp',
      price: 28000,
      isNew: true,
    },
    {
      _id: 4,
      name: '아프리칸 바이올렛',
      image: '/images/african_violet_black.webp',
      price: 20000,
      isNew: true,
    },
  ];

  // GreenMagazine 콘텐츠
  const greenMagazineItems = [
    {
      image: '/images/acadia_palenopsis_orchid.webp',
      title: '해피트리, 물 주는 타이밍이 중요해요',
      content: '잎이 처지거나 노랗게 변하셨나요? 해피트리는 과습에 민감한 식물입니다. 물 주는 빈도보다, “흙이 마른 시점”을 기준으로 판단하는 것이 핵심입니다.',
      href: '/green-magazine/happy-tree-watering',
    },
    {
      image: '/images/baby_gomu.webp',
      title: '화분은 어디에 두는 게 좋을까요?',
      content: '빛의 방향, 창문의 위치, 에어컨 바람까지… 식물은 단순히 빛만 있으면 되는 게 아닙니다. 집 구조를 고려한 최적의 배치 전략을 소개합니다.',
      href: '/green-magazine/plant-positioning',
    },
    {
      image: '/images/aglaonema_siam_black.webp',
      title: '식물도 밤에는 쉬고 싶어해요',
      content: '낮과 밤의 온도 차, 인공조명의 영향까지 생각해 본 적 있으신가요? 식물의 생체리듬에 맞춘 야간 관리 습관으로 더 건강하게 키워보세요.',
      href: '/green-magazine/plant-night-care',
    },
    {
      image: '/images/olive_tree_gray.webp',
      title: '초보자를 위한 실내 식물 추천',
      content: '물을 자주 주지 않아도 잘 자라는 식물들이 있습니다. 관리가 쉬우면서도 인테리어 효과까지 주는 식물들을 소개합니다.',
      href: '/green-magazine/easy-indoor-plants',
    },
    {
      image: '/images/alocasia_polly_black.webp',
      title: '식물의 휴식 시간도 중요해요',
      content: '물, 햇빛 못지않게 식물에게는 “쉼”도 필요합니다. 잠시라도 어둡고 조용한 환경을 제공해보세요.',
      href: '/green-magazine/plant-break-time',
    },
  ];

  // 커뮤니티 인기 반려 식물
  const popularPosts = [
    {
      id: 1,
      title: '우리집 몬스테라 자랑해요',
      description: '새 잎이 났어요! 너무 귀엽고 예뻐서 자랑하고 싶어요 🌱 새 잎이 났어요! 너무 귀엽고 예뻐서 자랑하고 싶어요 🌱',
      image: '/images/olive_tree_gray.webp',
      userName: '식물마스터',
      avatar: 'https://avatars.githubusercontent.com/u/127032516?v=4',
      likes: 132,
      comments: 18,
      views: 287,
      timeAgo: '2일 전',
      href: '/community',
      fallback: '사용자',
    },
    {
      id: 2,
      title: '고무나무 키우는 꿀팁!',
      description: '잎이 쳐지지 않게 하려면 물 주는 시기와 햇빛이 정말 중요해요. 공유해요! 잎이 쳐지지 않게 하려면 물 주는 시기와 햇빛이 정말 중요해요. 공유해요!',
      image: '/images/baby_gomu.webp',
      userName: '초록매실',
      avatar: 'https://avatars.githubusercontent.com/u/198023872?v=4',
      likes: 198,
      comments: 25,
      views: 402,
      timeAgo: '3일 전',
      href: '/community',
      fallback: '사용자',
    },
    {
      id: 3,
      title: '선인장 꽃 피운 날 🌵🌸',
      description: '거의 1년 만에 꽃을 피운 우리집 선인장, 너무 감동이에요! 거의 1년 만에 꽃을 피운 우리집 선인장, 너무 감동이에요!',
      image: '/images/baltic_blue_pothos_black.webp',
      userName: '선인장덕후',
      avatar: 'https://avatars.githubusercontent.com/u/197995808?v=4',
      likes: 154,
      comments: 12,
      views: 330,
      timeAgo: '1일 전',
      href: '/community',
      fallback: '사용자',
    },
    {
      id: 4,
      title: '꽃 피운 스투키 보고 가세요',
      description: '드디어 우리 스투키에서 꽃이 피었어요! 감동 그 자체입니다. 드디어 우리 스투키에서 꽃이 피었어요! 감동 그 자체입니다.',
      image: '/images/aglaonema_siam_black.webp',
      userName: '쑥쑥이',
      avatar: 'https://avatars.githubusercontent.com/u/163831171?v=4',
      likes: 154,
      comments: 20,
      views: 321,
      timeAgo: '2일 전',
      href: '/community',
      fallback: '사용자',
    },
  ];

  // 상품 리뷰
  const reviews = [
    {
      id: 1,
      productName: '히비스커스',
      productImg: '/images/hibiscus_white.webp',
      avatarImg: 'https://avatars.githubusercontent.com/u/198023872?v=4',
      userName: '호정',
      fallback: '사용자',
      content:
        '히비스커스는 꽃이 정말 화사해서 집 안이 한층 밝아졌어요. 매일 아침 꽃이 피는 걸 보는 재미가 쏠쏠합니다. 햇빛을 좋아해서 창가에 두었더니 무럭무럭 잘 자라더라고요. 특히 물만 잘 주면 별다른 관리는 필요 없어서 바쁜 직장인에게도 잘 맞아요. 꽃이 질 때마다 새로운 꽃봉오리가 올라오는 게 너무 신기하고 예뻐요.',
    },
    {
      id: 2,
      productName: '아프리칸 바이올렛',
      productImg: '/images/african_violet_black.webp',
      avatarImg: 'https://avatars.githubusercontent.com/u/163831171?v=4',
      userName: '준환',
      fallback: '사용자',
      content:
        '처음 키우는 식물인데도 쉽게 적응했어요. 햇빛은 직접 쬐지 않아도 간접광이면 충분히 자라고, 작은 잎이 빽빽하게 자라는 게 너무 귀여워요. 물을 줄 때마다 잎에 닿지 않도록 주의만 하면 병 없이 건강하게 잘 큽니다. 진한 보라색 꽃이 피면 방 안 분위기가 확 바뀌어요. 인테리어 효과도 정말 좋아요.',
    },
    {
      id: 3,
      productName: '버건디 고무나무',
      productImg: '/images/burgundy_rubber_tree_blue.webp',
      avatarImg: 'https://avatars.githubusercontent.com/u/197995808?v=4',
      userName: '상호',
      fallback: '사용자',
      content:
        '버건디 색의 잎이 너무 멋져서 바로 반했습니다. 다른 식물들과 다르게 어두운 잎 컬러가 고급스러운 느낌이에요. 물은 한 번 주고 오래 두어도 되고, 통풍만 잘 되면 크게 신경 안 써도 돼요. 초보자지만 너무 쉽게 키우고 있어요. 이 식물 덕분에 거실이 훨씬 세련돼 보입니다.',
    },
    {
      id: 4,
      productName: '물뿌리개',
      productImg: '/images/watering_can.webp',
      avatarImg: 'https://avatars.githubusercontent.com/u/127032516?v=4',
      userName: '현수',
      fallback: '사용자',
      content:
        '식물 물 주는 용도로 샀는데, 디자인이 예뻐서 소품처럼도 사용하고 있어요. 작은 입구 덕분에 흙이 튀지 않고 원하는 곳에만 물을 줄 수 있어서 편해요. 내열성도 좋아서 따뜻한 물을 써도 문제 없고, 가볍고 손잡이도 안정적입니다. 인테리어와 실용성을 모두 잡은 제품이에요!',
    },
  ];

  return (
    <div className='text-secondary flex flex-col gap-15 md:text-2xl lg:text-3xl'>
      {/* 배너 이미지 - 임시 */}
      <Image className='mb-4 h-[13rem] w-full border-4 object-cover md:h-[15rem] lg:h-[19.75rem]' src={hero} alt='배너 이미지' priority />
      {/* 배너 영상 - 임시 */}
      {/* <section className='relative h-[13rem] w-full md:h-[17rem] lg:h-[25rem]'>
        <iframe className='pointer-events-none h-full w-full' src='https://www.youtube.com/embed/V2voCiBjqdU?autoplay=1&mute=1&loop=1&controls=0&playlist=V2voCiBjqdU' title='배너 영상' allow='autoplay; encrypted-media' allowFullScreen />
      </section> */}

      {/* 날씨 정보 - API 연결 필요 */}
      <WeatherWidget />

      {/* 신상품 - 상품페이지의 신상품과 연결 필요 */}
      <NewProductSection newProductList={newProductList} />

      {/* Green Magazine - 매거진 페이지의 데이터와 연동 필요 */}
      <GreenMagazineCarousel greenMagazineItems={greenMagazineItems} />

      {/* 인기 반려 식물 게시글 */}
      <CommunityPop popularPosts={popularPosts} />

      {/* 리뷰 */}
      <ReviewCarousel reviews={reviews} />
    </div>
  );
}
