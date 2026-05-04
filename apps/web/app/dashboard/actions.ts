'use server';

import { cookies } from 'next/headers';

export async function clearAuthCookie() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('access_token');
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
