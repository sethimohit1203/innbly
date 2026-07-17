import { useEffect, useState } from 'react'
import { isValidPhoneNumber, type CountryCode } from 'libphonenumber-js/min'

const COUNTRIES: { code: CountryCode; dial: string; label: string }[] = [
  { code: 'IN', dial: '+91', label: 'India' },
  { code: 'US', dial: '+1', label: 'United States' },
  { code: 'GB', dial: '+44', label: 'United Kingdom' },
  { code: 'AE', dial: '+971', label: 'UAE' },
  { code: 'CA', dial: '+1', label: 'Canada' },
  { code: 'AU', dial: '+61', label: 'Australia' },
  { code: 'SG', dial: '+65', label: 'Singapore' },
  { code: 'DE', dial: '+49', label: 'Germany' },
]

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  country: CountryCode
  onCountryChange: (country: CountryCode) => void
  required?: boolean
  onValidityChange?: (valid: boolean) => void
}

export function PhoneInput({ value, onChange, country, onCountryChange, required, onValidityChange }: PhoneInputProps) {
  const [touched, setTouched] = useState(false)

  const valid = value.trim().length === 0 ? !required : isValidPhoneNumber(value, country)
  const showError = touched && !valid

  useEffect(() => {
    onValidityChange?.(valid)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valid])

  return (
    <div>
      <div className={`flex overflow-hidden rounded-xl border bg-slate-50 transition-all focus-within:bg-white ${
        showError ? 'border-rose-400' : 'border-slate-200 focus-within:border-primary-500'
      }`}>
        <select
          value={country}
          onChange={(e) => onCountryChange(e.target.value as CountryCode)}
          className="cursor-pointer border-r border-slate-200 bg-transparent px-2.5 py-3 text-[15px] font-semibold text-slate-700 outline-none"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} {c.dial}
            </option>
          ))}
        </select>
        <input
          type="tel"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="98765 43210"
          className="w-full bg-transparent px-3 py-3 text-[15px] font-semibold text-slate-800 outline-none"
        />
      </div>
      {showError && <p className="mt-1 text-xs font-semibold text-rose-500">Enter a valid phone number for the selected country.</p>}
    </div>
  )
}
