import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy · Rogers Cafe Qatar",
  description:
    "How Rogers Cafe Qatar handles guest orders, admin sign-in, and essential cookies on this website.",
};

const updated = "September 2026";

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-14">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8f6f3b]">Rogers · Qatar</p>
      <h1 className="mt-3 font-display text-3xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-[#81766f]">Last updated: {updated}.</p>
      <div className="mt-8 space-y-6 text-sm leading-7 text-[#4a423c]">
        <p>
          This page describes what this website actually collects. It does not use marketing cookies,
          analytics beacons, advertising trackers, newsletters, or customer accounts.
        </p>
        <section aria-labelledby="privacy-collect">
          <h2 id="privacy-collect" className="font-display text-xl text-[#322624]">What is collected</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <strong>Guest orders:</strong> the dishes, quantities, dine-in/takeaway choice, subtotal,
              order code, and order status needed to run the kitchen queue.
            </li>
            <li>
              <strong>Staff admin sign-in:</strong> the admin username and a one-way password check used
              only to protect the staff console at <code>/admin</code>. Passwords are stored as
              one-way hashes, never as readable text.
            </li>
            <li>
              <strong>WhatsApp handoff:</strong> if a guest taps an order or contact button, their own
              WhatsApp app opens with an order message. That conversation is handled by WhatsApp, not
              by this website.
            </li>
          </ul>
        </section>
        <section aria-labelledby="privacy-cookies">
          <h2 id="privacy-cookies" className="font-display text-xl text-[#322624]">Cookies</h2>
          <p className="mt-2">
            The site uses only essential, functional cookies: one that remembers a guest&apos;s own
            order while it is tracked, and one that keeps a Rogers Cafe staff member signed in to
            the admin console for up to 8 hours. There are no advertising or analytics cookies, so no
            cookie-consent banner is shown.
          </p>
        </section>
        <section aria-labelledby="privacy-logs">
          <h2 id="privacy-logs" className="font-display text-xl text-[#322624]">Server logs and retention</h2>
          <p className="mt-2">
            The hosting provider may keep routine server logs (such as request times and technical
            error records) to keep the service running. Orders remain in the cafe&apos;s order
            store until staff remove or replace them as part of normal operations.
          </p>
        </section>
        <section aria-labelledby="privacy-third">
          <h2 id="privacy-third" className="font-display text-xl text-[#322624]">Third-party services</h2>
          <p className="mt-2">
            Menu photos load from Unsplash and cafe gallery photos load from Google Photos. Opening
            a map link, phone link, WhatsApp button, Google Maps review link, or a published
            official profile link opens that third party&apos;s service, which applies its own
            privacy policy.
          </p>
        </section>
        <section aria-labelledby="privacy-contact">
          <h2 id="privacy-contact" className="font-display text-xl text-[#322624]">Privacy questions</h2>
          <p className="mt-2">
            For questions about an order or personal information, contact the cafe through the
            phone or WhatsApp details on the Visit tab when they are published. The client should
            replace this paragraph with the business&apos;s preferred privacy contact before
            production use.
          </p>
        </section>
      </div>
    </main>
  );
}
