import { cookies } from 'next/headers';

export async function getUserFromCookie() {
  const cookieStore = await cookies();
  const userAuth = cookieStore.get('user-auth')?.value;
  if (!userAuth) return null;
  try {
    const parsed = JSON.parse(userAuth);
    return parsed.state?.user || null;
  } catch {
    return null;
  }
}
