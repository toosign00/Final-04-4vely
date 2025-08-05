import MagazineListWrapper from '@/app/green-magazine/_components/MagazineListWrapper';
import { fetchMagazine } from '@/lib/functions/greenmagazine/fetchMagazine';

interface MagazinePageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

// Green Magazine 메인 페이지
export default async function GreenMagazinePage({ searchParams }: MagazinePageProps) {
  const { page } = await searchParams;

  // page 숫자로 변환
  const currentPage = Number(page) || 1;

  // 한 페이지에 표시할 게시물 수
  const limit = 4;

  // 순서대로 type: magazine, currentPage: 현재 페이지 번호, limit: 페이지당 항목 개수
  const res = await fetchMagazine('magazine', currentPage, limit);

  if (!res.ok || !res.item) {
    throw new Error('Green Magazine 데이터를 불러오지 못했습니다.');
  }

  return (
    <section className='text-secondary mx-auto w-full max-w-[75rem] place-self-center p-4 md:p-6 lg:p-8'>
      {/* 제목 */}
      <p className='text-sm md:text-base lg:text-lg'>| Green Magazine</p>
      <h1 className='mt-2 mb-6 text-lg font-semibold md:text-2xl lg:text-3xl'>Green Magazine</h1>
      {/* 게시물 리스트 & 페이지네이션 */}
      <MagazineListWrapper items={res.item} pagination={res.pagination} />
    </section>
  );
}
