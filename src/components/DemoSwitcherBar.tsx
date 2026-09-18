'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Shield, GraduationCap, Cake, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function DemoSwitcherBar() {
  const { user, role, switchRole } = useAuth();
  const [minimized, setMinimized] = useState(false);

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 text-xs no-print relative z-50">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between">
        
        {/* Status / Message */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
            Demo Bar
          </span>
          
          <div className="hidden sm:flex items-center gap-2 text-slate-300">
            <span>Usuario actual:</span>
            <strong className="text-white flex items-center gap-1.5">
              {role === 'ADMIN' ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  Administrador Lua Azul
                </>
              ) : (
                <>
                  <GraduationCap className="w-3.5 h-3.5 text-lua-400" />
                  {user?.name || 'Alumno Lua Azul'}
                </>
              )}
            </strong>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 hidden md:inline text-[11px]">Probar como:</span>
          
          <button
            onClick={() => switchRole('STUDENT')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1 ${
              role === 'STUDENT'
                ? 'bg-lua-600 text-white shadow-sm ring-1 ring-white/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3 h-3" />
            Alumno
          </button>

          <button
            onClick={() => switchRole('ADMIN')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1 ${
              role === 'ADMIN'
                ? 'bg-amber-600 text-white shadow-sm ring-1 ring-white/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Shield className="w-3 h-3" />
            Administrador
          </button>

          <Link
            href="/admin/cumpleanos"
            className="hidden lg:flex items-center gap-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded text-[11px] hover:bg-rose-500/30 transition-colors ml-2"
          >
            <Cake className="w-3 h-3 text-rose-400" />
            <span>Mails Cumpleaños</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
