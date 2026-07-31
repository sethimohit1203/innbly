import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, type FieldPath } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ImagePlus, UploadCloud, FileText, X, Loader2, AlertCircle, Copy, KeyRound, Home, Minus, Plus, Sparkles, PartyPopper } from 'lucide-react'
import { Footer } from '../components/Footer'
import { LocationPicker, type LocationValue } from '../components/host/LocationPicker'
import { usePageMeta } from '../hooks/usePageMeta'
import { hostFormSchema, submitHostListing, type HostFormValues } from '../lib/hostSubmission'
import { addMyListingId } from '../lib/myListings'
import { PROPERTY_TYPES, STRUCTURE_TYPES, PRIVACY_TYPES } from '../types'

const ALL_AMENITIES = [
  'Wi-Fi',
  'AC',
  'Attached Bath',
  'Power Backup',
  'Housekeeping',
  'Meals',
  'CCTV',
  'Parking',
  'Gym',
  'Laundry',
]

const DESCRIPTION_HIGHLIGHTS: Record<string, string> = {
  Peaceful: 'Take a break and unwind at this peaceful oasis.',
  Unique: 'Experience something truly unique during your stay.',
  'Family-friendly': 'A wonderful, family-friendly space for everyone.',
  Stylish: 'A stylish space designed with care.',
  Central: 'Centrally located, close to everything you need.',
  Spacious: 'Enjoy a spacious layout with plenty of room.',
}

const DISCOUNTS: { key: keyof Pick<HostFormValues, 'discountNewListing' | 'discountLastMinute' | 'discountWeekly' | 'discountMonthly'>; pct: string; label: string; hint: string }[] = [
  { key: 'discountNewListing', pct: '20%', label: 'New listing promotion', hint: 'Available until your listing has 3 reviews or gets booked 10 times' },
  { key: 'discountLastMinute', pct: '1%', label: 'Last-minute discount', hint: 'For stays booked 14 days or less before arrival' },
  { key: 'discountWeekly', pct: '10%', label: 'Weekly discount', hint: 'For stays of 7 nights or more' },
  { key: 'discountMonthly', pct: '15%', label: 'Monthly discount', hint: 'For stays of 28 nights or more' },
]

const SAFETY_ITEMS: { key: keyof Pick<HostFormValues, 'safetyCamera' | 'safetyNoiseMonitor' | 'safetyWeapons'>; label: string }[] = [
  { key: 'safetyCamera', label: 'Exterior security camera present' },
  { key: 'safetyNoiseMonitor', label: 'Noise decibel monitor present' },
  { key: 'safetyWeapons', label: 'Weapon(s) on the property' },
]

const STEPS: { slug: string; label: string; fields: FieldPath<HostFormValues>[] }[] = [
  { slug: 'owner-info', label: 'Owner Info', fields: ['ownerName', 'ownerEmail', 'ownerPhone'] },
  { slug: 'structure', label: 'Structure', fields: ['structureType'] },
  { slug: 'privacy-type', label: 'Privacy Type', fields: ['privacyType'] },
  { slug: 'location', label: 'Location', fields: ['city', 'neighborhood', 'address'] },
  { slug: 'floor-plan', label: 'Floor Plan', fields: ['maxGuests', 'bedrooms', 'beds', 'bathrooms'] },
  { slug: 'stand-out', label: 'Stand Out', fields: [] },
  { slug: 'title-type', label: 'Title', fields: ['propertyTitle', 'propertyType'] },
  { slug: 'amenities', label: 'Amenities', fields: ['amenities'] },
  { slug: 'photos', label: 'Photos', fields: ['photos'] },
  { slug: 'documents', label: 'Documents', fields: ['documents'] },
  { slug: 'description', label: 'Description', fields: ['description'] },
  { slug: 'finish-up', label: 'Finish Up', fields: [] },
  { slug: 'booking-settings', label: 'Booking Settings', fields: ['instantBook'] },
  { slug: 'pricing', label: 'Pricing', fields: ['pricePerNight', 'securityDeposit'] },
  { slug: 'discounts', label: 'Discounts', fields: [] },
  { slug: 'safety', label: 'Safety', fields: [] },
  { slug: 'agreement', label: 'Agreement', fields: ['agreedToTerms'] },
]

