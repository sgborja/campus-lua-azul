'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import LuaAzulLogo from '@/components/LuaAzulLogo';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok && data.user) {
        // Update context & storage
        await login(email.trim(), password);
        
        // Redirect based on role
        if (data.user.role === 'STUDENT') {
          router.push('/');
        } else {
          router.push('/admin');
        }
      } else {
        setError(data.error || 'Credenciales inválidas. Revisa el correo o la contraseña.');
      }
    } catch (e) {
      setLoading(false);
      setError('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-xl space-y-6">
        
        {/* Brand header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <LuaAzulLogo color="#2E4C82" subtitle="Campus Virtual" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-2xl text-slate-900">
              Ingreso a tu Cuenta
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Accede a tus clases, materiales descargables y certificados oficiales
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 block">Contraseña</label>
              <Link href="/recuperar" className="text-[11px] font-semibold text-lua-600 hover:text-lua-700 hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-lua-600 bg-slate-50/50 focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-lua-600 hover:bg-lua-700 text-white font-bold text-xs shadow-md shadow-lua-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? 'Validando...' : 'Iniciar Sesión'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Register prompt */}
        <div className="pt-2 border-t border-slate-100 text-center space-y-2">
          <p className="text-xs text-slate-500">
            ¿Aún no tienes cuenta?
          </p>
          <Link
            href="/registro"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-lua-600 hover:text-lua-700 hover:underline"
          >
            <Sparkles className="w-3.5 h-3.5 text-dorado" />
            <span>Crear cuenta</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
