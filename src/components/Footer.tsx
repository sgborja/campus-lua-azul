import React from 'react';
import Link from 'next/link';
import LuaAzulLogo, { StarIcon } from './LuaAzulLogo';
import { Mail } from 'lucide-react';
import { db } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';

const FALLBACK_DESCRIPTION =
  'Formación con raíz botánica y profundidad simbólica, para leerte a vos y acompañar a otros. Cursos en Flores de Bach, Reiki, Runas Vikingas y Flores de California.';
const FALLBACK_TAGLINE = 'Hacer las cosas con cuidado y que se note.';
const FALLBACK_LINKS_TEXT =
  'Flores de Bach|/curso/seminario-flores-de-bach\nReiki Usui Tradicional|/#seminarios\nRunas Vikingas|/curso/runas-vikingas\nFlores de California|/#seminarios\nÁrea de Miembros|/campus';

function parseFooterLinks(text: string): { label: string; href: string }[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href] = line.split('|').map((part) => part.trim());
      return { label: label || '', href: href || '/' };
    })
    .filter((l) => l.label);
}

export default async function Footer() {
  // Este componente vive en el layout raíz, así que sin esto Next.js lo
  // renderiza estático en build time y los cambios guardados en Ajustes
  // del Sitio nunca se ven hasta el próximo deploy.
  noStore();
  const settings = await db.getSiteSettings().catch(() => null);
  const footerDescription = settings?.footerDescription || FALLBACK_DESCRIPTION;
  const footerTagline = settings?.footerTagline || FALLBACK_TAGLINE;
  const footerLocation = settings?.footerLocation || '';
  const footerLinks = parseFooterLinks(settings?.footerLinksText || FALLBACK_LINKS_TEXT);
  const footerContactEmail = settings?.footerContactEmail || 'campus@luaazul.com.ar';
  const footerExternalLinkLabel = settings?.footerExternalLinkLabel || 'Línea Objeto: luaazul.com.ar →';
  const footerExternalLinkUrl = settings?.footerExternalLinkUrl || 'https://www.luaazul.com.ar';
  const footerPaymentText = settings?.footerPaymentText || 'Cobro seguro con Mercado Pago';

  return (
    <footer className="bg-azul-950 text-celeste border-t border-azul/40 mt-20 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <LuaAzulLogo inverted subtitle="Seminarios" />

            <p className="text-xs sm:text-sm text-celeste/80 max-w-md leading-relaxed font-light">
              {footerDescription}
            </p>

            <div className="flex items-center gap-2 text-xs text-dorado font-serif italic">
              <StarIcon className="w-3 h-3 text-dorado" />
              <span>{footerTagline}</span>
            </div>
          </div>

          {/* Links Col 1 */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">
              Seminarios
            </h3>
            <ul className="space-y-2 text-xs text-celeste/70">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`hover:text-white transition-colors ${link.href === '/campus' ? 'text-dorado' : ''}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">
              Contacto y Tienda
            </h3>
            <ul className="space-y-2 text-xs text-celeste/70">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-verde" />
                <span>{footerContactEmail}</span>
              </li>
              <li>
                <a
                  href={footerExternalLinkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors text-dorado"
                >
                  {footerExternalLinkLabel}
                </a>
              </li>
              <li>
                <span className="text-[11px] text-celeste/50">
                  {footerPaymentText}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-azul/40 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-celeste/50 gap-4 font-light sm:pr-20">
          <p>© {new Date().getFullYear()} Lua Azul. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1.5">
            {footerLocation && (
              <>
                <span>{footerLocation}</span>
                <span>·</span>
              </>
            )}
            <span className="text-dorado font-serif">Seminarios Lua Azul</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
