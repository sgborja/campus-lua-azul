'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Course } from '@/lib/types';
import { sanitizeHtml } from '@/lib/sanitizeHtml';
import {
  Video,
  FileText,
  FileDown,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  CreditCard,
  Lock,
  Sparkles,
  HelpCircle,
  Share2,
} from 'lucide-react';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showSimulatedModal, setShowSimulatedModal] = useState(false);
  const [simulatedData, setSimulatedData] = useState<{ prefId: string; initPoint: string } | null>(null);

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number; finalPrice: number } | null>(null);

  const slug = params.slug as string;

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/courses/${slug}${user ? `?userId=${user.id}` : ''}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.course) {
          setCourse(data.course);
          setIsEnrolled(Boolean(data.isEnrolled));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug, user]);

  const handleApplyCoupon = async () => {
    if (!course || !couponInput.trim()) return;
    setCheckingCoupon(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), courseId: course.id }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({ code: couponInput.trim().toUpperCase(), discountPercent: data.discountPercent, finalPrice: data.finalPrice });
      } else {
        setAppliedCoupon(null);
        setCouponError(data.error || 'Cupón inválido');
      }
    } catch (e) {
      console.error(e);
      setCouponError('Error al validar el cupón');
    } finally {
      setCheckingCoupon(false);
    }
  };

  const handleEnrollOrCheckout = async () => {
    if (!course) return;
    if (!user) {
      router.push('/login');
      return;
    }

    setProcessingPayment(true);
    try {
      const res = await fetch('/api/mercadopago/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          userId: user.id,
          couponCode: appliedCoupon?.code,
        }),
      });
      const data = await res.json();

      if (data.isFree && data.redirectUrl) {
        // Free course: direct enrollment
        router.push(data.redirectUrl);
        return;
      }

      if (data.isSimulated) {
        setSimulatedData({
          prefId: data.preferenceId,
          initPoint: data.initPoint,
        });
        setShowSimulatedModal(true);
      } else if (data.initPoint) {
        // Real Mercado Pago preference
        window.location.href = data.initPoint;
      }
    } catch (e) {
      console.error('Error during checkout:', e);
      alert('Ocurrió un error al procesar la inscripción');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleSimulatePaymentApproval = async () => {
    if (!course || !user) return;
    try {
      const res = await fetch('/api/mercadopago/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          userId: user.id,
          paymentId: `pay_sim_${Date.now()}`,
          preferenceId: simulatedData?.prefId || 'simulated',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowSimulatedModal(false);
        router.push(`/campus/curso/${course.slug}?pago_exitoso=true`);
      }
    } catch (e) {
      console.error(e);
      alert('Error simulando confirmación');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-4 space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Curso no encontrado</h2>
        <p className="text-slate-500 text-sm">El curso solicitado no existe o fue dado de baja.</p>
        <Link href="/" className="inline-block px-4 py-2 bg-lua-600 text-white rounded-lg text-sm font-semibold">
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <div className="space-y-12 pb-24">
      
      {/* Course Hero Banner */}
      <section className="bg-gradient-to-b from-slate-950 via-lua-950 to-slate-900 text-white py-14 lg:py-20 px-4 sm:px-6 lg:px-8 border-b border-lua-900/50">
        <div className="max-w-7xl mx-auto">

          <div className="max-w-3xl space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-lua-600/30 text-lua-300 text-xs font-semibold px-3 py-1 rounded-full border border-lua-500/30">
                {course.category}
              </span>
              <span className="bg-slate-800 text-slate-300 text-xs font-medium px-3 py-1 rounded-full">
                Nivel {course.level}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
              {course.title}
            </h1>

            <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
              {course.shortDescription}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-lua-400" />
                <span>{course.durationHours} horas estimadas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Video className="w-4 h-4 text-lua-400" />
                <span>{totalLessons} clases prácticas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileDown className="w-4 h-4 text-lua-400" />
                <span>{course.resources.length} recursos descargables</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <Award className="w-4 h-4" />
                <span>Certificado Oficial</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SYLLABUS & RESOURCES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

        {/* Left: Syllabus & Description */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-2xl font-serif font-bold text-slate-900">
              Acerca de este curso
            </h2>
            <div
              className="prose prose-slate text-sm text-slate-600 leading-relaxed whitespace-pre-line [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_a]:text-lua-600 [&_a]:underline [&_h3]:text-lg [&_h3]:font-serif [&_h3]:font-bold [&_h3]:text-azul-dark [&_h3]:mt-4 [&_h4]:text-sm [&_h4]:font-bold [&_h4]:uppercase [&_h4]:tracking-wide [&_h4]:text-slate-700 [&_h4]:mt-3 [&_blockquote]:border-l-4 [&_blockquote]:border-lua-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_table]:w-full [&_table]:my-3 [&_table]:border-collapse [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:p-2 [&_th]:text-left [&_td]:border [&_td]:border-slate-200 [&_td]:p-2"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(course.description) }}
            />
          </div>

          {/* Temario / Módulos */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif font-bold text-slate-900">
                  Temario y Contenidos
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {course.modules.length} módulos • {totalLessons} lecciones
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {course.modules.map((mod, idx) => (
                <div
                  key={mod.id}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50"
                >
                  <div className="px-5 py-3.5 bg-slate-100/80 border-b border-slate-200 font-semibold text-sm text-slate-800 flex items-center justify-between">
                    <span>{mod.title}</span>
                    <span className="text-xs text-slate-500 font-normal">
                      {mod.lessons.length} lecciones
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 bg-white">
                    {mod.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="px-5 py-3 flex items-center justify-between text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          {lesson.type === 'VIDEO' ? (
                            <Video className="w-4 h-4 text-lua-600" />
                          ) : (
                            <FileText className="w-4 h-4 text-amber-600" />
                          )}
                          <span className="font-medium text-slate-800">{lesson.title}</span>
                        </div>
                        <span className="text-slate-400 text-[11px]">
                          {lesson.durationMinutes} min
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Quiz in curriculum if exists */}
              {course.quiz && (
                <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="font-bold text-slate-800 block">
                        {course.quiz.title}
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Requisito para certificar • Mínimo {course.quiz.passingScorePercent}%
                      </span>
                    </div>
                  </div>
                  <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                    Examen Final
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Downloadable Resources List */}
          {course.resources.length > 0 && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                <FileDown className="w-5 h-5 text-lua-600" />
                Documentación y Materiales Incluidos
              </h3>
              <p className="text-xs text-slate-500">
                Todo este material estará disponible para descarga inmediata en tu panel una vez matriculada/o.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {course.resources.map((res) => (
                  <div
                    key={res.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-lua-100 text-lua-700 mt-0.5">
                      <FileDown className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{res.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{res.description}</p>
                      <span className="inline-block text-[10px] text-slate-400 font-medium mt-1">
                        {res.fileType} • {res.fileSize}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right: Pricing / Enroll / Instructor — sticky so it stays visible next to the long description */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-4">
              <img
                src={course.coverImage}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 block">Inversión del curso</span>
                {course.isFree ? (
                  <span className="text-3xl font-extrabold text-emerald-600">GRATIS</span>
                ) : course.priceOnRequest ? (
                  <span className="text-3xl font-extrabold text-slate-900">Consultar</span>
                ) : (
                  <div className="space-y-0.5">
                    {appliedCoupon ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-semibold text-slate-400 line-through">
                          ${course.price.toLocaleString('es-AR')}
                        </span>
                        <span className="text-3xl font-extrabold text-emerald-600">
                          {appliedCoupon.finalPrice === 0 ? 'GRATIS' : `$${appliedCoupon.finalPrice.toLocaleString('es-AR')}`}
                        </span>
                      </div>
                    ) : (
                      <span className="text-3xl font-extrabold text-slate-900">
                        ${course.price.toLocaleString('es-AR')} <span className="text-sm font-semibold text-slate-500">ARS</span>
                      </span>
                    )}
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                      Hasta 12 cuotas con Mercado Pago
                    </p>
                  </div>
                )}
              </div>
            </div>

            {!isEnrolled && !course.isFree && !course.priceOnRequest && (
              <div className="space-y-1.5">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs">
                    <span className="text-emerald-800 font-semibold">
                      Cupón <code className="font-mono">{appliedCoupon.code}</code> aplicado ({appliedCoupon.discountPercent}% off)
                    </span>
                    <button
                      type="button"
                      onClick={() => { setAppliedCoupon(null); setCouponInput(''); }}
                      className="text-emerald-700 hover:underline font-semibold"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                      placeholder="¿Tenés un cupón?"
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={checkingCoupon || !couponInput.trim()}
                      className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs disabled:opacity-50 whitespace-nowrap"
                    >
                      {checkingCoupon ? '...' : 'Aplicar'}
                    </button>
                  </div>
                )}
                {couponError && <p className="text-[11px] text-red-600">{couponError}</p>}
              </div>
            )}

            {isEnrolled ? (
              <div className="space-y-3">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>¡Ya estás matriculada/o en este curso!</span>
                </div>
                <Link
                  href={`/campus/curso/${course.slug}`}
                  className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  Ir al Aula Virtual
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : course.priceOnRequest ? (
              <div className="space-y-3">
                <a
                  href={`https://wa.me/541168790332?text=${encodeURIComponent(`Hola! Quiero consultar por el curso "${course.title}".`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Consultar por WhatsApp
                  <ArrowRight className="w-4 h-4" />
                </a>
                <p className="text-[11px] text-slate-400 text-center">
                  Te contamos el valor y la modalidad de inscripción
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleEnrollOrCheckout}
                  disabled={processingPayment}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-lua-600 to-lua-700 hover:from-lua-500 hover:to-lua-600 text-white font-bold text-sm shadow-lg shadow-lua-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processingPayment ? (
                    'Procesando...'
                  ) : course.isFree || appliedCoupon?.finalPrice === 0 ? (
                    'Inscribirme Gratis Ahora'
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Inscribirme con Mercado Pago
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  Pago seguro y acceso instantáneo de por vida
                </p>
              </div>
            )}

            {/* What is included checklist */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Este curso incluye:
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-lua-600 flex-shrink-0" />
                  <span>Acceso ilimitado a todas las lecciones en video y texto</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-lua-600 flex-shrink-0" />
                  <span>{course.resources.length} guías y plantillas en PDF descargables</span>
                </li>
                {course.quiz && (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-lua-600 flex-shrink-0" />
                    <span>Examen interactivo ({course.quiz.questions.length} preguntas)</span>
                  </li>
                )}
                {course.certificateEnabled && (
                  <li className="flex items-center gap-2 text-amber-700 font-semibold">
                    <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span>Certificado Oficial de Finalización con código QR</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Dictado por Lua Azul
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
                LA
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Equipo Docente Lua Azul</h4>
                <p className="text-xs text-slate-500">Más de 15 años acompañando procesos de sanación</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Más de 15 años trabajando con terapias sanadoras y transmitiendo ese conocimiento a otras personas, en seminarios de Flores de Bach, Reiki, Runas Vikingas y Flores de California dictados con seriedad y cuidado.
            </p>
          </div>
        </div>

      </section>

      {/* SIMULATED MERCADO PAGO MODAL FOR TESTING */}
      {showSimulatedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Checkout de Mercado Pago
              </h3>
              <p className="text-xs text-slate-500">
                Curso: <strong className="text-slate-800">{course.title}</strong>
                <br />
                Monto: <strong className="text-emerald-700">${course.price.toLocaleString('es-AR')} ARS</strong>
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-2">
              <p className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Simulador de Acreditación Inmediata
              </p>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Para que puedas probar el flujo completo en tu computadora sin configurar las credenciales de Mercado Pago ahora mismo, haz clic en el botón verde abajo para simular un pago exitoso con acreditación instantánea.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleSimulatePaymentApproval}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Simular Pago Aprobado en Mercado Pago
              </button>

              <button
                onClick={() => setShowSimulatedModal(false)}
                className="w-full py-2.5 px-4 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-semibold transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
