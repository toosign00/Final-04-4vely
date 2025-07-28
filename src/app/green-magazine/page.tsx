'use client';

import MagazineCard from '@/app/green-magazine/_components/MagazineCard';
import PaginationWrapper from '@/components/ui/PaginationWrapper';
import { useState } from 'react';

// 더미 데이터
const greenMagazineItems = [
  {
    _id: 1,
    type: 'magazine',
    title: '해피트리, 물 주는 타이밍이 중요해요',
    content: '잎이 처지거나 노랗게 변하셨나요? 해피트리는 과습에 민감한 식물입니다. 물 주는 빈도보다, “흙이 마른 시점”을 기준으로 판단하는 것이 핵심입니다.',
    image: '/images/acadia_palenopsis_orchid.webp',
    createdAt: '2025.07.10 10:15:20',
    updatedAt: '2025.07.11 09:00:00',
    bookmarks: 12,
    myBookmarkId: null,
    views: 123,
    user: {
      _id: 1,
      name: '테스트 관리자',
      email: 'admin@market.com',
      // image: 'files/febc13-final04-emjf/user_test01.webp',
      image: '/favicon.svg',
    },
    extra: {
      contents: [
        {
          content: '해피트리는 과습에 특히 민감해요. 흙을 손가락으로 만졌을 때 촉촉하지 않다면, 그때 물을 주세요.',
          postImage: '/images/acadia_palenopsis_orchid.webp',
        },
        {
          content: '잎이 처진다면 과습의 신호일 수 있어요. 뿌리 썩음을 방지하려면 물빠짐 좋은 화분을 사용하세요.',
          postImage: '/images/acadia_palenopsis_orchid.webp',
        },
      ],
    },
  },
  {
    _id: 2,
    type: 'magazine',
    title: '화분은 어디에 두는 게 좋을까요?',
    content: '빛의 방향, 창문의 위치, 에어컨 바람까지… 식물은 단순히 빛만 있으면 되는 게 아닙니다. 집 구조를 고려한 최적의 배치 전략을 소개합니다.',
    image: '/images/baby_gomu.webp',
    createdAt: '2025.07.12 14:40:03',
    updatedAt: '2025.07.13 08:30:10',
    bookmarks: 9,
    myBookmarkId: null,
    views: 87,
    user: {
      _id: 1,
      name: '테스트 관리자',
      email: 'admin@market.com',
      // image: 'files/febc13-final04-emjf/user_test01.webp',
      image: '/favicon.svg',
    },
    extra: {
      contents: [
        {
          content: '창문 근처라도 직광은 피하고 간접광이 드는 곳이 좋아요.',
          postImage: '/images/baby_gomu.webp',
        },
      ],
    },
  },
  {
    _id: 3,
    type: 'magazine',
    title: '식물도 밤에는 쉬고 싶어해요',
    content: '낮과 밤의 온도 차, 인공조명의 영향까지 생각해 본 적 있으신가요? 식물의 생체리듬에 맞춘 야간 관리 습관으로 더 건강하게 키워보세요.',
    image: '/images/aglaonema_siam_black.webp',
    createdAt: '2025.07.15 08:05:12',
    updatedAt: '2025.07.15 22:20:00',
    bookmarks: 7,
    myBookmarkId: null,
    views: 69,
    user: {
      _id: 1,
      name: '테스트 관리자',
      email: 'admin@market.com',
      // image: 'files/febc13-final04-emjf/user_test01.webp',
      image: '/favicon.svg',
    },
    extra: {
      contents: [
        {
          content: '밤에도 조명을 켜두면 식물이 스트레스를 받을 수 있어요.',
          postImage: '/images/aglaonema_siam_black.webp',
        },
      ],
    },
  },
  {
    _id: 4,
    type: 'magazine',
    title: '초보자를 위한 실내 식물 추천',
    content: '물을 자주 주지 않아도 잘 자라는 식물들이 있습니다. 관리가 쉬우면서도 인테리어 효과까지 주는 식물들을 소개합니다.',
    image: '/images/olive_tree_gray.webp',
    createdAt: '2025.07.17 19:22:45',
    updatedAt: '2025.07.18 10:10:45',
    bookmarks: 15,
    myBookmarkId: null,
    views: 152,
    user: {
      _id: 1,
      name: '테스트 관리자',
      email: 'admin@market.com',
      // image: 'files/febc13-final04-emjf/user_test01.webp',
      image: '/favicon.svg',
    },
    extra: {
      contents: [
        {
          content: '스투키, 산세베리아, 아이비 등은 초보자에게 적합한 식물이에요.',
          postImage: '/images/olive_tree_gray.webp',
        },
      ],
    },
  },
  {
    _id: 5,
    type: 'magazine',
    title: '식물의 휴식 시간도 중요해요',
    content: '물, 햇빛 못지않게 식물에게는 “쉼”도 필요합니다. 잠시라도 어둡고 조용한 환경을 제공해보세요.',
    image: '/images/alocasia_polly_black.webp',
    createdAt: '2025.07.20 11:55:08',
    updatedAt: '2025.07.20 15:40:00',
    bookmarks: 6,
    myBookmarkId: null,
    views: 41,
    user: {
      _id: 1,
      name: '테스트 관리자',
      email: 'admin@market.com',
      // image: 'files/febc13-final04-emjf/user_test01.webp',
      image: '/favicon.svg',
    },
    extra: {
      contents: [
        {
          content: '낮 시간 동안 충분히 빛을 받은 식물은 밤에는 어둠 속에서 회복하는 시간을 가져요.',
          postImage: '/images/alocasia_polly_black.webp',
        },
      ],
    },
  },
];

export default function GreenMagazinePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 4;

  // 현재 페이지에 표시할 게시글 목록 수
  const currentItems = greenMagazineItems.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  // 전체 페이지 수
  const totalPages = Math.ceil(greenMagazineItems.length / PER_PAGE);

  return (
    <section className='text-secondary mx-auto w-full max-w-[75rem] place-self-center p-4 md:p-6 lg:p-8'>
      {/* 제목 */}
      <p className='text-sm md:text-base lg:text-lg'>| Green Magazine</p>
      <h1 className='mt-2 mb-6 text-lg font-semibold md:text-2xl lg:text-3xl'>Green Magazine</h1>

      {/* 카드 리스트 */}
      <div className='flex flex-col gap-8'>
        {currentItems.map((post) => (
          <MagazineCard key={post._id} post={post} />
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className='mt-10'>
        <PaginationWrapper currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
      </div>
    </section>
  );
}
