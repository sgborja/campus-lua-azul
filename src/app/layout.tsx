import type { Metadata } from 'next';
import { Parisienne, Cormorant_Garamond, Poppins } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import DemoSwitcherBar from '@/components/DemoSwitcherBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Seminarios Lua Azul | Formación con Raíz Botánica y Profundidad Simbólica',
  description:
    'Cursos y seminarios de Flores de Bach, Reiki, Runas Vikingas y Flores de California. Formación pausada, seria y con calidez artesanal.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${parisienne.variable} ${cormorant.variable} ${poppins.variable}`}
    >
      <body className="min-h-screen flex flex-col font-sans antialiased text-slate-800 bg-[#fbfdfc] selection:bg-[#1E5C42] selection:text-white">
        <AuthProvider>
          <DemoSwitcherBar />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
