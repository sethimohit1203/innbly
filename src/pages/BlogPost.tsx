import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Link } from '~links'
import { CalendarDays, ChevronRight, User } from 'lucide-react'
import { Footer } from '../components/Footer'
import { usePageMeta } from '../hooks/usePageMeta'
import { useJsonLd } from '../hooks/useJsonLd'
import { breadcrumbSchema, SITE_URL, SITE_NAME } from '../lib/seo'
import { fetchBlogPostBySlug, type BlogPost } from '../lib/blog'
import { markdownToHtml } from '../lib/markdown'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setPost(undefined)
    fetchBlogPostBySlug(slug).then((data) => {
      if (!cancelled) setPost(data)
    })
    return () => {
      cancelled = true
    }
  }, [slug])

  usePageMeta(
    post ? post.title : 'Blog',
    post ? post.description : undefined,
    post?.coverImage,
  )

  useJsonLd(
    'blog-post-schema',
    post
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.description,
            image: post.coverImage || undefined,
            author: { '@type': 'Organization', name: post.author || SITE_NAME },
            publisher: { '@id': `${SITE_URL}/#organization` },
            datePublished: post.publishedAt,
            dateModified: post.publishedAt,
            mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
          },
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]
      : null,
  )

  if (post === null) return <Navigate to="/blog" replace />

  if (post === undefined) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <div className="h-8 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="mt-6 h-64 w-full animate-pulse rounded-2xl bg-slate-100" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 w-full animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/blog" className="hover:text-primary-600">Blog</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate font-medium text-slate-700 dark:text-slate-300">{post.title}</span>
        </nav>

        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          {post.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" /> {post.author}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" /> {formatDate(post.publishedAt)}
          </span>
        </div>

        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover shadow-card"
          />
        )}

        <div
          className="mt-8 [&_a]:text-primary-600 [&_a]:underline [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900 dark:[&_h2]:text-white [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-slate-900 dark:[&_h3]:text-white [&_p]:my-4 [&_p]:leading-relaxed [&_p]:text-slate-700 dark:[&_p]:text-slate-300 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1.5 [&_li]:text-slate-700 dark:[&_li]:text-slate-300 [&_img]:my-6 [&_img]:rounded-xl [&_table]:my-6 [&_table]:w-full"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
        />

        {post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2 border-t border-slate-100 pt-6 dark:border-stone-800">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-stone-800 dark:text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-primary-100 bg-primary-50 p-6 text-center dark:border-primary-900/40 dark:bg-primary-950/20">
          <p className="text-lg font-bold text-slate-900 dark:text-white">Ready to plan your next stay?</p>
          <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
            Explore verified villas, cabins and holiday homes across India.
          </p>
          <Link
            to="/search"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-bold text-white shadow-sm transition hover:bg-primary-700"
          >
            Browse stays
          </Link>
        </div>
      </article>
      <Footer />
    </>
  )
}
