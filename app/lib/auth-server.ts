import { cookies } from 'next/headers';

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get('helix_token')?.value ?? null;
}
