import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createCoursePreference } from '@/lib/mercadopago';
import { requireSelfOrAdmin } from '@/lib/auth';
import { validateCouponForCourse } from '@/lib/coupons';

export async function POST(req: NextRequest) {
  try {
    const { courseId, userId, couponCode } = await req.json();

    if (!(await requireSelfOrAdmin(req, userId))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const course = await db.getCourseById(courseId);
    const user = await db.getUserById(userId);

    if (!course || !user) {
      return NextResponse.json({ error: 'Curso o Usuario no encontrado' }, { status: 404 });
    }

    if (course.isFree || course.price === 0) {
      // Free course: enroll directly
      await db.enroll(user.id, course.id);
      return NextResponse.json({
        isFree: true,
        redirectUrl: `/campus/curso/${course.slug}`,
      });
    }

    // Un cupón se revalida siempre en el servidor: nunca hay que confiar en
    // un precio con descuento que haya calculado el navegador.
    let finalPrice = course.price;
    let validCouponCode: string | undefined;
    if (couponCode) {
      const check = await validateCouponForCourse(couponCode, course, user.id);
      if (!check.valid) {
        return NextResponse.json({ error: check.error || 'Cupón inválido' }, { status: 400 });
      }
      finalPrice = check.finalPrice!;
      validCouponCode = check.coupon!.code;
    }

    if (finalPrice <= 0) {
      // Cupón de 100%: se inscribe directo, sin pasar por Mercado Pago.
      await db.enroll(user.id, course.id);
      if (validCouponCode) {
        const coupon = await db.getCouponByCode(validCouponCode);
        if (coupon) await db.recordCouponRedemption(coupon.id, user.id, course.id);
      }
      return NextResponse.json({
        isFree: true,
        redirectUrl: `/campus/curso/${course.slug}`,
      });
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.startsWith('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const preferenceResult = await createCoursePreference({
      course,
      user,
      baseUrl,
      overridePrice: finalPrice,
      couponCode: validCouponCode,
    });

    // Save pending order
    await db.saveOrder({
      id: `ord_${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      courseId: course.id,
      courseTitle: course.title,
      amount: finalPrice,
      currency: 'ARS',
      mpPreferenceId: preferenceResult.id || `pref_${Date.now()}`,
      status: 'PENDING',
      couponCode: validCouponCode,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      preferenceId: preferenceResult.id,
      initPoint: preferenceResult.init_point,
      sandboxInitPoint: preferenceResult.sandbox_init_point,
      isSimulated: preferenceResult.isSimulated,
    });
  } catch (error) {
    console.error('Error creating MP preference:', error);
    return NextResponse.json({ error: 'Error al generar preferencia de Mercado Pago' }, { status: 500 });
  }
}
