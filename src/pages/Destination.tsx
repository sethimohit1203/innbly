import { useMemo } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Calendar, MapPin, UtensilsCrossed, Car, ChevronRight } from 'lucide-react'
import { PropertyCard } from '../components/PropertyCard'
import { Footer } from '../components/Footer'
import { FAQAccordion, type FAQItem } from '../components/FAQAccordion'
import { Reveal } from '../components/Reveal'
import { useProperties } from '../context/PropertiesContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { useJsonLd } from '../hooks/useJsonLd'
import { breadcrumbSchema, faqSchema, webPageSchema } from '../lib/seo'
import { getDestinationBySlug, DESTINATIONS } from '../data/destinations'

export function DestinationPage({ slug }: { slug: string }) {
  const destination = getDestinationBySlug(slug)
  const { properties } = useProperties()

  const featured = useMemo(
    () => (destination ? properties.filter((p) => p.city.toLowerCase() === destination.name.toLowerCase()) : []),
    [destination, properties],
  )

  const otherDestinations = DESTINATIONS.filter((d) => d.slug !== slug).slice(0, 6)

  const faqs: FAQItem[] = destination
    ? [
        { q: `What is the best time to visit ${destination.name}?`, a: destination.bestTimeToVisit },
        {
          q: `What kind of properties does Innbly offer in ${destination.name}?`,
          a: `Innbly lists verified ${destination.propertyTypes.join(' and ').toLowerCase()} in and around ${destination.name}, each physically audited and photographed before listing.`,
        },
        {
          q: `How do I get to ${destination.name}?`,
          a: destination.transportation,
        },
        {
          q: `Is ${destination.name} good for a weekend trip?`,
          a: `Yes — most Innbly stays in ${destination.name} allow bookings of just 1–2 nights, making it a solid weekend-getaway option depending on how far it is from your city.`,
        },
      ]
    : []

  usePageMeta(
    destination ? `${destination.name} Villas, Cottages & Vacation Rentals` : 'Destination not found',
    destination
      ? `Book verified villas, cottages, and holiday homes in ${destination.name}, ${destination.state}. ${destination.tagline}. Compare prices, amenities, and host reviews on Innbly.`
      : undefined,
  )

  useJsonLd(
    'destination-schema',
    destination
      ? [
          webPageSchema({
            name: `${destination.name} Villas, Cottages & Vacation Rentals`,
            description: destination.tagline,
            path: `/${destination.slug}`,
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: destination.name, path: `/${destination.slug}` },
          ]),
          faqSchema(faqs),
        ]
      : null,
  )

  if (!destination) return <Navigate to="/search" replace />

  return (
    <>
      <div
        className="relative bg-slate-900 bg-cover bg-center py-24 text-white"
        style={{ backgroundImage: `linear-gradient(to bottom, rgba(2,6,23,0.7), rgba(2,6,23,0.85)), url(${destination.heroImage})` }}
      >
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <nav className="mb-6 flex items-center justify-center gap-1.5 text-sm text-slate-300">
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-white">{destination.name}</span>
          </nav>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Villas & Vacation Rentals in {destination.name}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-slate-200">{destination.tagline}</p>
          <Link
            to={`/search?city=${encodeURIComponent(destination.name)}`}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 font-bold text-white shadow-lg transition hover:bg-primary-700"
          >
            View all stays in {destination.name}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <Reveal>
          <h2 className="mb-4 text-2xl font-bold text-slate-900">{destination.name} Travel Guide</h2>
          <p className="leading-relaxed text-slate-600">{destination.guide}</p>
        </Reveal>

        <Reveal className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
            <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-slate-900">
              <Calendar className="h-5 w-5 text-primary-600" /> Best Time to Visit
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">{destination.bestTimeToVisit}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
            <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-slate-900">
              <Car className="h-5 w-5 text-primary-600" /> Getting There
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">{destination.transportation}</p>
          </div>
        </Reveal>

        <Reveal className="mt-10">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
            <MapPin className="h-5 w-5 text-primary-600" /> Top Attractions in {destination.name}
          </h3>
          <div className="flex flex-wrap gap-2">
            {destination.attractions.map((a) => (
              <span key={a} className="rounded-full bg-slate-100 px-3.5 py-1.5 text-sm font-medium text-slate-700">
                {a}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-10">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
            <UtensilsCrossed className="h-5 w-5 text-primary-600" /> What to Eat in {destination.name}
          </h3>
          <div className="flex flex-wrap gap-2">
            {destination.food.map((f) => (
              <span key={f} className="rounded-full bg-accent-50 px-3.5 py-1.5 text-sm font-medium text-accent-700">
                {f}
              </span>
            ))}
          </div>
        </Reveal>

        {featured.length > 0 && (
          <Reveal className="mt-14">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">Featured Properties in {destination.name}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </Reveal>
        )}

        <Reveal className="mt-14 border-t border-slate-200 pt-8">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Frequently Asked Questions About {destination.name}</h2>
          <FAQAccordion items={faqs} />
        </Reveal>

        <Reveal className="mt-14 border-t border-slate-200 pt-8">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">More Popular Destinations</h2>
          <div className="flex flex-wrap gap-2">
            {otherDestinations.map((d) => (
              <Link
                key={d.slug}
                to={`/${d.slug}`}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary-400 hover:text-primary-700"
              >
                {d.name}
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
      <Footer />
    </>
  )
}
