import { Footer } from '../components/Footer'

export function TermsPage() {
  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: January 2026</p>

        <div className="prose prose-slate mt-8 max-w-none space-y-6 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="text-lg font-bold text-slate-900">Using innbly</h2>
            <p className="mt-2">
              innbly is a platform that connects tenants looking for PGs, coliving spaces, and rentals with
              independent property hosts. We help you discover listings, schedule visits, and communicate with
              hosts. innbly is not a party to any rental agreement between a tenant and a host.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Listings</h2>
            <p className="mt-2">
              Hosts are responsible for the accuracy of their listing details, pricing, and availability. While we
              apply a verification process to badge certain listings, innbly does not guarantee the condition,
              legality, or availability of any property at all times.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Visit scheduling</h2>
            <p className="mt-2">
              Scheduling a visit through the site sends your details to the property host so they can confirm a
              time with you directly. innbly does not charge for scheduling a visit and does not guarantee a host
              will be available at your requested time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Accounts</h2>
            <p className="mt-2">
              Signing up personalizes your experience and lets hosts identify you as a genuine enquiry. It is not a
              secure, password-protected account system — please don't share sensitive financial information
              through the site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Changes to these terms</h2>
            <p className="mt-2">
              We may update these terms from time to time. Continued use of the site after a change means you
              accept the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Contact</h2>
            <p className="mt-2">
              Questions about these terms? Reach us at{' '}
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
