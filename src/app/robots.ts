import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://campus.luaazul.com.ar';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/campus',
        '/cuenta',
        '/api',
        '/checkout',
        '/login',
        '/registro',
        '/recuperar',
        '/restablecer',
        '/verificar',
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
