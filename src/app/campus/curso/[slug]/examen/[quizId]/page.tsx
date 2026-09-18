'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Course, Quiz } from '@/lib/types';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const slug = params.slug as string;
  const quizId = params.quizId as string;

  useEffect(() => {
    if (!slug || !user) return;

    fetch(`/api/courses/${slug}?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.course) {
          setCourse(data.course);
          if (data.course.quiz) {
            setSelectedAnswers(new Array(data.course.quiz.questions.length).fill(-1));
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug, user]);

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (examResult) return; // locked after submission
    setSelectedAnswers((prev) => {
      const copy = [...prev];
      copy[questionIdx] = optionIdx;
      return copy;
    });
  };

  const handleSubmitExam = async () => {
    if (!course || !course.quiz || !user) return;

    const unanswered = selectedAnswers.filter((a) => a === -1).length;
    if (unanswered > 0) {
      if (!confirm(`Tienes ${unanswered} pregunta(s) sin responder. ¿Deseas entregar de todas formas?`)) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          courseId: course.id,
          quizId: course.quiz.id,
          userAnswers: selectedAnswers,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setExamResult(data);
        if (data.passed) {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.4 },
          });
        }
      }
    } catch (e) {
      console.error('Error submitting quiz:', e);
      alert('Error al calificar el examen');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    if (!course?.quiz) return;
    setExamResult(null);
    setSelectedAnswers(new Array(course.quiz.questions.length).fill(-1));
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-xs text-slate-500">Cargando evaluación...</div>
      </div>
    );
  }

  if (!course || !course.quiz) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <p className="text-slate-500 text-sm">Examen no encontrado.</p>
        <Link href="/campus" className="mt-4 inline-block text-lua-600 text-xs font-semibold">
          Volver a Mi Campus
        </Link>
      </div>
    );
  }

  const quiz = course.quiz;
  const answeredCount = selectedAnswers.filter((a) => a !== -1).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Back button */}
      <Link
        href={`/campus/curso/${course.slug}`}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Volver a las lecciones del curso</span>
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
              Evaluación Teórica y Práctica
            </span>
            <h1 className="text-2xl font-serif font-bold text-slate-900">{quiz.title}</h1>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">{quiz.description}</p>

        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 border-t border-slate-100">
          <span>Curso: <strong className="text-slate-800">{course.title}</strong></span>
          <span>•</span>
          <span>Preguntas: <strong className="text-slate-800">{quiz.questions.length}</strong></span>
          <span>•</span>
          <span>Puntaje mínimo de aprobación: <strong className="text-amber-600">{quiz.passingScorePercent}%</strong></span>
        </div>
      </div>

      {/* RESULT CARD (If submitted) */}
      {examResult && (
        <div
          className={`rounded-3xl p-6 sm:p-8 border shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-200 ${
            examResult.passed
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              : 'bg-rose-50/80 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {examResult.passed ? (
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center">
                  <XCircle className="w-7 h-7" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold">
                  {examResult.passed ? '¡Felicitaciones! Has aprobado el examen' : 'No alcanzaste el puntaje requerido'}
                </h2>
                <p className="text-xs opacity-80 mt-0.5">
                  Obtuviste {examResult.correctCount} aciertos de {examResult.totalQuestions} ({examResult.scorePercent}%)
                </p>
              </div>
            </div>

            <span className="text-2xl font-extrabold">{examResult.scorePercent}%</span>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {examResult.passed ? (
              <Link
                href="/campus/certificados"
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all shadow flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-amber-400" />
                Ver mi Certificado Oficial
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                onClick={handleRetry}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all shadow flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reintentar Examen
              </button>
            )}

            <Link
              href={`/campus/curso/${course.slug}`}
              className="px-4 py-2.5 rounded-xl bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold border border-slate-300 transition-colors"
            >
              Volver al Aula Virtual
            </Link>
          </div>
        </div>
      )}

      {/* QUESTIONS LIST */}
      <div className="space-y-6">
        {quiz.questions.map((q, qIdx) => {
          const feedback = examResult?.questionsFeedback?.[qIdx];

          return (
            <div
              key={q.id}
              className={`bg-white rounded-2xl p-6 border shadow-sm space-y-4 transition-all ${
                feedback
                  ? feedback.isCorrect
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-rose-200 bg-rose-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {qIdx + 1}
                  </span>
                  <h3 className="font-semibold text-slate-900 text-sm leading-relaxed">
                    {q.question}
                  </h3>
                </div>

                {feedback && (
                  feedback.isCorrect ? (
                    <span className="text-emerald-600 flex items-center gap-1 text-xs font-bold flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4" /> Correcta
                    </span>
                  ) : (
                    <span className="text-rose-600 flex items-center gap-1 text-xs font-bold flex-shrink-0">
                      <XCircle className="w-4 h-4" /> Incorrecta
                    </span>
                  )
                )}
              </div>

              {/* Options */}
              <div className="space-y-2 pl-10">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[qIdx] === optIdx;
                  const isTheCorrectOne = feedback && feedback.correctOptionIndex === optIdx;

                  let borderClass = 'border-slate-200 hover:border-slate-300 bg-white';
                  if (isSelected) borderClass = 'border-lua-600 bg-lua-50/60 ring-1 ring-lua-600';
                  if (feedback) {
                    if (isTheCorrectOne) borderClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium';
                    else if (isSelected && !feedback.isCorrect) borderClass = 'border-rose-400 bg-rose-50 text-rose-900';
                    else borderClass = 'border-slate-100 opacity-60';
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={Boolean(examResult)}
                      onClick={() => handleSelectOption(qIdx, optIdx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center gap-3 ${borderClass}`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'border-lua-600 bg-lua-600' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback explanation */}
              {feedback && (
                <div className="ml-10 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                  <strong className="text-slate-800 block">Explicación técnica:</strong>
                  <p>{feedback.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SUBMIT BUTTON */}
      {!examResult && (
        <div className="sticky bottom-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {answeredCount} de {quiz.questions.length} preguntas respondidas
          </span>

          <button
            onClick={handleSubmitExam}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-lua-600 to-lua-700 hover:from-lua-500 hover:to-lua-600 text-white text-xs font-bold shadow-lg shadow-lua-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Calificando...' : 'Finalizar y Calificar Examen'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
