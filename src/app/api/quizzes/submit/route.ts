import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireSelfOrAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { userId, courseId, quizId, userAnswers } = await req.json();

    if (!userId || !courseId || !quizId || !Array.isArray(userAnswers)) {
      return NextResponse.json(
        { error: 'Parámetros inválidos' },
        { status: 400 }
      );
    }

    if (!(await requireSelfOrAdmin(req, userId))) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const course = await db.getCourseById(courseId);
    if (!course || !course.quiz || course.quiz.id !== quizId) {
      return NextResponse.json({ error: 'Examen no encontrado' }, { status: 404 });
    }

    const quiz = course.quiz;
    let correctCount = 0;
    const questionsFeedback = quiz.questions.map((q, idx) => {
      const selected = userAnswers[idx];
      const isCorrect = selected === q.correctOptionIndex;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        selectedOption: selected,
        correctOptionIndex: q.correctOptionIndex,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const totalQuestions = quiz.questions.length;
    const scorePercent = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercent >= quiz.passingScorePercent;

    // Save attempt
    const attempt = await db.saveQuizAttempt({
      quizId,
      courseId,
      userId,
      scorePercent,
      passed,
      userAnswers,
    });

    // Check certificate issuance
    let certificate = await db.getCertificateForCourse(userId, courseId);
    let certificateUnlocked = false;

    if (passed && course.certificateEnabled && !certificate) {
      const progressPercent = await db.getCourseProgressPercent(userId, courseId);
      if (progressPercent === 100) {
        certificate = await db.issueCertificate(userId, courseId, scorePercent);
        certificateUnlocked = true;
      }
    }

    return NextResponse.json({
      success: true,
      scorePercent,
      correctCount,
      totalQuestions,
      passed,
      passingScorePercent: quiz.passingScorePercent,
      questionsFeedback,
      attempt,
      certificate,
      certificateUnlocked,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al procesar el examen' }, { status: 500 });
  }
}
