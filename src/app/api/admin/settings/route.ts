import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const settings = await db.getSiteSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await requireSuperAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const settings = await db.saveSiteSettings(body);
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error al guardar configuración:', error);
    return NextResponse.json({ error: 'Error al guardar configuración' }, { status: 500 });
  }
}
