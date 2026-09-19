import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Course } from '@/lib/types';
import { requireAdmin, requireSelfOrAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  const wantsAdminView = url.searchParams.get('admin') === 'true';

  const adminUser = wantsAdminView ? await requireAdmin(req) : null;
  const isAdmin = !!adminUser;
  const allCourses = await db.getCourses();
  let courses = isAdmin ? allCourses : allCourses.filter((c) => c.published);

  // Un Profesor solo gestiona los cursos donde figura como profesor a cargo;
  // Admin y Editor ven todos.
  if (adminUser?.role === 'PROFESOR') {
    courses = courses.filter((c) => c.instructorIds?.includes(adminUser.id));
  }

  if (!userId) {
    return NextResponse.json({ courses });
  }

  if (!(await requireSelfOrAdmin(req, userId))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  // Augment with user enrollment and progress data
  const augmentedCourses = await Promise.all(
    courses.map(async (c) => {
      const isEnrolled = await db.isEnrolled(userId, c.id);
      const progressPercent = isEnrolled ? await db.getCourseProgressPercent(userId, c.id) : 0;
      const certificate = isEnrolled ? await db.getCertificateForCourse(userId, c.id) : null;

      return {
        ...c,
        isEnrolled,
        progressPercent,
        hasCertificate: Boolean(certificate),
        certificateCode: certificate?.code,
      };
    })
  );

  return NextResponse.json({ courses: augmentedCourses });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  try {
    const body = await req.json();
    if (!body.title || !body.slug) {
      return NextResponse.json({ error: 'Título y slug son requeridos' }, { status: 400 });
    }

    // Un Profesor siempre queda a cargo del curso que crea (no puede
    // crearlo "para otro"); Admin/Editor pueden asignar profesores libremente.
    const instructorIds: string[] =
      admin.role === 'PROFESOR' ? [admin.id] : Array.isArray(body.instructorIds) ? body.instructorIds : [];

    const newCourse: Course = {
      id: `course_${Date.now()}`,
      slug: body.slug,
      title: body.title,
      shortDescription: body.shortDescription || '',
      description: body.description || '',
      price: Number(body.price) || 0,
      isFree: Boolean(body.isFree) || Number(body.price) === 0,
      priceOnRequest: Boolean(body.priceOnRequest),
      coverImage: body.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800',
      category: body.category || 'General',
      level: body.level || 'Principiante',
      published: body.published !== undefined ? body.published : true,
      durationHours: Number(body.durationHours) || 1,
      certificateEnabled: body.certificateEnabled !== undefined ? body.certificateEnabled : true,
      instructorIds,
      modules: body.modules || [],
      resources: body.resources || [],
      quiz: body.quiz || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.saveCourse(newCourse);
    return NextResponse.json({ course: newCourse, success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear curso' }, { status: 500 });
  }
}
