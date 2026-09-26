# Third-party notices

This project uses third-party packages, fonts, icons, images, and services. Ownership and license terms below are summarized to reduce licensing risk; the client should confirm any item marked for review before commercial use.

## Packages (npm)

| Package | License (per package metadata) | Notes |
|---|---|---|
| next, react, react-dom | MIT | Core framework/runtime. |
| drizzle-orm, better-sqlite3 | MIT | Order storage. `better-sqlite3` is a native module; verify it builds on the deployment host. |
| framer-motion | MIT | UI animation in guest and admin experiences. |
| lucide-react | ISC | Icon set used across the site and admin console. |
| clsx, tailwind-merge | MIT | Class-name utilities. |
| tailwindcss, @tailwindcss/postcss, postcss | MIT | Styling pipeline. |
| typescript, @types/* | Apache-2.0 / MIT | Build-time only. |

Run `npm audit` before handover; this audit found 0 vulnerabilities at the time of review.

## Images and brand assets

- `public/brand/rogers-mark.svg`: a simple placeholder "R" mark created for this project. **Client must supply (or approve) the final logo** before launch. The legacy profile image from the previous brand has been removed from `public/brand/`.
- Menu photos in `lib/menu.ts` load from Unsplash CDN URLs (`images.unsplash.com`). Unsplash content is subject to the Unsplash license/terms; hotlinking also depends on Unsplash availability. **Client should confirm** whether to keep Unsplash hotlinks or replace them with owned, locally hosted food photography before sale.
- Gallery photos in `lib/gallery.ts` were supplied by the client from the cafe's own Google listing and load from Google's photo CDN (`lh3.googleusercontent.com`). **Client confirms it holds the rights** to these listing photos.
- No other stock imagery is bundled.

## External services and links

- WhatsApp (`wa.me`), Google Maps directions/search, and `maps.app.goo.gl` review short links are outbound links only. Their names, sites, and services belong to their respective owners. Do not present them as partnerships unless the client provides written evidence.
- Google-hosted gallery images (`lh3.googleusercontent.com`) are loaded as third-party CDN content.
- No analytics, advertising, payment, or email-marketing vendor is integrated.

## Unclear / needs client confirmation

1. The final logo (only a placeholder mark exists today).
2. Whether Unsplash menu photos may be used commercially, or must be replaced with client-owned photography.
3. Whether the Google listing photos supplied for the gallery may be used on the website.
4. Menu names, prices, and availability are demo content until the cafe confirms them in writing.
5. Review quotes/ratings/dates: fill them in `lib/reviews.ts` only by copying them verbatim from the linked Google Maps review.
