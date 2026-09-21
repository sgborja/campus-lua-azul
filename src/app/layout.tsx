import type { Metadata } from 'next';
import { Parisienne, Cormorant_Garamond } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingWhatsapp from '@/components/FloatingWhatsapp';

const parisienne = Parisienne({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-firma',
});

const cormorant = Cormorant_Garamond({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-cormorant',
});

const SITE_TITLE = 'Seminarios Lua Azul | Formación con Raíz Botánica y Profundidad Simbólica';
const SITE_DESCRIPTION =
  'Cursos y seminarios de Flores de Bach, Reiki, Runas Vikingas y Flores de California. Formación pausada, seria y con calidez artesanal.';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://campus.luaazul.com.ar';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: SITE_TITLE,
    template: '%s | Campus Lua Azul',
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: BASE_URL,
    siteName: 'Campus Lua Azul',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${parisienne.variable} ${cormorant.variable}`}
    >
      <body className="min-h-screen flex flex-col font-sans antialiased text-slate-800 bg-[#fbfdfc] selection:bg-[#1E5C42] selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingWhatsapp />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
