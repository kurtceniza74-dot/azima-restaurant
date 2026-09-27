# Rogers Cafe Qatar App

This Next.js app provides a guest ordering experience for Rogers Cafe Qatar and a separate staff-only order dashboard.

## Files

- `components/restaurant-app.tsx` (guest app, four tabs)
- `components/ui/mac-os-menu-bar.tsx`, `components/ui/specials-linear-carousel.tsx`
- `lib/menu.ts`, `lib/contact.ts`, `lib/gallery.ts`, `lib/reviews.ts`
- `app/globals.css` (Tailwind theme source)

## Install dependencies

```bash
npm install
```

## Run locally

```bash
npm run dev          # development server
npm run typecheck    # tsc --noEmit
npm run build        # production build
npm start            # serve the production build
```

Menu prototype prices are formatted in Qatari riyals.

## Guest experience

`app/page.tsx` renders `components/restaurant-app.tsx`, a responsive client component with four tabs: Home, Menu, Orders, and Visit. A macOS-style menu bar drives navigation on desktop — with direct links to the `/gallery` and `/reviews` routes — and both it and the phone's sticky header hide on downward scroll and return on upward scroll or near the top. The two headers share one passive scroll listener (`useIsScrolledDown`) lifted into `RestaurantApp`, so the page never re-renders the tree on a scroll tick that does not change direction. An open menu also pins the bar in place so it cannot slide away mid-interaction. The `/gallery` route renders `components/gallery-view.tsx` (photo grid + keyboard lightbox), and `/reviews` renders `components/reviews-section.tsx`, the same honest review cards shown on the homepage.

Menu filters open as an iOS-style popover: the panel springs open with staggered, blurring-in rows and a highlight that glides to the pointed row. Because scroll-revealed sections create their own stacking contexts, the panel is rendered through a portal on `<body>` and positioned against its trigger, so it always floats above the cards. The menu bar's Browse/Rogers menus and the phone navigation use the same spring pop and inner `prefers-reduced-motion` fallbacks.

The Visit tab lists the cafe's dine-in, takeaway, and gathering services plus honest contact blocks: call, WhatsApp, map code (tap to copy), directions, and official-profile links render only when the corresponding value is set in `lib/contact.ts` — until then a "coming soon" notice is shown instead of invented details. Review cards only display a quote, rating, reviewer, or date when it was copied verbatim from the linked Google Maps review (`lib/reviews.ts`).

Adding a dish with **+** raises a floating cart automatically. The cart lists every added item with thumbnails, unit and line prices, and its own quantity steppers, plus a running subtotal, a **Clear cart** action, and a chevron that collapses it back to a summary pill. It stays visible on Home, Menu, and Visit while items are in it, and a new **+** re-opens it if it was collapsed. **Review Order** opens the order screen; while an older order is still being tracked the button reads **Start new order** and begins a fresh order with the newly added items. **Order now · QAR amount** creates the order through `POST /api/orders`, submits it with `PATCH /api/orders/[code]`, and then tracks it live by polling that same endpoint. Sending a WhatsApp notification afterwards is optional.

## Guest Orders and Admin

Guests can build an order without an account. The app creates a four-letter order code, submits the request directly to the kitchen, and shows the guest live status; the request is saved in SQLite and appears in the admin dashboard at `/admin`.

Buyers do not sign in. Admin access uses a server-side scrypt password hash, a signed HTTP-only session cookie, CSRF tokens, same-origin checks, and rate limits. Set up an admin account interactively in a terminal:

```bash
npm run admin:setup
```

The setup command writes the password hash and the session secret to `.env.local` (the deployment source) and to a runtime store at `.data/admin-credentials.json`, so rotating the password takes effect without a server restart and the signing secret never lives inside the source tree. Only the scrypt hash is stored, so the password itself cannot be recovered — re-run `npm run admin:setup` to rotate it, which also signs every existing session out. `.env.local` and the whole `.data/` directory are git-ignored.

Order status changes are shared with guest tracking. Admins can confirm or decline submitted orders, then mark confirmed orders delivered. The guest page does not invent preparation times or progress. Real kitchen updates require staff actions in `/admin`.

The SQLite file store is for a single persistent Node.js server. The in-memory rate limiter is per process. Before a multi-instance or serverless deployment, configure a shared database and shared rate-limit store, and ensure the trusted reverse proxy sets and sanitizes `X-Forwarded-Proto` / `X-Forwarded-For`.
