'use client';

import React, { useEffect, useState } from 'react';
import { User, Course } from '@/lib/types';
import {
  Users,
  Send,
  FileDown,
  BookOpen,
  CheckCircle2,
  Cake,
  Mail,
  X,
  Sparkles,
} from 'lucide-react';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Dispatch form
  const [documentTitle, setDocumentTitle] = useState('Guía de Actualización de Medidas 2026');
  const [documentUrl, setDocumentUrl] = useState('/docs/Guia-Medidas-A5-LuaAzul.pdf');
  const [dispatchNote, setDispatchNote] = useState('Te compartimos este material complementario para tu curso.');
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  const fetchStudents = () => {
    setLoading(true);
    fetch('/api/admin/metrics')
      .then((res) => res.json())
      .then((data) => {
        if (data.students) setStudents(data.students);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleOpenDispatch = (student: any) => {
    setSelectedStudent(student);
    setDispatchSuccess(false);
    setShowDispatchModal(true);
  };

  const handleSendDocumentation = (e: React.FormEvent) => {
    e.preventDefault();
    setDispatchSuccess(true);
    setTimeout(() => {
      setShowDispatchModal(false);
      setDispatchSuccess(false);
      alert(`Documentación enviada exitosamente a ${selectedStudent?.email || 'todos los alumnos'}`);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900">
            Alumnos Matriculados & Progreso
          </h2>
          <p className="text-xs text-slate-500">
            Monitorea el avance de los estudiantes y despacha documentación y guías exclusivas.
          </p>
        </div>

        <button
          onClick={() => handleOpenDispatch(null)}
          className="px-4 py-2 rounded-xl bg-lua-600 hover:bg-lua-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" />
          <span>Enviar Documentación General</span>
        </button>
      </div>

      {/* Students List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500">Cargando alumnos...</div>
      ) : (
        <div className="space-y-4">
          {students.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{student.name}</h3>
                    <p className="text-xs text-slate-500">{student.email}</p>
                    {student.birthDate && (
                      <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-0.5">
                        <Cake className="w-3 h-3" />
                        Nacimiento: {student.birthDate}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenDispatch(student)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-lua-50 hover:text-lua-700 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar Documentación</span>
                  </button>
                </div>
              </div>

              {/* Course Progress Badges */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Cursos Matriculados ({student.coursesProgress?.length || 0}):
                </span>

                {student.coursesProgress?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {student.coursesProgress.map((cp: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-800 line-clamp-1">{cp.courseTitle}</strong>
                          <span className="font-bold text-slate-700">{cp.progressPercent}%</span>
                        </div>

                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              cp.progressPercent === 100 ? 'bg-emerald-500' : 'bg-lua-600'
                            }`}
                            style={{ width: `${cp.progressPercent}%` }}
                          />
                        </div>

                        {cp.hasCertificate && (
                          <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 pt-0.5">
                            <CheckCircle2 className="w-3 h-3 text-amber-500" />
                            Certificado emitido
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Sin cursos matriculados aún.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DISPATCH DOCUMENTATION MODAL */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-lua-50 text-lua-600 flex items-center justify-center">
                  <FileDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900">
                    Envío de Documentación
                  </h3>
                  <p className="text-xs text-slate-500">
                    Destinatario: <strong>{selectedStudent ? selectedStudent.name : 'Todos los Alumnos'}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDispatchModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendDocumentation} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Título del Documento</label>
                <input
                  type="text"
                  required
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Ruta o Archivo Descargable</label>
                <input
                  type="text"
                  required
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Mensaje / Nota para el Alumno</label>
                <textarea
                  rows={3}
                  value={dispatchNote}
                  onChange={(e) => setDispatchNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>El alumno recibirá una notificación en su campus con acceso a la descarga del archivo.</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={dispatchSuccess}
                  className="px-5 py-2.5 rounded-xl bg-lua-600 hover:bg-lua-700 text-white font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  {dispatchSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Enviar Documento Ahora
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
