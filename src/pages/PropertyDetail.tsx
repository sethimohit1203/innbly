import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChevronRight,
  Heart,
  Share2,
  Images,
  MapPin,
  BadgeCheck,
  Sofa,
  Wifi,
  Wind,
  Bath,
  Zap,
  Sparkles,
  UtensilsCrossed,
  ShieldCheck,
  Car,
  Dumbbell,
  Star,
  MessageCircle,
  Users,
  Clock,
  TrainFront,
  Building2,
  Landmark as LandmarkIcon,
  ShoppingBag,
  GraduationCap,
  Waves,
  Plane,
  MapPinned,
  ThumbsUp,
  PlayCircle,
  Rotate3d,
} from 'lucide-react'
import { getPropertyById, properties } from '../data/properties'
import { MapPlaceholder } from '../components/MapPlaceholder'
import { Footer } from '../components/Footer'
import { PropertyCard } from '../components/PropertyCard'
import { DateRangePicker } from '../components/DateRangePicker'
import { GuestCounter } from '../components/GuestCounter'
import { PriceCalendar } from '../components/PriceCalendar'
import { useSavedProperties } from '../context/SavedPropertiesContext'
import { useRecentlyViewed } from '../context/RecentlyViewedContext'
import { useToast } from '../context/ToastContext'
import { usePageMeta } from '../hooks/usePageMeta'
import type { LandmarkType, TenantPreference } from '../types'

const landmarkIcons: Record<LandmarkType, JSX.Element> = {
  Metro: <TrainFront className="h-4 w-4" />,
  Gym: <Dumbbell className="h-4 w-4" />,
  Restaurant: <UtensilsCrossed className="h-4 w-4" />,
  Hospital: <Building2 className="h-4 w-4" />,
  Market: <ShoppingBag className="h-4 w-4" />,
  College: <GraduationCap className="h-4 w-4" />,
  Mall: <ShoppingBag className="h-4 w-4" />,
  Beach: <Waves className="h-4 w-4" />,
  Temple: <LandmarkIcon className="h-4 w-4" />,
  Airport: <Plane className="h-4 w-4" />,
  Office: <Building2 className="h-4 w-4" />,
  Attraction: <MapPinned className="h-4 w-4" />,
}

const AVAILABILITY_LABEL: Record<string, string> = {
  Available: 'Available',
  Limited: 'Limited Availability',
  Booked: 'Fully Booked',
}

const amenityIcons: Record<string, JSX.Element> = {
  'Wi-Fi': <Wifi className="h-5 w-5" />,
  AC: <Wind className="h-5 w-5" />,
  'Attached Bath': <Bath className="h-5 w-5" />,
  'Power Backup': <Zap className="h-5 w-5" />,
  Housekeeping: <Sparkles className="h-5 w-5" />,
  Meals: <UtensilsCrossed className="h-5 w-5" />,
  CCTV: <ShieldCheck className="h-5 w-5" />,
  Parking: <Car className="h-5 w-5" />,
  Gym: <Dumbbell className="h-5 w-5" />,
  Laundry: <Sparkles className="h-5 w-5" />,
}

const amenityGroups: Record<string, string[]> = {
  Comfort: ['AC', 'Attached Bath', 'Laundry'],
  Utilities: ['Wi-Fi', 'Power Backup', 'CCTV', 'Parking'],
  Services: ['Housekeeping', 'Meals', 'Gym'],
}

