
'use server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    cookies().set('user-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0),
      path: '/',
      sameSite: 'lax',
    });

    cookies().set('isLoggedIn', '', {
      expires: new Date(0),
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    cookies().set('loggedInUser', '', {
      expires: new Date(0),
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    
     cookies().set('authToken', '', {
      expires: new Date(0),
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });


    return NextResponse.json({ message: 'Выход выполнен успешно' }, { status: 200 });
  } catch (e) {
    console.error('Logout API error:', e);
    return NextResponse.json({ message: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
