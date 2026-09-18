'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Course, Quiz } from '@/lib/types';
import { Award, CheckCircle2, BookOpen, HelpCircle, ExternalLink } from 'lucide-react';

export default function AdminExamsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => {
        if (data.courses) setCourses(data.courses);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const coursesWithQuiz = courses.filter((c) => c.quiz);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900">
            Gestor de Exámenes y Evaluaciones
          </h2>
          <p className="text-xs text-slate-500">
            Cuestionarios interactivos con calificación automática y requisito de aprobación para certificar.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500">Cargando cuestionarios...</div>
      ) : (
        <div className="space-y-6">
          {coursesWithQuiz.map((c) => {
            const quiz = c.quiz!;
            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-6 p-6 sm:p-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                        Evaluación del Curso: {c.title}
                      </span>
                      <h3 className="font-serif font-bold text-lg text-slate-900">{quiz.title}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full">
                      Puntaje mínimo: {quiz.passingScorePercent}%
                    </span>
                    <Link
                      href={`/campus/curso/${c.slug}/examen/${quiz.id}`}
                      target="_blank"
                      className="text-xs text-lua-600 hover:text-lua-700 font-bold flex items-center gap-1"
                    >
                      <span>Probar Examen</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Questions Breakdown */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Preguntas configuradas ({quiz.questions.length})
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quiz.questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                      >
                        <div className="flex items-start gap-2 font-semibold text-slate-900">
                          <span className="text-slate-400 font-bold">{idx + 1}.</span>
                          <span className="leading-snug">{q.question}</span>
                        </div>

                        <ul className="space-y-1 pl-4 text-slate-600 text-[11px]">
                          {q.options.map((opt, optIdx) => (
                            <li
                              key={optIdx}
                              className={`flex items-center gap-1.5 ${
                                optIdx === q.correctOptionIndex ? 'text-emerald-700 font-bold' : ''
                              }`}
                            >
                              {optIdx === q.correctOptionIndex ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                              ) : (
                                <span className="w-1 h-1 rounded-full bg-slate-300 ml-1 mr-1" />
                              )}
                              <span>{opt}</span>
                            </li>
                          ))}
                        </ul>

                        <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-200">
                          Explicación: {q.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
