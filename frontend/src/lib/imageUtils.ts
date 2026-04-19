export function getStorageUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  if (path.startsWith('/storage/')) return process.env.NEXT_PUBLIC_API_URL + path
  if (path.startsWith('storage/')) return process.env.NEXT_PUBLIC_API_URL + '/' + path
  return process.env.NEXT_PUBLIC_API_URL + '/storage/' + path
}
