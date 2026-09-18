'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, XCircle, Award, Calendar, CheckCircle2, User, BookOpen } from 'lucide-react';

export default function CertificateVerificationPage() {
  const params = useParams();
  const code = params.code as string;
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;

    fetch(`/api/certificates/${code}`)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-slate-500">
        Verificando credencial oficial en los registros de Lua Azul...
      </div>
    );
  }

  const isValid = data?.valid && data?.certificate;
  const cert = data?.certificate;

  return (
    <div className="max-w-xl mx-auto px-4 py-16 sm:py-24 space-y-8">
      
      {/* Verification Badge Header */}
      <div className="text-center space-y-3">
        {isValid ? (
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md ring-8 ring-emerald-50">
            <ShieldCheck className="w-10 h-10" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-md ring-8 ring-rose-50">
            <XCircle className="w-10 h-10" />
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
          {isValid ? 'Certificado Oficial Válido' : 'Certificado No Encontrado'}
        </h1>

        <p className="text-xs text-slate-500">
          Registro Oficial de Credenciales Académicas de <strong>Lua Azul</strong>
        </p>
      </div>

      {/* Details Box */}
      {isValid ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <span className="text-xs font-semibold text-slate-500">Código de Verificación:</span>
            <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-3 py-1 rounded-md">
              {cert.code}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-lua-600 mt-0.5" />
              <div>
                <span className="text-slate-400 block text-[11px]">Alumno Certificado</span>
                <strong className="text-sm font-bold text-slate-900">{cert.userName}</strong>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <BookOpen className="w-4 h-4 text-lua-600 mt-0.5" />
              <div>
                <span className="text-slate-400 block text-[11px]">Curso Acreditado</span>
                <strong className="text-sm font-bold text-slate-900">{cert.courseTitle}</strong>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-lua-600 mt-0.5" />
              <div>
                <span className="text-slate-400 block text-[11px]">Fecha de Emisión</span>
                <strong className="text-slate-800">
                  {new Date(cert.issuedAt).toLocaleDateString('es-AR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </strong>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Este documento fue emitido por el sistema oficial del Campus Lua Azul y cuenta con validez académica certificada.
            </span>
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/"
              className="inline-block px-5 py-2.5 rounded-xl bg-lua-600 hover:bg-lua-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              Conocer el Campus Lua Azul
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow text-center space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            No se encontró ningún diploma asociado al código <code className="font-mono font-bold text-rose-600">{code}</code>. Verifica que el enlace o identificador esté escrito correctamente.
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg"
          >
            Ir a la Página Principal
          </Link>
        </div>
      )}

    </div>
  );
}
