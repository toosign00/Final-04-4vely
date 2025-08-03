'use client';

import SkeletonWeatherCard from '@/components/_home/weather/SkeletonWeatherCard';
import { Button } from '@/components/ui/Button';
import { WeatherInfo } from '@/lib/functions/weather/fetchWeather';
import { mapWeatherToTips } from '@/lib/functions/weather/mapWeatherToTips';
import { weatherImage } from '@/lib/utils/weaterImage';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiMapPin, FiWind } from 'react-icons/fi';
import { IoWaterOutline } from 'react-icons/io5';

interface WeatherTipData {
  weather: WeatherInfo & { tip: string };
  plants: string[];
}

export default function WeatherWidget() {
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
          setTipsData({
            weather: tips.weather,
            plants: tips.plants.map((p) => p.name),
          });
        } catch {
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
          setTipsData({
            weather: tips.weather,
            plants: tips.plants.map((p) => p.name),
          });
        } catch {
          setError(true);
        }
        setLoading(false);
      },
    );
  }, []);

  return (
    <section className='relative mx-auto my-14 flex w-full flex-col px-5 sm:max-w-[40rem] md:max-w-none lg:max-w-[70rem]' aria-label='현재 날씨 정보'>
      {/* 스켈레톤 UI */}
      {loading && <SkeletonWeatherCard />}

      {/* 오류 또는 데이터 없음 */}
      {!loading && (!tipsData || error) && <div className='text-error rounded-xl bg-white p-4 shadow-md'>날씨 정보를 불러오는 데 실패했습니다. 다시 시도해주세요.</div>}

      {/* 정상 데이터 렌더링 */}
      {!loading && tipsData && (
        <>
          {/* 날씨 및 팁 카드 */}
          <div
            className='relative flex min-h-[18.75rem] items-center overflow-hidden rounded-xl text-white shadow-md'
            style={{
              backgroundImage: `url(/images/${weatherImage(tipsData.weather.rawDescription)}.webp)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* 반투명 오버레이 */}
            <div className='absolute inset-0 rounded-xl bg-black/30' />

            {/* 컨텐츠 레이어 */}
            <div className='relative w-full p-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:text-lg lg:text-xl'>
                {/* 좌측: 날씨 정보 */}
                <div className='flex flex-col items-center justify-center'>
                  <div className='flex flex-row items-center gap-5 font-bold'>
                    <FiMapPin className='md:h-6 md:w-6' />
                    <p className='mr-3 text-xl font-bold md:mr-2 md:text-2xl'>{tipsData.weather.city}</p>
                  </div>
                  <div className='flex flex-row items-center'>
                    {tipsData.weather.description} {tipsData.weather.temp}°C
                    <Image src={`https://openweathermap.org/img/wn/${tipsData.weather.icon}@2x.png`} width={48} height={48} alt={tipsData.weather.description} className='h-12 w-12 md:h-16 md:w-16' />
                  </div>
                  <div className='flex flex-row items-center text-base text-gray-200 md:text-lg lg:text-xl'>
                    <IoWaterOutline className='mr-1' /> {tipsData.weather.humidity}%
                    <FiWind className='mr-1 ml-4' /> {tipsData.weather.windSpeed}m/s
                  </div>
                </div>

                {/* 우측: 식물 팁 정보 */}
                <div className='bg-surface/70 text-secondary flex min-h-[12rem] flex-col justify-between rounded-lg p-5 text-base lg:text-xl'>
                  {/* 팁 제목 및 설명 */}
                  <div>
                    <h3 className='mb-2 font-semibold'>오늘의 식물 관리 팁</h3>
                    <div className='mb-3 text-sm lg:text-base'>
                      {tipsData.weather.tip
                        .split('.')
                        .filter((sentence) => sentence.trim() !== '')
                        .map((sentence, index) => (
                          <p key={index} className='mb-1'>
                            {sentence.trim() + '.'}
                          </p>
                        ))}
                    </div>
                  </div>

                  {/* 추천 식물 (없어도 레이아웃 유지) */}
                  <div className='mt-4'>
                    <h4 className='mb-2 font-semibold'>오늘의 초록 친구</h4>

                    {tipsData.plants.length > 0 ? (
                      <div className='flex flex-wrap gap-1 md:gap-3'>
                        {tipsData.plants.map((plant, index) => (
                          <span key={index} className='rounded-full border-2 border-green-600 bg-white px-3 py-1 text-sm text-green-700 lg:text-base'>
                            {plant}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className='h-3 text-sm text-gray-600 lg:text-base'>오늘은 초록 친구가 쉬고 있어요.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className='mt-4 flex justify-end'>
            <Button asChild variant='secondary' size='sm' className='md:h-9 md:px-4 md:py-2 md:text-base lg:h-10 lg:px-6 lg:text-xl'>
              <Link href='/my-page/my-plants'>내 식물 관리하기</Link>
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
