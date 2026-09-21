'use client';

import React, { useEffect, useState } from 'react';
import { UserRole } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import {
  Users,
  Shield,
  GraduationCap,
  Edit,
  Send,
  FileDown,
  CheckCircle2,
  X,
  Sparkles,
  UserCheck,
} from 'lucide-react';

export default function AdminUsersAndPermissionsPage() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'ADMIN';
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'progress'>('users');
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

  // Dispatch modal
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [documentTitle, setDocumentTitle] = useState('Guía de Estudio en PDF Lua Azul');
  const [documentUrl, setDocumentUrl] = useState('/docs/Guia-Medidas-A5-LuaAzul.pdf');
  const [dispatchNote, setDispatchNote] = useState('Material complementario para tu cursada.');
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/admin/metrics')
      .then((res) => res.json())
      .then((data) => {
        if (data.allUsers) setAllUsers(data.allUsers);
        if (data.students) setStudents(data.students);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUpdatingRoleId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAllUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        alert('Error al actualizar permisos');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión');
    } finally {
      setUpdatingRoleId(null);
    }
  };

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
      alert(`Documentación despachada a ${selectedStudent ? selectedStudent.email : 'todos los alumnos'}`);
    }, 1200);
  };

  const roleBadges: Record<UserRole, { label: string; bg: string; text: string }> = {
    ADMIN: { label: 'Administrador', bg: 'bg-amber-100 border-amber-300', text: 'text-amber-900' },
    PROFESOR: { label: 'Profesor / Instructor', bg: 'bg-emerald-100 border-emerald-300', text: 'text-emerald-900' },
    EDITOR: { label: 'Editor de Contenidos', bg: 'bg-blue-100 border-blue-300', text: 'text-blue-900' },
    STUDENT: { label: 'Alumno/a', bg: 'bg-slate-100 border-slate-300', text: 'text-slate-800' },
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-azul-dark">
            Gestión de Usuarios, Permisos y Alumnos
          </h2>
          <p className="text-xs text-slate-500">
            Asigna roles de Administrador, Profesor o Editor, y supervisa el progreso formativo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'users'
                ? 'bg-azul text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5 inline mr-1.5" />
            Roles y Permisos ({allUsers.length})
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'progress'
                ? 'bg-azul text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 inline mr-1.5" />
            Progreso y Documentación ({students.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500">Cargando usuarios...</div>
      ) : activeTab === 'users' ? (
        /* TAB 1: USERS & PERMISSIONS */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Usuarios registrados en la plataforma
            </span>
            <span className="text-xs text-slate-500">
              Puedes cambiar el permiso de cualquier usuario en tiempo real
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {allUsers.map((u) => {
              const currentBadge = roleBadges[u.role as UserRole] || roleBadges.STUDENT;

              return (
                <div
                  key={u.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={u.name}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm text-slate-900">{u.name}</strong>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${currentBadge.bg} ${currentBadge.text}`}
                        >
                          {currentBadge.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>

                  {/* Role Selector Controls (solo ADMIN puede reasignar roles) */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isSuperAdmin ? (
                      <>
                        <span className="text-xs text-slate-400 font-medium hidden md:inline">
                          Asignar rol:
                        </span>
                        <select
                          value={u.role}
                          disabled={updatingRoleId === u.id}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-800 outline-none focus:ring-2 focus:ring-azul disabled:opacity-50 cursor-pointer shadow-sm"
                        >
                          <option value="ADMIN">👑 Administrador (Total)</option>
                          <option value="PROFESOR">🌿 Profesor / Instructor</option>
                          <option value="EDITOR">✏️ Editor de Contenidos</option>
                          <option value="STUDENT">🎓 Alumno/a</option>
                        </select>
                      </>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-500">
                        {u.role}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* TAB 2: STUDENTS PROGRESS & DOCUMENT DISPATCH */
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => handleOpenDispatch(null)}
              className="px-4 py-2 rounded-xl bg-verde hover:bg-verde-light text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Documentación General</span>
            </button>
          </div>

          {students.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 text-xs">
              No hay alumnos matriculados todavía.
            </div>
          ) : (
            students.map((student) => (
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
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenDispatch(student)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-verde/10 hover:text-verde text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar Documentación</span>
                  </button>
                </div>

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
                              className="bg-verde h-1.5 rounded-full"
                              style={{ width: `${cp.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Sin cursos matriculados aún.</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* DISPATCH DOCUMENTATION MODAL */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-celeste/40 text-azul flex items-center justify-center">
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
                <label className="font-semibold text-slate-700 block">Ruta o Archivo PDF</label>
                <input
                  type="text"
                  required
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Mensaje / Nota para el Alumno/a</label>
                <textarea
                  rows={3}
                  value={dispatchNote}
                  onChange={(e) => setDispatchNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
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
                  className="px-5 py-2.5 rounded-xl bg-verde hover:bg-verde-light text-white font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  {dispatchSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Despachando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Despachar Documento
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
