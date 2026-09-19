import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { renderWelcomeCourseEmailHtml, sendOrSimulateEmail } from '@/lib/email';
import { getPayment, isMercadoPagoConfigured } from '@/lib/mercadopago';
import { requireSelfOrAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { courseId, userId, paymentId, preferenceId } = await req.json();

    if (!(await requireSelfOrAdmin(req, userId))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const course = await db.getCourseById(courseId);
    const user = await db.getUserById(userId);

    if (!course || !user) {
      return NextResponse.json({ error: 'Curso o Usuario no encontrado' }, { status: 404 });
    }

    // El monto esperado es el de la orden (puede tener un cupón aplicado),
    // nunca el precio de lista del curso: un cupón legítimo paga menos.
    const orders = await db.getOrders();
    const pendingOrder = orders.find(
      (o) => (preferenceId && o.mpPreferenceId === preferenceId) || (o.userId === user.id && o.courseId === course.id && o.status === 'PENDING')
    );
    const expectedAmount = pendingOrder?.amount ?? course.price;

    // Si Mercado Pago está configurado (producción con pagos reales), la
    // única fuente de verdad válida es consultar el pago por su API: nunca
    // hay que confiar en que el navegador dice "pagué". Un curso gratis no
    // pasa por Mercado Pago y no requiere esta verificación.
    if (!course.isFree && course.price > 0 && isMercadoPagoConfigured) {
      if (!paymentId) {
        return NextResponse.json({ error: 'Falta el identificador de pago de Mercado Pago' }, { status: 400 });
      }

      let payment;
      try {
        payment = await getPayment(String(paymentId));
      } catch (e) {
        console.error('No se pudo verificar el pago en Mercado Pago:', e);
        return NextResponse.json({ error: 'No se pudo verificar el pago' }, { status: 402 });
      }

      const metadata = (payment.metadata || {}) as Record<string, unknown>;
      const metaCourseId = metadata.course_id ?? metadata.courseId;
      const metaUserId = metadata.user_id ?? metadata.userId;

      const isApproved = payment.status === 'approved';
      const matchesCourse = String(metaCourseId) === String(course.id);
      const matchesUser = String(metaUserId) === String(user.id);
      const matchesAmount = Math.round(Number(payment.transaction_amount)) >= Math.round(expectedAmount);

      if (!isApproved || !matchesCourse || !matchesUser || !matchesAmount) {
        console.error('Verificación de pago fallida', {
          paymentId,
          status: payment.status,
          metaCourseId,
          metaUserId,
          amount: payment.transaction_amount,
        });
        return NextResponse.json({ error: 'El pago no pudo ser verificado' }, { status: 402 });
      }
    }

    // Enroll the user in the course
    const enrollment = await db.enroll(user.id, course.id);

    // Update order status if exists (reutiliza la orden pendiente ya encontrada arriba)
    if (pendingOrder) {
      pendingOrder.status = 'APPROVED';
      pendingOrder.mpPaymentId = paymentId || `pay_${Date.now()}`;
      await db.saveOrder(pendingOrder);
    } else {
      await db.saveOrder({
        id: `ord_${Date.now()}`,
        userId: user.id,
        userEmail: user.email,
        courseId: course.id,
        courseTitle: course.title,
        amount: course.price,
        currency: 'ARS',
        mpPreferenceId: preferenceId || 'simulated',
        mpPaymentId: paymentId || `pay_${Date.now()}`,
        status: 'APPROVED',
        createdAt: new Date().toISOString(),
      });
    }

    if (pendingOrder?.couponCode) {
      const coupon = await db.getCouponByCode(pendingOrder.couponCode);
      if (coupon) await db.incrementCouponUsage(coupon.id);
    }

    // Send welcome email
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.startsWith('localhost') ? 'http' : 'https';
    const courseUrl = `${protocol}://${host}/campus/curso/${course.slug}`;

    const welcomeHtml = renderWelcomeCourseEmailHtml({
      userName: user.name,
      courseTitle: course.title,
      courseUrl,
    });

    await sendOrSimulateEmail({
      to: user.email,
      toName: user.name,
      subject: `¡Tu acceso a ${course.title} está listo! 🎉`,
      html: welcomeHtml,
    });

    return NextResponse.json({
      success: true,
      enrollment,
      redirectUrl: `/campus/curso/${course.slug}`,
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json({ error: 'Error al confirmar el pago' }, { status: 500 });
  }
}
