
'use server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Выход выполнен успешно' }, { status: 200 });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0),
      path: '/',
      sameSite: 'lax' as 'lax' | 'strict' | 'none' | undefined,
    };
    
    const clientCookieOptions = {
        ...cookieOptions,
        httpOnly: false,
    };

    response.cookies.set('user-session', '', cookieOptions);
    response.cookies.set('isLoggedIn', '', clientCookieOptions);
    response.cookies.set('loggedInUser', '', clientCookieOptions);
    
    return response;
  } catch (e: any) {
    console.error('Logout API error:', e.message, e.stack);
    const errorResponse = NextResponse.json({ message: 'Внутренняя ошибка сервера при выходе' }, { status: 500 });
    // Attempt to clear cookies even on error
    const cookieOptions = { expires: new Date(0), path: '/' };
    errorResponse.cookies.set('user-session', '', {...cookieOptions, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax'});
    errorResponse.cookies.set('isLoggedIn', '', {...cookieOptions, httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax'});
    errorResponse.cookies.set('loggedInUser', '', {...cookieOptions, httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax'});
    return errorResponse;
  }
}
