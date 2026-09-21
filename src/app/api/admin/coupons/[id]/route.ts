import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireSuperAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  try {
    const body = await req.json();

    // Simple toggle from the coupon list (only `active` sent).
    const onlyTogglingActive = Object.keys(body).every((k) => k === 'active');
    if (onlyTogglingActive) {
      const coupon = await db.setCouponActive(params.id, Boolean(body.active));
      if (!coupon) {
        return NextResponse.json({ error: 'Cupón no encontrado' }, { status: 404 });
      }
      return NextResponse.json({ success: true, coupon });
    }

    // Full edit from the coupon form.
    const code = body.code !== undefined ? String(body.code).trim().toUpperCase() : undefined;
    if (code !== undefined) {
      if (!code) {
        return NextResponse.json({ error: 'El código no puede estar vacío' }, { status: 400 });
      }
      const existing = await db.getCouponByCode(code);
      if (existing && existing.id !== params.id) {
        return NextResponse.json({ error: 'Ya existe otro cupón con ese código' }, { status: 400 });
      }
    }
    if (body.discountPercent !== undefined) {
      const discountPercent = Number(body.discountPercent);
      if (!Number.isInteger(discountPercent) || discountPercent < 1 || discountPercent > 100) {
        return NextResponse.json({ error: 'El descuento debe ser un número entre 1 y 100' }, { status: 400 });
      }
    }

    const coupon = await db.updateCoupon(params.id, {
      ...(code !== undefined ? { code } : {}),
      ...(body.discountPercent !== undefined ? { discountPercent: Number(body.discountPercent) } : {}),
      ...(body.courseId !== undefined ? { courseId: body.courseId || undefined } : {}),
      ...(body.maxUses !== undefined ? { maxUses: body.maxUses ? Number(body.maxUses) : undefined } : {}),
      ...(body.expiresAt !== undefined ? { expiresAt: body.expiresAt || undefined } : {}),
      ...(body.active !== undefined ? { active: Boolean(body.active) } : {}),
    });
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
