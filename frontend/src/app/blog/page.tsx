import Link from 'next/link'
import type { BlogPost } from '@/types'
import BlogClient from '@/components/blog/BlogClient'

const API = process.env.NEXT_PUBLIC_API_URL

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API}/api/blog`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export const metadata = {
  title: 'Blog | UmmahJobs',
  description: 'Career advice, job seeking tips, and Islamic guidance for Muslim professionals.',
}

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" style={{ position: 'relative' }}>
{/* Header */}
      <div className="mb-8">
        <nav className="text-xs text-gray-400 flex items-center gap-1.5 mb-3">
          <Link href="/" className="hover:text-gray-600">Home</Link>
          <span>/</span>
          <span className="text-gray-600">Blog</span>
        </nav>
        <h1 className="text-3xl font-extrabold text-gray-900">Blog</h1>
        <p className="text-gray-500 text-sm mt-1">
          Career advice, job seeking tips, and guidance for Muslim professionals.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
          <p className="text-gray-500 text-sm mb-2">Check back soon — new articles coming.</p>
          <Link href="/jobs" className="text-sm font-medium" style={{ color: '#033BB0' }}>
            Browse jobs →
          </Link>
        </div>
      ) : (
        <BlogClient posts={posts} />
      )}
    </div>
  )
}
