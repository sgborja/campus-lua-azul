'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Course, Lesson, Resource, LessonProgress } from '@/lib/types';
import { sanitizeHtml } from '@/lib/sanitizeHtml';
import confetti from 'canvas-confetti';
import {
  Video,
  FileText,
  FileDown,
  CheckCircle2,
  Circle,
  PlayCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Clock,
  Sparkles,
  Download,
  AlertCircle,
  HelpCircle,
  Share2,
  Presentation,
  Copy,
  Check,
} from 'lucide-react';

// Rango Unicode del bloque Runic (usado por ejemplo en el curso de Runas Vikingas)
const RUNIC_GLYPH_REGEX = /[ᚠ-᛿]/g;

function extractGlyph(title: string): string | null {
  const matches = title.match(RUNIC_GLYPH_REGEX);
  return matches && matches.length > 0 ? matches.join('') : null;
}

function CourseClassroomContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [progressList, setProgressList] = useState<LessonProgress[]>([]);
  const [glyphCopied, setGlyphCopied] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'content' | 'resources' | 'quiz'>('content');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [certificateUnlocked, setCertificateUnlocked] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const slug = params.slug as string;

  useEffect(() => {
    if (!slug || !user) return;

    fetch(`/api/courses/${slug}?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.course) {
          setCourse(data.course);
          setProgressList(data.progress || []);
          setIsEnrolled(Boolean(data.isEnrolled) || user.role !== 'STUDENT');

          // Find first uncompleted lesson or first lesson
          const allLessons: Lesson[] = [];
          data.course.modules.forEach((m: any) => allLessons.push(...m.lessons));

          const firstUncompleted = allLessons.find(
            (l) => !data.progress?.some((p: any) => p.lessonId === l.id && p.completed)
          );

          if (firstUncompleted) {
            setActiveLessonId(firstUncompleted.id);
          } else if (allLessons.length > 0) {
            setActiveLessonId(allLessons[0].id);
          }

          if (data.certificate) {
            setCertificateUnlocked(true);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug, user]);

  // Show celebration if payment just succeeded
  useEffect(() => {
    if (searchParams.get('pago_exitoso')) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [searchParams]);

  // Flat list of all lessons in order
  const allLessons = useMemo(() => {
    if (!course) return [];
    const list: Lesson[] = [];
    course.modules.forEach((m) => list.push(...m.lessons));
    return list;
  }, [course]);

  const activeLesson = useMemo(() => {
    return allLessons.find((l) => l.id === activeLessonId) || allLessons[0];
  }, [allLessons, activeLessonId]);

  const currentIndex = allLessons.findIndex((l) => l.id === activeLesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const isCompleted = (lessonId: string) => {
    return progressList.some((p) => p.lessonId === lessonId && p.completed);
  };

  const completedCount = allLessons.filter((l) => isCompleted(l.id)).length;
  const progressPercent = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  const toggleLessonCompletion = async (lessonId: string) => {
    if (!user || !course) return;

    const currentComp = isCompleted(lessonId);
    const newComp = !currentComp;

    // Optimistic UI update
    setProgressList((prev) => {
      const idx = prev.findIndex((p) => p.lessonId === lessonId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], completed: newComp };
        return copy;
      } else {
        return [...prev, { userId: user.id, courseId: course.id, lessonId, completed: newComp }];
      }
    });

    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          courseId: course.id,
          lessonId,
          completed: newComp,
        }),
      });
      const data = await res.json();

      if (data.certificateUnlocked) {
        setCertificateUnlocked(true);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
        });
      }
    } catch (e) {
      console.error('Error toggling completion:', e);
    }
  };

  // Convert YouTube/Vimeo URLs to embeddable URLs
  const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
    }
    return url;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-lua-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Cargando el aula virtual de Lua Azul...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-md mx-auto text-center py-24 space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Curso no encontrado</h2>
        <Link href="/campus" className="inline-block px-4 py-2 bg-lua-600 text-white rounded-lg text-sm">
          Volver a Mi Campus
        </Link>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="max-w-md mx-auto text-center py-24 space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Todavía no estás inscripta en este curso</h2>
        <p className="text-sm text-slate-500">
          Inscribite para acceder a las clases, el material descargable y el certificado.
        </p>
        <Link
          href={`/curso/${course.slug}`}
          className="inline-block px-4 py-2 bg-lua-600 text-white rounded-lg text-sm font-semibold"
        >
          Ver curso e inscribirme
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      
      {/* Top Classroom Bar */}
      <div className="h-14 bg-slate-950 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Alternar temario"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          
          <Link
            href="/campus"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Volver a Mi Campus</span>
          </Link>

          <span className="text-slate-600 hidden sm:inline">|</span>

          <h2 className="text-xs sm:text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-md">
            {course.title}
          </h2>
        </div>

        {/* Progress % and Certificate access */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Progreso:</span>
            <div className="w-28 bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  progressPercent === 100 ? 'bg-emerald-500' : 'bg-lua-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-200">{progressPercent}%</span>
          </div>

          {progressPercent === 100 && (
            <Link
              href="/campus/certificados"
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm animate-pulse"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Ver Certificado</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Layout Area: Sidebar + Player */}
      <div className="flex-1 flex overflow-hidden">

        {/* Backdrop behind the sidebar on mobile so it doesn't blend into the lesson content */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 top-14 bg-black/70 z-10 md:hidden"
          />
        )}

        {/* LEFT SIDEBAR: Syllabus & Modules */}
        <aside
          className={`${
            sidebarOpen ? 'w-full sm:w-80 lg:w-96 translate-x-0 left-0' : '-translate-x-full w-0'
          } transition-all duration-300 bg-slate-950 border-r border-slate-800 flex flex-col flex-shrink-0 fixed inset-y-14 z-20 md:static`}
        >
          <div className="p-4 border-b border-slate-800/80">
            <h3 className="font-serif font-bold text-sm text-white">Contenido del Curso</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {completedCount} de {allLessons.length} lecciones completadas
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {course.modules.map((mod, modIdx) => (
              <div key={mod.id} className="space-y-1.5">
                <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {mod.title}
                </div>

                <div className="space-y-1">
                  {mod.lessons.map((les) => {
                    const completed = isCompleted(les.id);
                    const isActive = les.id === activeLesson?.id;

                    return (
                      <button
                        key={les.id}
                        onClick={() => {
                          setActiveLessonId(les.id);
                          if (window.innerWidth < 768) setSidebarOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                          isActive
                            ? 'bg-lua-600/30 text-white border border-lua-500/50 shadow-sm'
                            : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                        }`}
                      >
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLessonCompletion(les.id);
                          }}
                          className="mt-0.5 cursor-pointer flex-shrink-0"
                          title={completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                        >
                          {completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className={`line-clamp-2 leading-snug font-medium ${isActive ? 'text-lua-300 font-semibold' : ''}`}>
                            {les.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                            {les.type === 'VIDEO' ? (
                              <span className="flex items-center gap-1">
                                <Video className="w-3 h-3 text-lua-400" /> Video
                              </span>
                            ) : les.type === 'PPT' ? (
                              <span className="flex items-center gap-1">
                                <Presentation className="w-3 h-3 text-orange-400" /> Presentación
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3 text-amber-400" /> Guía
                              </span>
                            )}
                            <span>•</span>
                            <span>{les.durationMinutes} min</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Final Exam Entry if Course has Quiz */}
            {course.quiz && (
              <div className="pt-2 border-t border-slate-800">
                <Link
                  href={`/campus/curso/${course.slug}/examen/${course.quiz.id}`}
                  className="w-full text-left p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 hover:bg-amber-500/20 transition-all flex items-center gap-3"
                >
                  <Award className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <div>
                    <strong className="block text-white font-semibold">{course.quiz.title}</strong>
                    <span className="text-[10px] text-amber-300/80">
                      Examen Final • Ponderación {course.quiz.passingScorePercent}%
                    </span>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT MAIN AREA: Video/Content Reader & Tabs */}
        <main className="flex-1 bg-slate-900 overflow-y-auto">
          {activeLesson ? (
            <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
              
              {/* Media Player Box */}
              {activeLesson.type === 'VIDEO' && activeLesson.videoUrl ? (
                <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
                  <iframe
                    src={getEmbedUrl(activeLesson.videoUrl) || ''}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              ) : activeLesson.type === 'PPT' && activeLesson.pptUrl ? (
                <div className="aspect-video w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
                  <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(activeLesson.pptUrl)}`}
                    title={activeLesson.title}
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                        Lección en formato Lectura & Guía Técnica
                      </span>
                      <h1 className="text-xl sm:text-2xl font-serif font-bold text-white mt-0.5">
                        {activeLesson.title}
                      </h1>
                    </div>
                  </div>

                  {(() => {
                    const glyph = extractGlyph(activeLesson.title);
                    if (!glyph) return null;
                    return (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(glyph);
                            setGlyphCopied(true);
                            setTimeout(() => setGlyphCopied(false), 1500);
                          } catch {
                            // portapapeles no disponible; el glifo sigue siendo visible y seleccionable
                          }
                        }}
                        title="Copiar el glifo de esta runa"
                        className="flex-shrink-0 flex flex-col items-center gap-1 px-4 py-1 rounded-xl border border-slate-700 hover:border-amber-500/60 hover:bg-amber-500/10 transition-colors"
                      >
                        <span className="text-6xl sm:text-7xl font-serif text-amber-400 leading-none select-all">
                          {glyph}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                          {glyphCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" /> Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copiar glifo
                            </>
                          )}
                        </span>
                      </button>
                    );
                  })()}
                </div>
              )}

              {/* Lesson Controls: Title, Completion check, Prev / Next */}
              <div className="bg-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white leading-snug">
                    {activeLesson.title}
                  </h1>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    Duración: {activeLesson.durationMinutes} minutos
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => toggleLessonCompletion(activeLesson.id)}
                    className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      isCompleted(activeLesson.id)
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30'
                        : 'bg-lua-600 hover:bg-lua-500 text-white shadow-md shadow-lua-600/20'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isCompleted(activeLesson.id) ? 'Completada ✓' : 'Marcar como Completada'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      disabled={!prevLesson}
                      onClick={() => prevLesson && setActiveLessonId(prevLesson.id)}
                      className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Lección anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      disabled={!nextLesson}
                      onClick={() => nextLesson && setActiveLessonId(nextLesson.id)}
                      className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Siguiente lección"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* TABS HEADER */}
              <div className="flex border-b border-slate-800 gap-4 sm:gap-6 text-xs font-semibold overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`pb-3 border-b-2 transition-colors flex items-center gap-2 flex-shrink-0 whitespace-nowrap ${
                    activeTab === 'content'
                      ? 'border-lua-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Notas y Explicación de la Clase</span>
                  <span className="sm:hidden">Notas</span>
                </button>

                <button
                  onClick={() => setActiveTab('resources')}
                  className={`pb-3 border-b-2 transition-colors flex items-center gap-2 flex-shrink-0 whitespace-nowrap ${
                    activeTab === 'resources'
                      ? 'border-lua-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileDown className="w-4 h-4" />
                  <span className="hidden sm:inline">Documentación Descargable ({course.resources.length})</span>
                  <span className="sm:hidden">Archivos ({course.resources.length})</span>
                </button>

                {course.quiz && (
                  <button
                    onClick={() => setActiveTab('quiz')}
                    className={`pb-3 border-b-2 transition-colors flex items-center gap-2 flex-shrink-0 whitespace-nowrap ${
                      activeTab === 'quiz'
                        ? 'border-amber-500 text-amber-300'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    Examen Final
                  </button>
                )}
              </div>

              {/* TAB CONTENT: Content & Notes */}
              {activeTab === 'content' && (
                <div className="bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
                  <div
                    className="prose prose-invert prose-sm max-w-none leading-relaxed text-slate-300 whitespace-pre-line [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_a]:text-lua-400 [&_a]:underline [&_h3]:text-lg [&_h3]:font-serif [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-4 [&_h4]:text-sm [&_h4]:font-bold [&_h4]:uppercase [&_h4]:tracking-wide [&_h4]:text-amber-400 [&_h4]:mt-4 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-400 [&_table]:w-full [&_table]:my-3 [&_table]:border-collapse [&_th]:border [&_th]:border-slate-700 [&_th]:bg-slate-900 [&_th]:p-2 [&_th]:text-left [&_td]:border [&_td]:border-slate-700 [&_td]:p-2 [&_hr]:border-slate-800 [&_hr]:my-6"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(activeLesson.content) }}
                  />
                </div>
              )}

              {/* TAB CONTENT: Downloadable Resources (Documentation dispatch to student) */}
              {activeTab === 'resources' && (
                <div className="bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
                  <div>
                    <h3 className="font-serif font-bold text-base text-white">
                      Documentación y Archivos de Trabajo
                    </h3>
                    <p className="text-xs text-slate-400">
                      Haz clic en cualquiera de los archivos para descargarlo a tu dispositivo.
                    </p>
                  </div>

                  <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50">
                    {course.resources.map((res) => (
                      <div
                        key={res.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-lua-600/20 text-lua-400 mt-0.5 border border-lua-500/20">
                            <FileDown className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{res.title}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">{res.description}</p>
                            <span className="text-[10px] text-slate-500 font-medium">
                              Formato {res.fileType} • {res.fileSize}
                            </span>
                          </div>
                        </div>

                        <a
                          href={res.fileUrl}
                          download
                          className="px-4 py-2 rounded-xl bg-lua-600 hover:bg-lua-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap self-end sm:self-center shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Descargar Archivo
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: Exam teaser */}
              {activeTab === 'quiz' && course.quiz && (
                <div className="bg-slate-950 p-6 sm:p-8 rounded-2xl border border-amber-500/30 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-white">{course.quiz.title}</h3>
                      <p className="text-xs text-slate-400">{course.quiz.description}</p>
                      <p className="text-xs text-amber-400 font-medium pt-1">
                        Puntaje mínimo de aprobación: {course.quiz.passingScorePercent}%
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/campus/curso/${course.slug}/examen/${course.quiz.id}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
                    >
                      Comenzar Examen Ahora
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 text-xs">
              Selecciona una lección del temario a la izquierda para comenzar.
            </div>
          )}
        </main>
      </div>

    </div>
  );
}

export default function CourseClassroomPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-xs text-slate-400">Cargando aula virtual...</div>}>
      <CourseClassroomContent />
    </Suspense>
  );
}
