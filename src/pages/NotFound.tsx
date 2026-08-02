import { Link } from '~links'
import { Home, Search } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { usePageMeta } from '../hooks/usePageMeta'

/** Catch-all for any unmatched route — previously there was no fallback at
 * all, so a broken link (or a typo'd URL) rendered a blank page with just
 * the navbar and nothing else. */
export function NotFoundPage() {
  usePageMeta('Page Not Found', 'The page you were looking for could not be found on innbly.')

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-extrabold text-primary-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link to="/">
          <Button>
            <Home className="h-4 w-4" /> Back to Home
          </Button>
        </Link>
        <Link to="/search">
          <Button variant="outline">
            <Search className="h-4 w-4" /> Explore Stays
          </Button>
        </Link>
      </div>
    </div>
  )
}
