import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility · Rogers Cafe Qatar",
  description: "Accessibility approach and contact options for the Rogers Cafe Qatar website.",
};

export default function AccessibilityPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-14">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8f6f3b]">Rogers · Qatar</p>
      <h1 className="mt-3 font-display text-3xl">Accessibility</h1>
      <p className="mt-2 text-sm text-[#81766f]">
        This statement describes the site&apos;s current approach. It is not a certification of compliance
        with any particular accessibility standard.
      </p>
      <div className="mt-8 space-y-6 text-sm leading-7 text-[#4a423c]">
        <section aria-labelledby="access-approach">
          <h2 id="access-approach" className="font-display text-xl text-[#322624]">Our approach</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>Semantic landmarks, labelled form controls, and real buttons for actions.</li>
            <li>Keyboard-operable tabs, filters, dialogs, the gallery lightbox, and the staff console.</li>
            <li>Visible focus styling and reduced-motion support for animations.</li>
            <li>Responsive layouts intended to work from small phones to desktop.</li>
          </ul>
        </section>
        <section aria-labelledby="access-limits">
          <h2 id="access-limits" className="font-display text-xl text-[#322624]">Known limits</h2>
          <p className="mt-2">
            Photography — menu and gallery — uses short descriptive labels; decorative background art is hidden from assistive
            technology. Contrast, heading order, and screen-reader behavior should be re-checked whenever the
            menu, theme, or content changes.
          </p>
        </section>
        <section aria-labelledby="access-feedback">
          <h2 id="access-feedback" className="font-display text-xl text-[#322624]">Feedback</h2>
          <p className="mt-2">
            Guests who encounter an accessibility barrier can contact the cafe through the phone or
            WhatsApp details on the Visit tab when they are published. The client should add its preferred accessibility contact here
            before production use.
          </p>
        </section>
      </div>
    </main>
  );
}
