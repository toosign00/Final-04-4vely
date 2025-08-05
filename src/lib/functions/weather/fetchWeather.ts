'use server';

export interface WeatherInfo {
  city: string; // 도시 이름
  datetime: number; // 현재 시간 -> 계절 분기용으로 사용
  temp: number; // 현재 기온 (섭씨)
  humidity: number; // 현재 습도
  description: string; // 날씨 설명 (한글 변환)
  rawDescription: string; // 날씨 설명 (원본 영어)
  icon: string; // 날씨 아이콘
  windSpeed: number; // 풍속
}

/**
 * 영어 날씨 설명 -> 한글로 변환
 */
function translateWeatherDescription(rawDescription: string) {
  const lower = rawDescription.toLowerCase();

  if (lower.includes('clear')) return '맑음';
  if (lower.includes('cloud')) return '흐림';
  if (lower.includes('rain')) return '비';
  if (lower.includes('drizzle')) return '이슬비';
  if (lower.includes('shower')) return '소나기';
  if (lower.includes('snow')) return '눈';
  if (lower.includes('thunderstorm')) return '천둥';
  if (lower.includes('mist') || lower.includes('fog') || lower.includes('haze') || lower.includes('smoke')) return '안개';

  return '';
}

export async function fetchWeather(lat: number, lon: number) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&lang=en&units=metric`, { cache: 'no-store' });
    // API 호출 실패 시
    if (!response.ok) {
      throw new Error(`날씨 API를 불러올 수 없습니다. ${response.status}`);
    }

    const data = await response.json();

    const weatherArray = data.weather;

    // 날씨 배열에서 첫 번째 요소 추출
    const currentWeather = Array.isArray(weatherArray) && weatherArray.length > 0 ? weatherArray[0] : null;

    // 날씨 설명 -> 한글로 변환
    const rawDescription = currentWeather?.description ?? '';
    const description = translateWeatherDescription(rawDescription);

    // 날씨 아이콘 확인
    const icon = currentWeather?.icon ?? '';

    // 풍속 정보 확인
    const windSpeed = data.wind?.speed ?? 0;

    return {
      city: data.name,
      datetime: data.dt,
      temp: Math.round(data.main.temp * 10) / 10,
      humidity: data.main.humidity,
      description,
      rawDescription,
      icon,
      windSpeed,
    };
  } catch {
    return null;
  }
}
