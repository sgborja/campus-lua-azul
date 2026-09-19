import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateCouponForCourse } from '@/lib/coupons';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { code, courseId } = await req.json();
    if (!code || !courseId) {
      return NextResponse.json({ valid: false, error: 'Falta el código o el curso' }, { status: 400 });
    }

    const course = await db.getCourseById(courseId);
    if (!course) {
      return NextResponse.json({ valid: false, error: 'Curso no encontrado' }, { status: 404 });
    }

    const result = await validateCouponForCourse(code, course);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error validando cupón:', error);
    return NextResponse.json({ valid: false, error: 'Error al validar el cupón' }, { status: 500 });
  }
}
