'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

interface AdminBlogPost {
  id: number
  title: string
  slug: string
  category: string | null
  excerpt: string | null
  featured_image_path: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

function postStatus(post: AdminBlogPost): 'published' | 'scheduled' | 'draft' {
  if (!post.published_at) return 'draft'
  if (new Date(post.published_at) > new Date()) return 'scheduled'
  return 'published'
}

function StatusBadge({ post }: { post: AdminBlogPost }) {
  const status = postStatus(post)
  if (status === 'published') {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Published</span>
  }
  if (status === 'scheduled') {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />Scheduled</span>
  }
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500"><span className="w-1.5 h-1.5 rounded-full bg-gray-400" />Draft</span>
}

function ConfirmDialog({
  title, body, onConfirm, onCancel,
}: { title: string; body: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-5">{body}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminBlogPage() {
  const { showToast } = useToast()
  const router = useRouter()
  const [posts, setPosts] = useState<AdminBlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<AdminBlogPost | null>(null)

  useEffect(() => {
    api.get('/api/admin/blog')
      .then((d: { posts: AdminBlogPost[] }) => setPosts(d.posts))
      .catch(() => showToast('Failed to load posts.', 'error'))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(post: AdminBlogPost) {
    setDeleteTarget(null)
    setPosts((prev) => prev.filter((p) => p.slug !== post.slug))
    try {
      await api.delete(`/api/admin/blog/${post.slug}`)
      showToast('Post deleted.', 'success')
    } catch {
      showToast('Failed to delete post.', 'error')
      // re-fetch
      api.get('/api/admin/blog').then((d: { posts: AdminBlogPost[] }) => setPosts(d.posts)).catch(() => {})
    }
  }

  const published = posts.filter((p) => postStatus(p) === 'published').length
  const drafts = posts.filter((p) => postStatus(p) !== 'published').length

  function formatDate(d: string | null) {
    if (!d) return 'Draft'
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <>
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Post"
          body={`Delete "${deleteTarget.title}"? This cannot be undone.`}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Blog Posts</h1>
            <p className="text-sm text-gray-500 mt-1">{posts.length} total · {published} published · {drafts} drafts/scheduled</p>
          </div>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#033BB0' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Post
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xl font-extrabold text-gray-900">{posts.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Posts</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xl font-extrabold text-green-600">{published}</p>
            <p className="text-xs text-gray-500 mt-0.5">Published</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xl font-extrabold text-gray-400">{drafts}</p>
            <p className="text-xs text-gray-500 mt-0.5">Drafts / Scheduled</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-lg" />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-400">No blog posts yet.</p>
              <Link href="/admin/blog/new" className="text-sm font-medium mt-2 inline-block hover:underline" style={{ color: '#033BB0' }}>Create your first post →</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Post</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Category</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Date</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                      {/* Title + thumbnail */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {post.featured_image_path ? (
                            <img
                              src={post.featured_image_path}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover shrink-0 border border-gray-100"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate max-w-[280px]">{post.title}</p>
                            <p className="text-xs text-gray-400 font-mono truncate">{post.slug}</p>
                          </div>
                        </div>
                      </td>
                      {/* Category */}
                      <td className="px-4 py-3">
                        {post.category ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{post.category}</span>
                        ) : <span className="text-xs text-gray-300">—</span>}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge post={post} />
                      </td>
                      {/* Date */}
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(post.published_at)}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <Link
                            href={`/admin/blog/${post.slug}/edit`}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Edit
                          </Link>
                          {postStatus(post) === 'published' && (
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              View ↗
                            </a>
                          )}
                          <button
                            onClick={() => setDeleteTarget(post)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
