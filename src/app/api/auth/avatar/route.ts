import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { avatar } = await req.json();
    if (!avatar || typeof avatar !== 'string') {
      return NextResponse.json({ error: 'Falta el avatar' }, { status: 400 });
    }

    await db.updateUserAvatar(user.id, avatar);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar avatar:', error);
    return NextResponse.json({ error: 'Error al actualizar el avatar' }, { status: 500 });
  }
}
