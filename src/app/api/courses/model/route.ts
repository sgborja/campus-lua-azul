import { NextRequest, NextResponse } from 'next/server';
import { db, getModelCourse } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  try {
    const modelCourse = getModelCourse();
    db.saveCourse(modelCourse);
    return NextResponse.json({ success: true, course: modelCourse });
  } catch (error) {
    console.error('Error loading model course:', error);
    return NextResponse.json({ error: 'Error al cargar el curso modelo' }, { status: 500 });
  }
}
