import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { renderWelcomeCourseEmailHtml, sendOrSimulateEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { courseId, userId, paymentId, preferenceId } = await req.json();

    const course = db.getCourseById(courseId);
    const user = db.getUserById(userId);

    if (!course || !user) {
      return NextResponse.json({ error: 'Curso o Usuario no encontrado' }, { status: 404 });
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
