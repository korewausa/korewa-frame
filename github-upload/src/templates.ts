import type { Template } from "./types";

export const templates: Template[] = [
  { id: "camera-strip-black", name: "Camera Strip Black", category: "Modern", description: "Clean black photo strip", background: "#171817", foreground: "#f4f2ec", accent: "#f4f2ec", font: "sans", margin: 4, layout: "camera-strip" },
  { id: "camera-strip-white", name: "Camera Strip White", category: "White", description: "Clean white photo strip", background: "#ffffff", foreground: "#242424", accent: "#242424", font: "sans", margin: 4, layout: "camera-strip" },
  { id: "camera-strip-mono", name: "Camera Strip Mono", category: "Minimal", description: "Quiet monochrome strip", background: "#ffffff", foreground: "#292929", accent: "#292929", font: "mono", margin: 4, layout: "camera-strip" },
];

export const categories = ["All", ...new Set(templates.map((template) => template.category))];
