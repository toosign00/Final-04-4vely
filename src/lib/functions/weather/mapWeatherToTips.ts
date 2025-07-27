'use server';

import { fetchWeather } from '@/lib/functions/weather/fetchWeather';
import { plantByWeather } from '@/lib/functions/weather/plantByWeather';
import { ProductApiData } from '@/types/product';

/**
 * 배열을 랜덤하게 섞는 함수
 */
function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * 현재 위치 기반 날씨 데이터에 따라 관리 팁과 추천 식물 반환
 *
 * @param lat - 위도
 * @param lon - 경도
 */
export async function mapWeatherToTips(lat: number, lon: number) {
  // 위치 기반의 날씨 데이터 요청
  const weatherData = await fetchWeather(lat, lon);
  if (!weatherData) {
    throw new Error('날씨 정보를 불러올 수 없습니다.');
  }

  // 날씨 정보 구조 분해
  const { temp, humidity, description, windSpeed } = weatherData;

  /** 우선순위 조건 설정
   * - key : 날씨 조건 식별자용
   * - condition : 해당 조건 만족 여부
   * - tip : 관련 문구
   * - tags : 식물 태그
   */
  const conditionPriority = [
    { key: 'hot_humid', condition: temp >= 30 && humidity >= 85, tip: '덥고 습한 날씨에는 식물이 숨 쉴 수 있게 환기 잘 시켜주세요. 물은 너무 자주 주지 않는 게 좋아요.', tags: ['주 1회 물주기', '건조 식물', '따뜻함 선호'] },
    { key: 'hot_dry', condition: temp >= 27 && humidity < 85, tip: '건조한 여름에는 하루 한 번 정도만 살짝 물을 주세요. 식물이 건강하게 자랄 거예요.', tags: ['매일 물주기', '다습 식물', '따뜻함 선호'] },
    { key: 'cold_humid', condition: temp <= 10 && humidity >= 70, tip: '추운 날엔 식물이 과하게 젖지 않도록 물 주는 양을 조절해 주세요. 따뜻한 공간을 좋아해요.', tags: ['주 1회 물주기', '보통 습도', '따뜻함 선호'] },
    { key: 'cold_dry', condition: temp <= 10 && humidity < 70, tip: '찬바람이 부는 건조한 날엔 식물을 따뜻한 실내로 옮기고 물은 아침에 주세요. 식물이 좋아할 거예요!', tags: ['월 1회 물주기', '건조 식물', '따뜻함 선호'] },
    { key: 'rain', condition: description.includes('비'), tip: '비 오는 날엔 물을 잠시 멈추고, 흙이 촉촉한지 잘 살펴주세요. 과습은 식물 친구의 적이에요.', tags: ['매일 물주기', '보통 습도', '따뜻함 선호'] },
    { key: 'strongWind', condition: windSpeed > 10, tip: '바람이 센 날에는 찬바람을 피해 식물을 안전한 곳에 두는 게 좋아요. 식물이 힘내길 바라며!', tags: ['주 1회 물주기', '건조 식물', '따뜻함 선호'] },
    { key: 'mild_clear', condition: temp > 10 && temp < 30 && description === '맑음', tip: '화창한 날엔 식물이 햇빛도 쬐고 상쾌한 공기도 마시게 해주세요. 식물이 기뻐할 거예요!', tags: ['주 1회 물주기', '보통 습도', '따뜻함 선호'] },
    { key: 'mild_cloudy', condition: temp > 10 && temp < 30 && description === '흐림', tip: '흐린 날에도 식물은 빛이 필요해요. 창가 쪽으로 살짝 옮겨 빛을 더 받을 수 있게 해주세요.', tags: ['매일 물주기', '다습 식물', '서늘함 선호'] },
  ];

  // 조건에 해당하는 항목을 찾음
  const matchedCondition = conditionPriority.find((priorityItem) => priorityItem.condition);

  // 추천 식물 데이터
  let plantsData: ProductApiData[] = [];

  if (matchedCondition) {
    // 서버에서 해당 조건에 맞는 식물 데이터 가져옴
    const response = await plantByWeather(matchedCondition.tags);

    // 응답 데이터가 유효하면 랜덤 3개 추출
    if (response.ok === 1 && Array.isArray(response.item)) {
      plantsData = shuffleArray(response.item).slice(0, 3);
    }
  }

  return {
    weather: {
      datetime: weatherData.datetime,
      city: weatherData.city,
      description,
      icon: weatherData.icon,
      temp,
      humidity,
      windSpeed,
      tip: matchedCondition?.tip ?? '오늘은 실내 식물과 시간을 보내기 좋은 날이에요. 당신의 친구 초록이가 기다리고 있어요!',
    },
    tags: matchedCondition?.tags,
    plants: plantsData,
  };
}
