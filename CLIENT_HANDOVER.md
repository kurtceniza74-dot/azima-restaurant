# Client handover — Rogers Cafe Qatar website

> Templates and summaries in this repository (including privacy/terms/accessibility pages) require review by the business/client or qualified legal counsel before production use.

## What is included

- Custom restaurant website with a polished, modern GUI.
- Responsive desktop/tablet/mobile design.
- Easy-to-use navigation (Home, Menu, Orders, Visit) plus `/gallery` and `/reviews` routes.
- Cafe branding integration (Rogers burgundy/cream guest theme; matching burgundy/cream staff console).
- Menu and content presentation with search, filters, and item cards.
- Photo gallery page (`/gallery`) built from client-supplied Google listing photos.
- Honest review cards linking to the cafe's own Google Maps reviews (homepage section and `/reviews`); no quote, rating, reviewer, or date is shown unless copied verbatim from the linked review.
- Contact/location information shown only when published in `lib/contact.ts`: map code, call/WhatsApp/directions links, and official-profile link — all hidden (with a "coming soon" notice) while unset.
- Social/profile links where supplied by the client.
- Basic SEO setup (metadata, Open Graph, sitemap, robots).
- Performance-conscious implementation (static guest shell, self-hosted font, minimal third parties).
- Security configuration and code review (this audit pass).
- Secure staff login for the `/admin` order console, including rate limiting, CSRF protection, and hashed credentials.
- Deployment setup guidance and GitHub repository setup.
- Basic bug fixing before handover.
- Browser compatibility checks (modern evergreen browsers).
- Basic accessibility checks.
- Basic privacy/security review.
- Instructions for editing content (see “Editing content” below).
- Short handover/support period — duration to be agreed with the client (customizable).

## What is not included

- Domain name purchase/renewal.
- Hosting/server fees. Hosting is not included in the website development price unless specifically stated. The current selected hosting option may cost approximately USD 3/month. Hosting prices, limits, availability, and terms are determined by the hosting provider and may change.
- Paid email hosting.
- Payment gateway fees.
- Online ordering platform fees.
- Third-party subscription fees.
- Premium plugins/services.
- Photography/video production.
- Logo redesign unless separately agreed.
- Restaurant menu data entry beyond the agreed scope.
- Ongoing unlimited changes.
- Ongoing maintenance after the agreed support period.
- Legal advice.
- Guaranteed legal/regulatory compliance.
- Guaranteed cybersecurity / protection from all attacks.
- PCI-DSS compliance unless separately implemented and audited.
- Payment processing unless specifically contracted.
- Database/backend development beyond the current agreed functionality (guest orders + staff order console backed by a single-server SQLite store).
- SEO ranking guarantees.
- Google Ads/social advertising.
- Domain ownership costs.
- Future hosting price increases.

## Client responsibilities

- Provide the correct business name, address, contacts, menu, prices, images, logo, and opening hours.
- Confirm it has rights to supplied images, logo, and content.
- Approve final text and prices in writing.
- Provide required legal/privacy/business disclosures.
- Keep admin credentials secure and rotate them if staff change.
- Pay domain, hosting, payment processor, email, and third-party recurring charges.
- Notify the developer when business information changes.

## Security disclaimer

Reasonable security measures and standard web-development practices are implemented as part of the project. No website or online service can be guaranteed to be completely secure or immune from future vulnerabilities, attacks, third-party outages, or changes in law. Ongoing maintenance, updates, backups, monitoring, and credential management remain important after handover.

## Service/hosting disclaimer

Hosting is a separate third-party service. If the current selected plan is approximately $3/month, state: hosting is not included in the website development price unless specifically stated. The current selected hosting option may cost approximately USD 3/month. Hosting prices, limits, availability, and terms are determined by the hosting provider and may change. Domain registration, email hosting, payment processing, and delivery-platform relationships are also separate third-party services.

## Editing content

- Site name, short brand, and country label: edit `lib/contact.ts` (`siteName`, `brandShortName`, `countryLabel`).
- Menu items/prices/categories: edit `lib/menu.ts` (`menuItems`, `menuCategories`, `featuredDrinkIds`, `featuredFoodIds`).
- Contact details (phone, WhatsApp, map code, directions query, official profile): edit `lib/contact.ts` — keep `null` for anything not yet published; the UI hides that action automatically.
- Gallery photos: edit `lib/gallery.ts` (`galleryPhotos`).
- Review sources and verbatim quotes: edit `lib/reviews.ts` (`reviewSources`).
- Guest copy and layout: edit `components/restaurant-app.tsx`.
- Staff console: edit `components/admin-dashboard.tsx`.
- Gallery/reviews pages: edit `app/gallery/page.tsx`, `app/reviews/page.tsx`.
- Legal pages: edit `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/accessibility/page.tsx`.
- After content edits, run `npm run typecheck` and `npm run build`, then redeploy.

## Deployment notes

- The app needs a single persistent Node.js server because orders live in a local SQLite file (`.data/rogers.sqlite`, git-ignored and not deployed).
- Set `ROGERS_ADMIN_USERNAME`, `ROGERS_ADMIN_PASSWORD_HASH`, and `ROGERS_ADMIN_SESSION_SECRET` as environment variables on the host (created locally with `npm run admin:setup`), then redeploy/restart.
- Deployments reset the local order store unless the host provides a persistent disk/volume. Do not treat the default free-tier filesystem as durable order storage.
- Replace the placeholder sitemap/robots origin (`https://rogers-cafe-qatar.example.com`) with the real production domain.
