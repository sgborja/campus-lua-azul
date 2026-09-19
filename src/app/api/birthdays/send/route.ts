import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { renderBirthdayEmailHtml, sendOrSimulateEmail } from '@/lib/email';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  try {
    const { userId } = await req.json();

    const user = db.getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const template = db.getBirthdayTemplate();
    const uniquePromoCode = `${template.promoCode}-${user.name.split(' ')[0].toUpperCase()}`;

    const emailHtml = renderBirthdayEmailHtml({
      userName: user.name,
      promoCode: uniquePromoCode,
      discountPercent: template.discountPercent,
      validDays: template.validDays,
      customMessage: template.message.replace('[NOMBRE]', user.name),
    });

    const sendResult = await sendOrSimulateEmail({
      to: user.email,
      toName: user.name,
      subject: template.subject,
      html: emailHtml,
    });

    const log = db.logBirthdayEmail({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      promoCode: uniquePromoCode,
      status: sendResult.simulated ? 'SIMULATED' : 'SENT',
    });

    return NextResponse.json({
      success: true,
      log,
      previewHtml: emailHtml,
      simulated: sendResult.simulated,
    });
  } catch (error) {
    console.error('Error sending birthday email:', error);
    return NextResponse.json({ error: 'Error al enviar email de cumpleaños' }, { status: 500 });
  }
}
