'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import LuaAzulLogo from '@/components/LuaAzulLogo';

export default function RecuperarPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Error al procesar la solicitud');
      }
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <LuaAzulLogo color="#2E4C82" subtitle="Campus Virtual" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-2xl text-slate-900">Recuperar Contraseña</h1>
            <p className="text-xs text-slate-500 mt-1">
              Te enviamos un enlace a tu correo para elegir una nueva contraseña
            </p>
          </div>
        </div>

        {sent ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl text-center font-medium flex flex-col items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            Si el correo existe en nuestro sistema, te enviamos un enlace para restablecer tu contraseña.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl text-center font-medium">
                {error}
              </div>
            )}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Correo Electrónico</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-lua-600 bg-slate-50/50 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-lua-600 hover:bg-lua-700 text-white font-bold text-xs shadow-md shadow-lua-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="pt-2 border-t border-slate-100 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-lua-600 hover:text-lua-700 hover:underline"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Volver a Iniciar Sesión</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
