import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkUpcomingBirthdays } from '@/lib/email';

export async function GET() {
  const upcoming = checkUpcomingBirthdays(30); // next 30 days
  const template = db.getBirthdayTemplate();
  const logs = db.getBirthdayLogs();

  return NextResponse.json({
    upcoming,
    template,
    logs,
  });
}
