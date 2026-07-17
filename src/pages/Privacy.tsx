import { Footer } from '../components/Footer'

export function PrivacyPage() {
  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: January 2026</p>

        <div className="prose prose-slate mt-8 max-w-none space-y-6 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="text-lg font-bold text-slate-900">What we collect</h2>
            <p className="mt-2">
              When you search for a stay, schedule a visit, sign up, or contact us, we collect the details you
              provide directly: your name, email address, phone number, and any message content. We also store
              which property you're interested in and your preferred visit date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">How we use it</h2>
            <p className="mt-2">
              We use this information to connect you with property hosts, schedule visits, respond to your
              enquiries, and send you updates about listings you've asked to hear about. We do not sell your data
              to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Where it's stored</h2>
            <p className="mt-2">
              Visit requests, signups, newsletter subscriptions, and contact messages are stored in a private
              Google Sheet operated by innbly, and a copy is kept in your browser's local storage so the host
              dashboard can display leads immediately. If you sign in with Google, we only receive your name and
              email address from your Google account — never your password.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Your choices</h2>
            <p className="mt-2">
              You can ask us to delete your information at any time by emailing{' '}
              <a href="mailto:innblysupport@gmail.com" className="font-semibold text-primary-600 hover:underline">
                innblysupport@gmail.com
              </a>
              . You can also unsubscribe from newsletter emails at any time using the same contact.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Contact</h2>
            <p className="mt-2">
              Questions about this policy? Reach us at{' '}
              <a href="mailto:innblysupport@gmail.com" className="font-semibold text-primary-600 hover:underline">
                innblysupport@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  )
}
