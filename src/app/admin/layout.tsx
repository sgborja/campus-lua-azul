'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Users,
  Cake,
  CreditCard,
  ShieldCheck,
  PlusCircle,
  ChevronRight,
  Settings,
  MessageSquareHeart,
} from 'lucide-react';

const ADMIN_ROLES = ['ADMIN', 'PROFESOR', 'EDITOR'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || !ADMIN_ROLES.includes(user.role))) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || !ADMIN_ROLES.includes(user.role)) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center text-sm text-slate-500">
        Verificando acceso...
      </div>
    );
  }

  const navItems = [
    { label: 'Visión General', href: '/admin', icon: LayoutDashboard },
    { label: 'Gestor de Cursos', href: '/admin/cursos', icon: BookOpen },
    { label: 'Área de Exámenes', href: '/admin/examenes', icon: Award },
    { label: 'Alumnos y Progreso', href: '/admin/alumnos', icon: Users },
    { label: 'Mails de Cumpleaños', href: '/admin/cumpleanos', icon: Cake },
    { label: 'Testimonios', href: '/admin/testimonios', icon: MessageSquareHeart },
    { label: 'Pedidos Mercado Pago', href: '/admin/pedidos', icon: CreditCard },
    { label: 'Ajustes del Sitio', href: '/admin/ajustes', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/admin' && pathname === '/admin') return true;
    if (href !== '/admin' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Admin Subheader Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full w-fit mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              Panel de Administración Lua Azul
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
              Gestión del Campus Virtual
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/cursos"
              className="px-4 py-2 rounded-xl bg-lua-600 hover:bg-lua-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Crear Nuevo Curso</span>
            </Link>
          </div>
        </div>

        {/* Admin Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-200 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Content Container */}
        <div>{children}</div>

      </div>
    </div>
  );
}
