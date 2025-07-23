import hoyaImg from '@/assets/images/hoya_heart_brown.webp';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

export default function CommunityEditPage() {
  return (
    <div className='bg-surface min-h-screen px-4 py-8'>
      <div className='mx-auto w-full max-w-xl'>
        <h2 className='mb-6 text-3xl font-semibold'>수정하기</h2>
        <div className='flex flex-col gap-6'>
          {/* 제목 */}
          <div className='flex flex-col gap-2'>
            <label htmlFor='title' className='text-sm font-medium'>
              제목
            </label>
            <input id='title' type='text' placeholder='제목을 입력하세요' className='h-11 w-full bg-white px-3 text-sm' />
          </div>

          {/* 내용 + 이미지 */}
          <div className='flex flex-col gap-2'>
            <label htmlFor='content' className='text-sm font-medium'>
              내용
            </label>

            <div className='flex min-h-[480px] flex-col gap-5 bg-white p-5'>
              {/* 이미지 자리 */}
              <div className='mx-auto w-full'>
                <div className='relative aspect-[3/4] h-[480px] w-full overflow-hidden rounded bg-gray-50'>
                  <Image src={hoyaImg} alt='첨부 이미지' fill className='object-cover' />
                </div>
              </div>

              {/* 내용 입력 영역 */}
              <textarea id='content' placeholder='내용을 입력해주세요' className='min-h-[100px] w-full bg-white p-3 text-sm leading-relaxed' />
            </div>
          </div>

          {/* 하단 버튼 영역 */}
          <div className='mt-2 flex items-center justify-between gap-4'>
            <Button type='button' variant='primary'>
              사진 첨부
            </Button>
            <Button type='button'>수정하기</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
