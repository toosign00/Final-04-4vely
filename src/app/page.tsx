import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className='flex h-screen flex-col items-center justify-center'>
      <h1 className='text-secondary mb-4 text-5xl font-bold'>Final-04-4vely</h1>

      <p className='text-secondary mb-8 text-xl font-medium'>메인 페이지입니다</p>

      <Button asChild variant='default' size='lg'>
        <Link href='/navigation'>네비게이션으로 이동</Link>
      </Button>
    </div>
  );
}
