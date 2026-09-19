import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireSuperAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const coupon = await db.setCouponActive(params.id, Boolean(body.active));
    if (!coupon) {
      return NextResponse.json({ error: 'Cupón no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    console.error('Error actualizando cupón:', error);
    return NextResponse.json({ error: 'Error al actualizar el cupón' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireSuperAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  try {
    await db.deleteCoupon(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando cupón:', error);
    return NextResponse.json({ error: 'Error al eliminar el cupón' }, { status: 500 });
  }
}