function NumberStepperRow({
  label,
  value,
  onChange,
  min = 0,
  max = 30,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-4 last:border-0">
      <span className="font-medium text-slate-800">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-5 text-center text-sm font-semibold">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

function FileDropzone({
  label,
  hint,
  files,
  onChange,
  max,
  accept,
  icon: Icon,
}: {
  label: string
  hint: string
  files: File[]
  onChange: (files: File[]) => void
  max: number
  accept?: string
  icon: typeof UploadCloud
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-slate-700">{label}</p>
      <label className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-10 text-slate-400 transition hover:border-primary-400 hover:text-primary-500">
        <Icon className="h-8 w-8" />
        <span className="text-sm font-medium">{hint}</span>
        <input
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? [])
            onChange([...files, ...picked].slice(0, max))
            e.target.value = ''
          }}
        />
      </label>
      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {files.map((f, i) => (
            <div key={`${f.name}-${i}`} className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-slate-400">
              {f.type.startsWith('image/') ? (
                <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
              ) : (
                <FileText className="h-6 w-6" />
              )}
              <button
                type="button"
                onClick={() => onChange(files.filter((_, idx) => idx !== i))}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/70 text-white opacity-0 transition group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** A full-bleed, no-form-fields divider step — matches Airbnb's "Step N" interstitials. */
function Interstitial({ eyebrow, title, description, icon: Icon }: { eyebrow: string; title: string; description: string; icon: typeof Sparkles }) {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        <Icon className="h-7 w-7" />
      </div>
      <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-slate-400">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-extrabold text-slate-900">{title}</h2>
      <p className="mt-3 max-w-sm text-sm text-slate-500">{description}</p>
    </div>
  )
}

export function ListPropertyPage() {
  usePageMeta('List Your Property', 'List your property on innbly in a few simple steps and start receiving guest inquiries directly.')
  const navigate = useNavigate()
  const { step: stepSlug } = useParams()
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [accessCode, setAccessCode] = useState<string | null>(null)
  const [codeCopied, setCodeCopied] = useState(false)
  const [location, setLocation] = useState<LocationValue | null>(null)

  const stepIndex = Math.max(0, STEPS.findIndex((s) => s.slug === stepSlug))
  const step = stepSlug ? stepIndex : 0

  // A bare /dashboard/list-property (or an unknown slug) settles on step 0's
  // real URL rather than silently rendering it under the wrong address —
  // keeps every step addressable/bookmarkable/back-button-able.
  useEffect(() => {
    if (!stepSlug || STEPS.findIndex((s) => s.slug === stepSlug) === -1) {
      navigate(`/dashboard/list-property/${STEPS[0].slug}`, { replace: true })
    }
  }, [stepSlug, navigate])

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HostFormValues>({
    resolver: zodResolver(hostFormSchema),
    defaultValues: {
      maxGuests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      pricePerNight: 1800,
      securityDeposit: 10000,
      instantBook: false,
      discountNewListing: true,
      discountLastMinute: true,
      discountWeekly: true,
      discountMonthly: true,
      safetyCamera: false,
      safetyNoiseMonitor: false,
      safetyWeapons: false,
      amenities: [],
      photos: [],
      documents: [],
      agreedToTerms: false,
    },
  })

  const values = watch()

  const toggleAmenity = (a: string) => {
    const current = values.amenities ?? []
    setValue('amenities', current.includes(a) ? current.filter((x) => x !== a) : [...current, a], { shouldValidate: true })
  }

  const goToStep = (index: number) => navigate(`/dashboard/list-property/${STEPS[index].slug}`)

  const goNext = async () => {
    const valid = await trigger(STEPS[step].fields)
    if (valid) goToStep(Math.min(STEPS.length - 1, step + 1))
  }

  const handleLocationChange = (v: LocationValue) => {
    setLocation(v)
    setValue('city', v.city, { shouldValidate: true })
    setValue('neighborhood', v.neighborhood, { shouldValidate: true })
    setValue('address', v.address, { shouldValidate: true })
    setValue('latitude', v.lat, { shouldValidate: true })
    setValue('longitude', v.lng, { shouldValidate: true })
  }

  const applyHighlight = (snippet: string) => {
    const current = (values.description ?? '').trim()
    setValue('description', current ? `${current} ${snippet}` : snippet, { shouldValidate: true })
  }

  const onSubmit = async (data: HostFormValues) => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const { id, accessCode: code } = await submitHostListing(data)
      addMyListingId(id)
      setAccessCode(code)
      setDone(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-50">
            <Check className="h-8 w-8 text-accent-600" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-900">Listing submitted!</h1>
          <p className="mt-2 text-slate-500">
            "{values.propertyTitle || 'Your property'}" has been sent for review. We'll be in touch once it's approved and live.
          </p>
        </div>

        {/* Listing-card preview, matching the Airbnb "Your listing" screen */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="flex items-center gap-4 border-b border-slate-100 p-4">
            {values.photos?.[0] ? (
              <img src={URL.createObjectURL(values.photos[0])} alt="" className="h-16 w-20 rounded-xl object-cover" />
            ) : (
              <div className="flex h-16 w-20 items-center justify-center rounded-xl bg-slate-100 text-slate-300">
                <Home className="h-6 w-6" />
              </div>
            )}
            <div>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">Action required</span>
              <p className="mt-1 font-bold text-slate-900">{values.propertyTitle || 'Untitled property'}</p>
              <p className="text-sm text-slate-500">{values.neighborhood}, {values.city}</p>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm font-bold text-slate-800">Confirm a few key details</p>
            <p className="mt-1 text-xs text-slate-500">Required to publish — our team reviews every submission before it goes live, usually within 24–48 hours.</p>
          </div>
        </div>

        {accessCode && (
          <div className="mt-6 w-full rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left">
            <div className="flex items-center gap-2 text-amber-800">
              <KeyRound className="h-4 w-4" />
              <p className="text-sm font-bold">Your pricing access code</p>
            </div>
            <p className="mt-1 text-xs text-amber-700">
              Save this now — you'll need it in the Host Dashboard to edit your price, weekend rates, fees and
              calendar later, and it can't be recovered if you lose it. We've also emailed it to you.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <code className="flex-1 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-center text-lg font-bold tracking-widest text-slate-800">
                {accessCode}
              </code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(accessCode).then(() => {
                    setCodeCopied(true)
                    setTimeout(() => setCodeCopied(false), 2000)
                  })
                }}
                className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
              >
                <Copy className="h-3.5 w-3.5" /> {codeCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-extrabold text-slate-900">List Your Property</h1>

        {/* Stepper */}
        <div className="mt-6 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex shrink-0 items-center gap-1">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                  i <= step ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`whitespace-nowrap px-1.5 text-xs font-medium ${i <= step ? 'text-slate-800' : 'text-slate-400'}`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && <div className="h-0.5 w-4 shrink-0 bg-slate-200" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="ownerName" className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
                  <input
                    id="ownerName"
                    {...register('ownerName')}
                    placeholder="e.g. Rahul Mehta"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                  {errors.ownerName && <p className="mt-1 text-xs font-medium text-rose-600">{errors.ownerName.message}</p>}
                </div>
                <div>
                  <label htmlFor="ownerEmail" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                  <input
                    id="ownerEmail"
                    type="email"
                    {...register('ownerEmail')}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                  {errors.ownerEmail && <p className="mt-1 text-xs font-medium text-rose-600">{errors.ownerEmail.message}</p>}
                </div>
                <div>
                  <label htmlFor="ownerPhone" className="mb-1 block text-sm font-medium text-slate-700">Phone Number</label>
                  <input
                    id="ownerPhone"
                    type="tel"
                    {...register('ownerPhone')}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                  {errors.ownerPhone && <p className="mt-1 text-xs font-medium text-rose-600">{errors.ownerPhone.message}</p>}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="mb-1 text-xl font-bold text-slate-900">Which of these best describes your place?</h2>
                <p className="mb-4 text-sm text-slate-500">This is separate from your listing's site category — it just helps guests picture the space.</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {STRUCTURE_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setValue('structureType', t, { shouldValidate: true })}
                      className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition ${
                        values.structureType === t
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      <Home className="h-5 w-5" />
                      <span className="text-sm font-semibold">{t}</span>
                    </button>
                  ))}
                </div>
                {errors.structureType && <p className="mt-3 text-xs font-medium text-rose-600">{errors.structureType.message}</p>}
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="mb-4 text-xl font-bold text-slate-900">What type of place will guests have?</h2>
                <div className="space-y-3">
                  {PRIVACY_TYPES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setValue('privacyType', p.value, { shouldValidate: true })}
                      className={`block w-full rounded-2xl border-2 p-4 text-left transition ${
                        values.privacyType === p.value ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className="font-semibold text-slate-800">{p.label}</p>
                      <p className="mt-1 text-sm text-slate-500">{p.description}</p>
                    </button>
                  ))}
                </div>
                {errors.privacyType && <p className="mt-3 text-xs font-medium text-rose-600">{errors.privacyType.message}</p>}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <LocationPicker value={location} onChange={handleLocationChange} />
                <div>
                  <label htmlFor="city" className="mb-1 block text-sm font-medium text-slate-700">City</label>
                  <input
                    id="city"
                    {...register('city')}
                    placeholder="e.g. Bengaluru"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                  {errors.city && <p className="mt-1 text-xs font-medium text-rose-600">{errors.city.message}</p>}
                </div>
                <div>
                  <label htmlFor="neighborhood" className="mb-1 block text-sm font-medium text-slate-700">Neighborhood / Area</label>
                  <input
                    id="neighborhood"
                    {...register('neighborhood')}
                    placeholder="e.g. Koramangala"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                  {errors.neighborhood && <p className="mt-1 text-xs font-medium text-rose-600">{errors.neighborhood.message}</p>}
                </div>
                <div>
                  <label htmlFor="address" className="mb-1 block text-sm font-medium text-slate-700">Full Address</label>
                  <input
                    id="address"
                    {...register('address')}
                    placeholder="5th Block, Koramangala, Bengaluru"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                  {errors.address && <p className="mt-1 text-xs font-medium text-rose-600">{errors.address.message}</p>}
                  <p className="mt-1 text-xs text-slate-400">Only the neighborhood is shown publicly — the full address is shared with confirmed guests only.</p>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="mb-1 text-xl font-bold text-slate-900">Share some basics about your place</h2>
                <p className="mb-2 text-sm text-slate-500">You'll add more details later, such as bed types.</p>
                <div className="mt-4">
                  <NumberStepperRow label="Guests" value={values.maxGuests ?? 2} onChange={(v) => setValue('maxGuests', v, { shouldValidate: true })} min={1} max={20} />
                  <NumberStepperRow label="Bedrooms" value={values.bedrooms ?? 1} onChange={(v) => setValue('bedrooms', v, { shouldValidate: true })} min={0} max={20} />
                  <NumberStepperRow label="Beds" value={values.beds ?? 1} onChange={(v) => setValue('beds', v, { shouldValidate: true })} min={1} max={30} />
                  <NumberStepperRow label="Bathrooms" value={values.bathrooms ?? 1} onChange={(v) => setValue('bathrooms', v, { shouldValidate: true })} min={1} max={20} />
                </div>
                {errors.maxGuests && <p className="mt-2 text-xs font-medium text-rose-600">{errors.maxGuests.message}</p>}
              </div>
            )}

            {step === 5 && (
              <Interstitial
                eyebrow="Step 2"
                title="Make your place stand out"
                description="In this step, you'll add some of the amenities your place offers, plus photos and documents. Then you'll create a title and description."
                icon={Sparkles}
              />
            )}

            {step === 6 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="propertyTitle" className="mb-1 block text-sm font-medium text-slate-700">Property Title</label>
                  <input
                    id="propertyTitle"
                    {...register('propertyTitle')}
                    placeholder="e.g. Palm Grove Villa — Candolim"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                  {errors.propertyTitle && <p className="mt-1 text-xs font-medium text-rose-600">{errors.propertyTitle.message}</p>}
                </div>
                <div>
                  <label htmlFor="propertyType" className="mb-1 block text-sm font-medium text-slate-700">Property Type</label>
                  <select
                    id="propertyType"
                    {...register('propertyType')}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  >
                    <option value="">Select a type</option>
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {errors.propertyType && <p className="mt-1 text-xs font-medium text-rose-600">{errors.propertyType.message}</p>}
                </div>
              </div>
            )}

            {step === 7 && (
              <div>
                <p className="mb-3 text-sm font-medium text-slate-700">Select the amenities available:</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {ALL_AMENITIES.map((a) => (
                    <label
                      key={a}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                        (values.amenities ?? []).includes(a)
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-slate-300 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={(values.amenities ?? []).includes(a)}
                        onChange={() => toggleAmenity(a)}
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-400"
                      />
                      {a}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 8 && (
              <>
                <FileDropzone
                  label="Property Photos"
                  hint="Click to add photos (at least 3)"
                  files={values.photos ?? []}
                  onChange={(files) => setValue('photos', files, { shouldValidate: true })}
                  max={10}
                  accept="image/*"
                  icon={ImagePlus}
                />
                {errors.photos && <p className="mt-2 text-xs font-medium text-rose-600">{errors.photos.message}</p>}
              </>
            )}

            {step === 9 && (
              <>
                <FileDropzone
                  label="Verification Documents (ID proof / ownership proof)"
                  hint="Click to add documents — optional but speeds up review"
                  files={values.documents ?? []}
                  onChange={(files) => setValue('documents', files, { shouldValidate: true })}
                  max={5}
                  icon={UploadCloud}
                />
                {errors.documents && <p className="mt-2 text-xs font-medium text-rose-600">{errors.documents.message}</p>}
              </>
            )}

            {step === 10 && (
              <div>
                <h2 className="mb-1 text-xl font-bold text-slate-900">Create your description</h2>
                <p className="mb-4 text-sm text-slate-500">Share what makes your place special.</p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {Object.entries(DESCRIPTION_HIGHLIGHTS).map(([label, snippet]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => applyHighlight(snippet)}
                      className="rounded-full border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-primary-400 hover:text-primary-700"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <textarea
                  id="description"
                  {...register('description')}
                  rows={6}
                  placeholder="Tell guests what makes this space worth staying in…"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
                <p className="mt-1 text-right text-xs text-slate-400">{(values.description ?? '').length}/500</p>
                {errors.description && <p className="mt-1 text-xs font-medium text-rose-600">{errors.description.message}</p>}
              </div>
            )}

            {step === 11 && (
              <Interstitial
                eyebrow="Step 3"
                title="Finish up and publish"
                description="Finally, you'll choose booking settings, set up pricing, add any discounts, and share a few safety details before you publish your listing."
                icon={PartyPopper}
              />
            )}

            {step === 12 && (
              <div>
                <h2 className="mb-1 text-xl font-bold text-slate-900">Pick your booking settings</h2>
                <p className="mb-4 text-sm text-slate-500">You can change this at any time.</p>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setValue('instantBook', false, { shouldValidate: true })}
                    className={`block w-full rounded-2xl border-2 p-4 text-left transition ${
                      !values.instantBook ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p className="font-semibold text-slate-800">
                      Approve your first 5 bookings <span className="ml-1 text-xs font-bold text-accent-600">Recommended</span>
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Start by reviewing reservation requests, then switch to Instant Book so guests can book automatically.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('instantBook', true, { shouldValidate: true })}
                    className={`block w-full rounded-2xl border-2 p-4 text-left transition ${
                      values.instantBook ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p className="font-semibold text-slate-800">Use Instant Book</p>
                    <p className="mt-1 text-sm text-slate-500">Let guests book automatically.</p>
                  </button>
                </div>
              </div>
            )}

            {step === 13 && (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-1 text-xl font-bold text-slate-900">Now, set your prices</h2>
                  <p className="mb-3 text-sm text-slate-500">You can change this anytime from your Host Dashboard's Pricing &amp; Calendar tab.</p>
                  <label htmlFor="pricePerNight" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Base price</label>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-slate-400">₹</span>
                    <input
                      id="pricePerNight"
                      type="number"
                      {...register('pricePerNight', { valueAsNumber: true })}
                      className="w-40 rounded-xl border border-slate-300 px-2 py-1 text-3xl font-extrabold text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  {errors.pricePerNight && <p className="mt-1 text-xs font-medium text-rose-600">{errors.pricePerNight.message}</p>}
                  <p className="mt-2 text-xs text-slate-400">
                    Weekend markup and a per-date calendar can be set up after your listing is approved, from Pricing &amp; Calendar in your dashboard.
                  </p>
                </div>
                <div>
                  <label htmlFor="securityDeposit" className="mb-1 block text-sm font-medium text-slate-700">Security Deposit (₹)</label>
                  <input
                    id="securityDeposit"
                    type="number"
                    {...register('securityDeposit', { valueAsNumber: true })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                  {errors.securityDeposit && <p className="mt-1 text-xs font-medium text-rose-600">{errors.securityDeposit.message}</p>}
                </div>
              </div>
            )}

            {step === 14 && (
              <div>
                <h2 className="mb-1 text-xl font-bold text-slate-900">Add discounts</h2>
                <p className="mb-4 text-sm text-slate-500">Help your place stand out to get booked faster and earn your first reviews.</p>
                <div className="space-y-3">
                  {DISCOUNTS.map((d) => (
                    <label key={d.key} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                      <span className="flex items-center gap-3">
                        <span className="flex h-9 min-w-[3.25rem] items-center justify-center rounded-full border border-slate-300 px-2 text-sm font-bold text-slate-700">{d.pct}</span>
                        <span>
                          <span className="block font-semibold text-slate-800">{d.label}</span>
                          <span className="block text-xs text-slate-500">{d.hint}</span>
                        </span>
                      </span>
                      <input
                        type="checkbox"
                        {...register(d.key)}
                        className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-400"
                      />
                    </label>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-400">Only one discount will be applied per stay.</p>
              </div>
            )}

            {step === 15 && (
              <div>
                <h2 className="mb-4 text-xl font-bold text-slate-900">Share safety details</h2>
                <p className="mb-3 font-semibold text-slate-700">Does your place have any of these?</p>
                <div className="space-y-3">
                  {SAFETY_ITEMS.map((s) => (
                    <label key={s.key} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                      <span className="font-medium text-slate-700">{s.label}</span>
                      <input
                        type="checkbox"
                        {...register(s.key)}
                        className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-400"
                      />
                    </label>
                  ))}
                </div>
                <p className="mt-4 text-xs text-slate-500">
                  Security cameras that monitor indoor spaces are not allowed even if they're turned off. All exterior
                  security cameras must be disclosed.
                </p>
              </div>
            )}

            {step === 16 && (
              <div className="space-y-5">
                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-bold text-slate-800">{values.propertyTitle || 'Untitled property'}</p>
                  <p>{values.propertyType} · {values.neighborhood}, {values.city}</p>
                  <p>
                    ₹{Number(values.pricePerNight || 0).toLocaleString('en-IN')}/night · up to {values.maxGuests} guests ·{' '}
                    {values.bedrooms} bedroom{values.bedrooms === 1 ? '' : 's'} · {values.beds} bed{values.beds === 1 ? '' : 's'} · {values.bathrooms} bathroom{values.bathrooms === 1 ? '' : 's'}
                  </p>
                  <p>{(values.photos ?? []).length} photo(s), {(values.documents ?? []).length} document(s) attached</p>
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
                  <input
                    type="checkbox"
                    {...register('agreedToTerms')}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-400"
                  />
                  <span className="text-sm text-slate-600">
                    I confirm the information above is accurate and I agree to innbly's host terms and cancellation
                    policy shown in the <a href="/terms" className="font-semibold text-primary-600 hover:underline">Terms of Service</a>.
                  </span>
                </label>
                {errors.agreedToTerms && <p className="text-xs font-medium text-rose-600">{errors.agreedToTerms.message}</p>}

                {submitError && (
                  <div className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {submitError}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={() => goToStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-xl bg-accent-500 px-6 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-accent-600 hover:shadow-card-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? 'Submitting…' : 'Submit Listing'}
              </button>
            )}
          </div>
        </form>
      </div>
      <Footer />
    </>
  )
}
