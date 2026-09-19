import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkUpcomingBirthdays } from '@/lib/email';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  const upcoming = await checkUpcomingBirthdays(30); // next 30 days
  const template = await db.getBirthdayTemplate();
  const logs = await db.getBirthdayLogs();

  return NextResponse.json({
    upcoming,
    template,
    logs,
  });
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const template = await db.saveBirthdayTemplate({
      subject: body.subject,
      title: body.title,
      message: body.message,
      promoCode: body.promoCode,
      discountPercent: Number(body.discountPercent),
      validDays: Number(body.validDays),
    });
    return NextResponse.json({ success: true, template });
  } catch (error) {
    console.error('Error guardando plantilla de cumpleaños:', error);
    return NextResponse.json({ error: 'Error al guardar la plantilla' }, { status: 500 });
  }
}
