# Rogers Cafe Qatar Brand Spec

Status: Rebrand in progress — demo content pending client confirmation

## Redesign Record

- Mode: Full rebrand to Rogers Cafe Qatar, keeping the proven app structure.
- Direction: Warm editorial utility, retaining the cream/burgundy/gold palette.
- Preserve: Home/Menu/Orders/Visit tabs, menu search and filters, dine-in/takeaway choice, quantity controls, the staff console (including its animated status sections), and the optional WhatsApp handoff.
- Update: All guest/admin copy, metadata, legal pages, and docs now say Rogers Cafe Qatar; menu data is cafe-themed demo content (coffee, iced drinks, tea, pastries, light bites, sandwiches).
- Add: `/gallery` route (client Google-listing photos with a keyboard lightbox) and `/reviews` route (honest Google Maps review links), linked from the homepage, menu bar, and footers.
- Remove: Delivery-partner links and every previous brand mark, contact detail, and identifier (cookies, env vars, table/file names).
- Highest risk: There is no order API. Live status comes only from staff actions in `/admin`; never invent ETAs or progress.
- Rollback: Git history retains the previous brand. Nothing is pushed without client approval.

## Brand Facts and Assets

- Name: Rogers Cafe Qatar (short brand: `ROGERS`; country label: `QATAR`).
- Location: Qatar. City/address not yet confirmed — do not claim a city anywhere in the UI.
- Phone / WhatsApp / map code / directions query / official profile: NOT PUBLISHED. Keep them `null` in `lib/contact.ts` until the client supplies real values; the UI hides unset actions and shows a "coming soon" notice instead.
- Logo: placeholder `public/brand/rogers-mark.svg`; final logo pending from the client.
- Gallery: client-supplied photos from the cafe's Google listing in `lib/gallery.ts`.
- Reviews: Google Maps short links in `lib/reviews.ts`. Quote, reviewer, rating, and date must be copied verbatim from the linked review or left `null`.
- Menu names, prices, and photography remain demo content; do not present them as confirmed facts.

## Design Read

- Artifact: Mobile-first cafe ordering app with a desktop-responsive counterpart.
- Audience: Residents and visitors discovering Rogers Cafe, browsing the menu, starting an order, or finding/contacting the cafe.
- Visual language: Warm editorial utility with tighter mobile proportions.
- Narrative role: App home (hero, featured drinks/food, menu, gallery preview, reviews), menu discovery, order review, then visit/contact.
- Visual temperature: Warm, calm, coffee-house.
- Motion intensity: 2/10. Short interaction feedback only; honor reduced-motion preferences.

## Approved System

- Palette: cream `#F7F4EE`, ink `#322624`, burgundy `#692336`, muted text `#81766F`, gold `#8F6F3B` / `#D8BD86`.
- Typography: existing display + sans stacks; mobile page headings ~28-32px, section headings 22-26px, body 14-16px.
- Imagery: Unsplash demo photos in `lib/menu.ts`; Google-hosted listing photos in `lib/gallery.ts`; placeholder SVG brand mark.

## Content Honesty Contract

- Contact values stay `null` until published; unset actions are hidden everywhere automatically.
- Review cards show only what was copied verbatim from the linked Google Maps review — never paraphrased or invented.
- Order status advances only through staff actions in `/admin`; the guest UI must not invent preparation times.
- Menu names/prices are demo content pending written client confirmation.