import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { renderBirthdayEmailHtml, sendOrSimulateEmail, checkUpcomingBirthdays } from '@/lib/email';

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const todaysBirthdays = (await checkUpcomingBirthdays(0)).filter((r) => r.isToday);
  const template = await db.getBirthdayTemplate();

  let sent = 0;
  const skipped: string[] = [];

  for (const { user } of todaysBirthdays) {
    try {
      if (await db.wasBirthdaySentThisYear(user.id)) {
        skipped.push(user.email);
        continue;
      }

      const uniquePromoCode = `${template.promoCode}-${user.name.split(' ')[0].toUpperCase()}`;
      const emailHtml = renderBirthdayEmailHtml({
        userName: user.name,
        promoCode: uniquePromoCode,
        discountPercent: template.discountPercent,
        validDays: template.validDays,
        customMessage: template.message.replace('[NOMBRE]', user.name),
        customTitle: template.title,
      });

      const sendResult = await sendOrSimulateEmail({
        to: user.email,
        toName: user.name,
        subject: template.subject,
        html: emailHtml,
      });

      await db.logBirthdayEmail({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        promoCode: uniquePromoCode,
        status: sendResult.simulated ? 'SIMULATED' : 'SENT',
      });

      sent += 1;
    } catch (err) {
      console.error(`Cumpleaños: error enviando a ${user.email}`, err);
    }
  }

  return NextResponse.json({ ok: true, sent, skipped });
}
