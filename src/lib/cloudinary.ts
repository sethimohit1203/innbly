const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined

/** Uploads directly from the browser to Cloudinary using an unsigned upload
 * preset — safe to expose client-side (it can only accept uploads into the
 * configured folder/preset, not read or delete anything), the same trust
 * model as the Supabase anon key. Returns the public HTTPS URL Cloudinary
 * assigns the file. */
export async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Listing submissions are temporarily unavailable. Please try again later.')
  }

  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', UPLOAD_PRESET)
  body.append('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
    method: 'POST',
    body,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error?.message ?? `Failed to upload ${file.name}`)
  }

  const data = await res.json()
  return data.secure_url as string
}
