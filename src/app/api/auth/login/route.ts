
'use server';
import { NextResponse } from 'next/server';
import { verifyUserCredentials } from '@/lib/auth';
import type { StoredUser } from '@/types/user';
import { cookies } from 'next/headers';

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

    const userSessionData: StoredUser = {
      id: verifiedUser.id,
      username: verifiedUser.username,
      role: verifiedUser.role,
      isAdmin: verifiedUser.isAdmin,
      firstName: verifiedUser.firstName,
      lastName: verifiedUser.lastName,
      email: verifiedUser.email,
      phoneNumber: verifiedUser.phoneNumber,
      carMake: verifiedUser.carMake,
      carModel: verifiedUser.carModel,
      vinCode: verifiedUser.vinCode,
    };

    const sessionCookieValue = JSON.stringify(userSessionData);
    const sevenDaysInSeconds = 7 * 24 * 60 * 60;

    cookies().set('user-session', sessionCookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sevenDaysInSeconds,
      path: '/',
      sameSite: 'lax',
    });

    cookies().set('isLoggedIn', 'true', {
      maxAge: sevenDaysInSeconds,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    cookies().set('loggedInUser', JSON.stringify(userSessionData), {
      maxAge: sevenDaysInSeconds,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });


    return NextResponse.json({ message: 'Вход выполнен успешно', user: userSessionData }, { status: 200 });
  } catch (e) {
    console.error('Login API error:', e);
    return NextResponse.json({ message: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
