export interface GoogleProfile {
  name: string
  email: string
  picture?: string
}

/** Decodes the JWT payload from a Google Identity Services credential. No signature
 * verification happens client-side — this is fine for personalizing the UI, but a real
 * backend would need to verify the token before trusting it for anything sensitive. */
export function decodeGoogleCredential(credential: string): GoogleProfile | null {
  try {
    const payloadB64 = credential.split('.')[1]
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))
    return { name: payload.name, email: payload.email, picture: payload.picture }
  } catch {
    return null
  }
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void
          renderButton: (el: HTMLElement, options: Record<string, unknown>) => void
        }
      }
      translate?: {
        TranslateElement: new (options: object, id: string) => void
      }
    }
    googleTranslateElementInit?: () => void
  }
}
