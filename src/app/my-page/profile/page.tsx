import { getUserDetail, type UserDetail } from '@/lib/functions/userFunctions';
import ProfileClient from './_components/ProfileClient';

export default async function ProfilePage() {
  // 서버에서 유저 정보 조회
  const res = await getUserDetail();
  let user: UserDetail | null = null;
  if (res.ok && res.item) {
    user = res.item;
  }

  return <ProfileClient user={user} />;
}
