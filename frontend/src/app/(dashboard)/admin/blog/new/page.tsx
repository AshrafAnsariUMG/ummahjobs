'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/Toast'

const KNOWN_CATEGORIES = ['Education', 'Information', 'Interview', 'Job Seeking', 'Learn', 'Skill']

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function AdminBlogNewPage() {
  const { showToast } = useToast()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [featuredImageUrl, setFeaturedImageUrl] = useState('')
  const [publishedAt, setPublishedAt] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const fileRef = useRef<HTMLInputElement>(null)

  // Auto-slug from title (debounced)
  useEffect(() => {
    if (slugManual) return
    const t = setTimeout(() => setSlug(slugify(title)), 300)
    return () => clearTimeout(t)
  }, [title, slugManual])

  async function handleImageUpload(file: File) {
    setUploading(true)
    try {
      const form = new FormData()
      form.append('image', file)
      const res = await api.upload('/api/admin/blog/upload-image', form) as { url: string }
      setFeaturedImageUrl(res.url)
      showToast('Image uploaded.', 'success')
    } catch {
      showToast('Image upload failed.', 'error')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(publishNow: boolean) {
    setSaving(true)
    setErrors({})

    const payload: Record<string, unknown> = {
      title,
      content,
      category: category || null,
      excerpt: excerpt || null,
      featured_image_path: featuredImageUrl || null,
      slug: slugManual ? slug : undefined,
    }

    if (publishNow) {
      payload.published_at = publishedAt || new Date().toISOString()
    } else {
      payload.published_at = null
    }

    try {
      const res = await api.post('/api/admin/blog', payload) as { post: { slug: string }; slug: string }
      showToast('JazakAllah Khayran! Post created.', 'success')
      router.push(`/admin/blog/${res.slug}/edit`)
    } catch (err: unknown) {
      const e = err as { errors?: Record<string, string[]> }
      if (e?.errors) {
        const flat: Record<string, string> = {}
        Object.entries(e.errors).forEach(([k, v]) => { flat[k] = v[0] })
        setErrors(flat)
      } else {
        showToast('Failed to create post.', 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/blog" className="text-xs font-medium text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 mb-3">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Blog Posts
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900">New Blog Post</h1>
      </div>

      <div className="space-y-5">
        {/* Title */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title..."
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          {slug && (
            <p className="text-xs text-gray-400 mt-1.5">
              Slug: <span className="font-mono text-gray-600">{slug}</span>
            </p>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <label className="block text-sm font-semibold text-gray-700 mb-0.5">
            Content <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-400 mb-2">You can use HTML tags for formatting. The content will be rendered as-is on the public blog.</p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="<p>Start writing...</p>"
            className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent font-mono resize-y"
            style={{ minHeight: 400, '--tw-ring-color': '#033BB0' } as React.CSSProperties}
          />
          {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
        </div>

        {/* Category + Excerpt */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-0.5">Category</label>
            <p className="text-xs text-gray-400 mb-2">
              Existing: {KNOWN_CATEGORIES.join(', ')}
            </p>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Career Advice"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
              list="blog-categories"
            />
            <datalist id="blog-categories">
              {KNOWN_CATEGORIES.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Excerpt
              <span className="ml-2 text-xs font-normal text-gray-400">{excerpt.length}/500</span>
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value.slice(0, 500))}
              placeholder="Brief summary shown on the blog listing page..."
              rows={3}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent resize-none"
              style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Featured Image */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Featured Image</label>
          <div className="flex gap-2 mb-4">
            {(['upload', 'url'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setImageTab(tab)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors"
                style={imageTab === tab
                  ? { backgroundColor: '#033BB0', color: '#fff', borderColor: '#033BB0' }
                  : { borderColor: '#e5e7eb', color: '#6b7280' }}
              >
                {tab === 'upload' ? 'Upload File' : 'External URL'}
              </button>
            ))}
          </div>

          {imageTab === 'upload' && (
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpg,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file)
                }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {uploading ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                )}
                {uploading ? 'Uploading…' : 'Choose image (JPG/PNG/WebP, max 5MB)'}
              </button>
            </div>
          )}

          {imageTab === 'url' && (
            <input
              type="url"
              value={featuredImageUrl}
              onChange={(e) => setFeaturedImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
            />
          )}

          {featuredImageUrl && (
            <div className="mt-3 flex items-start gap-3">
              <img src={featuredImageUrl} alt="Preview" className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-mono break-all">{featuredImageUrl}</p>
                <button onClick={() => setFeaturedImageUrl('')} className="text-xs text-red-500 hover:text-red-700 mt-1">Remove</button>
              </div>
            </div>
          )}
        </div>

        {/* Publish Date */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <label className="block text-sm font-semibold text-gray-700 mb-0.5">Publish Date & Time</label>
          <p className="text-xs text-gray-400 mb-2">Leave empty to save as draft. Set a future date to schedule.</p>
          <div className="flex items-center gap-3">
            <input
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
            />
            <button
              onClick={() => {
                const now = new Date()
                const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                setPublishedAt(local.toISOString().slice(0, 16))
              }}
              className="px-3 py-2.5 text-xs font-medium rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap"
            >
              Publish Now
            </button>
          </div>
        </div>

        {/* Advanced: Slug */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowAdvanced((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Advanced Options
            <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showAdvanced && (
            <div className="px-5 pb-5 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mt-4 mb-1.5">URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugManual(true) }}
                placeholder="post-url-slug"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent font-mono"
                style={{ '--tw-ring-color': '#033BB0' } as React.CSSProperties}
              />
              {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 mt-6 -mx-8 px-8 py-4 bg-white border-t border-gray-200 flex items-center justify-between gap-3">
        <Link href="/admin/blog" className="text-sm font-medium text-gray-500 hover:text-gray-700">
          Cancel
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSubmit(false)}
            disabled={saving || !title || !content}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={saving || !title || !content}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-40 transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#033BB0' }}
          >
            {saving ? 'Saving…' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  )
}
