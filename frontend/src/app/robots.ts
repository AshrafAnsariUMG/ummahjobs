import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin',
          '/admin/',
          '/candidate/',     // private dashboards
          '/employer/',
          '/dashboard',
          '/_next/',
        ],
      },
    ],
    sitemap: 'https://ummahjobs.com/sitemap.xml',
    host: 'https://ummahjobs.com',
  }
}
