/**
 * Rogers Cafe Qatar — gallery photos.
 * Photos supplied by the client from the cafe's Google listing.
 * The /gallery page and the homepage gallery preview both read this list.
 */
export interface GalleryPhoto {
  id: string;
  src: string;
  alt: string;
}

export const galleryPhotos: GalleryPhoto[] = [
  {
    id: "dining-room",
    src: "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWn_FS0SETYTwT4kHO6wy-JHo0rf3XnafVHPuNW_LLfU3PsNbQLuNUMHaLx3E2M5ld6MVkoRV10Qxzp_3w7hrci8cSooR5_pwRp-d13rpSckUyv2oZ-aap7vChop1uJMGhewSkF3Q8bRmsA=s948-k-no",
    alt: "Dining room at Rogers Cafe Qatar with warm lighting and set tables",
  },
  {
    id: "counter",
    src: "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkXwSoUUrrTRE4bEo_1048HRZtHC16ZoTU6zOZze2PT2jfZV-t5wGk7fIZg7-iCc8qtawG-gE7MpAB-Bs5bZHa03-0Vp_ERZREcjxMHftkObPIhrqY_goJYBjM0I8u-55M926lpSRIpMqwx=s711-k-no",
    alt: "Guests at the counter inside Rogers Cafe Qatar",
  },
];