export function PropertyDetailPage() {
  const { id } = useParams()
  const property = id ? getPropertyById(id) : undefined
  const { isSaved, toggleSaved } = useSavedProperties()
  const { addRecentlyViewed } = useRecentlyViewed()
  const { showToast } = useToast()
  const [showAllPhotos, setShowAllPhotos] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
  const [tenantType, setTenantType] = useState<TenantPreference>('Anyone')
  const [checkIn, setCheckIn] = useState<string | null>(null)
  const [checkOut, setCheckOut] = useState<string | null>(null)
  const [guests, setGuests] = useState(1)
  const saved = property ? isSaved(property.id) : false

  useEffect(() => {
    if (property) addRecentlyViewed(property.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property?.id])

  usePageMeta(
    property ? `${property.title} for Rent in ${property.neighborhood}, ${property.city}` : 'Property not found',
    property
      ? `${property.title} — ₹${property.price.toLocaleString('en-IN')}/night stay for up to ${property.maxGuests} guests in ${property.neighborhood}, ${property.city}. ${property.verified ? 'Verified property.' : ''} Schedule a free visit today.`
      : undefined,
  )

  if (!property) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-slate-800">Property not found</h2>
        <Link to="/search" className="mt-4 inline-block text-primary-600 hover:underline">
          Back to search
        </Link>
      </div>
    )
  }

  const whatsappUrl = `https://wa.me/${property.ownerPhone.replace('+', '')}?text=${encodeURIComponent(
    `Hi ${property.ownerName}, I'm interested in "${property.title}" listed on innbly. Could you share more details?`,
  )}`

  const nearby = properties.filter((p) => p.id !== property.id && p.city === property.city)
  const recommendations = (nearby.length >= 3 ? nearby : properties.filter((p) => p.id !== property.id)).slice(0, 4)

  return (
    <>
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6">
      {/* Breadcrumbs + utility buttons */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center gap-1.5 text-sm text-slate-500">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/search" className="hover:text-primary-600">{property.city}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-slate-700">{property.neighborhood}</span>
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSaved(property.id)}
            className="flex items-center gap-1.5 rounded-full border border-slate-300 px-3.5 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-400"
          >
            <Heart className={`h-4 w-4 ${saved ? 'fill-rose-500 text-rose-500' : ''}`} />
            {saved ? 'Saved' : 'Save'}
          </button>
          <button className="flex items-center gap-1.5 rounded-full border border-slate-300 px-3.5 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-400">
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>
      </div>

      {/* Hero media grid */}
      <div className="relative mb-8 grid h-[420px] grid-cols-5 grid-rows-2 gap-2 overflow-hidden rounded-2xl">
        <img
          src={property.images[0]}
          alt={property.title}
          className="col-span-3 row-span-2 h-full w-full object-cover transition hover:brightness-95"
        />
        {property.images.slice(1, 5).map((img, i) => (
          <img
            key={i}
            src={img}
            alt=""
            className="col-span-1 h-full w-full object-cover transition hover:brightness-95"
          />
        ))}
        <button
          onClick={() => setShowAllPhotos(true)}
          className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-slate-800 shadow-card-hover transition hover:bg-white"
        >
          <Images className="h-4 w-4" /> View all photos
        </button>
      </div>

      {/* Media: video tour / 360 walkthrough — honest placeholder, no fabricated media */}
      <div className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-4">
        <span className="text-sm font-semibold text-slate-500">Want more than photos?</span>
        <button
          onClick={() => showToast('Video tour coming soon for this property — check back later.')}
          className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-600 transition hover:border-primary-400 hover:text-primary-700"
        >
          <PlayCircle className="h-4 w-4" /> Video Tour — Coming Soon
        </button>
        <button
          onClick={() => showToast('360° virtual walkthrough coming soon for this property.')}
          className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-600 transition hover:border-primary-400 hover:text-primary-700"
        >
          <Rotate3d className="h-4 w-4" /> 360° Tour — Coming Soon
        </button>
      </div>

      {showAllPhotos && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 animate-fade-in"
          onClick={() => setShowAllPhotos(false)}
        >
          <div className="grid max-h-full max-w-4xl grid-cols-2 gap-3 overflow-y-auto">
            {property.images.map((img, i) => (
              <img key={i} src={img} alt="" className="w-full rounded-xl object-cover" />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-10 lg:flex-row">
        {/* LEFT COLUMN 65% */}
        <div className="lg:w-[65%]">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{property.title}</h1>
          <div className="mt-2 flex items-center gap-1.5 text-slate-500">
            <MapPin className="h-4 w-4" />
            {property.address}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {property.verified && (
              <span className="flex items-center gap-1 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified Property
              </span>
            )}
            {property.furnished && (
              <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                <Sofa className="h-3.5 w-3.5" /> Fully Furnished
              </span>
            )}
            <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <Users className="h-3.5 w-3.5" /> Up to {property.maxGuests} guests
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              For {property.tenantPreference}
            </span>
            {property.instantBook && (
              <span className="flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                <Zap className="h-3.5 w-3.5" /> Instant Book
              </span>
            )}
            {property.freeCancellation && (
              <span className="flex items-center gap-1 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
                <ShieldCheck className="h-3.5 w-3.5" /> Free Cancellation
              </span>
            )}
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                property.availabilityStatus === 'Available'
                  ? 'bg-accent-50 text-accent-700'
                  : property.availabilityStatus === 'Limited'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-slate-200 text-slate-600'
              }`}
            >
              {AVAILABILITY_LABEL[property.availabilityStatus]}
            </span>
          </div>

          {/* Description */}
          <div className="mt-6 border-t border-slate-200 pt-6">
            <h2 className="mb-2 text-lg font-bold text-slate-900">About this property</h2>
            <p className={`text-sm leading-relaxed text-slate-600 ${descExpanded ? '' : 'line-clamp-4'}`}>
              {property.description}
            </p>
            <button
              onClick={() => setDescExpanded((v) => !v)}
              className="mt-1 text-sm font-semibold text-primary-600 hover:underline"
            >
              {descExpanded ? 'Show less' : 'Read More'}
            </button>
          </div>

          {/* Amenities */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Amenities</h2>
            <div className="space-y-5">
              {Object.entries(amenityGroups).map(([group, items]) => {
                const present = items.filter((a) => property.amenities.includes(a))
                if (present.length === 0) return null
                return (
                  <div key={group}>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">{group}</h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {present.map((a) => (
                        <div
                          key={a}
                          className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 transition hover:border-primary-300 hover:bg-primary-50/50"
                        >
                          <span className="text-primary-600">{amenityIcons[a]}</span>
                          {a}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Location */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Location & Proximity</h2>
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
                Walk Score: {Math.max(10, 100 - Math.round(
                  (property.landmarks.reduce((sum, l) => sum + l.walkMin, 0) / property.landmarks.length) * 3,
                ))}
              </span>
            </div>
            <MapPlaceholder className="h-64 w-full" label={property.neighborhood} />
            <div className="mt-4 space-y-1">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Nearby Landmarks</h3>
              {property.landmarks.map((l) => (
                <div
                  key={l.name}
                  className="flex items-center justify-between border-l-2 border-primary-200 py-2 pl-4 text-sm transition hover:border-primary-500"
                >
                  <span className="flex items-center gap-2 font-medium text-slate-700">
                    <span className="text-primary-600">{landmarkIcons[l.type]}</span> {l.name}
                  </span>
                  <span className="text-slate-500">
                    {l.distanceM}m ({l.walkMin} min walk)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Host Profile */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Meet your host</h2>
            <Link
              to={`/host/${encodeURIComponent(property.ownerName)}`}
              className="flex items-start gap-4 rounded-2xl border border-slate-200 p-5 transition hover:border-primary-300 hover:bg-primary-50/30"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700">
                {property.ownerName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-900">{property.ownerName}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-accent-700">
                  <Clock className="h-3.5 w-3.5" /> {property.hostResponseTime}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {property.hostResponseRate}% response rate · Hosting since {property.hostJoinedYear} · {property.hostTotalListings} listing{property.hostTotalListings > 1 ? 's' : ''}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{property.hostBio}</p>
                <span className="mt-2 inline-block text-xs font-bold text-primary-600 hover:underline">View host profile →</span>
              </div>
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN 35% - sticky booking card */}
        <div className="lg:w-[35%]">
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-card-hover">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-extrabold text-slate-900">
                  ₹{property.price.toLocaleString('en-IN')}
                </span>
                <span className="text-slate-500"> /night</span>
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {property.rating}
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Security deposit: ₹{property.deposit.toLocaleString('en-IN')} (refundable)
            </p>

            <fieldset className="mt-5">
              <legend className="mb-1.5 block text-xs font-semibold text-slate-600">Preferred Tenant Type</legend>
              <div className="grid grid-cols-3 gap-2">
                {(['Boys', 'Girls', 'Anyone'] as TenantPreference[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTenantType(t)}
                    className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                      tenantType === t
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-slate-300 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-4">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Check-in — Check-out</span>
              <DateRangePicker checkIn={checkIn} checkOut={checkOut} onChange={(a, b) => { setCheckIn(a); setCheckOut(b) }} />
            </div>

            <div className="mt-4">
              <GuestCounter value={guests} onChange={setGuests} max={property.maxGuests} />
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <PriceCalendar propertyId={property.id} />
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-3.5 text-sm font-bold text-white shadow-card transition hover:bg-accent-600 hover:shadow-card-hover"
            >
              <MessageCircle className="h-4 w-4" /> Chat with Host
            </a>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12 border-t border-slate-200 pt-8">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Ratings & Reviews</h2>
        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="lg:w-2/5">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-slate-900">{property.rating}</span>
              <span className="text-lg text-slate-500">out of 5</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{property.reviewCount} verified reviews</p>
            <div className="mt-6 space-y-3">
              {property.ratingBreakdown.map((r) => (
                <div key={r.label}>
                  <div className="mb-1 flex justify-between text-sm text-slate-600">
                    <span>{r.label}</span>
                    <span className="font-semibold">{r.score}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-accent-500 transition-all"
                      style={{ width: `${(r.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4">
            {property.reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-slate-200 p-4 transition hover:shadow-card"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img src={r.avatar} alt={r.name} className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        {r.name}
                        {r.verifiedStay && (
                          <span className="flex items-center gap-0.5 rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-semibold text-accent-700">
                            <BadgeCheck className="h-3 w-3" /> Verified Stay
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{r.occupation} · {r.date}</span>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{r.text}</p>
                <div className="mt-3 flex items-center gap-4 border-t border-slate-50 pt-3 text-xs font-semibold text-slate-500">
                  {r.wouldRecommend && (
                    <span className="flex items-center gap-1 text-accent-700">
                      <ThumbsUp className="h-3.5 w-3.5" /> Would recommend
                    </span>
                  )}
                  <span>{r.helpfulVotes} found this helpful</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* More Places Nearby */}
      <div className="mt-12 border-t border-slate-200 pt-8">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">More Places Nearby</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {recommendations.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </div>
    </div>
    <Footer />
    </>
  )
}
