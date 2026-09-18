import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 });
    }

    const user = db.getUserByEmail(email);
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const response = NextResponse.json({ user, success: true });
    response.cookies.set('campus_user_id', user.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false,
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Error interno de autenticación' }, { status: 500 });
  }
}
