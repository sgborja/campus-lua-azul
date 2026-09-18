'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import confetti from 'canvas-confetti';
import { CheckCircle2, ArrowRight, BookOpen } from 'lucide-react';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const courseId = searchParams.get('course_id');
  const userId = searchParams.get('user_id') || user?.id;

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });

    if (courseId && userId) {
      fetch('/api/mercadopago/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          userId,
          paymentId: searchParams.get('payment_id') || `pay_mp_${Date.now()}`,
          preferenceId: searchParams.get('preference_id') || 'mp_approved',
        }),
      }).catch((e) => console.error(e));
    }
  }, [courseId, userId, searchParams]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full border border-slate-200 shadow-2xl text-center space-y-6">
        
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md ring-8 ring-emerald-50">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            ¡Pago Acreditado con Éxito!
          </span>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900">
            ¡Bienvenida/o al Curso!
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tu pago a través de Mercado Pago fue confirmado. Tu matrícula está activa y te hemos enviado el comprobante a tu correo.
          </p>
        </div>

        <div className="pt-2 space-y-2">
          <Link
            href="/campus"
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-lua-600 to-lua-700 hover:from-lua-500 hover:to-lua-600 text-white font-bold text-xs shadow-lg shadow-lua-600/25 transition-all flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Acceder al Aula Virtual en Mi Campus
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-500">Cargando confirmación...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
