'use server';

import { fetchWeather } from '@/lib/api/weather';

/**
 * 전달받은 위도와 경도를 기반으로 날씨 데이터 조회하고,
 * 해당 조건에 맞는 관리 팁과 추천 식물 목록을 반환
 */
export async function mapWeatherToTips(lat: number, lon: number) {
  // 날씨 데이터 요청
  const weatherData = await fetchWeather(lat, lon);

  if (!weatherData) {
    throw new Error('날씨 정보를 불러올 수 없습니다.');
  }

  // 날씨 정보 구조 분해
  const { temp, humidity, description, windSpeed } = weatherData;

  // 우선순위 조건 설정
  // - key : 날씨 조건 식별자용
  // - condition : 해당 조건을 만족 여부
  const conditionPriority = [
    { key: 'strongWind', condition: windSpeed > 10 },
    { key: 'hot', condition: temp >= 30 },
    { key: 'humid', condition: humidity >= 85 },
    { key: 'rain', condition: description.includes('rain') },
    { key: 'snow', condition: description.includes('snow') },
    { key: 'clouds', condition: description.includes('clouds') },
    { key: 'clear', condition: description.includes('clear') },
  ];

  const matchedCondition = conditionPriority.find((condition) => condition.condition);
  const conditionKey = matchedCondition?.key ?? null;

  // 조건 키에 맞는 관리 팁 및 추천 식물 목록 조회
  const matched = conditionKey ? plantByWeather[conditionKey] : null;

  return {
    weather: {
      description,
      temp,
      humidity,
      windSpeed,
      tip: matched?.tip ?? '오늘은 실내 식물과 시간을 보내기 좋은 날이에요.',
    },
    plants: matched?.plants ?? [],
  };
}
