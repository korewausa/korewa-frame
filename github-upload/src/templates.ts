import type { Template } from "./types";

export const templates: Template[] = [
  { id: "analog-print", name: "Analog Print", category: "Analog", description: "Warm photo paper", background: "#f7f2e9", foreground: "#5c5953", accent: "#8b7968", font: "typewriter", margin: 4, layout: "analog-print" },
  { id: "analog-note", name: "Lab Note", category: "Analog", description: "Quiet lab note", background: "#fbf8f1", foreground: "#555149", accent: "#787168", font: "mono", margin: 4, layout: "analog-print" },
  { id: "analog-faded", name: "Faded Print", category: "Analog", description: "Faded album paper", background: "#efe8dc", foreground: "#6a6258", accent: "#a27862", font: "typewriter", margin: 4, layout: "analog-print" },
  { id: "analog-hand", name: "Hand Note", category: "Analog", description: "Handwritten album note", background: "#f8f3e9", foreground: "#5d574f", accent: "#9b765f", font: "hand", margin: 4, layout: "analog-print" },
  { id: "camera-strip-white", name: "EXIF Strip", category: "White", description: "Clean white EXIF strip", background: "#ffffff", foreground: "#242424", accent: "#d9271c", font: "sans", margin: 4, layout: "camera-strip" },
  { id: "camera-strip-mono", name: "EXIF Strip Mono", category: "White", description: "Quiet monochrome strip", background: "#ffffff", foreground: "#292929", accent: "#292929", font: "mono", margin: 4, layout: "camera-strip" },
];

export const categories = ["All", ...new Set(templates.map((template) => template.category))];
