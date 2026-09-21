import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireSelfOrAdmin } from '@/lib/auth';
import { sendOrSimulateEmail, renderNewQuestionEmailHtml } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    const lessonId = req.nextUrl.searchParams.get('lessonId');
    if (!lessonId) {
      return NextResponse.json({ error: 'Falta el parámetro lessonId' }, { status: 400 });
    }
    const questions = await db.getQuestionsForLesson(lessonId);
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error al obtener preguntas:', error);
    return NextResponse.json({ error: 'Error al obtener las preguntas' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { studentId, courseId, lessonId, questionText } = await req.json();

    if (!studentId || !courseId || !lessonId || !questionText?.trim()) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    const student = await requireSelfOrAdmin(req, studentId);
    if (!student) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const course = await db.getCourseById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }
    const lesson = course.modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId);
    if (!lesson) {
      return NextResponse.json({ error: 'Lección no encontrada' }, { status: 404 });
    }

    const question = await db.createQuestion({
      courseId: course.id,
      courseTitle: course.title,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      studentId: student.id,
      studentName: student.name,
      questionText: questionText.trim(),
    });

    // Notify the course's instructors (fallback: every Admin, if none assigned).
    let recipients = (
      await Promise.all((course.instructorIds || []).map((id) => db.getUserById(id)))
    ).filter((u): u is NonNullable<typeof u> => !!u);
    if (recipients.length === 0) {
      recipients = (await db.getUsers()).filter((u) => u.role === 'ADMIN');
    }

    const adminUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/preguntas`;
    await Promise.all(
      recipients.map((prof) =>
        sendOrSimulateEmail({
          to: prof.email,
          toName: prof.name,
          subject: `Nueva pregunta en "${course.title}"`,
          html: renderNewQuestionEmailHtml({
            professorName: prof.name,
            studentName: student.name,
            courseTitle: course.title,
            lessonTitle: lesson.title,
            questionText: question.questionText,
            adminUrl,
          }),
        })
      )
    );

    return NextResponse.json({ success: true, question });
  } catch (error) {
    console.error('Error al crear la pregunta:', error);
    return NextResponse.json({ error: 'Error al enviar la pregunta' }, { status: 500 });
  }
}
