import ExifReader from "exifreader";
import type { PhotoMeta } from "./types";

const EMPTY = "—";

function description(tags: Record<string, { description?: unknown } | undefined>, keys: string[]): string {
  for (const key of keys) {
    const value = tags[key]?.description;
    if (value !== undefined && value !== "") return String(value);
  }
  return EMPTY;
}

function clean(value: string, suffix = ""): string {
  return value === EMPTY ? value : `${value}${suffix}`;
}

export async function readExif(file: File): Promise<PhotoMeta> {
  try {
    const tags = await ExifReader.load(file, { expanded: true });
    const exif = tags.exif ?? {};
    const gps = tags.gps;
    const date = description(exif as Record<string, { description?: unknown } | undefined>, ["DateTimeOriginal", "DateTimeDigitized", "DateTime"]);
    const latitude = gps?.Latitude;
    const longitude = gps?.Longitude;

    return {
      camera: description(exif as Record<string, { description?: unknown } | undefined>, ["Model"]),
      lens: description(exif as Record<string, { description?: unknown } | undefined>, ["LensModel", "Lens"]),
      aperture: clean(description(exif as Record<string, { description?: unknown } | undefined>, ["FNumber"]), " "),
      shutter: description(exif as Record<string, { description?: unknown } | undefined>, ["ExposureTime"]),
      iso: description(exif as Record<string, { description?: unknown } | undefined>, ["ISOSpeedRatings", "PhotographicSensitivity"]),
      focalLength: clean(description(exif as Record<string, { description?: unknown } | undefined>, ["FocalLength"]), ""),
      date: date === EMPTY ? EMPTY : date.replace(/:/g, "-").replace(/-(\d{2})-(\d{2}) /, "-$1-$2 "),
      location: latitude !== undefined && longitude !== undefined
        ? `${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}`
        : EMPTY,
    };
  } catch {
    return emptyMeta();
  }
}

export function emptyMeta(): PhotoMeta {
  return {
    camera: EMPTY,
    lens: EMPTY,
    aperture: EMPTY,
    shutter: EMPTY,
    iso: EMPTY,
    focalLength: EMPTY,
    date: EMPTY,
    location: EMPTY,
  };
}
