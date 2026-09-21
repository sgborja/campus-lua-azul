'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import LuaAzulLogo, { StarIcon } from './LuaAzulLogo';
import UserAvatar from './UserAvatar';
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
  KeyRound,
} from 'lucide-react';

const STAFF_ROLES = ['ADMIN', 'PROFESOR', 'EDITOR'];
const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  PROFESOR: 'Profesor',
  EDITOR: 'Editor',
  STUDENT: 'Alumno/a',
};

export default function Navbar() {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();
  const isStaff = STAFF_ROLES.includes(role);
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

            {isStaff && (
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
            )}
          </nav>

          {/* Right Action: User Menu & Role Indicator */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                  <UserAvatar avatar={user.avatar} name={user.name} className="w-8 h-8" />
                  <div className="text-left leading-none">
                    <span className="block text-xs font-semibold text-slate-800 max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      isStaff ? 'text-dorado' : 'text-verde'
                    }`}>
                      {ROLE_LABELS[role] || 'Alumno/a'}
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

                    <div className="py-1">
                      {isStaff && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-dorado-dark hover:bg-amber-50"
                        >
                          <Shield className="w-3.5 h-3.5 text-dorado" />
                          Panel de Administración
                        </Link>
                      )}
                      <Link
                        href="/campus"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                        Mi Área de Alumno/a
                      </Link>
                      <Link
                        href="/campus/certificados"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <Award className="w-3.5 h-3.5 text-slate-500" />
                        Mis Certificados
                      </Link>
                      <Link
                        href="/cuenta"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                        Mi Cuenta
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
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-slate-700 hover:text-azul hover:bg-slate-50 text-xs font-semibold transition-all"
                >
                  <UserIcon className="w-3.5 h-3.5 text-azul" />
                  <span>Ingresar</span>
                </Link>
                <Link
                  href="/registro"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-azul hover:bg-azul-light text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <span>Registrarse</span>
                </Link>
              </div>
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
          {isStaff && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-dorado-dark bg-amber-50"
            >
              <Shield className="w-4 h-4 text-dorado" />
              Panel de Gestión
            </Link>
          )}

          {user ? (
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <div className="text-xs font-semibold text-slate-500">Sesión: {user.name} ({ROLE_LABELS[role] || 'Alumno/a'})</div>
              <Link
                href="/cuenta"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <KeyRound className="w-4 h-4 text-slate-500" />
                Mi Cuenta
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-lg bg-red-50 text-red-600 font-medium"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-azul text-white text-xs font-semibold shadow-sm"
              >
                <UserIcon className="w-4 h-4" />
                Ingresar al Campus
              </Link>
              <Link
                href="/registro"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Crear Cuenta de Alumno/a
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
