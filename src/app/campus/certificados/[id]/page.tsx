'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import LuaAzulLogo, { StarIcon } from '@/components/LuaAzulLogo';
import { Printer, ChevronLeft, ShieldCheck, Award } from 'lucide-react';

export default function CertificateDetailPage() {
  const params = useParams();
  const code = params.id as string;
  const [certData, setCertData] = useState<any | null>(null);
  const [settings, setSettings] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;

    Promise.all([
      fetch(`/api/certificates/${code}`).then((res) => res.json()),
      fetch('/api/admin/settings').then((res) => res.json()),
    ])
      .then(([certRes, settingsRes]) => {
        if (certRes.valid && certRes.certificate) {
          setCertData(certRes.certificate);
        }
        if (settingsRes.settings) {
          setSettings(settingsRes.settings);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs text-slate-500">
        Cargando credencial oficial de Lua Azul...
      </div>
    );
  }

  if (!certData) {
    return (
      <div className="max-w-md mx-auto text-center py-24 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Certificado no encontrado</h2>
        <Link href="/campus/certificados" className="inline-block text-azul text-xs font-semibold">
          Volver a Mis Certificados
        </Link>
      </div>
    );
  }

  const issueDateFormatted = new Date(certData.issuedAt).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6">
      
      {/* Action Bar (hidden on print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between no-print">
        <Link
          href="/campus/certificados"
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver al listado
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-xl bg-azul-dark hover:bg-azul text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-dorado" />
            Imprimir / Guardar en PDF
          </button>
        </div>
      </div>

      {/* DIPLOMA PARCHMENT CANVAS - Colors: Azul #2E4C82, Verde #1E5C42, Dorado #B8893A */}
      <div className="max-w-4xl mx-auto bg-[#faf8f5] text-slate-900 rounded-2xl shadow-2xl p-8 sm:p-14 border-8 border-[#2E4C82] relative overflow-hidden print-certificate">
        
        {/* Decorative inner gold border */}
        <div className="border-2 border-[#B8893A] p-6 sm:p-10 rounded-lg relative space-y-8 text-center bg-white/70 backdrop-blur-sm">
          
          {/* Top Emblem */}
          <div className="space-y-1">
            <div className="w-14 h-14 mx-auto text-[#2E4C82] mb-1">
              <LuaAzulLogo variant="symbol" color="#2E4C82" />
            </div>
            
            <h1 className="font-firma text-4xl sm:text-5xl text-[#2E4C82]">
              Lua Azul
            </h1>
            <p className="font-serif text-[11px] uppercase tracking-[0.3em] text-[#1E5C42] font-semibold">
              Seminarios · Línea Formación
            </p>
          </div>

          <div className="py-1">
            <div className="flex items-center justify-center gap-3 my-2">
              <div className="w-16 h-px bg-[#B8893A]" />
              <StarIcon className="w-3.5 h-3.5 text-dorado" />
              <div className="w-16 h-px bg-[#B8893A]" />
            </div>
            
            <span className="text-xs font-sans uppercase tracking-widest text-slate-500 block mb-1">
              Otorga el presente
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E4C82] tracking-wide">
              {settings?.certificateTitle || 'CERTIFICADO DE FORMACIÓN'}
            </h2>
          </div>

          {/* Recipient */}
          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-sans italic">a favor de:</p>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 py-2 border-b-2 border-slate-300 max-w-xl mx-auto">
              {certData.userName}
            </h3>
          </div>

          {/* Statement */}
          <p className="text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed font-sans">
            {settings?.certificateStatement ||
              'Por haber completado con dedicación el programa formativo, el estudio botánico-simbólico y la evaluación correspondiente al curso:'}
          </p>

          <div className="bg-[#f2f7f4] py-3.5 px-6 rounded-xl border border-[#BEE0D0] inline-block max-w-xl">
            <h4 className="font-serif font-bold text-lg sm:text-xl text-[#1E5C42]">
              {certData.courseTitle}
            </h4>
          </div>

          {/* Signatures & Seal Section */}
          <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end border-t border-slate-200/80">
            
            {/* Signature */}
            <div className="space-y-1 text-center">
              <div className="font-firma text-2xl text-[#2E4C82] border-b border-slate-400 pb-1 max-w-[160px] mx-auto">
                {settings?.certificateSignerName || 'Sabrina Borja'}
              </div>
              <p className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider font-sans">
                {settings?.certificateSignerTitle || 'Directora Docente'}
              </p>
              <p className="text-[10px] text-slate-500 font-sans">Seminarios Lua Azul</p>
            </div>

            {/* Official Digital Seal */}
            <div className="text-center space-y-1">
              <div className="w-20 h-20 mx-auto rounded-full border-2 border-dashed border-[#B8893A] bg-amber-50/50 flex flex-col items-center justify-center p-1 text-slate-800">
                <ShieldCheck className="w-6 h-6 text-[#1E5C42]" />
                <span className="text-[8px] font-bold uppercase tracking-wider text-[#2E4C82] mt-0.5">
                  Validez Digital
                </span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono block">
                ID: {certData.code}
              </span>
            </div>

            {/* Date & Verification */}
            <div className="space-y-1 text-center sm:text-right font-sans">
              <p className="text-[11px] text-slate-500">Buenos Aires, Argentina</p>
              <p className="text-xs font-bold text-slate-800">{issueDateFormatted}</p>
              <p className="text-[10px] text-[#B8893A] font-medium">luaazul.com.ar</p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
