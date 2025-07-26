'use client';

import { Button } from '@/components/ui/Button';
import { FileText, Plus } from 'lucide-react';
import React from 'react';
import { EmptyDiaryStateProps } from '../../_types/plant.types';

/**
 * 일지가 없을 때 표시하는 빈 상태 컴포넌트
 *
 * @description
 * - 사용자가 아직 일지를 작성하지 않았을 때 표시되는 안내 화면
 * - 명확한 행동 유도(CTA)를 통해 첫 일지 작성을 권장
 * - 접근성을 고려한 시맨틱 HTML 구조 사용
 *
 * @param {EmptyDiaryStateProps} props - 컴포넌트 props
 * @param {string} props.plantName - 식물 이름 (개인화된 메시지에 사용)
 * @param {() => void} props.onWriteDiary - 일지 작성 버튼 클릭 핸들러
 *
 * @performance
 * - React.memo로 불필요한 리렌더링 방지
 * - 가벼운 SVG 아이콘 사용으로 빠른 로딩
 *
 * @accessibility
 * - 적절한 ARIA 레이블과 시맨틱 HTML 사용
 * - 키보드 접근성 지원
 *
 * @ux
 * - 친근한 톤의 메시지로 사용자 경험 개선
 * - 명확한 행동 유도로 사용자 전환율 향상
 */
const EmptyDiaryState = React.memo<EmptyDiaryStateProps>(({ plantName, onWriteDiary }) => {
  return (
    <section className='flex min-h-[25rem] flex-col items-center justify-center px-4 text-center' aria-labelledby='empty-state-title' role='region'>
      {/* 일러스트레이션 아이콘 */}
      <div className='mb-6' aria-hidden='true'>
        <FileText className='mx-auto h-16 w-16 text-gray-300' />
      </div>

      {/* 메인 메시지 */}
      <div className='mb-8 max-w-md'>
        <h3 id='empty-state-title' className='t-h3 text-secondary mb-3 font-bold'>
          아직 일지가 없습니다
        </h3>
        <p className='t-body text-muted leading-relaxed'>
          <span className='text-secondary font-medium'>{plantName}</span>의 성장 과정을 기록해보세요!
          <br />첫 번째 일지로 특별한 순간을 남겨보세요.
        </p>
      </div>

      {/* 행동 유도 버튼 */}
      <Button variant='primary' size='lg' onClick={onWriteDiary} className='flex items-center gap-2 px-6 py-3' aria-describedby='empty-state-title'>
        <Plus className='size-5' aria-hidden='true' />
        <span>첫 일지 작성하기</span>
      </Button>

      {/* 추가 안내 메시지 */}
      <div className='mt-6 text-center'>
        <p className='t-small text-muted/80'>💡 일지에는 사진과 함께 식물의 변화나 특이사항을 기록할 수 있어요</p>
      </div>
    </section>
  );
});

// 컴포넌트 이름 설정 (React DevTools에서 표시됨)
EmptyDiaryState.displayName = 'EmptyDiaryState';

export default EmptyDiaryState;
