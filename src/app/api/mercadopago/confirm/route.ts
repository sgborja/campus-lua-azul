import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { renderWelcomeCourseEmailHtml, sendOrSimulateEmail } from '@/lib/email';
import { getPayment, isMercadoPagoConfigured } from '@/lib/mercadopago';
import { requireSelfOrAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { courseId, userId, paymentId, preferenceId } = await req.json();

    if (!requireSelfOrAdmin(req, userId)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const course = db.getCourseById(courseId);
    const user = db.getUserById(userId);

    if (!course || !user) {
      return NextResponse.json({ error: 'Curso o Usuario no encontrado' }, { status: 404 });
    }

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
      const matchesAmount = Math.round(Number(payment.transaction_amount)) >= Math.round(course.price);

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
    const enrollment = db.enroll(user.id, course.id);

    // Update order status if exists
    const orders = db.getOrders();
    const existingOrder = orders.find(
      (o) => (preferenceId && o.mpPreferenceId === preferenceId) || (o.userId === user.id && o.courseId === course.id && o.status === 'PENDING')
    );

    if (existingOrder) {
      existingOrder.status = 'APPROVED';
      existingOrder.mpPaymentId = paymentId || `pay_${Date.now()}`;
      db.saveOrder(existingOrder);
    } else {
      db.saveOrder({
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
