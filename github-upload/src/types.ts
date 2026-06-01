export type AspectRatio = "1:1" | "4:5" | "16:9" | "9:16";
export type FontChoice = "sans" | "serif" | "mono";

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
  | "Modern";

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
  layout: "bottom" | "split" | "poster" | "stamp";
};

export type FrameSettings = {
  background: string;
  foreground: string;
  font: FontChoice;
  margin: number;
  ratio: AspectRatio;
};
