import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function SocialKakao() {
  const REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY; // REST API KEY
  const REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI; // Redirect URI

  const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;

  const handleLogin = () => {
    window.location.href = kakaoURL;
  };

  return (
    <Button onClick={handleLogin} asChild className='mb-4 bg-yellow-300 hover:bg-amber-300' fullWidth variant='default' size='lg'>
      <Link href='/'>카카오 로그인</Link>
    </Button>
  );
}
