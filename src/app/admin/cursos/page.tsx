'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Course, Module, Lesson, Resource } from '@/lib/types';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { useAuth } from '@/lib/auth-context';
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
  Layers,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function AdminCoursesPage() {
  const { user } = useAuth();
  const canAssignInstructors = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const [courses, setCourses] = useState<Course[]>([]);
  const [staffUsers, setStaffUsers] = useState<{ id: string; name: string; role: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Terapia Floral');
  const [instructorIds, setInstructorIds] = useState<string[]>([]);
  const [price, setPrice] = useState(15000);
  const [isFree, setIsFree] = useState(false);
  const [priceOnRequest, setPriceOnRequest] = useState(false);
  const [published, setPublished] = useState(true);
  const [level, setLevel] = useState<'Principiante' | 'Intermedio' | 'Avanzado'>('Principiante');
  const [durationHours, setDurationHours] = useState(6);
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');

  // Sample lesson to include
  const [lessonTitle, setLessonTitle] = useState('1.1 Introducción práctica y fundamentos');
  const [lessonType, setLessonType] = useState<'VIDEO' | 'TEXT' | 'PPT'>('VIDEO');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [lessonContent, setLessonContent] = useState('Guía inicial de preparación botánica y principios del método.');
  const [lessonPptUrl, setLessonPptUrl] = useState('');
  const [uploadingPpt, setUploadingPpt] = useState(false);

  const handlePptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPpt(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setLessonPptUrl(data.url);
      } else {
        alert(data.error || 'Error al subir la presentación');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al subir la presentación');
    } finally {
      setUploadingPpt(false);
      e.target.value = '';
    }
  };

  // Resource to attach
  const [resourceTitle, setResourceTitle] = useState('Guía Oficial en PDF Lua Azul');
  const [resourceFileUrl, setResourceFileUrl] = useState('/docs/Guia-Medidas-A5-LuaAzul.pdf');
  const [uploadingResource, setUploadingResource] = useState(false);

  const handleResourceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResource(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setResourceFileUrl(data.url);
        if (!resourceTitle.trim()) setResourceTitle(file.name);
      } else {
        alert(data.error || 'Error al subir el archivo');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al subir el archivo');
    } finally {
      setUploadingResource(false);
      e.target.value = '';
    }
  };

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setCoverImage(data.url);
      } else {
        alert(data.error || 'Error al subir la imagen');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al subir la imagen');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const fetchCourses = () => {
    setLoading(true);
    fetch('/api/courses?admin=true')
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

  useEffect(() => {
    if (!canAssignInstructors) return;
    fetch('/api/admin/metrics')
      .then((res) => res.json())
      .then((data) => {
        const staff = (data.allUsers || []).filter((u: any) => u.role === 'PROFESOR' || u.role === 'ADMIN' || u.role === 'EDITOR');
        setStaffUsers(staff);
      })
      .catch((err) => console.error(err));
  }, [canAssignInstructors]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) {
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingCourseId(null);
    setTitle('');
    setSlug('');
    setCategory('Terapia Floral');
    setInstructorIds([]);
    setPrice(15000);
    setIsFree(false);
    setPriceOnRequest(false);
    setPublished(true);
    setLevel('Principiante');
    setDurationHours(6);
    setCoverImage('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800');
    setShortDescription('');
    setDescription('');
    setLessonTitle('1.1 Introducción práctica y fundamentos');
    setLessonType('VIDEO');
    setLessonVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    setLessonContent('Guía inicial de preparación botánica y principios del método.');
    setLessonPptUrl('');
    setResourceTitle('Guía Oficial en PDF Lua Azul');
    setResourceFileUrl('/docs/Guia-Medidas-A5-LuaAzul.pdf');
    setShowModal(true);
  };

  const handleOpenEditModal = (course: Course) => {
    setIsEditing(true);
    setEditingCourseId(course.id);
    setTitle(course.title);
    setSlug(course.slug);
    setCategory(course.category || 'Terapia Floral');
    setInstructorIds(course.instructorIds || []);
    setPrice(course.price || 0);
    setIsFree(Boolean(course.isFree));
    setPriceOnRequest(Boolean(course.priceOnRequest));
    setPublished(course.published !== undefined ? course.published : true);
    setLevel((course.level as any) || 'Principiante');
    setDurationHours(course.durationHours || 6);
    setCoverImage(course.coverImage || '');
    setShortDescription(course.shortDescription || '');
    setDescription(course.description || '');

    const firstMod = course.modules?.[0];
    const firstLes = firstMod?.lessons?.[0];
    setLessonTitle(firstLes?.title || '1.1 Introducción');
    setLessonType(firstLes?.type || 'VIDEO');
    setLessonVideoUrl(firstLes?.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    setLessonContent(firstLes?.content || '');
    setLessonPptUrl(firstLes?.pptUrl || '');

    const firstRes = course.resources?.[0];
    setResourceTitle(firstRes?.title || 'Guía Oficial en PDF Lua Azul');
    setResourceFileUrl(firstRes?.fileUrl || '/docs/Guia-Medidas-A5-LuaAzul.pdf');

    setShowModal(true);
  };

  const getResourceFileType = (url: string): 'PDF' | 'ZIP' | 'PPT' => {
    const ext = url.split('.').pop()?.toLowerCase().split('?')[0] || '';
    if (ext === 'zip') return 'ZIP';
    if (ext === 'ppt' || ext === 'pptx') return 'PPT';
    return 'PDF';
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      alert('Por favor completa el título y el enlace URL');
      return;
    }

    setSaving(true);
    try {
      if (isEditing && editingCourseId) {
        // Find existing course to preserve modules/exam if any
        const existing = courses.find((c) => c.id === editingCourseId);
        const updatedModules = existing?.modules?.length
          ? existing.modules.map((m, mIdx) => {
              if (mIdx === 0 && m.lessons.length > 0) {
                const updatedLessons = [...m.lessons];
                updatedLessons[0] = {
                  ...updatedLessons[0],
                  title: lessonTitle,
                  type: lessonType,
                  videoUrl: lessonType === 'VIDEO' ? lessonVideoUrl : undefined,
                  pptUrl: lessonType === 'PPT' ? lessonPptUrl : undefined,
                  content: lessonContent,
                };
                return { ...m, lessons: updatedLessons };
              }
              return m;
            })
          : [
              {
                id: `mod_${Date.now()}`,
                courseId: editingCourseId,
                title: 'Módulo 1: Inicio y Técnicas Fundamentales',
                order: 1,
                lessons: [
                  {
                    id: `les_${Date.now()}`,
                    moduleId: `mod_${Date.now()}`,
                    courseId: editingCourseId,
                    title: lessonTitle,
                    type: lessonType,
                    videoUrl: lessonType === 'VIDEO' ? lessonVideoUrl : undefined,
                  pptUrl: lessonType === 'PPT' ? lessonPptUrl : undefined,
                    durationMinutes: 15,
                    order: 1,
                    content: lessonContent,
                  },
                ],
              },
            ];

        const payload: Partial<Course> = {
          title,
          slug,
          category,
          ...(canAssignInstructors ? { instructorIds } : {}),
          price: isFree ? 0 : Number(price),
          isFree,
          priceOnRequest,
          published,
          level,
          durationHours: Number(durationHours),
          coverImage,
          shortDescription,
          description,
          modules: updatedModules,
          resources: [
            {
              id: `res_${Date.now()}`,
              courseId: editingCourseId,
              title: resourceTitle,
              description: 'Documentación oficial adjunta para descarga.',
              fileUrl: resourceFileUrl,
              fileType: getResourceFileType(resourceFileUrl),
              fileSize: '2.5 MB',
              downloadCount: 0,
            },
          ],
        };

        const res = await fetch(`/api/courses/${editingCourseId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setShowModal(false);
          fetchCourses();
        } else {
          alert('Error al actualizar el curso');
        }
      } else {
        // Create new course
        const newCoursePayload: Partial<Course> = {
          title,
          slug,
          category,
          ...(canAssignInstructors ? { instructorIds } : {}),
          price: isFree ? 0 : Number(price),
          isFree,
          priceOnRequest,
          level,
          durationHours: Number(durationHours),
          coverImage,
          shortDescription,
          description,
          published,
          certificateEnabled: true,
          modules: [
            {
              id: `mod_${Date.now()}`,
              courseId: `course_${Date.now()}`,
              title: 'Módulo 1: Fundamentos y Primera Práctica',
              order: 1,
              lessons: [
                {
                  id: `les_${Date.now()}`,
                  moduleId: `mod_${Date.now()}`,
                  courseId: `course_${Date.now()}`,
                  title: lessonTitle,
                  type: lessonType,
                  videoUrl: lessonType === 'VIDEO' ? lessonVideoUrl : undefined,
                  pptUrl: lessonType === 'PPT' ? lessonPptUrl : undefined,
                  durationMinutes: 20,
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
              fileType: getResourceFileType(resourceFileUrl),
              fileSize: '2.5 MB',
              downloadCount: 0,
            },
          ],
        };

        const res = await fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCoursePayload),
        });

        if (res.ok) {
          setShowModal(false);
          fetchCourses();
        } else {
          alert('Error al crear el curso');
        }
      }
    } catch (e) {
      console.error(e);
      alert('Error guardando el curso');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublished = async (course: Course) => {
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !course.published }),
      });
      if (res.ok) {
        fetchCourses();
      } else {
        alert('Error al cambiar la visibilidad del curso');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('¿Estás segura de eliminar este curso del Campus?')) return;

    try {
      const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCourses();
      } else {
        alert('Error al eliminar curso');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión');
    }
  };

  const handleLoadModelCourse = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/courses/model', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchCourses();
      } else {
        alert(data.error || 'Error cargando curso modelo');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión');
    } finally {
      setLoading(false);
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
            Crea, edita y administra las lecciones en video o texto y sus documentos descargables.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleLoadModelCourse}
            className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs shadow-sm transition-all flex items-center gap-2"
            title="Cargar un curso de ejemplo completo con lecciones y examen, para usar como modelo"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Cargar Curso de Ejemplo</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-lua-600 hover:bg-lua-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Crear Nuevo Curso</span>
          </button>
        </div>
      </div>

      {/* Courses List Table/Cards */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500">Cargando cursos...</div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-lua-50 text-lua-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-slate-900">
              Aún no tienes cursos publicados en el Campus
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Puedes crear tu primer curso desde cero o cargar nuestro curso modelo de Lua Azul para comenzar de inmediato.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleLoadModelCourse}
              className="px-5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs shadow-sm transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Cargar Curso Modelo Oficial</span>
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 rounded-xl bg-lua-600 hover:bg-lua-700 text-white font-bold text-xs shadow transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Crear Curso desde Cero</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="relative h-44 w-full bg-slate-100">
                    <img
                      src={course.coverImage}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-sm">
                      {course.category}
                    </span>
                    {!course.published && (
                      <span className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                        <EyeOff className="w-3 h-3" /> Oculto
                      </span>
                    )}
                    <span className="absolute bottom-2 right-2 bg-white/95 text-slate-900 text-xs font-bold px-2.5 py-1 rounded shadow">
                      {course.isFree ? 'Gratis' : course.priceOnRequest ? 'Consultar' : `$${course.price.toLocaleString('es-AR')} ARS`}
                    </span>
                    {course.quiz && (
                      <span className="absolute top-2 right-2 bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                        <Award className="w-3 h-3" /> Con Examen
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-serif font-bold text-base text-slate-900 line-clamp-2">
                      {course.title}
                    </h3>

                    {course.shortDescription && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {course.shortDescription}
                      </p>
                    )}

                    {canAssignInstructors && (
                      <p className="text-[11px] text-slate-500">
                        Profesor/a:{' '}
                        {course.instructorIds && course.instructorIds.length > 0
                          ? course.instructorIds
                              .map((id) => staffUsers.find((s) => s.id === id)?.name || 'Desconocido')
                              .join(', ')
                          : 'Sin asignar'}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-lua-600" />
                        {course.modules?.length || 0} módulos
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Video className="w-3.5 h-3.5 text-lua-600" />
                        {totalLessons} clases
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FileDown className="w-3.5 h-3.5 text-amber-600" />
                        {course.resources?.length || 0} PDFs
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(course)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-lua-600 hover:border-lua-300 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      title="Editar título, precio y clases"
                    >
                      <Edit className="w-3.5 h-3.5 text-lua-600" />
                      <span>Editar</span>
                    </button>

                    <Link
                      href={`/campus/curso/${course.slug}`}
                      className="p-1.5 text-slate-500 hover:text-lua-600 rounded-lg hover:bg-white transition-colors"
                      title="Abrir aula virtual del alumno"
                      target="_blank"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleTogglePublished(course)}
                      className="p-1.5 text-slate-500 hover:text-lua-600 rounded-lg hover:bg-white transition-colors"
                      title={course.published ? 'Ocultar curso (dejará de verse públicamente)' : 'Publicar curso (se mostrará públicamente)'}
                    >
                      {course.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* CREATE / EDIT COURSE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-lua-50 text-lua-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    {isEditing ? 'Editar Curso' : 'Crear Nuevo Curso en Lua Azul'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Publica contenido en video o texto con material adjunto para tus alumnas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Título del Curso *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="ej. Taller de Flores de Bach y Acompañamiento Floral"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-lua-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Slug / Enlace URL *</label>
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
                  <input
                    type="text"
                    list="category-suggestions"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="ej. Terapia Floral"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none"
                  />
                  <datalist id="category-suggestions">
                    <option value="Terapia Floral" />
                    <option value="Encuadernación" />
                    <option value="Reiki & Energía" />
                    <option value="Runas Vikingas" />
                    <option value="Papelería y Agendas" />
                    <option value="Emprendimiento" />
                  </datalist>
                </div>
              </div>

              {canAssignInstructors && (
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Profesor/a a cargo</label>
                  {staffUsers.length === 0 ? (
                    <p className="text-[11px] text-slate-400">
                      No hay usuarios con rol Profesor todavía. Asignalo desde Alumnos y Progreso.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {staffUsers.map((s) => {
                        const checked = instructorIds.includes(s.id);
                        return (
                          <label
                            key={s.id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                              checked ? 'bg-lua-50 border-lua-400 text-lua-700 font-semibold' : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) =>
                                setInstructorIds((prev) =>
                                  e.target.checked ? [...prev, s.id] : prev.filter((id) => id !== s.id)
                                )
                              }
                              className="rounded"
                            />
                            {s.name}
                            <span className="text-slate-400">
                              ({s.role === 'ADMIN' ? 'Admin' : s.role === 'EDITOR' ? 'Editor' : 'Profesor/a'})
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400">
                    Sin marcar ninguno, solo Admin y Editor pueden gestionar este curso.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Precio (ARS)</label>
                  <input
                    type="number"
                    disabled={isFree || priceOnRequest}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none disabled:opacity-50 font-bold"
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
                  <label className="flex items-center gap-2 mt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={priceOnRequest}
                      onChange={(e) => setPriceOnRequest(e.target.checked)}
                      className="rounded text-lua-600 focus:ring-lua-500"
                    />
                    <span className="text-slate-700 font-medium">Mostrar &quot;Consultar&quot; en vez del precio</span>
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
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="rounded text-lua-600 focus:ring-lua-500"
                  />
                  <span className="font-semibold text-slate-700">Curso visible públicamente (desmarcá para ocultarlo)</span>
                </label>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Foto de Portada</label>
                <div className="flex items-center gap-3">
                  {coverImage && (
                    <img src={coverImage} alt="Portada" className="w-16 h-16 rounded-lg object-cover border border-slate-200 flex-shrink-0" />
                  )}
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="https://images.unsplash.com/... (o subí un archivo)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                    />
                    <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-lua-600 hover:text-lua-700 cursor-pointer">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                        disabled={uploadingImage}
                        onChange={handleCoverImageUpload}
                      />
                      <span>{uploadingImage ? 'Subiendo...' : '📁 Subir imagen desde mi computadora'}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Descripción Corta</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Resumen para la tarjeta de presentación"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Descripción Completa</label>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Detalles sobre los contenidos y técnicas del seminario..."
                />
              </div>

              {/* Lesson 1 info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                  Lección Inicial del Curso:
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
                      <option value="PPT">Presentación PowerPoint</option>
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
                ) : lessonType === 'PPT' ? (
                  <div className="space-y-2">
                    <label className="font-medium text-slate-600 block mb-1">Archivo de PowerPoint</label>
                    {lessonPptUrl && (
                      <p className="text-[11px] text-emerald-700 truncate">✓ {lessonPptUrl}</p>
                    )}
                    <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-lua-600 hover:text-lua-700 cursor-pointer">
                      <input
                        type="file"
                        accept=".ppt,.pptx"
                        className="hidden"
                        disabled={uploadingPpt}
                        onChange={handlePptUpload}
                      />
                      <span>{uploadingPpt ? 'Subiendo...' : '📁 Subir archivo .ppt o .pptx'}</span>
                    </label>
                    <p className="text-[10px] text-slate-400">
                      Se muestra dentro del Aula Virtual con el visor de Office, sin que la alumna tenga que abrir PowerPoint.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="font-medium text-slate-600 block mb-1">Contenido de la guía</label>
                    <RichTextEditor value={lessonContent} onChange={setLessonContent} compact />
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
                  <div className="space-y-2">
                    <label className="font-medium text-slate-600 block mb-1">Ruta o archivo (PDF, PPT o ZIP)</label>
                    <input
                      type="text"
                      value={resourceFileUrl}
                      onChange={(e) => setResourceFileUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-mono"
                    />
                    <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-lua-600 hover:text-lua-700 cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.ppt,.pptx,.zip,application/pdf,application/zip,application/x-zip-compressed,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                        className="hidden"
                        disabled={uploadingResource}
                        onChange={handleResourceUpload}
                      />
                      <span>{uploadingResource ? 'Subiendo...' : '📁 Subir archivo desde mi computadora'}</span>
                    </label>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">
                  Este material queda disponible para descarga solo para alumnas inscriptas en el curso.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-lua-600 hover:bg-lua-700 text-white font-bold shadow transition-all disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Guardar y Publicar Curso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
