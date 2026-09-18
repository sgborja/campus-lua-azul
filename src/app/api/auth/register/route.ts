import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { User } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, birthDate } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nombre, email y contraseña son obligatorios' }, { status: 400 });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una cuenta con este email' }, { status: 400 });
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      email,
      password,
      birthDate: birthDate || undefined,
      role: 'STUDENT',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
    };

    db.saveUser(newUser);

    const response = NextResponse.json({ user: newUser, success: true });
    response.cookies.set('campus_user_id', newUser.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false,
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Error al registrar usuario' }, { status: 500 });
  }
}
