import { Plant, PlantPost } from '@/lib/actions/plantActions';

/**
 * 날짜 문자열을 YYYY.MM.DD 형식으로 통일하는 함수
 * @param dateString - 변환할 날짜 문자열 (ISO 형식 또는 이미 YYYY.MM.DD 형식)
 * @returns YYYY.MM.DD 형식의 날짜 문자열
 */
export function formatDateString(dateString: string): string {
  if (!dateString) return '';

  // 이미 YYYY.MM.DD 형식인 경우 (일지 작성 시)
  if (/^\d{4}\.\d{2}\.\d{2}$/.test(dateString)) {
    return dateString;
  }

  // ISO 형식인 경우 (식물 등록 시) - 시간 정보 제거하고 형식 변환
  if (dateString.includes('T') || dateString.includes('-')) {
    return dateString.split('T')[0].replace(/-/g, '.');
  }

  // YYYY.MM.DD HH:mm:ss 형식인 경우 시간 부분 제거
  if (/^\d{4}\.\d{2}\.\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(dateString)) {
    return dateString.split(' ')[0];
  }

  return dateString;
}

/**
 * 서버 API 응답의 PlantPost를 클라이언트에서 사용하는 Plant 타입으로 변환
 * @description API 원본 데이터 구조를 UI에서 사용하기 편한 형태로 매핑 (이미지 경로는 서버에서 이미 보정됨)
 * @param {PlantPost} post - 서버에서 받은 식물 게시물 원본 데이터 (이미지 경로 보정 완료)
 * @returns {Plant} 클라이언트 UI에서 사용할 수 있는 변환된 식물 데이터
 * @example
 * ```typescript
 * const plantPost: PlantPost = {
 *   _id: 1,
 *   title: '내 식물',
 *   content: '예쁜 식물입니다',
 *   image: 'https://api.example.com/uploads/plant1.jpg', // 서버에서 이미 보정된 완전한 URL
 *   extra: { species: '몰스테라', location: '거실' },
 *   createdAt: '2024-01-01T12:00:00Z'
 * };
 * const plant = mapPlantPostToPlant(plantPost);
 * // { id: 1, name: '내 식물', species: '몰스테라', ... }
 * ```
 * @validation 필수 필드가 없어도 빈 문자열로 안전하게 대체
 */
export function mapPlantPostToPlant(post: PlantPost): Plant {
  // 사용자 지정 날짜가 있으면 우선 사용, 없으면 생성일 사용
  const userDate = post.extra?.date;
  const dateToUse = userDate || post.createdAt || '';
  const formattedDate = formatDateString(dateToUse);

  return {
    id: post._id,
    name: post.title || '', // 빈 문자열 대비 안전 처리
    species: post.extra?.species || '',
    location: post.extra?.location || '',
    imageUrl: post.image || '', // 서버에서 이미 보정된 완전한 URL 사용
    date: formattedDate,
    memo: post.content || '',
    memoTitle: post.extra?.memoTitle || '', // 메모 제목
  };
}

/**
 * 여러 개의 PlantPost 배열을 Plant 배열로 일괄 변환
 * @description 식물 목록 데이터를 처리할 때 사용하는 배열 매핑 헬퍼 함수
 * @param {PlantPost[]} posts - 서버에서 받은 식물 게시물 데이터 배열
 * @returns {Plant[]} 클라이언트에서 사용할 수 있는 변환된 식물 데이터 배열
 * @example
 * ```typescript
 * const plantPosts: PlantPost[] = await getMyPlants();
 * const plants = mapPlantPostsToPlants(plantPosts);
 * // [{ id: 1, name: '...', ... }, { id: 2, name: '...', ... }]
 * ```
 * @performance 배열 map 메서드를 사용하여 대량 데이터 처리에 최적화
 * @validation 빈 배열 입력에 대해 안전하게 빈 배열 반환
 */
export function mapPlantPostsToPlants(posts: PlantPost[]): Plant[] {
  // 빈 배열 또는 undefined 입력에 대한 안전 처리
  if (!posts || !Array.isArray(posts)) {
    return [];
  }

  // 각 PlantPost를 Plant로 변환하여 새 배열 생성
  return posts.map(mapPlantPostToPlant);
}

/**
 * 식물 데이터 변환에 사용되는 유틸리티 함수들을 내보내는 모듈
 * @description PlantPost(서버 API 응답 타입)을 Plant(클라이언트 UI 타입)로 변환하는 로직 포함
 * @module plantUtils
 * @version 1.0.0
 * @since 2024-01-01
 * @exports mapPlantPostToPlant - 단일 식물 데이터 변환 함수
 * @exports mapPlantPostsToPlants - 다중 식물 데이터 변환 함수
 */
const plantUtils = {
  formatDateString,
  mapPlantPostToPlant,
  mapPlantPostsToPlants,
};

export default plantUtils;
