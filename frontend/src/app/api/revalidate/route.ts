import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')

  if (!secret || secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))

    revalidatePath('/')
    revalidatePath('/jobs')

    const extraPaths: string[] = body.paths ?? []
    for (const path of extraPaths) {
      revalidatePath(path)
    }

    return NextResponse.json({ revalidated: true, paths: ['/', '/jobs', ...extraPaths] })
  } catch {
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 })
  }
}
