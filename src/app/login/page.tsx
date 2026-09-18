'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { User, Lock, Mail, Shield, GraduationCap, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchRole } = useAuth();
  const [email, setEmail] = useState('alumno@luaazul.com');
  const [password, setPassword] = useState('alumno123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);
    setLoading(false);
    if (success) {
      router.push('/campus');
    } else {
      setError('Credenciales inválidas. Revisa el correo o contraseña.');
    }
  };

  const handleQuickStudentLogin = async () => {
    await switchRole('STUDENT');
    router.push('/campus');
  };

  const handleQuickAdminLogin = async () => {
    await switchRole('ADMIN');
    router.push('/admin');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-lua-50 text-lua-600 flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="font-serif font-bold text-2xl text-slate-900">
            Ingreso al Campus
          </h1>
          <p className="text-xs text-slate-500">
            Accede a tus cursos, lecciones y certificados oficiales
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-lua-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-lua-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-lua-600 hover:bg-lua-700 text-white font-bold text-xs shadow-md shadow-lua-600/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Demo Logins */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
            Acceso Rápido de Prueba (Demo)
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleQuickStudentLogin}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-lua-300 hover:bg-lua-50/50 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <GraduationCap className="w-4 h-4 text-lua-600" />
              <span>Ver como Alumno</span>
            </button>

            <button
              onClick={handleQuickAdminLogin}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <Shield className="w-4 h-4 text-amber-600" />
              <span>Ver como Admin</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          ¿Aún no tienes cuenta?{' '}
          <Link href="/registro" className="text-lua-600 font-bold hover:underline">
            Regístrate gratis
          </Link>
        </p>

      </div>
    </div>
  );
}
