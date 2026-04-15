export function formatJobDescription(raw: string): string {
  if (!raw) return ''

  // Already contains HTML tags — employer-posted job, return as-is
  if (/<[a-z][\s\S]*>/i.test(raw)) {
    return raw
  }

  // Plain text — apply formatting
  const text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = text.split('\n')

  const result: string[] = []
  let inList = false
  let listItems: string[] = []

  const flushList = () => {
    if (listItems.length > 0) {
      result.push(
        '<ul style="margin: 12px 0; padding-left: 24px;">' +
          listItems.map((item) => `<li style="margin-bottom: 6px;">${item}</li>`).join('') +
          '</ul>'
      )
      listItems = []
      inList = false
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (!line) {
      flushList()
      continue
    }

    // Numbered list: "1. Something" or "1) Something"
    const numberedMatch = line.match(/^(\d+)[.)]\s+(.+)$/)
    if (numberedMatch) {
      if (!inList) {
        flushList()
        inList = true
      }
      listItems.push(numberedMatch[2])
      continue
    }

    // Bullet list: "- Something", "• Something", "* Something"
    const bulletMatch = line.match(/^[-•*]\s+(.+)$/)
    if (bulletMatch) {
      if (!inList) {
        flushList()
        inList = true
      }
      listItems.push(bulletMatch[1])
      continue
    }

    // Flush any pending list before non-list content
    flushList()

    // Section heading: short line ending with ':', or ALL CAPS line
    const isHeading =
      (line.endsWith(':') && line.length < 80) ||
      (line === line.toUpperCase() && line.length > 3 && line.length < 80 && /[A-Z]/.test(line))

    if (isHeading) {
      const headingText = line.endsWith(':') ? line.slice(0, -1) : line
      result.push(
        `<h3 style="font-size: 16px; font-weight: 600; color: #111827; margin: 20px 0 8px;">${headingText}</h3>`
      )
      continue
    }

    // Regular paragraph
    result.push(`<p style="margin: 0 0 12px; line-height: 1.75; color: #374151;">${line}</p>`)
  }

  flushList()

  return result.join('\n')
}
