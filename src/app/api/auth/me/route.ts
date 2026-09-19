import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, publicUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  return NextResponse.json({ user: user ? publicUser(user) : null });
}
