import { useEffect, useRef, useState } from 'react'

interface UsePriceOptions<T> {
  request: Record<string, unknown> | null
  fallback: T
}

/** Debounced fetch to the authoritative /api/price endpoint. The client
 * never computes totals itself — it only renders whatever the server
 * returns, so nothing here is tamperable. */
export function useServerPrice<T>({ request, fallback }: UsePriceOptions<T>) {
  const [data, setData] = useState<T>(fallback)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  useEffect(() => {
    if (!request) return
    const thisRequestId = ++requestId.current
    setLoading(true)
    setError(null)

    const t = setTimeout(async () => {
      try {
        const res = await fetch('/api/price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        })
        if (thisRequestId !== requestId.current) return
        if (!res.ok) throw new Error('Pricing service unavailable')
        const json = (await res.json()) as T
        setData(json)
      } catch (err) {
        if (thisRequestId !== requestId.current) return
        setError((err as Error).message)
      } finally {
        if (thisRequestId === requestId.current) setLoading(false)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, 250)

    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(request)])

  return { data, loading, error }
}
