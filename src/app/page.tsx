'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Course } from '@/lib/types';
import LuaAzulLogo, { StarIcon } from '@/components/LuaAzulLogo';
import {
  BookOpen,
  Video,
  FileDown,
  Award,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<(Course & { isEnrolled?: boolean; progressPercent?: number })[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/courses${user ? `?userId=${user.id}` : ''}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.courses) {
          setCourses(data.courses);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  const categories = ['Todos', 'Terapia Floral', 'Formación Energética', 'Simbología y Runas'];

  const filteredCourses =
    selectedCategory === 'Todos'
      ? courses
      : courses.filter((c) => c.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div className="space-y-16 pb-20">
      
      {/* HERO SECTION - Tono Erudito-Cálido, Pausado, Azul Nocturno (#2E4C82) */}
      <section className="relative overflow-hidden bg-azul-950 text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-azul/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(46,76,130,0.35),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(184,137,58,0.12),transparent_50%)]" />
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          
          {/* Brand Mark with 4-pointed Star */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-azul-dark/80 border border-dorado/40 text-celeste text-xs tracking-wider backdrop-blur-sm">
            <StarIcon className="w-3.5 h-3.5 text-dorado" />
            <span className="font-medium">Seminarios Lua Azul · Línea Formación</span>
          </div>

          {/* Positioning statement from style guide */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-white leading-tight">
            Formación con raíz botánica <br className="hidden sm:block" />
            y <span className="text-dorado italic font-serif">profundidad simbólica</span>
          </h1>

          <p className="text-sm sm:text-base text-celeste/90 max-w-2xl mx-auto leading-relaxed font-light">
            Un camino de estudio serio en terapias florales, energéticas y rúnicas. Para leerte a vos y acompañar a otros, con el tiempo y el cuidado que cada proceso merece.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href="#seminarios"
              className="px-6 py-3.5 rounded-xl bg-verde hover:bg-verde-light text-white font-semibold text-xs uppercase tracking-wider shadow-lg shadow-verde/25 transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Ver Seminarios Disponibles
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              href="/campus"
              className="px-6 py-3.5 rounded-xl bg-azul-dark/80 hover:bg-azul-dark border border-azul/60 text-celeste font-semibold text-xs uppercase tracking-wider backdrop-blur-sm transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-dorado" />
              Área de Alumnos
            </Link>
          </div>

          {/* Badges de Valor */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-azul/50 text-xs text-celeste/80">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <StarIcon className="w-3 h-3 text-dorado flex-shrink-0" />
              <span>Clases en Video y Guías</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <StarIcon className="w-3 h-3 text-dorado flex-shrink-0" />
              <span>Vademécums en PDF</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <StarIcon className="w-3 h-3 text-dorado flex-shrink-0" />
              <span>Certificado Verificable</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <StarIcon className="w-3 h-3 text-dorado flex-shrink-0" />
              <span>Abono con Mercado Pago</span>
            </div>
          </div>
        </div>
      </section>

      {/* CATALOG SECTION */}
      <section id="seminarios" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-verde">
              <StarIcon className="w-3 h-3 text-dorado" />
              <span>Propuesta Académica</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-azul-dark mt-1">
              Seminarios y Cursos de Formación
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Las inscripciones están abiertas. Cuando quieras avanzar, podés sumarte a tu propio ritmo.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-verde text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-96 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => {
              const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
              const totalDocs = course.resources.length;

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                      <img
                        src={course.coverImage}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-azul-950/70 via-transparent to-transparent" />
                      
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="bg-azul-dark/90 backdrop-blur-md text-celeste text-[11px] font-semibold px-2.5 py-1 rounded-md">
                          {course.category}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <span className="text-white text-xs font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-dorado" />
                          {course.durationHours} hs estimadas
                        </span>
                        {course.isFree ? (
                          <span className="bg-verde text-white font-bold text-xs px-2.5 py-1 rounded-md shadow uppercase tracking-wider">
                            Seminario Abierto
                          </span>
                        ) : course.priceOnRequest ? (
                          <span className="bg-azul text-white font-bold text-xs px-3 py-1 rounded-md shadow">
                            Consultar
                          </span>
                        ) : (
                          <span className="bg-azul text-white font-bold text-xs px-3 py-1 rounded-md shadow">
                            ${course.price.toLocaleString('es-AR')} ARS
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                          {course.level}
                        </span>
                        <span>•</span>
                        <span>{totalLessons} clases</span>
                        {totalDocs > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-verde font-semibold">{totalDocs} materiales PDF</span>
                          </>
                        )}
                      </div>

                      <h3 className="font-serif font-bold text-lg text-azul-dark leading-snug group-hover:text-verde transition-colors">
                        {course.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {course.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-slate-100">
                    {course.isEnrolled ? (
                      <div className="space-y-2 pt-4">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-verde font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-verde" />
                            Matriculada/o
                          </span>
                          <span className="text-slate-600">{course.progressPercent || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-verde h-1.5 rounded-full transition-all"
                            style={{ width: `${course.progressPercent || 0}%` }}
                          />
                        </div>
                        <Link
                          href={`/campus/curso/${course.slug}`}
                          className="w-full mt-2 py-2.5 px-4 rounded-xl bg-azul-dark hover:bg-azul text-white text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                        >
                          Ir al Aula Virtual
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ) : (
                      <div className="pt-4">
                        <Link
                          href={`/curso/${course.slug}`}
                          className="w-full py-2.5 px-4 rounded-xl bg-verde hover:bg-verde-light text-white text-xs font-semibold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                          {course.isFree ? 'Ingresar al Seminario' : 'Ver Temario y Registrarme'}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* HISTORIA DE MARCA - TEXTO OFICIAL DEL MANUAL */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-[#f7faf8] border-l-4 border-verde rounded-2xl p-8 sm:p-10 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <StarIcon className="w-4 h-4 text-dorado" />
            <span className="text-xs font-bold uppercase tracking-widest text-verde">
              El origen de Lua Azul
            </span>
          </div>

          <blockquote className="font-serif text-base sm:text-lg text-slate-800 leading-relaxed italic">
            “Lua Azul empezó como mi camino de estudio en Flores de Bach y hoy incluye Reiki, Runas y Flores de California — formaciones y libros donde comparto lo que aprendí con seriedad y cuidado. Con el tiempo, esa misma forma de trabajar — con las manos, con tiempo, con detalle — se volvió también agendas personalizadas y artesanías en madera. Son dos caminos distintos, pero nacen del mismo lugar: hacer las cosas bien, y que se note.”
          </blockquote>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-azul-dark">Sabrina Borja · Creadora de Lua Azul</span>
            <span className="font-serif italic text-dorado">Hacer las cosas con cuidado y que se note.</span>
          </div>
        </div>
      </section>

    </div>
  );
}
