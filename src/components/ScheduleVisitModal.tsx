import { useEffect, useState } from 'react'
import type { CountryCode } from 'libphonenumber-js/min'
import { X, CalendarCheck, CircleCheck } from 'lucide-react'
import { useLeads } from '../context/LeadsContext'
import { useVisitModal } from '../context/VisitModalContext'
import { useToast } from '../context/ToastContext'
import { submitToSheet } from '../lib/backend'
import { PhoneInput } from './PhoneInput'

function tomorrowISO() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export function ScheduleVisitModal() {
  const { isOpen, target, closeVisitModal } = useVisitModal()
  const { addLead } = useLeads()
  const { showToast } = useToast()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>('IN')
  const [phoneValid, setPhoneValid] = useState(false)
  const [date, setDate] = useState(tomorrowISO())
  const [slot, setSlot] = useState('morning')
  const [submitted, setSubmitted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setVisible(false)
      const t = setTimeout(() => setVisible(true), 10)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => {
      closeVisitModal()
      setSubmitted(false)
      setName('')
      setPhone('')
      setSlot('morning')
      setDate(tomorrowISO())
    }, 200)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneValid) return

    const visitDate = `${date} · ${slot === 'morning' ? '10 AM–1 PM' : slot === 'afternoon' ? '1 PM–4 PM' : '4 PM–7 PM'}`

    addLead({
      propertyId: target.propertyId,
      propertyTitle: target.propertyTitle,
      name,
      phone,
      visitDate,
    })
    submitToSheet('lead', { name, phone, propertyTitle: target.propertyTitle, visitDate: date, slot })
    setSubmitted(true)
    showToast('Visit scheduled successfully!')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-all hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent-100 text-3xl text-accent-600 shadow-md">
              <CircleCheck className="h-8 w-8" />
            </div>
            <h3 className="mb-2 text-2xl font-extrabold text-slate-900">Visit Successfully Scheduled!</h3>
            <p className="mb-6 max-w-sm text-sm font-medium leading-relaxed text-slate-500">
              Our verified relationship manager has received your request for{' '}
              <strong>{target.propertyTitle}</strong>. We'll message you on WhatsApp shortly to confirm exact
              navigation details.
            </p>
            <button
              onClick={handleClose}
              className="rounded-xl bg-stone-950 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-black"
            >
              Back to Home Page
            </button>
          </div>
        ) : (
          <div className="p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10 text-lg text-primary-600">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Schedule Premium Visit</h3>
                <p className="text-xs font-semibold text-slate-500">{target.propertyTitle}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Your Name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g., Aditya Sharma"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] font-semibold text-slate-800 outline-none transition-all focus:border-primary-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  WhatsApp Contact Number <span className="text-rose-500">*</span>
                </label>
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  country={phoneCountry}
                  onCountryChange={setPhoneCountry}
                  required
                  onValidityChange={setPhoneValid}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Visit Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] font-semibold text-slate-800 outline-none transition-all focus:border-primary-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Preferred Slot
                  </label>
                  <select
                    required
                    value={slot}
                    onChange={(e) => setSlot(e.target.value)}
                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] font-semibold text-slate-800 outline-none transition-all focus:border-primary-500 focus:bg-white"
                  >
                    <option value="morning">Morning (10 AM–1 PM)</option>
                    <option value="afternoon">Afternoon (1 PM–4 PM)</option>
                    <option value="evening">Evening (4 PM–7 PM)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={!phoneValid}
                className="mt-4 w-full rounded-xl bg-primary-600 py-4 text-[15px] font-bold text-white shadow-lg shadow-primary-500/10 transition-all hover:bg-primary-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Confirm Appointment Booking
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
