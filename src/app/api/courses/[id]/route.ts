import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const course = db.getCourseById(params.id) || db.getCourseBySlug(params.id);
  if (!course) {
    return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
  }

  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');

  if (userId) {
    const isEnrolled = db.isEnrolled(userId, course.id);
    const progress = db.getProgress(userId, course.id);
    const progressPercent = db.getCourseProgressPercent(userId, course.id);
    const certificate = db.getCertificateForCourse(userId, course.id);
    const quizAttempts = course.quiz ? db.getQuizAttempts(userId, course.quiz.id) : [];

    return NextResponse.json({
      course,
      isEnrolled,
      progress,
      progressPercent,
      certificate,
      quizAttempts,
    });
  }

  return NextResponse.json({ course });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const course = db.getCourseById(params.id);
    if (!course) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }

    const body = await req.json();
    const updated = {
      ...course,
      ...body,
      id: course.id, // preserve id
      updatedAt: new Date().toISOString(),
    };

    db.saveCourse(updated);
    return NextResponse.json({ course: updated, success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar curso' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    db.deleteCourse(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar curso' }, { status: 500 });
  }
}
