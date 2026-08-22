/** Minimal Markdown → HTML converter for blog content. No dependency is
 * pulled in for this — the CoL n8n workflow emits plain Markdown (headings,
 * bold, links, lists, paragraphs) and nothing fancier, so a small
 * hand-rolled converter covers it. The ProRido-style workflow emits ready
 * HTML directly (see the n8n prompt in n8n-workflows/innbly-auto-blogging.json),
 * so content that already looks like HTML is passed through untouched
 * instead of being re-escaped.
 *
 * Content only ever arrives via api/submit.ts's BLOG_INGEST_SECRET-gated
 * ingestion path (never directly from a site visitor), so rendering it with
 * dangerouslySetInnerHTML is an accepted trust boundary — same as every
 * other server-authored HTML block already injected in this codebase
 * (index.html's static JSON-LD, useJsonLd). Don't reuse this for anything
 * user-submitted.
 */
function looksLikeHtml(content: string): boolean {
  return /^\s*</.test(content)
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function inline(text: string): string {
  let out = escapeHtml(text)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label: string, href: string) => {
    const external = /^https?:\/\//.test(href)
    const attrs = external ? ` target="_blank" rel="noopener noreferrer"` : ''
    return `<a href="${href}" class="text-primary-600 underline font-medium hover:text-primary-700"${attrs}>${label}</a>`
  })
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  out = out.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
  out = out.replace(/`([^`]+)`/g, '<code class="rounded bg-slate-100 px-1.5 py-0.5 text-[0.85em]">$1</code>')
  return out
}

export function markdownToHtml(markdown: string): string {
  if (looksLikeHtml(markdown)) return markdown

  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const html: string[] = []
  let listBuffer: string[] = []
  let listType: 'ul' | 'ol' | null = null

  const flushList = () => {
    if (!listType || listBuffer.length === 0) {
      listBuffer = []
      listType = null
      return
    }
    const cls = listType === 'ul' ? 'list-disc' : 'list-decimal'
    html.push(`<${listType} class="${cls} pl-6 space-y-1.5 my-4">${listBuffer.join('')}</${listType}>`)
    listBuffer = []
    listType = null
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      flushList()
      continue
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading) {
      flushList()
      const level = heading[1].length
      const sizes: Record<number, string> = {
        1: 'text-3xl font-extrabold mt-8 mb-4',
        2: 'text-2xl font-bold mt-8 mb-3',
        3: 'text-xl font-bold mt-6 mb-2',
        4: 'text-lg font-bold mt-5 mb-2',
        5: 'text-base font-bold mt-4 mb-2',
        6: 'text-sm font-bold mt-4 mb-2',
      }
      html.push(`<h${level} class="${sizes[level] ?? sizes[6]} text-slate-900">${inline(heading[2])}</h${level}>`)
      continue
    }

    const ulItem = /^[-*]\s+(.*)$/.exec(line)
    if (ulItem) {
      if (listType !== 'ul') flushList()
      listType = 'ul'
      listBuffer.push(`<li class="text-slate-700 leading-relaxed">${inline(ulItem[1])}</li>`)
      continue
    }

    const olItem = /^\d+\.\s+(.*)$/.exec(line)
    if (olItem) {
      if (listType !== 'ol') flushList()
      listType = 'ol'
      listBuffer.push(`<li class="text-slate-700 leading-relaxed">${inline(olItem[1])}</li>`)
      continue
    }

    flushList()
    html.push(`<p class="text-slate-700 leading-relaxed my-4">${inline(line)}</p>`)
  }

  flushList()
  return html.join('\n')
}
