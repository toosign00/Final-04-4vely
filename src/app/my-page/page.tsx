import { redirect } from 'next/navigation';

export default function MyPage() {
  redirect('/my-page/my-plants');
  return null;
}
