import {
  Building2,
  Home,
  Palmtree,
  Warehouse,
  Trees,
  TreeDeciduous,
  Tent,
  BedDouble,
  KeyRound,
  Users,
  School,
  Building,
  BedSingle,
  Landmark,
  Castle,
  ParkingSquare,
  HousePlus,
  MapPin,
  Sprout,
  Wheat,
  Sailboat,
  Sparkles,
  UtensilsCrossed,
  Box,
} from 'lucide-react'
import { PROPERTY_TYPES, type PropertyType } from '../types'

const ICONS: Record<PropertyType, React.ComponentType<{ className?: string }>> = {
  Hotels: Building2,
  Apartments: Home,
  Resorts: Palmtree,
  Villas: Warehouse,
  Cabins: Trees,
  Cottages: TreeDeciduous,
  'Glamping Sites': Tent,
  'Serviced Apartments': BedDouble,
  'Holiday Homes': KeyRound,
  'Guest Houses': Users,
  Hostels: School,
  Motels: Building,
  'B&Bs': BedSingle,
  Ryokans: Landmark,
  Riads: Castle,
  'Holiday Parks': ParkingSquare,
  Homestays: HousePlus,
  Campsites: MapPin,
  'Country Houses': Sprout,
  'Farm Stays': Wheat,
  Boats: Sailboat,
  'Luxury Tents': Sparkles,
  'Self Catering Accommodation': UtensilsCrossed,
  'Tiny Houses': Box,
}

export function PropertyTypeScroller({
  active,
  onChange,
}: {
  active: PropertyType | 'all'
  onChange: (type: PropertyType | 'all') => void
}) {
  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
      <button
        onClick={() => onChange('all')}
        className={`flex shrink-0 flex-col items-center gap-1.5 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all ${
          active === 'all'
            ? 'border-primary-600 bg-primary-600 text-white'
            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
        }`}
      >
        <Building2 className="h-4 w-4" />
        All Types
      </button>
      {PROPERTY_TYPES.map((type) => {
        const Icon = ICONS[type]
        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={`flex shrink-0 flex-col items-center gap-1.5 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all ${
              active === type
                ? 'border-primary-600 bg-primary-600 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="whitespace-nowrap">{type}</span>
          </button>
        )
      })}
    </div>
  )
}
