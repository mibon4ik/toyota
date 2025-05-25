
'use server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Выход выполнен успешно' }, { status: 200 });

    // Clear HttpOnly session cookie
    response.cookies.set('user-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0), // Set to a past date
      path: '/',
      sameSite: 'lax',
    });

    // Clear client-accessible cookies
    response.cookies.set('isLoggedIn', '', {
      expires: new Date(0),
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    response.cookies.set('loggedInUser', '', {
      expires: new Date(0),
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    
    // Deprecated, but clear just in case
     response.cookies.set('authToken', '', {
      expires: new Date(0),
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (e) {
    console.error('Logout API error:', e);
    // Still attempt to clear cookies even if there's an error creating the initial response
    const errorResponse = NextResponse.json({ message: 'Внутренняя ошибка сервера при выходе' }, { status: 500 });
    errorResponse.cookies.set('user-session', '', { expires: new Date(0), path: '/' });
    errorResponse.cookies.set('isLoggedIn', '', { expires: new Date(0), path: '/' });
    errorResponse.cookies.set('loggedInUser', '', { expires: new Date(0), path: '/' });
    return errorResponse;
  }
}
