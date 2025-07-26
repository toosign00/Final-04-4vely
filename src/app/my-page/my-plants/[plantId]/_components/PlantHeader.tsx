'use client';

import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { PlantHeaderProps } from '../../_types/plant.types';

/**
 * 식물 정보를 표시하는 헤더 컴포넌트
 *
 * @description
 * - 식물의 기본 정보(이름, 종류, 위치)와 프로필 이미지를 표시
 * - 일지 작성 버튼을 제공하여 사용자 액션 유도
 * - 반응형 디자인으로 모바일과 데스크탑 모두 지원
 *
 * @param {PlantHeaderProps} props - 컴포넌트 props
 * @param {Plant} props.plant - 표시할 식물 데이터
 * @param {() => void} props.onWriteDiary - 일지 작성 버튼 클릭 핸들러
 *
 * @performance
 * - React.memo로 불필요한 리렌더링 방지
 * - Image 컴포넌트에 priority 설정으로 LCP 최적화
 * - 적절한 sizes 속성으로 이미지 로딩 최적화
 *
 * @accessibility
 * - 이미지에 적절한 alt 텍스트 제공
 * - 버튼에 명확한 레이블 제공
 * - 시맨틱 HTML 구조 사용 (h1, section 등)
 */
const PlantHeader = React.memo<PlantHeaderProps>(({ plant, onWriteDiary }) => {
  return (
    <header className='bg-surface'>
      <div className='mx-auto max-w-4xl pb-10'>
        <div className='flex items-center justify-between gap-4'>
          {/* 식물 정보 섹션 */}
          <section className='flex min-w-0 flex-1 items-center gap-4'>
            {/* 식물 프로필 이미지 */}
            <div className='relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-gray-200'>
              <Image src={plant.imageUrl} alt={`${plant.name} 프로필 이미지`} fill className='object-cover' sizes='48px' priority />
            </div>

            {/* 식물 기본 정보 */}
            <div className='min-w-0 flex-1'>
              <h1 className='t-h4 text-secondary truncate font-bold'>{plant.name}</h1>
              <p className='t-small text-muted truncate'>
                <span className='inline-block'>{plant.species}</span>
                <span className='mx-2 text-gray-400'>•</span>
                <span className='inline-block'>{plant.location}</span>
              </p>
            </div>
          </section>

          {/* 액션 버튼 섹션 */}
          <div className='flex-shrink-0'>
            <Button variant='primary' onClick={onWriteDiary} className='flex items-center gap-2'>
              <Plus className='size-4' aria-hidden='true' />
              <span>일지 작성</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
});

// 컴포넌트 이름 설정 (React DevTools에서 표시됨)
PlantHeader.displayName = 'PlantHeader';

export default PlantHeader;
