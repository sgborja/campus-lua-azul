'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquareHeart, Star, CheckCircle2, XCircle, Trash2, Clock } from 'lucide-react';
import { sanitizeHtml } from '@/lib/sanitizeHtml';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchTestimonials = () => {
    setLoading(true);
    fetch('/api/testimonials?admin=true')
      .then((res) => res.json())
      .then((data) => setTestimonials(data.testimonials || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleSetStatus = async (id: string, status: 'PENDING' | 'APPROVED') => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchTestimonials();
      } else {
        alert('Error al actualizar el testimonio');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este testimonio definitivamente?')) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTestimonials();
      } else {
        alert('Error al eliminar el testimonio');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-500">Cargando testimonios...</div>;
  }

  const pending = testimonials.filter((t) => t.status === 'PENDING');
  const approved = testimonials.filter((t) => t.status === 'APPROVED');

  const renderCard = (t: any) => (
    <div key={t.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <strong className="text-sm text-slate-900 block">{t.userName}</strong>
          {t.courseTitle && <span className="text-[11px] text-slate-500">{t.courseTitle}</span>}
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
            />
          ))}
        </div>
      </div>

      <div
        className="text-xs text-slate-600 leading-relaxed [&_a]:underline"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(t.message) }}
      />

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-[10px] text-slate-400">
          {new Date(t.createdAt).toLocaleDateString('es-AR')}
        </span>
        <div className="flex items-center gap-2">
          {t.status === 'PENDING' ? (
            <button
              onClick={() => handleSetStatus(t.id, 'APPROVED')}
              disabled={busyId === t.id}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] flex items-center gap-1 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Aprobar
            </button>
          ) : (
            <button
              onClick={() => handleSetStatus(t.id, 'PENDING')}
              disabled={busyId === t.id}
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-[11px] flex items-center gap-1 disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              Ocultar
            </button>
          )}
          <button
            onClick={() => handleDelete(t.id)}
            disabled={busyId === t.id}
            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
            title="Eliminar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold text-lua-600 uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquareHeart className="w-4 h-4" />
          Fidelización y Prueba Social
        </span>
        <h2 className="text-xl font-serif font-bold text-slate-900 mt-0.5">Testimonios de Alumnas</h2>
        <p className="text-xs text-slate-500">
          Aprobá los testimonios que quieras mostrar públicamente en la página principal de Lua Azul.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          Pendientes de revisión ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <p className="text-xs text-slate-400">No hay testimonios pendientes.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{pending.map(renderCard)}</div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Publicados en la home ({approved.length})
        </h3>
        {approved.length === 0 ? (
          <p className="text-xs text-slate-400">Todavía no aprobaste ningún testimonio.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{approved.map(renderCard)}</div>
        )}
      </div>
    </div>
  );
}
