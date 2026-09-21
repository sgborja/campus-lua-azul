'use client';

import React, { useEffect, useState } from 'react';
import { Cake, Mail, Send, CheckCircle2, Sparkles, Gift, Clock, Save, ShieldAlert } from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { useAuth } from '@/lib/auth-context';

export default function AdminBirthdaysPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingUserId, setSendingUserId] = useState<string | null>(null);
  const [lastSentPreview, setLastSentPreview] = useState<string | null>(null);

  const [editSubject, setEditSubject] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editPromoCode, setEditPromoCode] = useState('');
  const [editDiscount, setEditDiscount] = useState(0);
  const [editValidDays, setEditValidDays] = useState(0);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateSaved, setTemplateSaved] = useState(false);

  const fetchBirthdays = () => {
    setLoading(true);
    fetch('/api/birthdays/check')
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        if (resData.template) {
          setEditSubject(resData.template.subject || '');
          setEditTitle(resData.template.title || '');
          setEditMessage(resData.template.message || '');
          setEditPromoCode(resData.template.promoCode || '');
          setEditDiscount(resData.template.discountPercent || 0);
          setEditValidDays(resData.template.validDays || 0);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBirthdays();
  }, []);

  const handleSaveTemplate = async () => {
    setSavingTemplate(true);
    setTemplateSaved(false);
    try {
      const res = await fetch('/api/birthdays/check', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: editSubject,
          title: editTitle,
          message: editMessage,
          promoCode: editPromoCode,
          discountPercent: editDiscount,
          validDays: editValidDays,
        }),
      });
      if (res.ok) {
        setTemplateSaved(true);
        fetchBirthdays();
      } else {
        alert('Error al guardar la plantilla');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleSendBirthday = async (userId: string) => {
    setSendingUserId(userId);
    try {
      const res = await fetch('/api/birthdays/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const resData = await res.json();
      if (resData.success) {
        setLastSentPreview(resData.previewHtml);
        fetchBirthdays();
        alert('¡Email de cumpleaños despachado exitosamente!');
      }
    } catch (e) {
      console.error(e);
      alert('Error enviando email');
    } finally {
      setSendingUserId(null);
    }
  };

  if (user && user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto text-center py-24 space-y-3">
        <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto" />
        <h2 className="font-serif font-bold text-lg text-slate-800">Acceso restringido</h2>
        <p className="text-xs text-slate-500">
          Solo el rol Administrador puede editar la plantilla y enviar los cupones de cumpleaños.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="py-20 text-center text-xs text-slate-500">Cargando módulo de cumpleaños...</div>;
  }

  const upcoming = data?.upcoming || [];
  const logs = data?.logs || [];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
          <Cake className="w-4 h-4" />
          Fidelización Automática
        </span>
        <h2 className="text-xl font-serif font-bold text-slate-900 mt-0.5">
          Mails de Cumpleaños & Regalos Automáticos
        </h2>
        <p className="text-xs text-slate-500">
          Envía felicitaciones automáticas a tus alumnas y alumnos con cupones de descuento exclusivos para su día.
        </p>
      </div>

      {/* UPCOMING BIRTHDAYS LIST */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
          <Cake className="w-5 h-5 text-amber-500" />
          Alumnos que cumplen años próximamente ({upcoming.length})
        </h3>

        {upcoming.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No hay cumpleaños en los próximos 30 días.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {upcoming.map((item: any) => (
              <div
                key={item.user.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                    {item.isToday ? '🎂' : item.birthdayFormatted}
                  </div>
                  <div>
                    <strong className="text-sm text-slate-900 block">{item.user.name}</strong>
                    <span className="text-xs text-slate-500">{item.user.email}</span>
                    <div className="mt-0.5">
                      {item.isToday ? (
                        <span className="text-[10px] font-extrabold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          ¡Cumple hoy!
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">
                          Cumpleaños en {item.diffDays} días ({item.birthdayFormatted})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendBirthday(item.user.id)}
                    disabled={sendingUserId === item.user.id}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {sendingUserId === item.user.id ? 'Enviando...' : 'Enviar Felicitación & Cupón'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EMAIL TEMPLATE PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Template Settings */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
            Configuración del Saludo
          </h3>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-500 block font-semibold">Asunto del correo</label>
              <input
                type="text"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 block font-semibold">Título dentro del correo</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="ej. ¡Muy Feliz Cumpleaños, [NOMBRE]!"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 block font-semibold">
                Mensaje (usá [NOMBRE] para el nombre del alumno/a)
              </label>
              <RichTextEditor value={editMessage} onChange={setEditMessage} compact />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-500 block font-semibold">Descuento (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={editDiscount}
                  onChange={(e) => setEditDiscount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-rose-600"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-500 block font-semibold">Días de validez</label>
                <input
                  type="number"
                  min={1}
                  value={editValidDays}
                  onChange={(e) => setEditValidDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 block font-semibold">Cupón base</label>
              <input
                type="text"
                value={editPromoCode}
                onChange={(e) => setEditPromoCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold"
              />
              <p className="text-[10px] text-slate-400">
                Se le agrega automáticamente el nombre de cada alumno/a, ej. {editPromoCode || 'CUMPLE'}-VALERIA
              </p>
            </div>

            {templateSaved && (
              <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 flex items-center gap-1.5 w-fit">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Plantilla guardada
              </p>
            )}

            <button
              onClick={handleSaveTemplate}
              disabled={savingTemplate}
              className="px-4 py-2 rounded-xl bg-lua-600 hover:bg-lua-700 text-white font-bold text-xs shadow transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              {savingTemplate ? 'Guardando...' : 'Guardar Plantilla'}
            </button>
          </div>
        </div>

        {/* Right: Live Visual Preview */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-serif font-bold text-base text-slate-900">
              Vista Previa del Correo de Lua Azul
            </h3>
            <span className="text-[11px] text-slate-400">Diseño HTML prémium</span>
          </div>

          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-inner bg-slate-50 p-4">
            <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow max-w-md mx-auto text-center">
              <div className="bg-gradient-to-r from-slate-950 via-lua-950 to-slate-900 text-white p-6 space-y-2">
                <span className="inline-block bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  🎁 ¡Tu Día Especial! 🎂
                </span>
                <h4 className="font-serif font-bold text-lg text-white">
                  ¡Muy Feliz Cumpleaños, Valeria!
                </h4>
                <p className="text-[11px] text-lua-200">Te desea todo el equipo de Lua Azul</p>
              </div>

              <div className="p-6 space-y-4 text-xs text-slate-700">
                <p>
                  ¡Hoy festejamos tu vida y tus ganas de seguir creando! Te preparamos un regalo exclusivo:
                </p>

                <div className="bg-slate-50 border-2 border-dashed border-lua-400 rounded-xl p-4 space-y-2">
                  <div className="text-2xl font-black text-amber-600">25% DE DESCUENTO</div>
                  <div className="font-mono text-base font-bold bg-white text-lua-800 py-1.5 px-3 rounded-lg border border-lua-200 inline-block tracking-wider">
                    CUMPLELUA25-VAL
                  </div>
                  <p className="text-[10px] text-slate-400">Válido por 15 días en cualquier curso o producto.</p>
                </div>

                <div className="pt-2">
                  <span className="inline-block bg-lua-600 text-white font-bold text-xs px-4 py-2 rounded-lg">
                    Ir al Campus y Usar mi Regalo ✨
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* HISTORY LOGS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-base text-slate-900">
          Historial de Mails Enviados ({logs.length})
        </h3>

        {logs.length === 0 ? (
          <p className="text-xs text-slate-400">Aún no se registraron envíos de cumpleaños.</p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {logs.map((log: any) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <strong className="text-slate-800">{log.userName}</strong> ({log.userEmail})
                  <span className="text-slate-400 ml-2">Cupón: {log.promoCode}</span>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {log.status}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {new Date(log.sentAt).toLocaleDateString('es-AR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
