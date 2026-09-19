import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Quiz } from '@/lib/types';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { courseId, quiz } = body;

    if (!courseId) {
      return NextResponse.json({ error: 'courseId es requerido' }, { status: 400 });
    }

    if (!quiz || !quiz.title || !quiz.questions || quiz.questions.length === 0) {
      return NextResponse.json(
        { error: 'El examen debe tener un título y al menos una pregunta' },
        { status: 400 }
      );
    }

    const cleanQuiz: Quiz = {
      id: quiz.id || `quiz_${Date.now()}`,
      courseId,
      title: quiz.title,
      description: quiz.description || 'Evaluación requerida para emitir tu certificado.',
      passingScorePercent: Number(quiz.passingScorePercent) || 75,
      questions: quiz.questions.map((q: any, idx: number) => ({
        id: q.id || `q_${Date.now()}_${idx}`,
        question: q.question,
        options: q.options || [],
        correctOptionIndex: Number(q.correctOptionIndex) || 0,
        explanation: q.explanation || 'Respuesta correcta según el material de estudio.',
      })),
    };

    const updatedCourse = await db.saveCourseQuiz(courseId, cleanQuiz);
    if (!updatedCourse) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, course: updatedCourse, quiz: cleanQuiz });
  } catch (error) {
    console.error('Error saving quiz:', error);
    return NextResponse.json({ error: 'Error al guardar el examen' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }
  try {
    const url = new URL(req.url);
    const courseId = url.searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'courseId es requerido' }, { status: 400 });
    }

    const updated = await db.deleteCourseQuiz(courseId);
    if (!updated) {
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, course: updated });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json({ error: 'Error al eliminar el examen' }, { status: 500 });
  }
}
