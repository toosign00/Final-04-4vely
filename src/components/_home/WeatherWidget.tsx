'use client';

import { WeatherInfo } from '@/lib/functions/weather/fetchWeather';
import { mapWeatherToTips } from '@/lib/functions/weather/mapWeatherToTips';
import { useEffect, useState } from 'react';

interface WeatherTipData {
  weather: WeatherInfo & { tip: string };
  plants: string[];
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [tipsData, setTipsData] = useState<WeatherTipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 사용자 위치 요청
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      // 허용
      async (position) => {
        const latitude = Number(position.coords.latitude.toFixed(4));
        const longitude = Number(position.coords.longitude.toFixed(4));

        try {
          const tips = await mapWeatherToTips(latitude, longitude);
          setWeather(tips.weather);
          setTipsData({
            weather: tips.weather,
            plants: tips.plants.map((p) => p.name),
          });
        } catch (err) {
          setError(true);
        }

        setLoading(false);
      },

      // 사용자 위치 거부 시 기본값이 서울
      async () => {
        const latitude = 37.5665;
        const longitude = 126.978;

        try {
          const tips = await mapWeatherToTips(latitude, longitude);
          setWeather(tips.weather);
          setTipsData({
            weather: tips.weather,
            plants: tips.plants.map((p) => p.name),
          });
        } catch (err) {
          setError(true);
        }

        setLoading(false);
      },
    );
  }, []);

  return (
    // 임시 UI
    <div className='rounded-xl bg-white p-4 shadow-md'>
      {loading && <p className='text-gray-600'>날씨 정보를 불러오는 중입니다...</p>}

      {!loading && (error || !weather || !tipsData) && <p className='text-error'>날씨 정보를 불러오는 데 실패했습니다. 다시 시도해주세요.</p>}

      {!loading && weather && tipsData && (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:text-lg lg:text-xl'>
          {/* 날씨 정보 */}
          <div className='flex flex-col items-start justify-center'>
            <p className='font-semibold'>{weather.city}</p>
            <p className='mt-1'>
              {weather.temp}°C, {weather.description}
            </p>
            <p className='mt-1 text-sm text-gray-700 md:text-base lg:text-lg'>
              습도: {weather.humidity}% / 풍속: {weather.windSpeed}m/s
            </p>
            <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt={weather.description} className='mt-2 h-16 w-16' />
          </div>

          {/* 식물 팁 정보 */}
          <div className='rounded-lg bg-green-50 p-3 text-sm md:text-base lg:text-xl'>
            <h3 className='mb-2 font-semibold text-green-800'>오늘의 식물 관리 팁</h3>
            <p className='mb-3 text-xs text-green-700 md:text-sm lg:text-base'>{tipsData.weather.tip}</p>

            {tipsData.plants.length > 0 && (
              <div>
                <h4 className='mb-1 font-semibold text-green-800'>추천 식물</h4>
                <div className='flex flex-wrap gap-1'>
                  {tipsData.plants.map((plant, index) => (
                    <span key={index} className='rounded-full bg-green-200 px-2 py-1 text-xs text-green-800 md:text-sm lg:text-base'>
                      {plant}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
