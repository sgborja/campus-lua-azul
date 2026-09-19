import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });
    }

    const user = await db.getUserByResetToken(token);
    if (!user) {
      return NextResponse.json({ error: 'El enlace no es válido o expiró' }, { status: 400 });
    }

    await db.updateUserPassword(user.id, await hashPassword(newPassword));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en reset-password:', error);
    return NextResponse.json({ error: 'Error al restablecer la contraseña' }, { status: 500 });
  }
}
