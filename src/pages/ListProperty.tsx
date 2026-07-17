import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ImagePlus, UploadCloud } from 'lucide-react'
import { Footer } from '../components/Footer'
import { usePageMeta } from '../hooks/usePageMeta'

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

const steps = ['Basic Details & Rent', 'Amenities', 'Photos']

export function ListPropertyPage() {
  usePageMeta('List Your Property', 'List your PG, coliving space, or rental on innbly in three simple steps and start receiving tenant leads.')
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)

  const [title, setTitle] = useState('')
  const [city, setCity] = useState('')
  const [rent, setRent] = useState('')
  const [deposit, setDeposit] = useState('')
  const [roomType, setRoomType] = useState('Single')
  const [amenities, setAmenities] = useState<string[]>([])
  const [photoCount, setPhotoCount] = useState(0)

  const toggleAmenity = (a: string) => {
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))
  }

  if (done) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-50">
          <Check className="h-8 w-8 text-accent-600" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">Listing submitted!</h1>
        <p className="mt-2 text-slate-500">
          "{title || 'Your property'}" has been added for review. You'll start receiving leads once it's live.
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
      <div className="mt-6 flex items-center gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
                i <= step ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`hidden text-sm font-medium sm:block ${i <= step ? 'text-slate-800' : 'text-slate-400'}`}>
              {label}
            </span>
            {i < steps.length - 1 && <div className="h-0.5 flex-1 bg-slate-200" />}
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Property Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sunrise Coliving — Koramangala"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">City / Neighborhood</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Koramangala, Bengaluru"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Monthly Rent (₹)</label>
                <input
                  type="number"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  placeholder="12500"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Security Deposit (₹)</label>
                <input
                  type="number"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  placeholder="25000"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Room Type</label>
              <div className="flex gap-2">
                {['Single', 'Sharing'].map((rt) => (
                  <button
                    key={rt}
                    onClick={() => setRoomType(rt)}
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                      roomType === rt
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-slate-300 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    {rt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="mb-3 text-sm font-medium text-slate-700">Select the amenities available:</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {ALL_AMENITIES.map((a) => (
                <label
                  key={a}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                    amenities.includes(a)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-300 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={amenities.includes(a)}
                    onChange={() => toggleAmenity(a)}
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-400"
                  />
                  {a}
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="mb-3 text-sm font-medium text-slate-700">Upload photos of your property</p>
            <button
              type="button"
              onClick={() => setPhotoCount((c) => Math.min(c + 1, 5))}
              className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-10 text-slate-400 transition hover:border-primary-400 hover:text-primary-500"
            >
              <UploadCloud className="h-8 w-8" />
              <span className="text-sm font-medium">Click to add a photo (placeholder)</span>
            </button>
            {photoCount > 0 && (
              <div className="mt-4 grid grid-cols-5 gap-2">
                {Array.from({ length: photoCount }).map((_, i) => (
                  <div
                    key={i}
                    className="flex aspect-square items-center justify-center rounded-xl bg-slate-100 text-slate-400"
                  >
                    <ImagePlus className="h-6 w-6" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>
        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
            className="rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => setDone(true)}
            className="rounded-xl bg-accent-500 px-6 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-accent-600 hover:shadow-card-hover"
          >
            Submit Listing
          </button>
        )}
      </div>
    </div>
    <Footer />
    </>
  )
}
