import { MessageSquare } from 'lucide-react'
import { usePageMeta } from '../../hooks/usePageMeta'

/** There's no host-guest messaging system in this app yet (bookings unlock
 * a WhatsApp deep-link instead, see CLAUDE.md's "Chat with Host" section) —
 * this page is honest about that rather than showing fabricated threads,
 * matching the "no leads yet" pattern already used on HostLeads. */
export function HostMessagesPage() {
  usePageMeta('Messages', 'Guest and platform messages for your host account.')

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-slate-900">Messages</h2>
      <p className="mb-6 text-sm text-slate-500">Conversations with guests and innbly support.</p>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
        <MessageSquare className="h-8 w-8 text-slate-300" />
        <p className="mt-3 font-semibold text-slate-600">No messages yet</p>
        <p className="mt-1 max-w-sm text-sm text-slate-400">
          Once a guest books one of your stays, use the "Chat with Host" link on their booking to talk directly on
          WhatsApp — a full in-app inbox is on the roadmap.
        </p>
      </div>
    </div>
  )
}
