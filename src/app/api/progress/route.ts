import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireSelfOrAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { userId, courseId, lessonId, completed } = await req.json();

    if (!userId || !courseId || !lessonId) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos (userId, courseId, lessonId)' },
        { status: 400 }
      );
    }

    if (!requireSelfOrAdmin(req, userId)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Toggle or set state
    const isCompleted = db.toggleLessonProgress(userId, courseId, lessonId, completed);
    const progressPercent = db.getCourseProgressPercent(userId, courseId);

    // Check certificate eligibility
    const course = db.getCourseById(courseId);
    let certificate = db.getCertificateForCourse(userId, courseId);
    let certificateUnlocked = false;

    if (course && course.certificateEnabled && !certificate && progressPercent === 100) {
      // Check if course has a quiz that requires passing
      if (course.quiz) {
        const attempts = db.getQuizAttempts(userId, course.quiz.id);
        const passedAttempt = attempts.find((a) => a.passed);
        if (passedAttempt) {
          certificate = db.issueCertificate(userId, courseId, passedAttempt.scorePercent);
          certificateUnlocked = true;
        }
      } else {
        // No quiz required, 100% lessons unlocks certificate directly
        certificate = db.issueCertificate(userId, courseId, 100);
        certificateUnlocked = true;
      }
    }

    return NextResponse.json({
      success: true,
      isCompleted,
      progressPercent,
      certificate,
      certificateUnlocked,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar progreso' }, { status: 500 });
  }
}
