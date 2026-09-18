'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import LuaAzulLogo, { StarIcon } from './LuaAzulLogo';
import {
  BookOpen,
  GraduationCap,
  Award,
  Shield,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, role, logout, switchRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand & Logo (Parisienne + Gata en la Luna) */}
          <Link href="/" className="group py-1">
            <LuaAzulLogo color="#2E4C82" subtitle="Seminarios" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                isActive('/') && pathname === '/'
                  ? 'bg-celeste/40 text-azul font-bold'
                  : 'text-slate-600 hover:text-azul hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-verde" />
              Seminarios & Cursos
            </Link>

            <Link
              href="/campus"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                isActive('/campus') && !pathname.startsWith('/campus/certificados')
                  ? 'bg-celeste/40 text-azul font-bold'
                  : 'text-slate-600 hover:text-azul hover:bg-slate-50'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-verde" />
              Área de Formación
            </Link>

            <Link
              href="/campus/certificados"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                isActive('/campus/certificados')
                  ? 'bg-celeste/40 text-azul font-bold'
                  : 'text-slate-600 hover:text-azul hover:bg-slate-50'
              }`}
            >
              <Award className="w-4 h-4 text-dorado" />
              Certificados
            </Link>

            <Link
              href="/admin"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                isActive('/admin')
                  ? 'bg-amber-50 text-dorado-dark font-bold border border-dorado/30'
                  : 'text-slate-600 hover:text-dorado-dark hover:bg-amber-50/50'
              }`}
            >
              <Shield className="w-4 h-4 text-dorado" />
              Panel de Gestión
            </Link>
          </nav>

          {/* Right Action: User Menu & Role Indicator */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-verde/30"
                  />
                  <div className="text-left leading-none">
                    <span className="block text-xs font-semibold text-slate-800 max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      role === 'ADMIN' ? 'text-dorado' : 'text-verde'
                    }`}>
                      {role === 'ADMIN' ? 'Admin' : 'Alumno'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/70">
                      <p className="text-xs text-slate-500 font-medium">Conectado como</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    <div className="p-2 border-b border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                        Cambio rápido de rol
                      </p>
                      <button
                        onClick={() => {
                          switchRole('STUDENT');
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md text-left ${
                          role === 'STUDENT'
                            ? 'bg-verde/10 text-verde font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <GraduationCap className="w-3.5 h-3.5 text-verde" />
                          Modo Alumno
                        </span>
                        {role === 'STUDENT' && <span className="text-[10px] bg-verde text-white px-1.5 py-0.5 rounded">Activo</span>}
                      </button>

                      <button
                        onClick={() => {
                          switchRole('ADMIN');
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md text-left mt-1 ${
                          role === 'ADMIN'
                            ? 'bg-amber-50 text-dorado-dark font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-dorado" />
                          Modo Administrador
                        </span>
                        {role === 'ADMIN' && <span className="text-[10px] bg-dorado text-white px-1.5 py-0.5 rounded">Activo</span>}
                      </button>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/campus"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                        Mi Área de Alumno
                      </Link>
                      <Link
                        href="/campus/certificados"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <Award className="w-3.5 h-3.5 text-slate-500" />
                        Mis Certificados
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left border-t border-slate-100 mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-500" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-azul hover:bg-azul-light text-white text-xs font-semibold shadow-sm transition-all"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Ingresar
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <BookOpen className="w-4 h-4 text-verde" />
            Seminarios & Cursos
          </Link>
          <Link
            href="/campus"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <GraduationCap className="w-4 h-4 text-verde" />
            Mi Área de Formación
          </Link>
          <Link
            href="/campus/certificados"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Award className="w-4 h-4 text-dorado" />
            Mis Certificados
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-dorado-dark bg-amber-50"
          >
            <Shield className="w-4 h-4 text-dorado" />
            Panel de Gestión
          </Link>

          <div className="pt-4 border-t border-slate-200">
            <div className="text-xs font-semibold text-slate-500 mb-2">Conmutador rápido (Demo):</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  switchRole('STUDENT');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-1.5 text-xs rounded font-medium ${
                  role === 'STUDENT' ? 'bg-verde text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Modo Alumno
              </button>
              <button
                onClick={() => {
                  switchRole('ADMIN');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-1.5 text-xs rounded font-medium ${
                  role === 'ADMIN' ? 'bg-dorado text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Modo Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
