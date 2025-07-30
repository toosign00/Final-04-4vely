import MagazineDetailContent from '@/app/green-magazine/_components/MagazineDetailContent';
import { getBookmarkByTarget } from '@/lib/functions/bookmarkServerFunctions';
import { fetchMagazineDetail } from '@/lib/functions/greenmagazine/fetchMagazineDetail';

interface MagazineDetail {
  params: Promise<{ id: string }>;
  myBookmarkId: number;
}

// Green Magazine의 상세 페이지
export default async function GreenMagazineDetailPage({ params, myBookmarkId }: MagazineDetail) {
  const { id } = await params;

  // id 숫자로 변환
  const postId = Number(id);

  // 게시글 상세 데이터 요청
  const res = await fetchMagazineDetail(postId);

  // 북마크 데이터 요청
  const bookmark = await getBookmarkByTarget(postId, 'post');

  if (!res.ok || !res.item) {
    throw new Error('Green Magazine 상세 데이터를 불러오지 못했습니다.');
  }

  return <MagazineDetailContent post={res.item} myBookmarkId={bookmark?._id ?? null} />;
}
