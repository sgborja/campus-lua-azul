import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userIdParam = url.searchParams.get('userId');
  const cookieUserId = req.cookies.get('campus_user_id')?.value;

  const targetId = userIdParam || cookieUserId;
  let user = targetId ? db.getUserById(targetId) : null;

  if (!user) {
    user = db.getUserById('usr_sabrina') || db.getUsers()[0];
  }

  return NextResponse.json({ user });
}
