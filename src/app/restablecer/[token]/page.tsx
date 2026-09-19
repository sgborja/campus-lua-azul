'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import LuaAzulLogo from '@/components/LuaAzulLogo';

export default function RestablecerPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
        setTimeout(() => router.push('/login'), 2500);
      } else {
        setError(data.error || 'Error al restablecer la contraseña');
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
          <h1 className="font-serif font-bold text-2xl text-slate-900">Elegir Nueva Contraseña</h1>
        </div>

        {done ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl text-center font-medium flex flex-col items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            Contraseña actualizada. Redirigiendo al login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl text-center font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Contraseña nueva</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-lua-600 bg-slate-50/50 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Confirmar contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-lua-600 bg-slate-50/50 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-lua-600 hover:bg-lua-700 text-white font-bold text-xs shadow-md shadow-lua-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? 'Guardando...' : 'Guardar Contraseña'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="pt-2 border-t border-slate-100 text-center">
          <Link href="/login" className="text-xs font-bold text-lua-600 hover:text-lua-700 hover:underline">
            Volver a Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
