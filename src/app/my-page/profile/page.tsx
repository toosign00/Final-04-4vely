import { getUserDetail } from '@/lib/functions/mypage/profile/userFunctions';
import ErrorDisplay from '../_components/ErrorDisplay';
import ProfileClient from './_components/ProfileClient';

export default async function ProfilePage() {
  try {
    // 서버에서 유저 정보 조회
    const res = await getUserDetail();

    // API 응답이 실패한 경우 에러 화면 표시
    if (!res.ok) {
      const errorMessage = res.message || '일시적인 오류가 발생했어요.';
      return <ErrorDisplay title='프로필 정보를 불러오지 못했습니다' message={errorMessage} />;
    }

    return <ProfileClient user={res.item || null} />;
  } catch (error) {
    console.error('ProfilePage error:', error);
    return <ErrorDisplay title='프로필 정보를 불러오지 못했습니다' message='일시적인 오류가 발생했어요.' />;
  }
}
