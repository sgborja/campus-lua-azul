import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const targetRole = url.searchParams.get('role');

  const users = db.getUsers();
  const targetUser =
    targetRole === 'ADMIN'
      ? users.find((u) => u.role === 'ADMIN') || users[0]
      : users.find((u) => u.role === 'STUDENT') || users[0];

  const response = NextResponse.json({ user: targetUser });
  if (targetUser) {
    response.cookies.set('campus_user_id', targetUser.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: false,
    });
  }
  return response;
}
