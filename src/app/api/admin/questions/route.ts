import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, canManageCourse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  if (admin.role === 'ADMIN' || admin.role === 'EDITOR') {
    const questions = await db.getAllQuestions();
    return NextResponse.json({ questions });
  }

  const courses = await db.getCourses();
  const ownCourseIds = courses.filter((c) => canManageCourse(admin, c)).map((c) => c.id);
  const questions = await db.getQuestionsForCourses(ownCourseIds);
  return NextResponse.json({ questions });
}
