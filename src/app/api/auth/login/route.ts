
'use server';
import { NextResponse } from 'next/server';
import { verifyUserCredentials } from '@/lib/auth';
import type { StoredUser } from '@/types/user';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'Логин и пароль обязательны' }, { status: 400 });
    }

    const verifiedUser = await verifyUserCredentials(username, password);

    if (!verifiedUser) {
      return NextResponse.json({ message: 'Неверные учетные данные' }, { status: 401 });
    }

    const userSessionData: StoredUser = verifiedUser;
    const sessionCookieValue = JSON.stringify(userSessionData);
    const sevenDaysInSeconds = 7 * 24 * 60 * 60;

    const response = NextResponse.json({ message: 'Вход выполнен успешно', user: userSessionData }, { status: 200 });

    response.cookies.set('user-session', sessionCookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sevenDaysInSeconds,
      path: '/',
      sameSite: 'lax',
    });

    response.cookies.set('isLoggedIn', 'true', {
      maxAge: sevenDaysInSeconds,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false, 
    });

    response.cookies.set('loggedInUser', JSON.stringify(userSessionData), {
      maxAge: sevenDaysInSeconds,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false, 
    });

    return response;
  } catch (e: any) {
    console.error('Login API error:', e.message, e.stack);
    return NextResponse.json({ message: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
