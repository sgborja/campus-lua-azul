'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Course, Quiz, QuizQuestion } from '@/lib/types';
import {
  Award,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  ExternalLink,
  PlusCircle,
  Edit,
  Trash2,
  X,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export default function AdminExamsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [originalCourseId, setOriginalCourseId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [examDescription, setExamDescription] = useState('Evaluación requerida para emitir tu certificado oficial.');
  const [passingScore, setPassingScore] = useState(80);
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: 'q_1',
      question: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      explanation: '',
    },
  ]);
  const [saving, setSaving] = useState(false);

  const fetchCourses = () => {
    setLoading(true);
    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => {
        if (data.courses) {
          setCourses(data.courses);
          if (data.courses.length > 0 && !selectedCourseId) {
            setSelectedCourseId(data.courses[0].id);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const coursesWithQuiz = courses.filter((c) => c.quiz);
  const coursesWithoutQuiz = courses.filter((c) => !c.quiz);

  const handleOpenCreateModal = (courseId?: string) => {
    setIsEditing(false);
    setSelectedCourseId(courseId || (courses[0]?.id ?? ''));
    setExamTitle('');
    setExamDescription('Evaluación requerida para emitir tu certificado oficial.');
    setPassingScore(80);
    setQuestions([
      {
        id: `q_${Date.now()}_1`,
        question: '¿Cuál es el concepto principal aprendido en este módulo?',
        options: [
          'Opción A: Primera alternativa',
          'Opción B: Segunda alternativa (Correcta)',
          'Opción C: Tercera alternativa',
          'Opción D: Cuarta alternativa',
        ],
        correctOptionIndex: 1,
        explanation: 'Esta es la respuesta correcta porque resume el principio teórico de la lección.',
      },
    ]);
    setShowModal(true);
  };

  const handleOpenEditModal = (course: Course) => {
    if (!course.quiz) return;
    setIsEditing(true);
    setOriginalCourseId(course.id);
    setSelectedCourseId(course.id);
    setExamTitle(course.quiz.title);
    setExamDescription(course.quiz.description || '');
    setPassingScore(course.quiz.passingScorePercent || 80);
    setQuestions(
      course.quiz.questions.length > 0
        ? course.quiz.questions
        : [
            {
              id: `q_${Date.now()}_1`,
              question: '',
              options: ['', '', '', ''],
              correctOptionIndex: 0,
              explanation: '',
            },
          ]
    );
    setShowModal(true);
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q_${Date.now()}_${prev.length + 1}`,
        question: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        explanation: '',
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) {
      alert('El examen debe tener al menos una pregunta.');
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionTextChange = (idx: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], question: text };
      return copy;
    });
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const opts = [...copy[qIdx].options];
      opts[optIdx] = val;
      copy[qIdx] = { ...copy[qIdx], options: opts };
      return copy;
    });
  };

  const handleCorrectOptionChange = (qIdx: number, correctIdx: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], correctOptionIndex: correctIdx };
      return copy;
    });
  };

  const handleExplanationChange = (qIdx: number, exp: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], explanation: exp };
      return copy;
    });
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourseId) {
      alert('Selecciona un curso para vincular el examen.');
      return;
    }

    if (!examTitle.trim()) {
      alert('Por favor ingresa un título para el examen.');
      return;
    }

    // Validate that questions are not empty
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question.trim()) {
        alert(`La pregunta #${i + 1} no tiene texto.`);
        return;
      }
      for (let j = 0; j < questions[i].options.length; j++) {
        if (!questions[i].options[j].trim()) {
          alert(`En la pregunta #${i + 1}, la opción #${j + 1} está vacía.`);
          return;
        }
      }
    }

    const payload = {
      courseId: selectedCourseId,
      quiz: {
        id: `quiz_${Date.now()}`,
        title: examTitle,
        description: examDescription,
        passingScorePercent: Number(passingScore),
        questions,
      },
    };

    setSaving(true);
    try {
      // Si estamos editando y se cambió el curso, primero liberamos el
      // examen del curso original para no dejarlo duplicado en dos cursos.
      if (isEditing && originalCourseId && originalCourseId !== selectedCourseId) {
        await fetch(`/api/admin/quizzes?courseId=${originalCourseId}`, { method: 'DELETE' });
      }

      const res = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowModal(false);
        fetchCourses();
      } else {
        alert(data.error || 'Error al guardar el examen');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuiz = async (courseId: string) => {
    if (!confirm('¿Estás segura de eliminar este examen del curso?')) return;

    try {
      const res = await fetch(`/api/admin/quizzes?courseId=${courseId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchCourses();
      } else {
        alert('Error al eliminar el examen');
      }
    } catch (e) {
      console.error(e);
      alert('Error al eliminar el examen');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900">
            Gestor de Exámenes y Evaluaciones
          </h2>
          <p className="text-xs text-slate-500">
            Configura cuestionarios interactivos con corrección automática y porcentaje de aprobación para certificar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {courses.length > 0 && (
            <button
              onClick={() => handleOpenCreateModal()}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Crear Nuevo Examen</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500">Cargando cuestionarios...</div>
      ) : courses.length === 0 ? (
        /* Empty State: No courses yet */
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-slate-900">
              Aún no tienes cursos publicados
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Los exámenes se asocian a un curso para desbloquear los certificados oficiales de tus alumnas. Primero crea o carga un curso.
            </p>
          </div>
          <Link
            href="/admin/cursos"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lua-600 hover:bg-lua-700 text-white text-xs font-bold shadow transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ir a Crear mi Primer Curso</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Active Quizzes List */}
          {coursesWithQuiz.length > 0 ? (
            <div className="space-y-6">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Exámenes Activos ({coursesWithQuiz.length})</span>
              </div>

              {coursesWithQuiz.map((c) => {
                const quiz = c.quiz!;
                return (
                  <div
                    key={c.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-6 p-6 sm:p-8"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Curso: {c.title}
                          </span>
                          <h3 className="font-serif font-bold text-lg text-slate-900 mt-1">{quiz.title}</h3>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full">
                          Aprobación: {quiz.passingScorePercent}%
                        </span>

                        <Link
                          href={`/campus/curso/${c.slug}/examen/${quiz.id}`}
                          target="_blank"
                          className="px-3 py-1.5 rounded-lg bg-lua-50 text-lua-700 hover:bg-lua-100 font-bold text-xs flex items-center gap-1 transition-colors"
                          title="Probar en el aula virtual"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Probar Examen</span>
                        </Link>

                        <button
                          onClick={() => handleOpenEditModal(c)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs flex items-center gap-1 transition-colors"
                          title="Editar preguntas"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={() => handleDeleteQuiz(c.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="Eliminar examen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Questions Breakdown */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Preguntas configuradas ({quiz.questions.length})
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          La respuesta correcta está destacada en verde
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {quiz.questions.map((q, idx) => (
                          <div
                            key={q.id || idx}
                            className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                          >
                            <div className="flex items-start gap-2 font-semibold text-slate-900">
                              <span className="text-amber-600 font-bold">{idx + 1}.</span>
                              <span className="leading-snug">{q.question}</span>
                            </div>

                            <ul className="space-y-1.5 pl-2 text-slate-600 text-[11px]">
                              {q.options.map((opt, optIdx) => (
                                <li
                                  key={optIdx}
                                  className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors ${
                                    optIdx === q.correctOptionIndex
                                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                                      : 'bg-white border border-slate-100'
                                  }`}
                                >
                                  {optIdx === q.correctOptionIndex ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                  ) : (
                                    <span className="w-2 h-2 rounded-full bg-slate-300 ml-1 mr-1 flex-shrink-0" />
                                  )}
                                  <span>{opt}</span>
                                </li>
                              ))}
                            </ul>

                            {q.explanation && (
                              <p className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-200">
                                <strong>Explicación:</strong> {q.explanation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <Award className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="font-serif font-bold text-base text-slate-900">
                Ningún curso tiene un examen asignado todavía
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Puedes crear un examen y asignárselo a cualquiera de tus cursos publicados para que tus alumnas rindan la evaluación y obtengan su diploma oficial.
              </p>
              <button
                onClick={() => handleOpenCreateModal()}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow transition-all inline-flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Crear Examen Ahora</span>
              </button>
            </div>
          )}

          {/* Courses Without Quiz Callout */}
          {coursesWithoutQuiz.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-xs text-amber-900 uppercase tracking-wider">
                    Cursos sin examen ({coursesWithoutQuiz.length})
                  </h4>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Los siguientes cursos aún no tienen cuestionario de acreditación:
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {coursesWithoutQuiz.map((c) => (
                      <span
                        key={c.id}
                        className="bg-white text-slate-800 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-2"
                      >
                        <span>{c.title}</span>
                        <button
                          onClick={() => handleOpenCreateModal(c.id)}
                          className="text-amber-700 font-bold hover:underline text-[11px]"
                        >
                          + Agregar
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* CREATE / EDIT EXAM MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    {isEditing ? 'Editar Examen' : 'Crear Nuevo Examen de Certificación'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Define las preguntas, opciones de selección múltiple y porcentaje para aprobar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuiz} className="space-y-6 text-xs">
              
              {/* Top settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">¿A qué curso pertenece? *</label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} {c.quiz && c.id !== originalCourseId ? '(Ya tiene examen, se reemplazará)' : ''}
                      </option>
                    ))}
                  </select>
                  {isEditing && (
                    <p className="text-[11px] text-slate-400">
                      Podés cambiar el curso: el examen se moverá al curso que elijas.
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">
                    Puntaje Mínimo para Aprobar (%) *
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={50}
                      max={100}
                      required
                      value={passingScore}
                      onChange={(e) => setPassingScore(Number(e.target.value))}
                      className="w-24 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-amber-700 outline-none"
                    />
                    <span className="text-[11px] text-slate-500">
                      Recomendado: 75% u 80% de respuestas correctas
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Título del Examen *</label>
                <input
                  type="text"
                  required
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="ej. Evaluación Final: Sistema de Flores de Bach"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Instrucción para el Alumno</label>
                <input
                  type="text"
                  value={examDescription}
                  onChange={(e) => setExamDescription(e.target.value)}
                  placeholder="Mensaje de bienvenida al comenzar el cuestionario"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              {/* Questions List */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                    Preguntas ({questions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Agregar Pregunta</span>
                  </button>
                </div>

                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                  {questions.map((q, qIdx) => (
                    <div
                      key={q.id || qIdx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-700 text-xs">
                          Pregunta #{qIdx + 1}
                        </span>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIdx)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                            title="Eliminar pregunta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Question text */}
                      <input
                        type="text"
                        required
                        value={q.question}
                        onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                        placeholder="Escribe aquí el enunciado de la pregunta..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-1 focus:ring-amber-500 outline-none font-medium"
                      />

                      {/* 4 Options with radio for correct answer */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-semibold text-slate-600 block">
                          Alternativas (marca el círculo de la opción que es CORRECTA):
                        </span>
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct_${qIdx}`}
                              checked={q.correctOptionIndex === optIdx}
                              onChange={() => handleCorrectOptionChange(qIdx, optIdx)}
                              className="text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                              title="Marcar como respuesta correcta"
                            />
                            <input
                              type="text"
                              required
                              value={opt}
                              onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                              placeholder={`Opción ${String.fromCharCode(65 + optIdx)}`}
                              className={`flex-1 px-3 py-1.5 rounded-lg border text-xs bg-white outline-none ${
                                q.correctOptionIndex === optIdx
                                  ? 'border-emerald-300 bg-emerald-50/30'
                                  : 'border-slate-200'
                              }`}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Pedagogical Explanation */}
                      <div className="pt-1">
                        <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                          Explicación Pedagógica (visible para el alumno tras enviar el examen):
                        </label>
                        <input
                          type="text"
                          value={q.explanation}
                          onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                          placeholder="ej. El método correcto es solarización porque capta la frecuencia sutil de la flor..."
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] bg-white text-slate-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow transition-all disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Examen y Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
