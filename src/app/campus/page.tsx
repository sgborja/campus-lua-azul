'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Course, Certificate } from '@/lib/types';
import {
  BookOpen,
  GraduationCap,
  Award,
  PlayCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Cake,
  FileDown,
  Gift,
} from 'lucide-react';

export default function CampusDashboardPage() {
  const { user, role } = useAuth();
  const [courses, setCourses] = useState<(Course & { isEnrolled?: boolean; progressPercent?: number; hasCertificate?: boolean })[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetch(`/api/courses?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.courses) {
          setCourses(data.courses);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  // Check if today/month is user's birthday
  const isBirthdayNear = () => {
    if (!user?.birthDate) return false;
    const today = new Date();
    const parts = user.birthDate.split('-');
    if (parts.length < 3) return false;
    const bMonth = parseInt(parts[1], 10) - 1;
    const bDay = parseInt(parts[2], 10);
    // Compare month or same day
    return today.getMonth() === bMonth;
  };

  const enrolledCourses = courses.filter((c) => c.isEnrolled);
  const availableCourses = courses.filter((c) => !c.isEnrolled);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* WELCOME BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-lua-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-lua-800/40">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,rgba(67,125,240,0.2),transparent_70%)] pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lua-600/30 text-lua-300 text-xs font-semibold border border-lua-500/30">
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            <span>Área de Miembros Lua Azul</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-white">
            ¡Hola, {user?.name || 'Alumna/o'}! ✨
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Bienvenida/o a tu campus virtual. Aquí puedes continuar tus lecciones, descargar materiales y guías de trabajo, realizar tus exámenes y descargar tus certificados oficiales.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
            <div className="bg-slate-800/80 px-3.5 py-1.5 rounded-lg border border-slate-700/80 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-lua-400" />
              <span><strong>{enrolledCourses.length}</strong> Cursos matriculados</span>
            </div>

            <Link
              href="/campus/certificados"
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Ver mis Certificados</span>
            </Link>
          </div>
        </div>
      </div>

      {/* BIRTHDAY BANNER (If user's birthday is this month or today) */}
      {isBirthdayNear() && (
        <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border-2 border-dashed border-amber-400/60 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-md">
              <Cake className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                ¡Es tu mes especial! 🎂
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                ¡Feliz Cumpleaños de parte de todo Lua Azul!
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Te enviamos un regalo a tu casilla de correo: <strong>25% de descuento</strong> en cualquier curso o kit de taller usando tu código exclusivo: <code className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono font-bold">CUMPLELUA25</code>.
              </p>
            </div>
          </div>
          <Link
            href="#catalogo-extra"
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow transition-all whitespace-nowrap flex items-center gap-2"
          >
            <Gift className="w-4 h-4" />
            Canjear en un nuevo curso
          </Link>
        </div>
      )}

      {/* MY ENROLLED COURSES */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900">
              Mis Cursos en Curso
            </h2>
            <p className="text-xs text-slate-500">
              Retoma tus clases donde las dejaste.
            </p>
          </div>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-lua-50 text-lua-600 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-800">Aún no estás inscripto en ningún curso</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Explora nuestro catálogo para comenzar a aprender encuadernación y diseño de agendas hoy mismo.
            </p>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 rounded-xl bg-lua-600 text-white text-xs font-bold shadow hover:bg-lua-700 transition-all"
            >
              Ver Catálogo de Cursos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => {
              const progress = course.progressPercent || 0;
              const isCompleted = progress === 100;

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative h-44 w-full bg-slate-100">
                    <img
                      src={course.coverImage}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      {isCompleted ? (
                        <span className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Completado
                        </span>
                      ) : (
                        <span className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                          En progreso
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-lua-700 bg-lua-50 px-2 py-0.5 rounded border border-lua-100 uppercase">
                        {course.category}
                      </span>
                      <h3 className="font-serif font-bold text-base text-slate-900 line-clamp-2">
                        {course.title}
                      </h3>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Progreso del curso</span>
                        <strong className="text-slate-800">{progress}%</strong>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-lua-600'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      <Link
                        href={`/campus/curso/${course.slug}`}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
                      >
                        <PlayCircle className="w-4 h-4 text-lua-400" />
                        {isCompleted ? 'Repasar Clases' : 'Continuar Aprendiendo'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      {isCompleted && course.certificateEnabled && (
                        <Link
                          href="/campus/certificados"
                          className="w-full mt-2 py-2 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs transition-all flex items-center justify-center gap-2"
                        >
                          <Award className="w-4 h-4 text-amber-600" />
                          Ver mi Certificado Oficial
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* EXPLORE MORE COURSES SECTION */}
      {availableCourses.length > 0 && (
        <section id="catalogo-extra" className="space-y-6 pt-6 border-t border-slate-200">
          <div>
            <h2 className="text-xl font-serif font-bold text-slate-900">
              Más cursos disponibles en Lua Azul
            </h2>
            <p className="text-xs text-slate-500">
              Suma nuevas habilidades creativas a tu taller.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {c.category}
                    </span>
                    {c.isFree ? (
                      <span className="text-emerald-600 font-bold">Gratis</span>
                    ) : c.priceOnRequest ? (
                      <span className="text-slate-900 font-bold">Consultar</span>
                    ) : (
                      <span className="text-slate-900 font-bold">${c.price.toLocaleString('es-AR')} ARS</span>
                    )}
                  </div>
                  <h4 className="font-serif font-bold text-slate-900 text-sm">{c.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{c.shortDescription}</p>
                </div>

                <Link
                  href={`/curso/${c.slug}`}
                  className="w-full py-2 px-3 rounded-lg bg-lua-50 hover:bg-lua-100 text-lua-700 font-semibold text-xs transition-all text-center block"
                >
                  Ver Ficha e Inscribirme →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
