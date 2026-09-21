'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Course } from '@/lib/types';
import {
  Ticket,
  PlusCircle,
  Trash2,
  Power,
  ShieldAlert,
  X,
  Pencil,
} from 'lucide-react';

export default function AdminCouponsPage() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(20);
  const [courseId, setCourseId] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/coupons').then((res) => res.json()),
      fetch('/api/courses?admin=true').then((res) => res.json()),
    ])
      .then(([couponsData, coursesData]) => {
        setCoupons(couponsData.coupons || []);
        setCourses(coursesData.courses || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setCode('');
    setDiscountPercent(20);
    setCourseId('');
    setMaxUses('');
    setExpiresAt('');
    setShowModal(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditingId(c.id);
    setCode(c.code);
    setDiscountPercent(c.discountPercent);
    setCourseId(c.courseId || '');
    setMaxUses(c.maxUses ? String(c.maxUses) : '');
    setExpiresAt(c.expiresAt ? c.expiresAt.slice(0, 10) : '');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(editingId ? `/api/admin/coupons/${editingId}` : '/api/admin/coupons', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          discountPercent: Number(discountPercent),
          courseId: courseId || null,
          maxUses: maxUses ? Number(maxUses) : null,
          expiresAt: expiresAt || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        fetchData();
      } else {
        alert(data.error || `Error al ${editingId ? 'editar' : 'crear'} el cupón`);
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active }),
      });
      if (res.ok) fetchData();
      else alert('Error al actualizar el cupón');
    } catch (e) {
      console.error(e);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este cupón definitivamente?')) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
      else alert('Error al eliminar el cupón');
    } catch (e) {
      console.error(e);
    } finally {
      setBusyId(null);
    }
  };

  if (user && user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto text-center py-24 space-y-3">
        <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto" />
        <h2 className="font-serif font-bold text-lg text-slate-800">Acceso restringido</h2>
        <p className="text-xs text-slate-500">Solo el rol Administrador puede crear cupones de descuento.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-500">Cargando cupones...</div>;
  }

  const courseTitle = (id?: string) => (id ? courses.find((c) => c.id === id)?.title || 'Curso eliminado' : 'Todos los cursos');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900">Cupones de Descuento</h2>
          <p className="text-xs text-slate-500">
            Creá códigos de descuento (o 100% gratis) para uno o todos los cursos.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-lua-600 hover:bg-lua-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Crear Cupón</span>
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-lua-50 text-lua-600 flex items-center justify-center mx-auto">
            <Ticket className="w-7 h-7" />
          </div>
          <h3 className="font-serif font-bold text-lg text-slate-900">Todavía no creaste ningún cupón</h3>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-lua-600 hover:bg-lua-700 text-white font-bold text-xs shadow transition-all inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Crear el primero</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <code className="font-mono font-bold text-sm bg-slate-100 px-2.5 py-1 rounded-lg text-slate-800">
                  {c.code}
                </code>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    c.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {c.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p>
                  <strong className="text-lua-700">{c.discountPercent}%</strong> de descuento
                  {c.discountPercent === 100 && <span className="text-emerald-600 font-semibold"> (curso gratis)</span>}
                </p>
                <p>Curso: {courseTitle(c.courseId)}</p>
                <p>Usos: {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ' (ilimitado)'}</p>
                {c.expiresAt && (
                  <p>Vence: {new Date(c.expiresAt).toLocaleDateString('es-AR')}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(c)}
                  disabled={busyId === c.id}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-[11px] flex items-center gap-1 disabled:opacity-50"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => handleToggleActive(c.id, c.active)}
                  disabled={busyId === c.id}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-[11px] flex items-center gap-1 disabled:opacity-50"
                >
                  <Power className="w-3.5 h-3.5" />
                  {c.active ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={busyId === c.id}
                  className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-serif font-bold text-lg text-slate-900">{editingId ? 'Editar Cupón' : 'Crear Cupón'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Código</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ej. BIENVENIDA20"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Descuento (%)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={100}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                />
                <p className="text-[10px] text-slate-400">100% = el curso queda gratis para quien lo use.</p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Curso</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="">Todos los cursos</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Usos máximos</label>
                  <input
                    type="number"
                    min={1}
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder="Ilimitado"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Vence el</label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-semibold">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-lua-600 hover:bg-lua-700 text-white font-bold shadow transition-all disabled:opacity-50">
                  {saving ? 'Guardando...' : editingId ? 'Guardar Cambios' : 'Crear Cupón'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
