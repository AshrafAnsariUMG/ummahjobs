import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { BlogPost } from '@/types'
import ShareButtons from '@/components/jobs/ShareButtons'
import NewsletterSignup from '@/components/home/NewsletterSignup'
import BlogFeaturedImage from '@/components/blog/BlogFeaturedImage'
import MANAd from '@/components/ads/MANAdBanner'

const API = process.env.NEXT_PUBLIC_API_URL
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ummahjobs.com'

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API}/api/blog/${slug}`, { next: { revalidate: 300 } })
    if (res.status === 404) return null
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function getRecentPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API}/api/blog`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const all: BlogPost[] = await res.json()
    return all.slice(0, 5)
  } catch {
    return []
  }
}

interface PageProps {
  params: Promise<{ slug: string }>
}

function estimateReadTime(content: string): number {
  const words = content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Blog | UmmahJobs' }
  const description = post.excerpt?.slice(0, 155) ?? post.content?.replace(/<[^>]*>/g, '').trim().slice(0, 155) ?? post.title
  const url = `${SITE}/blog/${slug}`
  const ogImage = post.featured_image_path
    ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${post.featured_image_path}`
    : `${SITE}/images/logo.png`
  return {
    title: `${post.title} | UmmahJobs Blog`,
    description,
    openGraph: {
      title: post.title,
      description,
      url,
      siteName: 'UmmahJobs',
      type: 'article',
      publishedTime: post.published_at,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: post.title,
      description,
      images: [ogImage],
    },
    alternates: { canonical: url },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const [post, recentPosts] = await Promise.all([getPost(slug), getRecentPosts()])

  if (!post) notFound()

  const readTime = post.content ? estimateReadTime(post.content) : 3
  const postUrl = `${SITE}/blog/${post.slug}`
  const dateFormatted = new Date(post.published_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 flex items-center gap-1.5 mb-6">
        <Link href="/" className="hover:text-gray-600">Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-gray-600">Blog</Link>
        <span>/</span>
        <span className="text-gray-600 truncate max-w-xs">{post.title}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Article */}
        <article className="flex-1 min-w-0">
          {/* Featured image */}
          <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden mb-7">
            <BlogFeaturedImage
              path={post.featured_image_path}
              alt={post.title}
              className="w-full h-full"
            />
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {post.category && (
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                style={{ backgroundColor: '#033BB0' }}
              >
                {post.category}
              </span>
            )}
            <span className="text-sm text-gray-500">{dateFormatted}</span>
            {post.author?.display_name && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-sm text-gray-500">By {post.author.display_name}</span>
              </>
            )}
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-500">{readTime} min read</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-6">{post.title}</h1>

          {/* Content */}
          {post.content ? (
            <div
              className="blog-content text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <p className="text-gray-500 italic">Content coming soon.</p>
          )}

          {/* Share */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <ShareButtons title={post.title} url={postUrl} />
          </div>

          {/* Back link */}
          <div className="mt-6">
            <Link href="/blog" className="text-sm font-medium hover:underline" style={{ color: '#033BB0' }}>
              ← Back to Blog
            </Link>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="w-full lg:w-72 shrink-0 space-y-6">
          {/* About UmmahJobs */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">About UmmahJobs</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              UmmahJobs connects Muslim professionals with halal opportunities worldwide.
            </p>
            <Link
              href="/jobs"
              className="block w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#033BB0' }}
            >
              Browse Jobs →
            </Link>
          </div>

          {/* Advertisement */}
          <div>
            <p style={{ fontSize: '10px', color: '#9CA3AF', textAlign: 'center', marginBottom: '4px' }}>Advertisement</p>
            <MANAd size="rectangle" />
          </div>

          {/* Recent posts */}
          {recentPosts.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Recent Posts</h3>
              <ul className="space-y-3">
                {recentPosts
                  .filter((p) => p.slug !== post.slug)
                  .slice(0, 5)
                  .map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/blog/${p.slug}`}
                        className="block text-sm text-gray-700 hover:text-blue-700 transition-colors leading-snug"
                      >
                        {p.title}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(p.published_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Newsletter */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-1 text-sm">Stay Updated</h3>
            <p className="text-xs text-gray-500 mb-4">Get new posts and job alerts in your inbox.</p>
            <NewsletterSignup />
          </div>
        </aside>
      </div>
    </div>
  )
}
