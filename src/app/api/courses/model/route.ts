import { NextResponse } from 'next/server';
import { db, getModelCourse } from '@/lib/db';

export async function POST() {
  try {
    const modelCourse = getModelCourse();
    db.saveCourse(modelCourse);
    return NextResponse.json({ success: true, course: modelCourse });
  } catch (error) {
    console.error('Error loading model course:', error);
    return NextResponse.json({ error: 'Error al cargar el curso modelo' }, { status: 500 });
  }
}
