import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Eye, Scale, BellRing, LogOut, User, Gift, LayoutDashboard, Camera, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSavedProperties } from '../context/SavedPropertiesContext'
import { useRecentlyViewed } from '../context/RecentlyViewedContext'
import { useCompare } from '../context/CompareContext'
import { useSavedSearch } from '../context/SavedSearchContext'
import { useToast } from '../context/ToastContext'
import { uploadToCloudinary } from '../lib/cloudinary'
import { Footer } from '../components/Footer'
import { usePageMeta } from '../hooks/usePageMeta'

export function ProfilePage() {
  usePageMeta('My Profile', 'Manage your innbly account details.')
  const { user, updateProfile, logout, openAuthModal } = useAuth()
  const { savedIds } = useSavedProperties()
  const { recentIds } = useRecentlyViewed()
  const { compareIds } = useCompare()
  const { savedSearches } = useSavedSearch()
  const { showToast } = useToast()

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <User className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Sign in to view your profile</h1>
        <p className="mt-2 text-sm text-slate-500">Your saved properties, searches, and account details live here.</p>
        <button
          onClick={() => openAuthModal()}
          className="mt-6 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-primary-700"
        >
          Sign In / Sign Up
        </button>
      </div>
    )
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile({ name: name.trim() || user.name, email: email.trim() || user.email, phone: phone.trim() || undefined })
    showToast('Profile updated')
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploadingAvatar(true)
    try {
      const url = await uploadToCloudinary(file, 'avatars')
      updateProfile({ avatarUrl: url })
      showToast('Profile photo updated')
    } catch (err) {
      showToast((err as Error).message ?? 'Could not upload photo', 'error')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const stats = [
    { to: '/saved', label: 'Saved Properties', count: savedIds.length, icon: Heart },
    { to: '/compare', label: 'Comparing', count: compareIds.length, icon: Scale },
    { to: '/saved', label: 'Saved Searches', count: savedSearches.length, icon: BellRing },
    { to: '/', label: 'Recently Viewed', count: recentIds.length, icon: Eye },
  ]

  return (
    <>
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            title="Change profile photo"
            className="group relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-2xl font-bold text-primary-700"
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
            <span
              className={`absolute inset-0 flex items-center justify-center bg-slate-900/50 text-white transition-opacity ${
                uploadingAvatar ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              {uploadingAvatar ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
            </span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{user.name}</h1>
            <p className="text-sm text-slate-500">
              {user.email} · <span className="capitalize">{user.role}</span> account
            </p>
          </div>
        </div>

        {user.role === 'host' && (
          <Link
            to="/dashboard"
            className="mt-6 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-primary-700 shadow-card transition hover:border-primary-300"
          >
            <LayoutDashboard className="h-4 w-4" /> Go to your Host Dashboard
          </Link>
        )}

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <Link
              key={s.label}
              to={s.to}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-card transition hover:border-primary-300 hover:shadow-card-hover"
            >
              <s.icon className="mx-auto h-5 w-5 text-primary-600" />
              <p className="mt-2 text-xl font-extrabold text-slate-900">{s.count}</p>
              <p className="text-xs font-semibold text-slate-500">{s.label}</p>
            </Link>
          ))}
        </div>

        <form onSubmit={handleSave} className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="mb-4 text-sm font-extrabold text-slate-900">Account Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Phone (optional)</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button type="submit" className="rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-primary-700">
              Save Changes
            </button>
            <Link to="/invite" className="flex items-center gap-1.5 text-sm font-bold text-accent-700 hover:underline">
              <Gift className="h-4 w-4" /> Invite Friends
            </Link>
          </div>
        </form>

        <button
          onClick={logout}
          className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:underline"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </section>
      <Footer />
    </>
  )
}
