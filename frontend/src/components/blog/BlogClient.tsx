'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { BlogPost } from '@/types'
import { getBlogImageUrl } from '@/lib/blogUtils'
import AnimatedSection from '@/components/ui/AnimatedSection'

const BLOG_CATEGORIES = ['All', 'Education', 'Information', 'Interview', 'Job Seeking', 'Learn', 'Skill']

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function BlogCardImage({ post }: { post: BlogPost }) {
  const [failed, setFailed] = useState(false)
  const url = getBlogImageUrl(post.featured_image_path)

  if (!url || failed) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #E6EDFF 0%, #c7d7ff 100%)' }}
      >
        <svg className="w-12 h-12 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={post.title}
      onError={() => setFailed(true)}
      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    />
  )
}

function PostCard({ post }: { post: BlogPost }) {
  const excerpt = post.excerpt ?? ''
  const truncated = excerpt.length > 150 ? excerpt.slice(0, 150) + '…' : excerpt

  return (
    <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors group">
      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
        <BlogCardImage post={post} />
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          {post.category && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: '#033BB0' }}
            >
              {post.category}
            </span>
          )}
          <span className="text-xs text-gray-400">{formatDate(post.published_at)}</span>
        </div>

        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>

        {truncated && <p className="text-sm text-gray-600 leading-relaxed mb-4">{truncated}</p>}

        <Link
          href={`/blog/${post.slug}`}
          className="text-sm font-medium hover:underline"
          style={{ color: '#033BB0' }}
        >
          Read More →
        </Link>
      </div>
    </article>
  )
}

export default function BlogClient({ posts }: { posts: BlogPost[] }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchCat =
        activeCategory === 'All' || p.category?.toLowerCase() === activeCategory.toLowerCase()
      const matchSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.excerpt ?? '').toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [posts, activeCategory, search])

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    posts.forEach((p) => {
      const c = p.category ?? 'Uncategorised'
      counts[c] = (counts[c] ?? 0) + 1
    })
    return counts
  }, [posts])

  const recentPosts = posts.slice(0, 5)

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={activeCategory === cat ? { backgroundColor: '#033BB0' } : undefined}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Posts grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filtered.map((post, index) => (
              <AnimatedSection key={post.id} animation="fade-up" delay={index * 100}>
                <PostCard post={post} />
              </AnimatedSection>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-500 text-sm">
              {search
                ? `No posts found for "${search}".`
                : `No posts found in ${activeCategory}.`}
            </p>
          </div>
        )}
      </main>

      {/* Sidebar */}
      <aside className="w-full lg:w-72 shrink-0 space-y-6">
        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Search</h3>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles…"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
          />
        </div>

        {/* Categories */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Categories</h3>
          <ul className="space-y-1.5">
            {Object.entries(categoryCounts).map(([cat, count]) => (
              <li key={cat}>
                <button
                  onClick={() => setActiveCategory(cat)}
                  className="flex items-center justify-between w-full text-sm text-gray-700 hover:text-blue-700 transition-colors py-0.5"
                  style={activeCategory === cat ? { color: '#033BB0', fontWeight: 600 } : undefined}
                >
                  <span>{cat}</span>
                  <span className="text-xs text-gray-400">{count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent posts */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Recent Posts</h3>
          <ul className="space-y-3">
            {recentPosts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="block text-sm text-gray-700 hover:text-blue-700 transition-colors leading-snug"
                >
                  {post.title}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(post.published_at)}</p>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}
