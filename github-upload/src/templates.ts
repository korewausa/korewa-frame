import type { Template } from "./types";

export const templates: Template[] = [
  { id: "pure-white", name: "Pure White", category: "White", description: "Clean white mat", background: "#ffffff", foreground: "#20211f", accent: "#a4a29c", font: "sans", margin: 10, layout: "bottom" },
  { id: "soft-white", name: "Soft White", category: "White", description: "Warm white gallery mat", background: "#faf8f3", foreground: "#34332f", accent: "#b4aa9c", font: "serif", margin: 13, layout: "split" },
  { id: "white-note", name: "White Note", category: "White", description: "Simple white photo note", background: "#fffdf9", foreground: "#282824", accent: "#8d8c85", font: "mono", margin: 12, layout: "stamp" },
  { id: "instant-classic", name: "Instant Classic", category: "Instant", description: "Classic instant photo", background: "#e9e5dc", foreground: "#33312c", accent: "#a29b8e", font: "serif", margin: 10, layout: "polaroid" },
  { id: "instant-clean", name: "Instant Clean", category: "Instant", description: "Clean instant white", background: "#f7f5f0", foreground: "#282824", accent: "#9b604a", font: "sans", margin: 12, layout: "polaroid" },
  { id: "instant-night", name: "Instant Night", category: "Instant", description: "Dark background instant", background: "#242624", foreground: "#f4f0e8", accent: "#c6a76a", font: "mono", margin: 9, layout: "polaroid" },
  { id: "quiet-white", name: "Quiet White", category: "Minimal", description: "余白と小さな記録", background: "#f7f5f0", foreground: "#24231f", accent: "#8b877e", font: "sans", margin: 11, layout: "bottom" },
  { id: "gallery", name: "Gallery", category: "Minimal", description: "展示室のような静けさ", background: "#ebe8df", foreground: "#1d1e1b", accent: "#7c817a", font: "serif", margin: 14, layout: "split" },
  { id: "silver-grain", name: "Silver Grain", category: "Film", description: "モノクロ暗室の空気", background: "#dedbd3", foreground: "#252522", accent: "#77766f", font: "mono", margin: 9, layout: "stamp" },
  { id: "contact-sheet", name: "Contact Sheet", category: "Film", description: "フィルムの記録面", background: "#252522", foreground: "#f2eee5", accent: "#b9aa87", font: "mono", margin: 8, layout: "bottom" },
  { id: "night-walk", name: "Night Walk", category: "Street", description: "夜のスナップ向け", background: "#151817", foreground: "#e3e1d8", accent: "#c6a76a", font: "sans", margin: 8, layout: "poster" },
  { id: "crossing", name: "Crossing", category: "Street", description: "軽快な都市の記録", background: "#e5e0d6", foreground: "#20221f", accent: "#c5573d", font: "mono", margin: 7, layout: "split" },
  { id: "editorial", name: "Editorial", category: "Magazine", description: "表紙のような存在感", background: "#eee9de", foreground: "#1b1c1a", accent: "#914a36", font: "serif", margin: 8, layout: "poster" },
  { id: "volume-one", name: "Volume One", category: "Magazine", description: "小冊子の一頁", background: "#d8d1c5", foreground: "#282620", accent: "#725d45", font: "serif", margin: 12, layout: "bottom" },
  { id: "postcard", name: "Postcard", category: "Travel", description: "旅先からの便り", background: "#eee7d8", foreground: "#333027", accent: "#a65a45", font: "serif", margin: 10, layout: "stamp" },
  { id: "waypoint", name: "Waypoint", category: "Travel", description: "場所と時間を残す", background: "#dce1d9", foreground: "#21302c", accent: "#647d76", font: "sans", margin: 9, layout: "split" },
  { id: "field-note", name: "Field Note", category: "Journal", description: "撮影ノートのように", background: "#e8e2d3", foreground: "#343126", accent: "#86795f", font: "mono", margin: 11, layout: "stamp" },
  { id: "daily", name: "Daily", category: "Journal", description: "日々の写真日記", background: "#f1eee7", foreground: "#37342d", accent: "#9b8565", font: "sans", margin: 12, layout: "bottom" },
  { id: "museum", name: "Museum", category: "Classic", description: "品のあるクラシック", background: "#e4ded2", foreground: "#29261f", accent: "#8f7553", font: "serif", margin: 15, layout: "split" },
  { id: "linen", name: "Linen", category: "Classic", description: "柔らかな生成り", background: "#f1eadc", foreground: "#423d33", accent: "#a79676", font: "serif", margin: 12, layout: "bottom" },
  { id: "mono", name: "Mono", category: "Modern", description: "シャープな黒と白", background: "#f0f0ed", foreground: "#121311", accent: "#121311", font: "sans", margin: 6, layout: "poster" },
  { id: "signal", name: "Signal", category: "Modern", description: "アクセントのある余白", background: "#deded8", foreground: "#1c211f", accent: "#e35737", font: "sans", margin: 8, layout: "split" },
];

export const categories = ["All", ...new Set(templates.map((template) => template.category))];
