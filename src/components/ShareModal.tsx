import { useState } from 'react'
import { X, Link2, Mail, MessageCircle, MessagesSquare, Facebook, Twitter, Code2, MoreHorizontal } from 'lucide-react'
import { useToast } from '../context/ToastContext'

interface ShareModalProps {
  title: string
  subtitle: string
  imageUrl?: string
  url: string
  onClose: () => void
}

/** Airbnb-style "Share this place" grid — every option here is a real,
 * working share target (mailto/sms/wa.me/social intent URLs, or a real
 * clipboard copy), not decorative. "More options" falls back to the
 * native share sheet where the browser supports it. */
export function ShareModal({ title, subtitle, imageUrl, url, onClose }: ShareModalProps) {
  const { showToast } = useToast()
  const [copied, setCopied] = useState(false)
  const shareText = `Check out ${title} on innbly`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      showToast('Could not copy the link — copy it from the address bar instead.', 'error')
    }
  }

  const openShareTarget = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer,width=600,height=500')
  }

  const options = [
    {
      label: 'Copy Link',
      icon: Link2,
      onClick: copyLink,
    },
    {
      label: 'Email',
      icon: Mail,
      onClick: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`${shareText}\n\n${url}`)}`
      },
    },
    {
      label: 'Messages',
      icon: MessagesSquare,
      onClick: () => {
        window.location.href = `sms:?body=${encodeURIComponent(`${shareText} ${url}`)}`
      },
    },
    {
      label: 'WhatsApp',
      icon: MessageCircle,
      onClick: () => openShareTarget(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`),
    },
    {
      label: 'Facebook',
      icon: Facebook,
      onClick: () => openShareTarget(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`),
    },
    {
      label: 'Twitter',
      icon: Twitter,
      onClick: () => openShareTarget(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`),
    },
    {
      label: 'Embed',
      icon: Code2,
      onClick: async () => {
        const snippet = `<iframe src="${url}" width="400" height="300" style="border:0;" loading="lazy"></iframe>`
        try {
          await navigator.clipboard.writeText(snippet)
          showToast('Embed code copied to clipboard')
        } catch {
          showToast('Could not copy the embed code.', 'error')
        }
      },
    },
    {
      label: 'More options',
      icon: MoreHorizontal,
      onClick: async () => {
        if (navigator.share) {
          try {
            await navigator.share({ title, text: shareText, url })
          } catch {
            // User cancelled the native share sheet — not an error.
          }
        } else {
          copyLink()
        }
      },
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Share this place</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 p-3">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />
          ) : (
            <div className="h-14 w-14 rounded-lg bg-slate-100" />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{title}</p>
            <p className="truncate text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={opt.onClick}
              className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <opt.icon className="h-4.5 w-4.5 text-slate-500" />
              {opt.label === 'Copy Link' && copied ? 'Copied!' : opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
