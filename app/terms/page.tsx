import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use · Rogers Cafe Qatar",
  description: "Basic website terms for Rogers Cafe Qatar guests and staff users.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-14">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8f6f3b]">Rogers · Qatar</p>
      <h1 className="mt-3 font-display text-3xl">Website Terms</h1>
      <p className="mt-2 text-sm text-[#81766f]">
        Template only — the business/client or qualified legal counsel should review these terms before production use.
      </p>
      <div className="mt-8 space-y-6 text-sm leading-7 text-[#4a423c]">
        <section aria-labelledby="terms-orders">
          <h2 id="terms-orders" className="font-display text-xl text-[#322624]">Orders</h2>
          <p className="mt-2">
            Menu items, prices, and availability shown here are a demo presentation until the cafe confirms
            them. Placing an order on this site sends a request to the kitchen; the cafe confirms, declines, or
            completes it in the staff console. Some orders may also be completed through WhatsApp.
          </p>
        </section>
        <section aria-labelledby="terms-use">
          <h2 id="terms-use" className="font-display text-xl text-[#322624]">Acceptable use</h2>
          <p className="mt-2">
            Guests agree not to misuse the ordering system, attempt to access the staff console without authorization,
            or interfere with the service. Staff accounts are for authorized cafe personnel only and must be kept confidential.
          </p>
        </section>
        <section aria-labelledby="terms-content">
          <h2 id="terms-content" className="font-display text-xl text-[#322624]">Content and liability</h2>
          <p className="mt-2">
            The cafe aims for accurate menus and published contact details but does not promise uninterrupted availability,
            specific preparation times, or particular results. Review cards are plain links to the cafe&apos;s own reviews
            on Google Maps; no review text, rating, or date is shown unless it was copied from the linked review.
            To the extent permitted by applicable law, the cafe
            is not liable for delays, third-party service outages (including WhatsApp, maps, or delivery platforms), or
            guest-supplied device issues.
          </p>
        </section>
        <section aria-labelledby="terms-law">
          <h2 id="terms-law" className="font-display text-xl text-[#322624]">Governing information</h2>
          <p className="mt-2">
            The client should confirm the governing law, business registration details, and consumer-contact information
            for Qatar before production use.
          </p>
        </section>
      </div>
    </main>
  );
}
