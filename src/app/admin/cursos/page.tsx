'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Course, Module, Lesson, Resource } from '@/lib/types';
import {
  BookOpen,
  PlusCircle,
  Video,
  FileText,
  FileDown,
  Trash2,
  Edit,
  ExternalLink,
  CheckCircle2,
  X,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Encuadernación');
  const [price, setPrice] = useState(15000);
  const [isFree, setIsFree] = useState(false);
  const [level, setLevel] = useState<'Principiante' | 'Intermedio' | 'Avanzado'>('Principiante');
  const [durationHours, setDurationHours] = useState(5);
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');

  // Sample lesson to include automatically
  const [lessonTitle, setLessonTitle] = useState('1.1 Introducción práctica y materiales');
  const [lessonType, setLessonType] = useState<'VIDEO' | 'TEXT'>('VIDEO');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [lessonContent, setLessonContent] = useState('Guía inicial de preparación de herramientas.');

  // Sample resource to attach
  const [resourceTitle, setResourceTitle] = useState('Guía Oficial en PDF Lua Azul');
  const [resourceFileUrl, setResourceFileUrl] = useState('/docs/Guia-Medidas-A5-LuaAzul.pdf');

  const fetchCourses = () => {
    setLoading(true);
    fetch('/api/courses')
      .then((res) => res.json())
      .then((data) => {
        if (data.courses) setCourses(data.courses);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    // auto slug
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generatedSlug);
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug) {
      alert('Por favor completa el título');
      return;
    }

    const newCoursePayload: Partial<Course> = {
      title,
      slug,
      category,
      price: isFree ? 0 : Number(price),
      isFree,
      level,
      durationHours: Number(durationHours),
      coverImage,
      shortDescription,
      description,
      published: true,
      certificateEnabled: true,
      modules: [
        {
          id: `mod_${Date.now()}`,
          courseId: `course_${Date.now()}`,
          title: 'Módulo 1: Inicio y Técnicas Fundamentales',
          order: 1,
          lessons: [
            {
              id: `les_${Date.now()}`,
              moduleId: `mod_${Date.now()}`,
              courseId: `course_${Date.now()}`,
              title: lessonTitle,
              type: lessonType,
              videoUrl: lessonType === 'VIDEO' ? lessonVideoUrl : undefined,
              durationMinutes: 15,
              order: 1,
              content: lessonContent,
            },
          ],
        },
      ],
      resources: [
        {
          id: `res_${Date.now()}`,
          courseId: `course_${Date.now()}`,
          title: resourceTitle,
          description: 'Documentación oficial adjunta para descarga.',
          fileUrl: resourceFileUrl,
          fileType: 'PDF',
          fileSize: '2.1 MB',
          downloadCount: 0,
        },
      ],
    };

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoursePayload),
      });
      if (res.ok) {
        setShowCreateModal(false);
        // Reset
        setTitle('');
        setShortDescription('');
        setDescription('');
        fetchCourses();
      }
    } catch (e) {
      console.error(e);
      alert('Error creando curso');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('¿Estás segura/o de eliminar este curso del Campus?')) return;

    try {
      const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCourses();
      }
    } catch (e) {
      console.error(e);
      alert('Error eliminando curso');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-900">
            Listado de Cursos y Contenidos
          </h2>
          <p className="text-xs text-slate-500">
            Crea, edita y gestiona las lecciones en video o texto y sus documentos descargables.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-lua-600 hover:bg-lua-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Crear Nuevo Curso</span>
        </button>
      </div>

      {/* Courses List Table/Cards */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500">Cargando cursos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 w-full bg-slate-100">
                    <img
                      src={course.coverImage}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                      {course.category}
                    </span>
                    <span className="absolute bottom-2 right-2 bg-white/95 text-slate-900 text-xs font-bold px-2 py-0.5 rounded shadow">
                      {course.isFree ? 'Gratis' : `$${course.price.toLocaleString('es-AR')} ARS`}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-serif font-bold text-sm text-slate-900 line-clamp-2">
                      {course.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-lua-600" />
                        {course.modules.length} módulos
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Video className="w-3.5 h-3.5 text-lua-600" />
                        {totalLessons} clases
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FileDown className="w-3.5 h-3.5 text-amber-600" />
                        {course.resources.length} PDFs
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/campus/curso/${course.slug}`}
                      className="p-2 text-slate-600 hover:text-lua-600 rounded-lg hover:bg-white transition-colors"
                      title="Abrir aula virtual"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/curso/${course.slug}`}
                      className="p-2 text-slate-600 hover:text-lua-600 rounded-lg hover:bg-white transition-colors"
                      title="Ver ficha pública"
                    >
                      <BookOpen className="w-4 h-4" />
                    </Link>
                  </div>

                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar curso"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE COURSE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-lua-50 text-lua-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    Crear Nuevo Curso en Lua Azul
                  </h3>
                  <p className="text-xs text-slate-500">Publica contenido en video o texto con material adjunto</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Título del Curso *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="ej. Taller de Encuadernación con Costura Francesa"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-lua-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Slug / Enlace URL</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                  >
                    <option value="Encuadernación">Encuadernación</option>
                    <option value="Papelería y Agendas">Papelería y Agendas</option>
                    <option value="Artesanías y 3D">Artesanías y 3D</option>
                    <option value="Emprendimiento">Emprendimiento</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Precio (ARS)</label>
                  <input
                    type="number"
                    disabled={isFree}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Modalidad de Cobro</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFree}
                      onChange={(e) => setIsFree(e.target.checked)}
                      className="rounded text-lua-600 focus:ring-lua-500"
                    />
                    <span className="text-slate-700 font-medium">100% Gratuito</span>
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Horas Estimadas</label>
                  <input
                    type="number"
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Descripción Corta</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Resumen atractivo para la tarjeta del catálogo"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Descripción Completa</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalles sobre qué aprenderán y técnicas..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              {/* Lesson 1 info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                  Primera Lección del Curso:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium text-slate-600 block mb-1">Título de la clase</label>
                    <input
                      type="text"
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-slate-600 block mb-1">Formato</label>
                    <select
                      value={lessonType}
                      onChange={(e) => setLessonType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                    >
                      <option value="VIDEO">Video (YouTube / Vimeo / MP4)</option>
                      <option value="TEXT">Lectura / Guía en Texto</option>
                    </select>
                  </div>
                </div>

                {lessonType === 'VIDEO' ? (
                  <div>
                    <label className="font-medium text-slate-600 block mb-1">URL del Video</label>
                    <input
                      type="text"
                      value={lessonVideoUrl}
                      onChange={(e) => setLessonVideoUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-mono"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="font-medium text-slate-600 block mb-1">Contenido de la guía</label>
                    <textarea
                      rows={2}
                      value={lessonContent}
                      onChange={(e) => setLessonContent(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Resource info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                  Documentación Descargable Adjunta:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium text-slate-600 block mb-1">Nombre del archivo</label>
                    <input
                      type="text"
                      value={resourceTitle}
                      onChange={(e) => setResourceTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-600 block mb-1">Ruta o archivo PDF</label>
                    <input
                      type="text"
                      value={resourceFileUrl}
                      onChange={(e) => setResourceFileUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-lua-600 hover:bg-lua-700 text-white font-bold shadow transition-all"
                >
                  Guardar y Publicar Curso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
