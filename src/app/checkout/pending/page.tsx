import React from 'react';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';

export default function CheckoutPendingPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full border border-slate-200 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <Clock className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif font-bold text-2xl text-slate-900">
            Pago en Proceso
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tu pago está siendo procesado por Mercado Pago. Tan pronto como se confirme la acreditación, tus clases se desbloquearán automáticamente.
          </p>
        </div>
        <Link
          href="/campus"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
        >
          Ir a Mi Campus
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
