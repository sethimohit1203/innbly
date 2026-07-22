import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

export function MobileFilterSheet({
  open,
  onClose,
  resultCount,
  children,
}: {
  open: boolean
  onClose: () => void
  resultCount: number
  children: ReactNode
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end bg-slate-900/50 sm:hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] w-full flex-col rounded-t-3xl bg-white"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-extrabold text-slate-900">Filters</h2>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">{children}</div>
            <div className="shrink-0 border-t border-slate-100 p-4">
              <button
                onClick={onClose}
                className="w-full rounded-2xl bg-primary-600 py-3.5 text-sm font-bold text-white shadow-card"
              >
                Show {resultCount} stay{resultCount === 1 ? '' : 's'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
