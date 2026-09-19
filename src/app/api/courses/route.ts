import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Course } from '@/lib/types';
import { requireAdmin, requireSelfOrAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');

  const courses = await db.getCourses();

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
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  try {
    const body = await req.json();
    if (!body.title || !body.slug) {
      return NextResponse.json({ error: 'Título y slug son requeridos' }, { status: 400 });
    }

    const newCourse: Course = {
      id: `course_${Date.now()}`,
      slug: body.slug,
      title: body.title,
      shortDescription: body.shortDescription || '',
      description: body.description || '',
      price: Number(body.price) || 0,
      isFree: Boolean(body.isFree) || Number(body.price) === 0,
      coverImage: body.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800',
      category: body.category || 'General',
      level: body.level || 'Principiante',
      published: body.published !== undefined ? body.published : true,
      durationHours: Number(body.durationHours) || 1,
      certificateEnabled: body.certificateEnabled !== undefined ? body.certificateEnabled : true,
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
