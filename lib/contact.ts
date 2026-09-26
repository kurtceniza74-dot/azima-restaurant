/**
 * Rogers Cafe Qatar — central content config.
 *
 * Every contact value below is a placeholder until the cafe supplies the real
 * detail. Keep `null` for anything not yet confirmed: the UI hides that action
 * instead of showing invented contact information. Setting a value here makes
 * the matching button appear everywhere automatically. Edit only this file.
 */

/** Business facts confirmed by the brand name itself. */
export const siteName = "Rogers Cafe Qatar";
export const brandShortName = "ROGERS";
export const countryLabel = "QATAR";

/** Display number, e.g. `+974 5555 0123`. `null` = not published yet. */
const phoneNumber: string | null = null;

export const phoneDisplay = phoneNumber;
export const phoneHref = phoneNumber ? `tel:${(phoneNumber as string).replace(/[^\d+]/g, "")}` : null;

/** International digits without `+`, e.g. `97455550123`. `null` = not published yet. */
const whatsappNumber: string | null = null;

export const whatsappDisplay = whatsappNumber ? `+${whatsappNumber}` : null;
export const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null;

/** Google Maps plus code shown on the Visit tab. `null` = not published yet. */
export const mapCode: string | null = null;

/** Map search text for directions, e.g. `Rogers Cafe Qatar`. `null` = not published yet. */
const directionsQuery: string | null = null;

export const directionsUrl = directionsQuery
  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(directionsQuery)}`
  : null;

/** Official listing/profile link supplied by the cafe. `null` = not published yet. */
export const officialProfileUrl: string | null = null;

