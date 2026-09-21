'use client';

import React, { useEffect, useState } from 'react';
import { Question } from '@/lib/types';
import { HelpCircle, User, Send, CheckCircle2, Clock } from 'lucide-react';

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'PENDING' | 'ANSWERED' | 'ALL'>('PENDING');
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);

  const fetchQuestions = () => {
    setLoading(true);
    fetch('/api/admin/questions')
      .then((res) => res.json())
      .then((data) => setQuestions(data.questions || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAnswer = async (id: string) => {
    const answerText = (answerDrafts[id] || '').trim();
    if (!answerText) return;
    setSendingId(id);
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerText }),
      });
      const data = await res.json();
      if (data.question) {
        setQuestions((prev) => prev.map((q) => (q.id === id ? data.question : q)));
        setAnswerDrafts((prev) => ({ ...prev, [id]: '' }));
      } else {
        alert(data.error || 'Error al responder');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión');
    } finally {
      setSendingId(null);
    }
  };

  const filtered = questions.filter((q) => filter === 'ALL' || q.status === filter);
  const pendingCount = questions.filter((q) => q.status === 'PENDING').length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4" />
          Consultas de Alumnas
        </span>
        <h2 className="text-xl font-serif font-bold text-slate-900 mt-0.5">Preguntas de tus cursos</h2>
        <p className="text-xs text-slate-500">
          Respondé acá las preguntas que dejaron en las lecciones; al alumno/a le llega un aviso por mail.
        </p>
      </div>

      <div className="flex gap-2">
        {(['PENDING', 'ANSWERED', 'ALL'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === f ? 'bg-lua-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            {f === 'PENDING' ? `Sin responder (${pendingCount})` : f === 'ANSWERED' ? 'Respondidas' : 'Todas'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-xs text-slate-500">Cargando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-xs text-slate-400">No hay preguntas para mostrar acá.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((q) => (
            <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] text-slate-400">
                    {q.courseTitle} · {q.lessonTitle}
                  </p>
                  <div className="flex items-start gap-2 mt-1">
                    <User className="w-3.5 h-3.5 text-lua-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-slate-800">{q.studentName}</span>
                      <p className="text-sm text-slate-700 mt-0.5">{q.questionText}</p>
                    </div>
                  </div>
                </div>
                {q.status === 'ANSWERED' ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3" /> Respondida
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full whitespace-nowrap">
                    <Clock className="w-3 h-3" /> Pendiente
                  </span>
                )}
              </div>

              {q.status === 'ANSWERED' ? (
                <div className="bg-lua-50 border border-lua-100 rounded-xl p-3 text-xs text-slate-700">
                  <span className="font-semibold text-lua-700">Tu respuesta ({q.answeredByName}):</span>
                  <p className="mt-0.5 whitespace-pre-line">{q.answerText}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={answerDrafts[q.id] || ''}
                    onChange={(e) => setAnswerDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder="Escribí tu respuesta..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-lua-500"
                  />
                  <button
                    onClick={() => handleAnswer(q.id)}
                    disabled={sendingId === q.id || !(answerDrafts[q.id] || '').trim()}
                    className="px-4 py-2 rounded-xl bg-lua-600 hover:bg-lua-700 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {sendingId === q.id ? 'Enviando...' : 'Responder'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
