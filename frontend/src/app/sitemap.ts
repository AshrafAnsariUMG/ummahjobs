import type { MetadataRoute } from 'next'

const BASE = 'https://ummahjobs.com'
const API = process.env.NEXT_PUBLIC_API_URL

function safeDate(value: string | null | undefined): Date {
  if (!value) return new Date()
  const d = new Date(value)
  return isNaN(d.getTime()) ? new Date() : d
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { path: '',                    priority: 1.0, freq: 'daily'   },
    { path: '/jobs',               priority: 0.9, freq: 'hourly'  },
    { path: '/blog',               priority: 0.8, freq: 'weekly'  },
    { path: '/about',              priority: 0.7, freq: 'monthly' },
    { path: '/contact',            priority: 0.6, freq: 'monthly' },
    { path: '/employers/why-post', priority: 0.8, freq: 'monthly' },
    { path: '/login',              priority: 0.5, freq: 'monthly' },
    { path: '/register',           priority: 0.6, freq: 'monthly' },
    { path: '/packages',           priority: 0.7, freq: 'weekly'  },
  ].map(({ path, priority, freq }) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: freq as MetadataRoute.Sitemap[number]['changeFrequency'],
    priority,
  }))

  let jobPages: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${API}/api/jobs?per_page=500&status=active`, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      const jobs = data.jobs ?? data.data ?? []
      jobPages = jobs.map((job: { slug: string; updated_at: string; is_featured?: boolean }) => ({
        url: `${BASE}/jobs/${job.slug}`,
        lastModified: safeDate(job.updated_at),
        changeFrequency: 'weekly' as const,
        priority: job.is_featured ? 0.9 : 0.7,
      }))
    }
  } catch { /* skip */ }

  let blogPages: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${API}/api/blog?per_page=100`, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      const posts = Array.isArray(data) ? data : (data.posts ?? data.data ?? [])
      blogPages = posts.map((post: { slug: string; updated_at: string }) => ({
        url: `${BASE}/blog/${post.slug}`,
        lastModified: safeDate(post.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
    }
  } catch { /* skip */ }

  return [...staticPages, ...jobPages, ...blogPages]
}
