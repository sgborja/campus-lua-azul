import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userIdParam = url.searchParams.get('userId');
  const cookieUserId = req.cookies.get('campus_user_id')?.value;

  const targetId = userIdParam || cookieUserId;
  const user = targetId ? db.getUserById(targetId) : null;

  return NextResponse.json({ user: user || null });
}
