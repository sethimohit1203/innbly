import { useEffect, useMemo, useState } from 'react'
import { Link } from '~links'
import { CalendarDays, Tag as TagIcon } from 'lucide-react'
import { Footer } from '../components/Footer'
import { Reveal } from '../components/Reveal'
import { usePageMeta } from '../hooks/usePageMeta'
import { useJsonLd } from '../hooks/useJsonLd'
import { breadcrumbSchema, webPageSchema, SITE_URL } from '../lib/seo'
import { fetchBlogPosts, type BlogPost } from '../lib/blog'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTag, setActiveTag] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchBlogPosts().then((data) => {
      if (!cancelled) {
        setPosts(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const tags = useMemo(() => {
    const set = new Set<string>()
    posts.forEach((p) => p.tags.forEach((t) => set.add(t)))
    return Array.from(set).slice(0, 12)
  }, [posts])

  const visible = activeTag ? posts.filter((p) => p.tags.includes(activeTag)) : posts

  usePageMeta(
    'Travel & Hosting Blog',
    'Destination guides, hosting tips, and travel inspiration from Innbly — verified villas, holiday homes and vacation rentals across India.',
  )

  useJsonLd('blog-list-schema', [
    webPageSchema({
      name: 'Innbly Blog',
      description: 'Destination guides, hosting tips, and travel inspiration for verified vacation rentals across India.',
      path: '/blog',
    }),
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog' },
    ]),
    posts.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'Blog',
          '@id': `${SITE_URL}/blog#blog`,
          name: 'Innbly Blog',
          url: `${SITE_URL}/blog`,
          blogPost: posts.slice(0, 20).map((p) => ({
            '@type': 'BlogPosting',
            headline: p.title,
            url: `${SITE_URL}/blog/${p.slug}`,
            datePublished: p.publishedAt,
          })),
        }
      : null,
  ])

  return (
    <>
      <div className="border-b border-slate-100 bg-gradient-to-b from-primary-50/60 to-white py-16 dark:border-stone-800 dark:from-stone-900 dark:to-stone-900">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            The Innbly Blog
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-slate-600 dark:text-slate-300">
            Destination guides, hosting tips, and travel inspiration for verified vacation rentals across India.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {tags.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                activeTag === null
                  ? 'bg-primary-600 text-white'
                  : 'border border-slate-200 text-slate-600 hover:border-primary-400 hover:text-primary-700 dark:border-stone-700 dark:text-slate-300'
              }`}
            >
              All
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  activeTag === tag
                    ? 'bg-primary-600 text-white'
                    : 'border border-slate-200 text-slate-600 hover:border-primary-400 hover:text-primary-700 dark:border-stone-700 dark:text-slate-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-100 dark:bg-stone-800" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center dark:border-stone-800 dark:bg-stone-900">
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">No posts yet</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              New destination guides and hosting tips are published regularly — check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((post) => (
              <Reveal key={post.id}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition hover:-translate-y-1 hover:shadow-lg dark:border-stone-800 dark:bg-stone-900"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-stone-800">
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-300">
                        <TagIcon className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(post.publishedAt)}
                    </div>
                    <h2 className="line-clamp-2 text-lg font-bold text-slate-900 group-hover:text-primary-700 dark:text-white">
                      {post.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                      {post.description}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
