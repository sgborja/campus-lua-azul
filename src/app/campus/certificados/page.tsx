'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Certificate } from '@/lib/types';
import { Award, CheckCircle2, Download, Printer, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';

export default function StudentCertificatesPage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetch(`/api/courses?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        // Find certificates
        const certs: Certificate[] = [];
        if (data.courses) {
          data.courses.forEach((c: any) => {
            if (c.hasCertificate && c.certificateCode) {
              certs.push({
                id: c.certificateCode,
                code: c.certificateCode,
                userId: user.id,
                userName: user.name,
                courseId: c.id,
                courseTitle: c.title,
                issuedAt: new Date().toISOString(),
              });
            }
          });
        }
        setCertificates(certs);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            Credenciales Académicas
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
            Mis Certificados Oficiales
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Diplomas digitales otorgados por Lua Azul al completar el 100% de clases y aprobar evaluaciones.
          </p>
        </div>

        <Link
          href="/verificar/LUA-2026-T89K2"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Probar Validador Público
        </Link>
      </div>

      {/* Certificates List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500">Cargando tus diplomas...</div>
      ) : certificates.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="font-serif font-bold text-lg text-slate-800">Aún no has desbloqueado certificados</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Completa todas las lecciones de tus cursos matriculados y rinde la evaluación final para obtener tu diploma con validez digital de Lua Azul.
          </p>
          <Link
            href="/campus"
            className="inline-block px-5 py-2.5 rounded-xl bg-lua-600 hover:bg-lua-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            Ir a mis Cursos en Curso
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.code}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Diploma Card Graphic Mockup */}
              <div className="p-6 bg-gradient-to-br from-slate-900 via-lua-950 to-slate-900 text-white relative overflow-hidden border-b border-lua-800/40">
                <div className="absolute right-3 top-3 opacity-10 font-serif font-black text-6xl text-white select-none">
                  LUA
                </div>
                <div className="space-y-2 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                      Certificado de Finalización
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                      {cert.code}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-white line-clamp-2">
                    {cert.courseTitle}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Otorgado a: <strong className="text-white">{cert.userName}</strong>
                  </p>
                </div>
              </div>

              {/* Actions & Verification Details */}
              <div className="p-6 space-y-4 bg-white flex-1 flex flex-col justify-between">
                <div className="space-y-2 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Estado de validez:</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Oficial y Verificado
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Código único:</span>
                    <strong className="font-mono text-slate-800">{cert.code}</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/campus/certificados/${cert.code}`}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-lua-600 hover:bg-lua-700 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Ver e Imprimir Diploma
                  </Link>

                  <Link
                    href={`/verificar/${cert.code}`}
                    target="_blank"
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                    title="Página de verificación pública"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
