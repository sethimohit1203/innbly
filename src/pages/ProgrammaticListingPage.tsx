import { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { Link } from '~links'
import { ChevronRight } from 'lucide-react'
import { PropertyCard } from '../components/PropertyCard'
import { Footer } from '../components/Footer'
import { Reveal } from '../components/Reveal'
import { useProperties } from '../context/PropertiesContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { useJsonLd } from '../hooks/useJsonLd'
import { breadcrumbSchema, webPageSchema } from '../lib/seo'
import { getProgrammaticPage } from '../data/programmaticPages'

export function ProgrammaticListingPage({ path }: { path: string }) {
  const config = getProgrammaticPage(path)
  const { properties } = useProperties()

  const matches = useMemo(() => (config ? properties.filter(config.predicate) : []), [config, properties])

  usePageMeta(
    config ? config.h1 : 'Page not found',
    config ? `${config.intro} Browse verified listings with transparent pricing on Innbly.` : undefined,
  )

  useJsonLd(
    'programmatic-schema',
    config
      ? [
          webPageSchema({ name: config.h1, description: config.intro, path: config.path }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: config.destinationName, path: `/${config.destinationSlug}` },
            { name: config.label, path: config.path },
          ]),
        ]
      : null,
  )

  if (!config) return <Navigate to="/search" replace />

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-500">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to={`/${config.destinationSlug}`} className="hover:text-primary-600">{config.destinationName}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-slate-700">{config.label}</span>
        </nav>

        <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">{config.h1}</h1>
        <p className="mb-10 max-w-2xl text-slate-600">{config.intro}</p>

        {matches.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
            No exact matches right now —{' '}
            <Link to={`/search?city=${encodeURIComponent(config.city)}`} className="font-semibold text-primary-600 hover:underline">
              see all stays in {config.destinationName}
            </Link>{' '}
            instead.
          </p>
        )}

        <Reveal className="mt-14 border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-xl font-bold text-slate-900">More Ways to Explore {config.destinationName}</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/${config.destinationSlug}`}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary-400 hover:text-primary-700"
            >
              {config.destinationName} Travel Guide
            </Link>
            <Link
              to={`/search?city=${encodeURIComponent(config.city)}`}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary-400 hover:text-primary-700"
            >
              All Stays in {config.destinationName}
            </Link>
          </div>
        </Reveal>
      </div>
      <Footer />
    </>
  )
}
