'use client';

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Building, Crown, Globe, Settings, Shield, Star, User, Users } from 'lucide-react';
import { useState } from 'react';

export default function SelectTestPage() {
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  return (
    <div className='min-h-screen space-y-8 bg-neutral-50 p-8'>
      <h1 className='t-h1 mb-10 text-center'>Select 컴포넌트 예시</h1>

      {/* 기본 */}
      <div className='space-y-4'>
        <h3 className='t-h3'>기본</h3>
        <div className='flex flex-wrap gap-4'>
          <Select>
            <SelectTrigger className='w-[12.5rem]'>
              <SelectValue placeholder='옵션을 선택하세요' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='option1'>옵션 1</SelectItem>
              <SelectItem value='option2'>옵션 2</SelectItem>
              <SelectItem value='option3'>옵션 3</SelectItem>
              <SelectItem value='option4'>옵션 4</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger size='sm' className='w-[9.375rem]'>
              <SelectValue placeholder='작은 크기' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='small1'>작은 옵션 1</SelectItem>
              <SelectItem value='small2'>작은 옵션 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 아이콘과 함께 사용 */}
      <div className='space-y-4'>
        <h3 className='t-h3'>아이콘과 함께 사용</h3>
        <div className='flex flex-wrap gap-4'>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className='w-[12.5rem]'>
              <SelectValue placeholder='역할을 선택하세요' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='user'>
                <User className='size-4' />
                일반 사용자
              </SelectItem>
              <SelectItem value='admin'>
                <Crown className='size-4' />
                관리자
              </SelectItem>
              <SelectItem value='moderator'>
                <Shield className='size-4' />
                모더레이터
              </SelectItem>
              <SelectItem value='vip'>
                <Star className='size-4' />
                VIP 사용자
              </SelectItem>
            </SelectContent>
          </Select>

          {selectedRole && (
            <p className='flex items-center text-sm text-neutral-600'>
              선택된 역할: <span className='ml-1 font-medium'>{selectedRole}</span>
            </p>
          )}
        </div>
      </div>

      {/* 그룹화된 옵션들 */}
      <div className='space-y-4'>
        <h3 className='t-h3'>그룹화된 옵션들</h3>
        <div className='flex flex-wrap gap-4'>
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className='w-[15.625rem]'>
              <SelectValue placeholder='국가를 선택하세요' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>아시아</SelectLabel>
                <SelectItem value='kr'>
                  <Globe className='size-4' />
                  대한민국
                </SelectItem>
                <SelectItem value='jp'>
                  <Globe className='size-4' />
                  일본
                </SelectItem>
                <SelectItem value='cn'>
                  <Globe className='size-4' />
                  중국
                </SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>유럽</SelectLabel>
                <SelectItem value='uk'>
                  <Globe className='size-4' />
                  영국
                </SelectItem>
                <SelectItem value='de'>
                  <Globe className='size-4' />
                  독일
                </SelectItem>
                <SelectItem value='fr'>
                  <Globe className='size-4' />
                  프랑스
                </SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>아메리카</SelectLabel>
                <SelectItem value='us'>
                  <Globe className='size-4' />
                  미국
                </SelectItem>
                <SelectItem value='ca'>
                  <Globe className='size-4' />
                  캐나다
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {selectedCountry && (
            <p className='flex items-center text-sm text-neutral-600'>
              선택된 국가: <span className='ml-1 font-medium'>{selectedCountry}</span>
            </p>
          )}
        </div>
      </div>

      {/* 긴 리스트 (스크롤 테스트) */}
      <div className='space-y-4'>
        <h3 className='t-h3'>긴 리스트 (스크롤)</h3>
        <div className='flex flex-wrap gap-4'>
          <Select>
            <SelectTrigger className='w-[12.5rem]'>
              <SelectValue placeholder='도시를 선택하세요' />
            </SelectTrigger>
            <SelectContent>
              {['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '수원', '성남', '고양', '용인', '부천', '안산', '안양', '남양주', '의정부', '평택', '시흥', '파주', '김포', '광명', '군포', '하남'].map((city) => (
                <SelectItem key={city} value={city.toLowerCase()}>
                  <Building className='size-4' />
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 비활성화된 옵션 */}
      <div className='space-y-4'>
        <h3 className='t-h3'>비활성화된 옵션</h3>
        <div className='flex flex-wrap gap-4'>
          <Select>
            <SelectTrigger className='w-[12.5rem]'>
              <SelectValue placeholder='요금제 선택' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='free'>
                <Users className='size-4' />
                무료 요금제
              </SelectItem>
              <SelectItem value='pro'>
                <Star className='size-4' />
                프로 요금제
              </SelectItem>
              <SelectItem value='enterprise' disabled>
                <Crown className='size-4' />
                기업 요금제 (준비중)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 실제 사용 예시 */}
      <div className='space-y-4'>
        <h3 className='t-h3'>실제 사용 예시</h3>

        {/* 사용자 프로필 설정 */}
        <div className='rounded-lg border bg-white p-6'>
          <h3 className='mb-4 font-semibold'>사용자 프로필 설정</h3>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>언어 설정</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder='언어를 선택하세요' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ko'>한국어</SelectItem>
                  <SelectItem value='en'>English</SelectItem>
                  <SelectItem value='ja'>日本語</SelectItem>
                  <SelectItem value='zh'>中文</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>테마 설정</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder='테마를 선택하세요' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='light'>
                    <Settings className='size-4' />
                    라이트 모드
                  </SelectItem>
                  <SelectItem value='dark'>
                    <Settings className='size-4' />
                    다크 모드
                  </SelectItem>
                  <SelectItem value='system'>
                    <Settings className='size-4' />
                    시스템 설정 따르기
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>알림 설정</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder='알림 빈도 선택' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>실시간</SelectLabel>
                    <SelectItem value='instant'>즉시 알림</SelectItem>
                    <SelectItem value='every5min'>5분마다</SelectItem>
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>배치</SelectLabel>
                    <SelectItem value='hourly'>1시간마다</SelectItem>
                    <SelectItem value='daily'>하루에 한번</SelectItem>
                    <SelectItem value='weekly'>일주일에 한번</SelectItem>
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectItem value='never'>알림 끄기</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>표시 항목 수</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder='페이지당 항목 수' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='10'>10개씩 보기</SelectItem>
                  <SelectItem value='25'>25개씩 보기</SelectItem>
                  <SelectItem value='50'>50개씩 보기</SelectItem>
                  <SelectItem value='100'>100개씩 보기</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 필터링 옵션 */}
        <div className='rounded-lg border bg-white p-6'>
          <h3 className='mb-4 font-semibold'>제품 필터링</h3>
          <div className='flex flex-wrap gap-4'>
            <Select>
              <SelectTrigger className='w-[9.375rem]'>
                <SelectValue placeholder='카테고리' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='electronics'>전자제품</SelectItem>
                <SelectItem value='clothing'>의류</SelectItem>
                <SelectItem value='books'>도서</SelectItem>
                <SelectItem value='home'>생활용품</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className='w-[12.5rem]'>
                <SelectValue placeholder='가격대' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='under-10000'>1만원 이하</SelectItem>
                <SelectItem value='10000-50000'>1만원 - 5만원</SelectItem>
                <SelectItem value='50000-100000'>5만원 - 10만원</SelectItem>
                <SelectItem value='over-100000'>10만원 이상</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className='w-[9.375rem]'>
                <SelectValue placeholder='정렬 기준' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='newest'>최신순</SelectItem>
                <SelectItem value='price-low'>가격 낮은순</SelectItem>
                <SelectItem value='price-high'>가격 높은순</SelectItem>
                <SelectItem value='popular'>인기순</SelectItem>
                <SelectItem value='rating'>평점순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 크기 비교 */}
      <div className='space-y-4'>
        <h3 className='t-h3'>크기 비교</h3>
        <div className='flex flex-wrap items-center gap-4'>
          <div className='space-y-2'>
            <label className='t-desc'>Small (32px)</label>
            <Select>
              <SelectTrigger size='sm' className='w-[9.375rem]'>
                <SelectValue placeholder='작은 크기' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='sm1'>작은 옵션 1</SelectItem>
                <SelectItem value='sm2'>작은 옵션 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <label className='t-desc'>Default (36px)</label>
            <Select>
              <SelectTrigger className='w-[12.5rem]'>
                <SelectValue placeholder='기본 크기' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='def1'>기본 옵션 1</SelectItem>
                <SelectItem value='def2'>기본 옵션 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
