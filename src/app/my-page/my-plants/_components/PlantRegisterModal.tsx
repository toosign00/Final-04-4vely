import { Button } from '@/components/ui/Button';

interface PlantRegisterModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PlantRegisterModal({ open, onClose }: PlantRegisterModalProps) {
  if (!open) return null;
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
      <div className='w-full max-w-sm rounded-xl bg-white p-6 shadow-lg'>
        <h2 className='mb-4 text-lg font-bold'>식물 등록</h2>
        <form className='space-y-3'>
          <input className='mb-2 w-full rounded border p-2' placeholder='식물 이름' />
          {/* 필요시 추가 입력란 */}
        </form>
        <div className='mt-4 flex justify-end gap-2'>
          <Button type='button' onClick={onClose}>
            닫기
          </Button>
          <Button type='submit' variant='primary'>
            등록
          </Button>
        </div>
      </div>
    </div>
  );
}
