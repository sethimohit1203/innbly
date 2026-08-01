import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link, NavLink } from '~links'
import {
  Search,
  LayoutDashboard,
  Building2,
  Users,
  User,
  Menu,
  X,
  ChevronDown,
  Heart,
  LogOut,
  PlusCircle,
  Gift,
  Receipt,
  Repeat,
  Bell,
  Home,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSavedProperties } from '../context/SavedPropertiesContext'
import { TranslateWidget } from './TranslateWidget'
import { Button } from './ui/Button'
import { HostMenuPanel } from './HostMenuPanel'
import { useNewBookingsCount, markBookingsSeen } from '../hooks/useNewBookingsCount'

export function Navbar() {
  const { user, openAuthModal, logout, switchRole } = useAuth()
  const { savedIds } = useSavedProperties()
  const navigate = useNavigate()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [switchingToHost, setSwitchingToHost] = useState(false)
  const [hostMenuOpen, setHostMenuOpen] = useState(false)
  const newBookingsCount = useNewBookingsCount(user?.role === 'host' ? user.email : undefined)

  const goToListProperty = async () => {
    if (user?.role === 'host') {
      navigate('/dashboard/list-property')
      return
    }
    if (user) {
      // Already have a real account (just not in host mode yet) — flip the
      // existing session's role instead of throwing them back into the
      // signup modal, which used to happen unconditionally here.
      setSwitchingToHost(true)
      const updated = await switchRole()
      setSwitchingToHost(false)
      if (updated) navigate('/dashboard/list-property')
      return
    }
    openAuthModal('host')
  }

  const handleSwitchRole = async () => {
    const updated = await switchRole()
    setAvatarOpen(false)
    if (updated) navigate(updated.role === 'host' ? '/dashboard' : '/')
  }

  const isHost = user?.role === 'host'
  const isTenant = user?.role === 'tenant'

  const hostLinks = [
    { to: '/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { to: '/dashboard/properties', label: 'Manage Properties', icon: Building2 },
    { to: '/dashboard/leads', label: 'Leads Tracker', icon: Users },
  ]

  const guestLinks = [
    { to: '/search', label: 'Explore', icon: Search },
    { to: '#list-property', label: 'List Your Property', icon: Home, onClick: goToListProperty },
    {
      to: '#become-host',
      label: 'Become a Host',
      icon: User,
      onClick: async (e: React.MouseEvent) => {
        e.preventDefault()
        if (user?.role === 'host') {
          navigate('/dashboard')
          return
        }
        if (user) {
          setSwitchingToHost(true)
          const updated = await switchRole()
          setSwitchingToHost(false)
          if (updated) navigate('/dashboard')
          return
        }
        openAuthModal('host')
      },
    },
    { to: '/enterprise', label: 'About Us' },
    { to: '/contact', label: 'Help' },
  ]

  const handleLogout = () => {
    logout()
    setAvatarOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 shadow-sm backdrop-blur-md transition-shadow">
      <div className="mx-auto grid h-18 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6 sm:px-8 lg:px-10">
        <Link to="/" className="flex items-center gap-2.5 justify-self-start">
          <img src="/brand/innbly-icon.jpg" alt="innbly" className="h-9 w-9 rounded-xl object-cover shadow-lg shadow-primary-500/20" />
          <span className="bg-gradient-to-r from-primary-900 to-primary-600 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
            innbly
          </span>
        </Link>

        <nav className="hidden items-center gap-6 justify-self-center md:flex">
          {isHost && (
            <div className="flex items-center gap-4">
              <div className="h-5 w-[1.5px] bg-slate-200" />
              <button
                type="button"
                onClick={() => setHostMenuOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50 transition"
                aria-label="Open hosting menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          )}
          {isHost
            ? hostLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end
                  className={({ isActive }) =>
                    `relative flex items-center gap-1.5 py-6 text-[15px] font-semibold transition-colors after:absolute after:-bottom-px after:left-0 after:h-0.5 after:rounded-full after:bg-primary-600 after:transition-all after:duration-200 after:ease-smooth after:content-[''] ${
                      isActive
                        ? 'text-primary-600 after:w-full'
                        : 'text-slate-600 after:w-0 hover:text-primary-600 hover:after:w-full'
                    }`
                  }
                >
                  <link.icon className="h-4 w-4" /> {link.label}
                </NavLink>
              ))
            : guestLinks.map((link) => {
                const handleClick = (e: React.MouseEvent) => {
                  if (link.onClick) {
                    e.preventDefault()
                    link.onClick(e)
                  }
                }
                return (
                  <NavLink
                    key={link.label}
                    to={link.to}
                    onClick={handleClick}
                    className={({ isActive }) =>
                      `flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[15px] font-semibold transition-colors ${
                        !link.onClick && isActive
                          ? 'bg-primary-50 text-primary-600 border border-primary-100'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-primary-600'
                      }`
                    }
                  >
                    {link.icon && <link.icon className="h-4 w-4" />} {link.label}
                  </NavLink>
                )
              })}
        </nav>

        <div className="flex items-center gap-4 justify-self-end">
          <TranslateWidget />

          {!isHost && (
            <Link
              to="/saved"
              className="relative hidden h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 text-slate-700 sm:flex"
              aria-label="Saved properties"
            >
              <Heart className="h-5 w-5 text-rose-500 hover:fill-rose-500" />
              {savedIds.length > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                  {savedIds.length}
                </span>
              )}
            </Link>
          )}

          {!isHost && (
            <Button
              onClick={goToListProperty}
              loading={switchingToHost}
              className="hidden sm:inline-flex bg-primary-600 hover:bg-primary-700 text-white rounded-full px-5 py-2 font-bold shadow-md items-center gap-2"
            >
              {switchingToHost ? 'Switching…' : 'List Your Property'}
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-primary-600 text-xs font-black">+</span>
            </Button>
          )}

          {isHost && (
            <div className="hidden items-center gap-3.5 sm:flex">
              {/* Name & Circular Photo Avatar */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-bold">Hi, {user!.name.split(' ')[0]}</span>
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xs font-bold text-slate-700 shadow-sm border border-slate-200">
                  {user!.avatarUrl ? (
                    <img src={user!.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    user!.name.charAt(0).toUpperCase()
                  )}
                </span>
              </div>

              {/* Notification Bell with Badge */}
              <button
                type="button"
                onClick={() => {
                  navigate('/dashboard/bookings')
                  markBookingsSeen(user!.email)
                }}
                aria-label={newBookingsCount > 0 ? `${newBookingsCount} new bookings` : 'Bookings'}
                className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-50 text-slate-700 active:scale-95 transition"
              >
                <Bell className="h-5 w-5 text-slate-800" />
                {newBookingsCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-extrabold text-white ring-2 ring-white">
                    {newBookingsCount}
                  </span>
                )}
              </button>

              {/* Switch to Travelling */}
              <button
                onClick={handleSwitchRole}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:border-slate-350 transition active:scale-95 shadow-sm"
              >
                Switch to travelling
              </button>

              {/* Log out */}
              <button
                onClick={handleLogout}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:border-slate-350 transition active:scale-95 shadow-sm"
              >
                Log out
              </button>
            </div>
          )}

          {isTenant && (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setAvatarOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 transition hover:border-slate-300 bg-white shadow-sm"
              >
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                  {user!.avatarUrl ? (
                    <img src={user!.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    user!.name.charAt(0).toUpperCase()
                  )}
                </span>
                <span className="text-sm font-semibold text-slate-700">{user!.name.split(' ')[0]}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition ${avatarOpen ? 'rotate-180' : ''}`} />
              </button>

              {avatarOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setAvatarOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-card-hover">
                    <Link
                      to="/profile"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <User className="h-4 w-4 text-slate-400" /> My Profile
                    </Link>
                    <Link
                      to="/bookings"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Receipt className="h-4 w-4 text-slate-400" /> My Bookings
                    </Link>
                    <Link
                      to="/saved"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Heart className="h-4 w-4 text-slate-400" /> Saved Properties
                    </Link>
                    <Link
                      to="/invite"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Gift className="h-4 w-4 text-slate-400" /> Invite Friends
                    </Link>
                    <div className="my-1 h-px bg-slate-100" />
                    <button
                      onClick={handleSwitchRole}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Repeat className="h-4 w-4 text-slate-400" /> Switch to hosting
                    </button>
                    <div className="my-1 h-px bg-slate-100" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {!user && (
            <Button variant="outline" onClick={() => openAuthModal()} className="hidden hover:border-primary-400 hover:text-primary-700 sm:inline-flex">
              <User className="h-4 w-4" /> Sign In / Sign Up
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="md:hidden"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="space-y-4 border-t border-slate-100 bg-white/95 px-4 py-6 shadow-xl backdrop-blur-md md:hidden">
          {isHost ? (
            hostLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block text-base font-semibold text-slate-700 transition-colors hover:text-primary-600"
              >
                {link.label}
              </Link>
            ))
          ) : (
            <Link
              to="/search"
              onClick={() => setMobileOpen(false)}
              className="block text-base font-semibold text-slate-700 transition-colors hover:text-primary-600"
            >
              Explore
            </Link>
          )}

          {isTenant && (
            <>
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="block text-base font-semibold text-slate-700 hover:text-primary-600">
                My Profile
              </Link>
              <Link to="/bookings" onClick={() => setMobileOpen(false)} className="block text-base font-semibold text-slate-700 hover:text-primary-600">
                My Bookings
              </Link>
              <Link to="/saved" onClick={() => setMobileOpen(false)} className="block text-base font-semibold text-slate-700 hover:text-primary-600">
                Saved Properties
              </Link>
              <Link to="/invite" onClick={() => setMobileOpen(false)} className="block text-base font-semibold text-slate-700 hover:text-primary-600">
                Invite Friends
              </Link>
              <button
                onClick={() => {
                  handleSwitchRole()
                  setMobileOpen(false)
                }}
                className="block text-base font-semibold text-slate-700 hover:text-primary-600"
              >
                Switch to hosting
              </button>
            </>
          )}

          {isHost && (
            <>
              <button
                onClick={() => {
                  handleSwitchRole()
                  setMobileOpen(false)
                }}
                className="block text-base font-semibold text-slate-700 hover:text-primary-600"
              >
                Switch to travelling
              </button>
              <button
                onClick={() => {
                  setHostMenuOpen(true)
                  setMobileOpen(false)
                }}
                className="block text-base font-semibold text-slate-700 hover:text-primary-600"
              >
                Menu
              </button>
            </>
          )}

          {!user && (
            <button
              onClick={() => {
                openAuthModal()
                setMobileOpen(false)
              }}
              className="block text-base font-semibold text-slate-700 transition-colors hover:text-primary-600"
            >
              Sign In / Sign Up
            </button>
          )}

          {user && (
            <button
              onClick={() => {
                handleLogout()
                setMobileOpen(false)
              }}
              className="block text-base font-semibold text-rose-600"
            >
              Log out
            </button>
          )}

          {!isHost && (
            <Button
              onClick={() => {
                goToListProperty()
                setMobileOpen(false)
              }}
              className="w-full"
            >
              List Your Property
            </Button>
          )}
        </div>
      )}

      {isHost && <HostMenuPanel open={hostMenuOpen} onClose={() => setHostMenuOpen(false)} />}
    </header>
  )
}
