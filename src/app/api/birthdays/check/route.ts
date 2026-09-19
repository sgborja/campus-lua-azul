import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkUpcomingBirthdays } from '@/lib/email';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  const upcoming = checkUpcomingBirthdays(30); // next 30 days
  const template = db.getBirthdayTemplate();
  const logs = db.getBirthdayLogs();

  return NextResponse.json({
    upcoming,
    template,
    logs,
  });
}
