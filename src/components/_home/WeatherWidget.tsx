'use client';

import { fetchWeather, WeatherInfo } from '@/lib/api/weather';
import { useEffect, useState } from 'react';

export default function WeatherWidget() {
  const [lat, setLat] = useState<number | null>(null); // 위도 상태
  const [lon, setLon] = useState<number | null>(null); // 경도 상태
  const [weather, setWeather] = useState<WeatherInfo | null>(null); // 날씨 상태

  // 사용자 위치 요청
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      // 허용
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setLat(latitude);
        setLon(longitude);
      },

      // 거부
      (error) => {
        // 사용자 위치 허용 거부 시 기본값이 서울
        setLat(37.5665);
        setLon(126.978);
      },
    );
  }, []);

  // 날씨 API 호출 및 캐시
  useEffect(() => {
    if (lat !== null && lon !== null) {
      const nowTime = Date.now();
      const ONE_HOUR_MS = 60 * 60 * 1000;

      const cached = localStorage.getItem('weatherCache');

      if (cached) {
        const parsed = JSON.parse(cached);

        // 1시간 이내면 캐시 사용 = API 요청 x
        if (nowTime - parsed.timestamp < ONE_HOUR_MS) {
          setWeather(parsed.weatherData);
          return;
        }
      }

      const roundedLat = Number(lat.toFixed(4));
      const roundedLon = Number(lon.toFixed(4));

      // API 호출 및 새로운 캐시 저장
      fetchWeather(roundedLat, roundedLon).then((weatherData) => {
        setWeather(weatherData);
        const weatherCache = {
          timestamp: nowTime, // 캐시된 시간
          formattedTime: new Date(nowTime).toLocaleString(), // 한국 시간 표기 형태로 바꿈
          weatherData,
        };

        localStorage.setItem('weatherCache', JSON.stringify(weatherCache));
      });
    }
  }, [lat, lon]);

  if (!weather) return <div>날씨 정보를 불러오는 중...</div>;

  return (
    // 임시 날씨 UI
    <div className='rounded-xl bg-white p-4'>
      <p>{weather.city}</p>
      <p>
        {weather.temp}°C, {weather.description}
      </p>
      <p>
        습도: {weather.humidity}% / 풍속: {weather.windSpeed}m/s
      </p>
      {/* 날씨 아이콘 표시 */}
      <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt={weather.description} />
      {/* 식물 관리 팁 추가 필요*/}
    </div>
  );
}
