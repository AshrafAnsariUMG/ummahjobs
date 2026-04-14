const API = process.env.NEXT_PUBLIC_API_URL ?? ''

/**
 * Resolves a raw featured_image_path value (as stored in the DB) to a
 * renderable URL, or null if the image should not be shown.
 *
 * Rules:
 *  - WP content paths  → null  (dead links, show fallback instead)
 *  - Full HTTP URL      → as-is (non-WP external images)
 *  - /storage/... path  → API_URL + path
 *  - blog/... relative  → API_URL + /storage/ + path
 *  - Anything else      → null
 */
export function getBlogImageUrl(path: string | null | undefined): string | null {
  if (!path) return null

  // WP migrated images are dead — show fallback placeholder
  if (path.includes('wp-content')) return null

  // Already a full URL (non-WP)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // Already has /storage/ prefix — prepend backend base URL
  if (path.startsWith('/storage/')) {
    return API + path
  }

  // Relative storage path e.g. 'blog/filename.webp'
  if (path.startsWith('blog/') || path.startsWith('images/')) {
    return API + '/storage/' + path
  }

  return null
}
