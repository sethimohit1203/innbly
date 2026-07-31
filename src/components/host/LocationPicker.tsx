import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'
import { Search, Loader2 } from 'lucide-react'

/** Free map provider (no API key): OpenStreetMap tiles via Leaflet, address
 * search/reverse-geocoding via Nominatim. Nominatim's usage policy caps
 * requests at ~1/sec and requires attribution + a real identifying
 * header — the debounce below and the visible "© OpenStreetMap" attribution
 * on the map satisfy that at this app's scale. Revisit (self-hosted
 * Nominatim, or a paid provider) if search volume grows significantly. */

// Leaflet's default marker icon paths resolve relative to the page URL and
// break under bundlers unless re-pointed at the bundled asset URLs.
const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

export interface LocationValue {
  address: string
  city: string
  neighborhood: string
  lat: number
  lng: number
}

interface NominatimResult {
  display_name: string
  lat: string
  lon: string
  address?: Record<string, string>
}

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629] // India centroid

function parseResult(r: NominatimResult): LocationValue {
  const a = r.address ?? {}
  return {
    address: r.display_name,
    city: a.city || a.town || a.village || a.state_district || a.state || '',
    neighborhood: a.suburb || a.neighbourhood || a.county || a.city_district || '',
    lat: Number(r.lat),
    lng: Number(r.lon),
  }
}

function DraggableMarker({ position, onMove }: { position: [number, number]; onMove: (lat: number, lng: number) => void }) {
  const markerRef = useRef<L.Marker>(null)
  useMapEvents({
    click(e) {
      onMove(e.latlng.lat, e.latlng.lng)
    },
  })
  return (
    <Marker
      draggable
      position={position}
      icon={defaultIcon}
      ref={markerRef}
      eventHandlers={{
        dragend: () => {
          const m = markerRef.current
          if (m) {
            const { lat, lng } = m.getLatLng()
            onMove(lat, lng)
          }
        },
      }}
    />
  )
}

function RecenterMap({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1]])
  return null
}

export function LocationPicker({ value, onChange }: { value: LocationValue | null; onChange: (v: LocationValue) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [searching, setSearching] = useState(false)
  const [reverseGeocoding, setReverseGeocoding] = useState(false)

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([])
      return
    }
    const timeout = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=in&q=${encodeURIComponent(query)}`,
          { headers: { 'Accept-Language': 'en' } },
        )
        setResults(res.ok ? ((await res.json()) as NominatimResult[]) : [])
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 600)
    return () => clearTimeout(timeout)
  }, [query])

  const selectResult = (r: NominatimResult) => {
    onChange(parseResult(r))
    setQuery('')
    setResults([])
  }

  const movePin = async (lat: number, lng: number) => {
    setReverseGeocoding(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lng}`, {
        headers: { 'Accept-Language': 'en' },
      })
      const data = res.ok ? ((await res.json()) as NominatimResult) : null
      onChange(data ? parseResult({ ...data, lat: String(lat), lon: String(lng) }) : { address: value?.address ?? '', city: value?.city ?? '', neighborhood: value?.neighborhood ?? '', lat, lng })
    } catch {
      onChange({ address: value?.address ?? '', city: value?.city ?? '', neighborhood: value?.neighborhood ?? '', lat, lng })
    } finally {
      setReverseGeocoding(false)
    }
  }

  const center: [number, number] = value ? [value.lat, value.lng] : DEFAULT_CENTER

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for your address"
          className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        />
        {searching && <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />}
        {results.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-card-hover">
            {results.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectResult(r)}
                className="block w-full truncate px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                {r.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 h-80 overflow-hidden rounded-2xl border border-slate-200">
        <MapContainer center={center} zoom={value ? 15 : 5} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap center={center} zoom={value ? 15 : 5} />
          <DraggableMarker position={center} onMove={movePin} />
        </MapContainer>
      </div>
      <p className="mt-2 text-xs text-slate-400">
        Drag the pin or search above — your exact address is only shared with guests after they've made a reservation.
      </p>
      {reverseGeocoding && <p className="mt-1 text-xs text-slate-400">Looking up address…</p>}
      {value?.address && <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{value.address}</div>}
    </div>
  )
}
