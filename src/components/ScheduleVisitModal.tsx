import { useState } from 'react'
import { X, CalendarCheck2 } from 'lucide-react'
import { useLeads } from '../context/LeadsContext'

export function ScheduleVisitModal({
  propertyId,
  propertyTitle,
  onClose,
}: {
  propertyId: string
  propertyTitle: string
  onClose: () => void
}) {
  const { addLead } = useLeads()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addLead({ propertyId, propertyTitle, name, phone, visitDate: date })
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CalendarCheck2 className="h-12 w-12 text-accent-500" />
            <h3 className="text-lg font-bold text-slate-900">Visit request sent!</h3>
            <p className="text-sm text-slate-500">
              The host has been notified. They'll confirm your visit to <strong>{propertyTitle}</strong> shortly.
            </p>
            <button
              onClick={onClose}
              className="mt-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-slate-900">Schedule a free visit</h3>
            <p className="mt-1 text-sm text-slate-500">{propertyTitle}</p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Full name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aditya Sharma"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Phone number</label>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Preferred visit date</label>
                <input
                  required
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-accent-500 px-4 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-accent-600 hover:shadow-card-hover"
              >
                Confirm visit request
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
