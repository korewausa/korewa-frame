import type { Template } from "./types";

export const templates: Template[] = [
  { id: "minimal-print", name: "Minimal Print", category: "White", description: "Simple centered photo print", background: "#ffffff", foreground: "#111111", accent: "#777777", font: "sans", margin: 4, layout: "minimal-print" },
  { id: "minimal-print-compact", name: "Minimal Compact", category: "White", description: "Compact centered photo print", background: "#ffffff", foreground: "#111111", accent: "#777777", font: "sans", margin: 4, layout: "minimal-print" },
  { id: "camera-strip-white", name: "EXIF Strip", category: "White", description: "Simple left and right strip", background: "#ffffff", foreground: "#242424", accent: "#242424", font: "sans", margin: 4, layout: "camera-strip" },
];

export const categories = ["All", ...new Set(templates.map((template) => template.category))];
