import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!(await requireSuperAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  const coupons = await db.getCoupons();
  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  if (!(await requireSuperAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const code = String(body.code || '').trim().toUpperCase();
    const discountPercent = Number(body.discountPercent);

    if (!code) {
      return NextResponse.json({ error: 'El código no puede estar vacío' }, { status: 400 });
    }
    if (!Number.isInteger(discountPercent) || discountPercent < 1 || discountPercent > 100) {
      return NextResponse.json({ error: 'El descuento debe ser un número entre 1 y 100' }, { status: 400 });
    }

    const existing = await db.getCouponByCode(code);
    if (existing) {
      return NextResponse.json({ error: 'Ya existe un cupón con ese código' }, { status: 400 });
    }

    const coupon = await db.createCoupon({
      code,
      discountPercent,
      courseId: body.courseId || undefined,
      maxUses: body.maxUses ? Number(body.maxUses) : undefined,
      expiresAt: body.expiresAt || undefined,
      active: true,
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    console.error('Error creando cupón:', error);
    return NextResponse.json({ error: 'Error al crear el cupón' }, { status: 500 });
  }
}
