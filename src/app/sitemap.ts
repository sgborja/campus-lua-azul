import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://campus.luaazul.com.ar';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = await db.getCourses().catch(() => []);

  const courseEntries: MetadataRoute.Sitemap = courses
    .filter((c) => c.published)
    .map((c) => ({
      url: `${BASE_URL}/curso/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  return [
    {
      url: BASE_URL,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...courseEntries,
  ];
}
