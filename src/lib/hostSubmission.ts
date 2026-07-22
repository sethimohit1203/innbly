import { z } from 'zod'
import { supabase } from './supabase'
import { submitToSheet } from './backend'

export const hostFormSchema = z.object({
  ownerName: z.string().trim().min(2, 'Enter your full name'),
  ownerEmail: z.string().trim().email('Enter a valid email address'),
  ownerPhone: z.string().trim().min(8, 'Enter a valid phone number'),

  propertyTitle: z.string().trim().min(4, 'Give your property a title'),
  propertyType: z.string().min(1, 'Select a property type'),
  description: z.string().trim().min(20, 'Add a bit more detail (20+ characters)'),

  city: z.string().trim().min(2, 'Enter a city'),
  neighborhood: z.string().trim().min(2, 'Enter a neighborhood or area'),
  address: z.string().trim().min(5, 'Enter a full address'),

  maxGuests: z.number().int().min(1, 'At least 1 guest').max(20, 'Max 20 guests'),
  pricePerNight: z.number().min(100, 'Enter a realistic nightly rate'),
  securityDeposit: z.number().min(0, 'Cannot be negative'),

  amenities: z.array(z.string()),
  photos: z
    .array(z.instanceof(File))
    .min(3, 'Upload at least 3 photos')
    .max(10, 'Up to 10 photos'),
  documents: z.array(z.instanceof(File)).max(5, 'Up to 5 documents'),

  agreedToTerms: z.boolean().refine((v) => v === true, { message: 'You must agree to the host terms' }),
})

export type HostFormValues = z.infer<typeof hostFormSchema>

async function uploadFiles(files: File[], prefix: string): Promise<string[]> {
  if (!supabase) throw new Error('Listing submissions are temporarily unavailable. Please try again later.')
  const urls: string[] = []
  for (const file of files) {
    const path = `${prefix}/${Date.now()}-${crypto.randomUUID()}-${file.name}`
    const { error } = await supabase.storage.from('host-uploads').upload(path, file)
    if (error) throw new Error(`Failed to upload ${file.name}: ${error.message}`)
    const { data } = supabase.storage.from('host-uploads').getPublicUrl(path)
    urls.push(data.publicUrl)
  }
  return urls
}

export async function submitHostListing(values: HostFormValues): Promise<string> {
  if (!supabase) throw new Error('Listing submissions are temporarily unavailable. Please try again later.')

  const [photoUrls, documentUrls] = await Promise.all([
    uploadFiles(values.photos, 'photos'),
    uploadFiles(values.documents, 'documents'),
  ])

  // Generated client-side (rather than left to the DB default) because the
  // anon key can only INSERT into host_submissions, not SELECT — so we
  // can't read back the row's generated id afterwards. Owning the id lets
  // the host's browser remember "this is mine" (see src/lib/myListings.ts)
  // without needing a SELECT policy that would otherwise let anyone read
  // anyone else's submission just by guessing an email.
  const id = crypto.randomUUID()

  const { error } = await supabase.from('host_submissions').insert({
    id,
    owner_name: values.ownerName,
    owner_email: values.ownerEmail,
    owner_phone: values.ownerPhone,
    property_title: values.propertyTitle,
    property_type: values.propertyType,
    description: values.description,
    city: values.city,
    neighborhood: values.neighborhood,
    address: values.address,
    max_guests: values.maxGuests,
    price_per_night: values.pricePerNight,
    security_deposit: values.securityDeposit,
    amenities: values.amenities,
    photo_urls: photoUrls,
    document_urls: documentUrls,
  })

  if (error) throw new Error(error.message)

  // Best-effort mirror to Google Sheets (+ email notification) — Supabase
  // above is the source of truth, so a Sheets hiccup shouldn't fail the
  // submission the host already sees as successful.
  submitToSheet('host-listing', {
    ownerName: values.ownerName,
    ownerEmail: values.ownerEmail,
    ownerPhone: values.ownerPhone,
    propertyTitle: values.propertyTitle,
    propertyType: values.propertyType,
    description: values.description,
    city: values.city,
    neighborhood: values.neighborhood,
    address: values.address,
    maxGuests: values.maxGuests,
    pricePerNight: values.pricePerNight,
    securityDeposit: values.securityDeposit,
    amenities: values.amenities,
    photoUrls,
    documentUrls,
  }).catch(() => {})

  return id
}
