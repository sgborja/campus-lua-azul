'use client';

import React, { useEffect, useState } from 'react';
import { Settings, CheckCircle2, FileText, Award, ShieldAlert, Sparkles, Tags } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.settings))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: string, value: string) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
      } else {
        alert('Error al guardar los ajustes');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  if (user && user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto text-center py-24 space-y-3">
        <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto" />
        <h2 className="font-serif font-bold text-lg text-slate-800">Acceso restringido</h2>
        <p className="text-xs text-slate-500">
          Solo el rol Administrador puede editar los ajustes del sitio.
        </p>
      </div>
    );
  }

  if (loading || !settings) {
    return <div className="py-20 text-center text-xs text-slate-500">Cargando ajustes...</div>;
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          <Settings className="w-4 h-4" />
          Configuración General
        </span>
        <h2 className="text-xl font-serif font-bold text-slate-900 mt-0.5">Ajustes del Sitio</h2>
        <p className="text-xs text-slate-500">
          Editá el encabezado de la home, el pie de página y la plantilla de los certificados oficiales.
        </p>
      </div>

      {/* Hero de la Home */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sparkles className="w-5 h-5 text-dorado" />
          Encabezado de la Home
        </h3>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">Badge superior</label>
          <input
            type="text"
            value={settings.heroBadge}
            onChange={(e) => handleChange('heroBadge', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Título principal</label>
            <input
              type="text"
              value={settings.heroTitleMain}
              onChange={(e) => handleChange('heroTitleMain', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Título destacado (en dorado)</label>
            <input
              type="text"
              value={settings.heroTitleAccent}
              onChange={(e) => handleChange('heroTitleAccent', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold italic"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">Subtítulo</label>
          <textarea
            rows={2}
            value={settings.heroSubtitle}
            onChange={(e) => handleChange('heroSubtitle', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">
            Chips de valor (separados por coma)
          </label>
          <input
            type="text"
            value={settings.heroBadges}
            onChange={(e) => handleChange('heroBadges', e.target.value)}
            placeholder="Clases en Video y Guías, Vademécums en PDF, Certificado Verificable, Abono con Mercado Pago"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
          />
        </div>
      </div>

      {/* Categorías de cursos */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Tags className="w-5 h-5 text-lua-600" />
          Categorías de Cursos
        </h3>
        <p className="text-[11px] text-slate-400">
          Estas son las categorías que aparecen como sugerencia al crear o editar un curso, y las que arman los
          filtros de la home. Agregá una nueva escribiéndola en una línea aparte, o editá/borrá una existente.
        </p>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">Categorías (una por línea)</label>
          <textarea
            rows={6}
            value={settings.courseCategories}
            onChange={(e) => handleChange('courseCategories', e.target.value)}
            placeholder={'Terapia Floral\nRunas Vikingas'}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileText className="w-5 h-5 text-lua-600" />
          Pie de Página (Footer)
        </h3>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">Descripción de la marca</label>
          <textarea
            rows={3}
            value={settings.footerDescription}
            onChange={(e) => handleChange('footerDescription', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">Frase destacada (en dorado, junto a la estrella)</label>
          <input
            type="text"
            value={settings.footerTagline}
            onChange={(e) => handleChange('footerTagline', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs italic"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">Ubicación (dejalo vacío para no mostrarla)</label>
          <input
            type="text"
            value={settings.footerLocation}
            onChange={(e) => handleChange('footerLocation', e.target.value)}
            placeholder="ej. Buenos Aires, Argentina"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">
            Columna &quot;Seminarios&quot; (una por línea, formato: Texto|/enlace)
          </label>
          <textarea
            rows={5}
            value={settings.footerLinksText}
            onChange={(e) => handleChange('footerLinksText', e.target.value)}
            placeholder={'Flores de Bach|/curso/seminario-flores-de-bach\nÁrea de Miembros|/campus'}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Email de contacto</label>
            <input
              type="text"
              value={settings.footerContactEmail}
              onChange={(e) => handleChange('footerContactEmail', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Texto sobre el pago</label>
            <input
              type="text"
              value={settings.footerPaymentText}
              onChange={(e) => handleChange('footerPaymentText', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Texto del link externo</label>
            <input
              type="text"
              value={settings.footerExternalLinkLabel}
              onChange={(e) => handleChange('footerExternalLinkLabel', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">URL del link externo</label>
            <input
              type="text"
              value={settings.footerExternalLinkUrl}
              onChange={(e) => handleChange('footerExternalLinkUrl', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Certificate template */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Award className="w-5 h-5 text-amber-600" />
          Plantilla de Certificados
        </h3>
        <p className="text-[11px] text-slate-400">
          El nombre de la alumna y el curso se completan automáticamente. Acá solo editás el texto fijo del diploma.
        </p>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">Título del certificado</label>
          <input
            type="text"
            value={settings.certificateTitle}
            onChange={(e) => handleChange('certificateTitle', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">Texto de la declaración</label>
          <textarea
            rows={3}
            value={settings.certificateStatement}
            onChange={(e) => handleChange('certificateStatement', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Nombre de quien firma</label>
            <input
              type="text"
              value={settings.certificateSignerName}
              onChange={(e) => handleChange('certificateSignerName', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Cargo de quien firma</label>
            <input
              type="text"
              value={settings.certificateSignerTitle}
              onChange={(e) => handleChange('certificateSignerTitle', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>
        </div>
      </div>

      {saved && (
        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex items-center gap-1.5 w-fit">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Ajustes guardados correctamente.
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2.5 rounded-xl bg-lua-600 hover:bg-lua-700 text-white font-bold text-xs shadow transition-all disabled:opacity-50"
      >
        {saving ? 'Guardando...' : 'Guardar Ajustes'}
      </button>
    </div>
  );
}
