import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Course } from '@/lib/types';
import { requireAdmin, requireSelfOrAdmin, getSessionUser, canManageCourse } from '@/lib/auth';

function stripPaidContent(course: Course): Course {
  return {
    ...course,
    modules: course.modules?.map((m) => ({
      ...m,
      lessons: m.lessons?.map((l) => ({
        ...l,
        videoUrl: undefined,
        pptUrl: undefined,
        content: '',
      })),
    })),
    resources: [],
    quiz: undefined,
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const course = (await db.getCourseById(params.id)) || (await db.getCourseBySlug(params.id));
  if (!course) {
    return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
  }

  if (!course.published) {
    const admin = await requireAdmin(req);
    if (!admin || !canManageCourse(admin, course)) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }
  }

  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');

  if (userId) {
    if (!(await requireSelfOrAdmin(req, userId))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const isEnrolled = await db.isEnrolled(userId, course.id);
    const progress = await db.getProgress(userId, course.id);
    const progressPercent = await db.getCourseProgressPercent(userId, course.id);
    const certificate = await db.getCertificateForCourse(userId, course.id);
    const quizAttempts = course.quiz ? await db.getQuizAttempts(userId, course.quiz.id) : [];

    const requester = await getSessionUser(req);
    const isStaff = !!requester && requester.role !== 'STUDENT';
    const responseCourse = isEnrolled || isStaff ? course : stripPaidContent(course);

    return NextResponse.json({
      course: responseCourse,
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
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  try {
    const course = await db.getCourseById(params.id);
    if (!course) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }
    if (!canManageCourse(admin, course)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    // Un Profesor no puede reasignar a qué profesores pertenece el curso.
    if (admin.role === 'PROFESOR') {
      delete body.instructorIds;
    }

    const updated = {
      ...course,
      ...body,
      id: course.id, // preserve id
      updatedAt: new Date().toISOString(),
    };

    await db.saveCourse(updated);
    return NextResponse.json({ course: updated, success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar curso' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  try {
    const course = await db.getCourseById(params.id);
    if (!course) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }
    if (!canManageCourse(admin, course)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    await db.deleteCourse(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar curso' }, { status: 500 });
  }
}
