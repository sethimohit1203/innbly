import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, type FieldPath } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ImagePlus, UploadCloud, FileText, X, Loader2, AlertCircle } from 'lucide-react'
import { Footer } from '../components/Footer'
import { GuestCounter } from '../components/GuestCounter'
import { usePageMeta } from '../hooks/usePageMeta'
import { hostFormSchema, submitHostListing, type HostFormValues } from '../lib/hostSubmission'
import { addMyListingId } from '../lib/myListings'
import { PROPERTY_TYPES } from '../types'

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

const STEPS: { label: string; fields: FieldPath<HostFormValues>[] }[] = [
  { label: 'Owner Info', fields: ['ownerName', 'ownerEmail', 'ownerPhone'] },
  { label: 'Property Info', fields: ['propertyTitle', 'propertyType', 'description'] },
  { label: 'Location', fields: ['city', 'neighborhood', 'address'] },
  { label: 'Pricing', fields: ['pricePerNight', 'securityDeposit', 'maxGuests'] },
  { label: 'Amenities', fields: ['amenities'] },
  { label: 'Photos', fields: ['photos'] },
  { label: 'Documents', fields: ['documents'] },
  { label: 'Agreement', fields: ['agreedToTerms'] },
]

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

export function ListPropertyPage() {
  usePageMeta('List Your Property', 'List your property on innbly in a few simple steps and start receiving guest inquiries directly.')
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

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
      pricePerNight: 1800,
      securityDeposit: 10000,
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

  const goNext = async () => {
    const valid = await trigger(STEPS[step].fields)
    if (valid) setStep((s) => Math.min(STEPS.length - 1, s + 1))
  }

  const onSubmit = async (data: HostFormValues) => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const id = await submitHostListing(data)
      addMyListingId(id)
      setDone(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-50">
          <Check className="h-8 w-8 text-accent-600" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">Listing submitted!</h1>
        <p className="mt-2 text-slate-500">
          "{values.propertyTitle || 'Your property'}" has been sent for review. We'll be in touch once it's approved and live.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Back to Dashboard
        </button>
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
              <div className="space-y-4">
                <div>
                  <label htmlFor="propertyTitle" className="mb-1 block text-sm font-medium text-slate-700">Property Title</label>
                  <input
                    id="propertyTitle"
                    {...register('propertyTitle')}
                    placeholder="e.g. Sunrise Coliving — Koramangala"
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
                <div>
                  <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    id="description"
                    {...register('description')}
                    rows={4}
                    placeholder="Tell guests what makes this space worth staying in…"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  />
                  {errors.description && <p className="mt-1 text-xs font-medium text-rose-600">{errors.description.message}</p>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
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

            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pricePerNight" className="mb-1 block text-sm font-medium text-slate-700">Nightly Rate (₹)</label>
                    <input
                      id="pricePerNight"
                      type="number"
                      {...register('pricePerNight', { valueAsNumber: true })}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                    {errors.pricePerNight && <p className="mt-1 text-xs font-medium text-rose-600">{errors.pricePerNight.message}</p>}
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
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Max Guests</label>
                  <GuestCounter value={values.maxGuests ?? 2} onChange={(v) => setValue('maxGuests', v, { shouldValidate: true })} max={20} />
                  {errors.maxGuests && <p className="mt-1 text-xs font-medium text-rose-600">{errors.maxGuests.message}</p>}
                </div>
              </div>
            )}

            {step === 4 && (
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

            {step === 5 && (
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

            {step === 6 && (
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

            {step === 7 && (
              <div className="space-y-5">
                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-bold text-slate-800">{values.propertyTitle || 'Untitled property'}</p>
                  <p>{values.propertyType} · {values.neighborhood}, {values.city}</p>
                  <p>₹{Number(values.pricePerNight || 0).toLocaleString('en-IN')}/night · up to {values.maxGuests} guests</p>
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
              onClick={() => setStep((s) => Math.max(0, s - 1))}
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
