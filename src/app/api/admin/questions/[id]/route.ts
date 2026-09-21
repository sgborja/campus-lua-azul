import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, canManageCourse } from '@/lib/auth';
import { sendOrSimulateEmail, renderQuestionAnsweredEmailHtml } from '@/lib/email';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { answerText } = await req.json();
    if (!answerText?.trim()) {
      return NextResponse.json({ error: 'La respuesta no puede estar vacía' }, { status: 400 });
    }

    const question = await db.getQuestionById(params.id);
    if (!question) {
      return NextResponse.json({ error: 'Pregunta no encontrada' }, { status: 404 });
    }

    const course = await db.getCourseById(question.courseId);
    if (!course || !canManageCourse(admin, course)) {
      return NextResponse.json({ error: 'No tenés permiso para responder esta pregunta' }, { status: 403 });
    }

    const updated = await db.answerQuestion(params.id, answerText.trim(), admin.id, admin.name);

    const student = await db.getUserById(question.studentId);
    if (student && updated) {
      const lessonUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/campus/curso/${course.slug}?leccion=${question.lessonId}`;
      await sendOrSimulateEmail({
        to: student.email,
        toName: student.name,
        subject: `Respondieron tu pregunta en "${course.title}"`,
        html: renderQuestionAnsweredEmailHtml({
          studentName: student.name,
          courseTitle: course.title,
          lessonTitle: question.lessonTitle,
          questionText: question.questionText,
          answerText: updated.answerText || answerText.trim(),
          lessonUrl,
        }),
      });
    }

    return NextResponse.json({ success: true, question: updated });
  } catch (error) {
    console.error('Error al responder la pregunta:', error);
    return NextResponse.json({ error: 'Error al responder la pregunta' }, { status: 500 });
  }
}
