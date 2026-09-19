import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { User } from '@/lib/types';
import { createSessionToken, sessionCookieOptions, hashPassword, publicUser, SESSION_COOKIE } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, birthDate } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nombre, email y contraseña son obligatorios' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una cuenta con este email' }, { status: 400 });
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      email,
      password: await hashPassword(password),
      birthDate: birthDate || undefined,
      role: 'STUDENT',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
    };

    db.saveUser(newUser);

    const response = NextResponse.json({ user: publicUser(newUser), success: true });
    response.cookies.set(SESSION_COOKIE, createSessionToken(newUser.id), sessionCookieOptions());
    return response;
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json({ error: 'Error al registrar usuario' }, { status: 500 });
  }
}
