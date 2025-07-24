'use server';

import { fetchWeather } from '@/lib/functions/weather/fetchWeather';
import { PlantByWeather, WeatherTipDataMap } from '@/lib/functions/weather/plantByWeather';
import { ApiRes } from '@/types/api.types';

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

  /** 우선순위 조건 설정
   * - key : 날씨 조건 식별자용
   * - condition : 해당 조건 만족 여부
   */
  const conditionPriority = [
    { key: 'hot_humid', condition: temp >= 30 && humidity >= 85 },
    { key: 'hot_dry', condition: temp >= 27 && humidity < 85 },
    { key: 'cold_humid', condition: temp <= 10 && humidity >= 70 },
    { key: 'cold_dry', condition: temp <= 10 && humidity < 70 },
    { key: 'rain', condition: description.includes('비') },
    { key: 'strongWind', condition: windSpeed > 10 },
    { key: 'mild_clear', condition: temp > 10 && temp < 30 && description === '맑음' },
    { key: 'mild_cloudy', condition: temp > 10 && temp < 30 && description === '흐림' },
  ];

  type ConditionKey = keyof WeatherTipDataMap;

  // 조건에 해당하는 날씨 찾음
  const matchedCondition = conditionPriority.find((priorityItem) => priorityItem.condition);
  // 해당 조건의 key만 추출
  const conditionKey = matchedCondition?.key as ConditionKey | undefined;

  // 모든 조건의 식물 데이터 호출
  const plantDataByCondition: ApiRes<WeatherTipDataMap> = await PlantByWeather();

  // 조건에 맞는 식물 정보 반환
  let matched = null;
  if (plantDataByCondition.ok === 1 && conditionKey && conditionKey in plantDataByCondition.item) {
    matched = plantDataByCondition.item[conditionKey];
  }

  return {
    weather: {
      description,
      temp,
      humidity,
      windSpeed,
      tip: matched?.tip ?? '오늘은 실내 식물과 시간을 보내기 좋은 날이에요. 당신의 친구 초록이가 기다리고 있어요!',
    },
    plants: matched?.plants ?? [],
  };
}
