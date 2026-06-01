export type AspectRatio = "1:1" | "4:5" | "16:9" | "9:16";
export type FontChoice = "sans" | "serif" | "mono" | "typewriter" | "hand";
export type InfoLayout = "template" | "below" | "inside-left" | "inside-right" | "clean";
export type InfoKey = keyof PhotoMeta;

export type PhotoMeta = {
  camera: string;
  lens: string;
  aperture: string;
  shutter: string;
  iso: string;
  focalLength: string;
  date: string;
  location: string;
};

export type TemplateCategory =
  | "Minimal"
  | "Film"
  | "Street"
  | "Magazine"
  | "Travel"
  | "Journal"
  | "Classic"
  | "Modern"
  | "White"
  | "Instant"
  | "Analog";

export type Template = {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  background: string;
  foreground: string;
  accent: string;
  font: FontChoice;
  margin: number;
  layout: "bottom" | "split" | "poster" | "stamp" | "polaroid" | "camera-strip" | "analog-print" | "minimal-print";
};

export type FrameSettings = {
  background: string;
  foreground: string;
  font: FontChoice;
  margin: number;
  frameWidth: number;
  footerHeight: number;
  ratio: AspectRatio;
  infoLayout: InfoLayout;
  visibleInfo: InfoKey[];
  infoOrder: InfoKey[];
};
