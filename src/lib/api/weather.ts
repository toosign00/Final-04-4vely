'use server';

export interface WeatherInfo {
  city: string; // 도시 이름
  datetime: number; // 현재 시간 -> 계절 분기용으로 사용
  temp: number; // 현재 기온 (섭씨)
  humidity: number; // 현재 습도
  description: string; // 날씨 설명
  icon: string; // 날씨 아이콘
  windSpeed: number; // 풍속
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherInfo | null> {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&lang=kr&units=metric`, { cache: 'no-store' });
    if (!response.ok) {
      // API 호출 실패 시
      throw new Error(`날씨 API를 불러올 수 없습니다. ${response.status}`);
    }

    const data = await response.json();

    const weatherArray = data.weather;
    // 배열 확인 후 첫 번째 요소 가져옴
    const currentWeather = Array.isArray(weatherArray) && weatherArray.length > 0 ? weatherArray[0] : null;

    // 날씨 설명 존재 확인
    const description = currentWeather && currentWeather.description ? currentWeather.description : '정보 없음';

    // 날씨 아이콘 존재 확인
    const icon = currentWeather && currentWeather.icon ? currentWeather.icon : '';

    // 풍속 존재 확인
    const windSpeed = data.wind && data.wind.speed ? data.wind.speed : 0;

    const weather: WeatherInfo = {
      city: data.name,
      datetime: data.dt,
      temp: data.main.temp,
      humidity: data.main.humidity,
      description,
      icon,
      windSpeed,
    };

    return weather;
  } catch (error) {
    console.error('날씨 데이터 가져오는 데 오류 발생:', error);
    return null;
  }
}
