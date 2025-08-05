import { redirect } from 'next/navigation';

export default function SignUpPage() {
  // /sign-up 접근 시 자동으로 step-1로 리디렉션
  redirect('/sign-up/step-1');
}

export function generateMetadata() {
  return {
    title: 'Green Mate - 회원가입',
    description: 'Green Mate에서 당신의 반려 식물을 만나보세요.',
  };
}
