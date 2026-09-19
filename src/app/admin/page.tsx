'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  Users,
  BookOpen,
  Award,
  CreditCard,
  Cake,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'ADMIN';
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then((res) => res.json())
      .then((resData) => setData(resData))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        Cargando estadísticas del Campus...
      </div>
    );
  }

  const m = data?.metrics || {
    totalStudents: 0,
    totalCourses: 0,
    totalCertificates: 0,
    totalRevenue: 0,
    upcomingBirthdaysCount: 0,
  };

  return (
    <div className="space-y-8">
      
      {/* 4 STAT CARDS (CLICKABLES) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Students -> /admin/alumnos */}
        <Link
          href="/admin/alumnos"
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2 hover:border-lua-500 hover:shadow-md hover:-translate-y-0.5 transition-all group block cursor-pointer"
          title="Ver alumnos registrados y permisos"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-lua-600 transition-colors">
              Alumnos y Permisos
            </span>
            <div className="p-2 rounded-xl bg-lua-50 text-lua-600 group-hover:bg-lua-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 group-hover:text-lua-700 transition-colors">
            {m.totalStudents}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>Gestionar usuarios</span>
            <span className="text-lua-600 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
              Ver lista <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Card 2: Courses -> /admin/cursos */}
        <Link
          href="/admin/cursos"
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2 hover:border-emerald-500 hover:shadow-md hover:-translate-y-0.5 transition-all group block cursor-pointer"
          title="Ver y crear cursos"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-emerald-600 transition-colors">
              Cursos y Clases
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
            {m.totalCourses}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>Crear o editar lecciones</span>
            <span className="text-emerald-600 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
              Ir a Cursos <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Card 3: Certificates -> /admin/examenes */}
        <Link
          href="/admin/examenes"
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2 hover:border-amber-500 hover:shadow-md hover:-translate-y-0.5 transition-all group block cursor-pointer"
          title="Gestionar exámenes y requerimientos de certificación"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-amber-600 transition-colors">
              Exámenes y Diplomas
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors">
            {m.totalCertificates}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>Crear preguntas y notas</span>
            <span className="text-amber-600 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
              Ir a Exámenes <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Card 4: Revenue -> /admin/pedidos (solo ADMIN) */}
        {isSuperAdmin && (
          <Link
            href="/admin/pedidos"
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2 hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5 transition-all group block cursor-pointer"
            title="Ver ventas y órdenes de Mercado Pago"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                Ventas Mercado Pago
              </span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
              ${m.totalRevenue.toLocaleString('es-AR')}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Directo
              </span>
              <span className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                Ver Pedidos <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        )}

      </div>

      {/* BIRTHDAYS ALERT CALLOUT (solo ADMIN, maneja cupones) */}
      {isSuperAdmin && data?.upcomingBirthdays && data.upcomingBirthdays.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-300/80 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Cake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded-full">
                ¡Cumpleaños Próximos!
              </span>
              <h3 className="font-bold text-sm text-slate-900 mt-1">
                {data.upcomingBirthdays.length} alumno(s) cumplen años este mes
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Entre ellos: <strong>{data.upcomingBirthdays[0].user.name}</strong> ({data.upcomingBirthdays[0].isToday ? '¡Hoy es su cumpleaños!' : `el ${data.upcomingBirthdays[0].birthdayFormatted}`}).
              </p>
            </div>
          </div>

          <Link
            href="/admin/cumpleanos"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>Ver Mails y Cupones</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* TWO COLUMN SUMMARY: Recent Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Recent Orders (solo ADMIN) */}
        {isSuperAdmin && (
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-serif font-bold text-base text-slate-900">
              Últimas Transacciones (Mercado Pago)
            </h3>
            <Link href="/admin/pedidos" className="text-xs text-lua-600 font-semibold hover:underline">
              Ver todas
            </Link>
          </div>

          {data?.recentOrders && data.recentOrders.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {data.recentOrders.map((ord: any) => (
                <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-800 block">{ord.courseTitle}</strong>
                    <span className="text-slate-400 text-[11px]">{ord.userEmail}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">
                      ${ord.amount.toLocaleString('es-AR')} ARS
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Aprobado
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">No hay transacciones registradas.</p>
          )}
        </div>
        )}

        {/* Right: Quick shortcuts */}
        <div className={`${isSuperAdmin ? 'lg:col-span-5' : 'lg:col-span-12'} bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4`}>
          <h3 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
            Accesos Rápidos del Administrador
          </h3>

          <div className="space-y-2.5">
            <Link
              href="/admin/cursos"
              className="p-3 rounded-xl border border-slate-200 hover:border-lua-300 hover:bg-lua-50/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-lua-100 text-lua-700">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800 group-hover:text-lua-700">
                    Administrar Cursos y Clases
                  </h4>
                  <p className="text-[11px] text-slate-500">Subir videos, redactar guías y adjuntar PDFs</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-lua-600" />
            </Link>

            <Link
              href="/admin/alumnos"
              className="p-3 rounded-xl border border-slate-200 hover:border-lua-300 hover:bg-lua-50/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800 group-hover:text-lua-700">
                    Listado de Alumnos & Documentación
                  </h4>
                  <p className="text-[11px] text-slate-500">Ver progreso y enviar documentación especial</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-lua-600" />
            </Link>

            <Link
              href="/admin/examenes"
              className="p-3 rounded-xl border border-slate-200 hover:border-lua-300 hover:bg-lua-50/40 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800 group-hover:text-lua-700">
                    Gestor de Exámenes
                  </h4>
                  <p className="text-[11px] text-slate-500">Crear preguntas y fijar porcentaje de aprobación</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-lua-600" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
