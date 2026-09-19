'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { Star, CheckCircle2, ChevronLeft, MessageSquareHeart } from 'lucide-react';

export default function SendTestimonialPage() {
  const { user } = useAuth();
  const [courseTitle, setCourseTitle] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-24 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Iniciá sesión para dejar tu testimonio</h2>
        <Link href="/login" className="inline-block px-4 py-2 bg-lua-600 text-white rounded-lg text-sm">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const plainText = message.replace(/<[^>]+>/g, '').trim();
    if (!plainText) {
      setError('Contanos un poco tu experiencia antes de enviar.');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, rating, courseTitle }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSent(true);
      } else {
        setError(data.error || 'Error al enviar el testimonio');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto text-center py-24 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">¡Gracias por tu testimonio!</h2>
        <p className="text-sm text-slate-500">
          Lo vamos a revisar y, apenas lo aprobemos, se va a mostrar en la página principal de Lua Azul.
        </p>
        <Link href="/campus" className="inline-block px-4 py-2 bg-lua-600 text-white rounded-lg text-sm">
          Volver a Mi Campus
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
      <Link href="/campus" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800">
        <ChevronLeft className="w-4 h-4" />
        Volver a Mi Campus
      </Link>

      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-lua-50 text-lua-600 flex items-center justify-center mx-auto">
          <MessageSquareHeart className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-slate-900">Contanos tu experiencia</h1>
        <p className="text-xs text-slate-500">
          Tu testimonio se revisa antes de publicarse en la home de Lua Azul.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
        <div className="space-y-1">
          <label className="font-semibold text-slate-700 block">¿Qué curso hiciste? (opcional)</label>
          <input
            type="text"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            placeholder="ej. Taller de Flores de Bach"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
          />
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-700 block">Tu calificación</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="p-0.5"
                title={`${n} estrellas`}
              >
                <Star
                  className={`w-6 h-6 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-slate-700 block">Tu testimonio</label>
          <RichTextEditor
            value={message}
            onChange={setMessage}
            placeholder="Contanos cómo fue tu experiencia en Lua Azul..."
          />
        </div>

        {error && (
          <p className="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="w-full px-6 py-2.5 rounded-xl bg-lua-600 hover:bg-lua-700 text-white font-bold shadow transition-all disabled:opacity-50"
        >
          {sending ? 'Enviando...' : 'Enviar Testimonio'}
        </button>
      </form>
    </div>
  );
}
