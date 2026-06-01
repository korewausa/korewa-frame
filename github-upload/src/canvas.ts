import type { FrameSettings, PhotoMeta, Template } from "./types";

const ratios = {
  "1:1": [1080, 1080],
  "4:5": [1080, 1350],
  "16:9": [1600, 900],
  "9:16": [1080, 1920],
} as const;

const fontFamilies = {
  sans: '"Helvetica Neue", Arial, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: '"Courier New", monospace',
  typewriter: '"American Typewriter", "Courier New", monospace',
  hand: '"Bradley Hand", "Segoe Print", cursive',
};

type PhotoBounds = {
  cardX: number;
  cardY: number;
  cardWidth: number;
  cardHeight: number;
  photoX: number;
  photoY: number;
  photoWidth: number;
  photoHeight: number;
};

function text(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, size: number, color: string, font: string, align: CanvasTextAlign = "left") {
  ctx.fillStyle = color;
  ctx.font = `${size}px ${font}`;
  ctx.textAlign = align;
  ctx.fillText(value, x, y);
}

function cameraMark(camera: string) {
  if (camera === "\u2014") return "KOREWA FRAME";
  if (/LEICA/i.test(camera)) return "LEICA";
  if (/FUJIFILM|X100/i.test(camera)) return "FUJIFILM";
  if (/RICOH|GR\s?III/i.test(camera)) return "RICOH";
  if (/SONY|ILCE|DSC-/i.test(camera)) return "SONY";
  if (/PENTAX|K-[0-9]/i.test(camera)) return "PENTAX";
  if (/CANON/i.test(camera)) return "CANON";
  if (/NIKON/i.test(camera)) return "NIKON";
  return camera.toUpperCase();
}

function cameraModel(camera: string) {
  if (camera === "\u2014") return "CAMERA";
  return camera.replace(/^RICOH\s+/i, "").replace(/^FUJIFILM\s+/i, "").replace(/^SONY\s+/i, "").replace(/^CANON\s+/i, "").replace(/^NIKON\s+/i, "");
}

function shootingDetails(meta: PhotoMeta) {
  return [meta.focalLength, `ISO ${meta.iso}`, `F${meta.aperture}`, meta.shutter]
    .filter((item) => !item.includes("\u2014"))
    .join("  ");
}

function drawCameraStrip(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  meta: PhotoMeta,
  settings: FrameSettings,
  template: Template,
  markImage: HTMLImageElement | null,
  width: number,
  height: number,
  scale: number,
) {
  const edge = Math.max(3 * scale, (settings.frameWidth ?? 12) * scale);
  const stripHeight = Math.max(72 * scale, width * 0.082 * ((settings.footerHeight ?? 105) / 100));
  const availableWidth = width - edge * 2;
  const imageScale = availableWidth / image.naturalWidth;
  const photoWidth = image.naturalWidth * imageScale;
  const photoHeight = image.naturalHeight * imageScale;
  const cardWidth = photoWidth + edge * 2;
  const cardHeight = photoHeight + edge * 2 + stripHeight;
  const cardX = 0;
  const cardY = 0;
  const photoX = cardX + edge;
  const photoY = cardY + edge;
  const footerY = photoY + photoHeight + edge;
  const inset = Math.max(18 * scale, cardWidth * 0.016);
  const middle = cardX + cardWidth * 0.58;
  const mark = cameraMark(meta.camera);
  const date = meta.date === "\u2014" ? "" : meta.date;
  const camera = cameraModel(meta.camera);
  const lens = meta.lens === "\u2014" ? "" : meta.lens;
  const small = Math.max(16, 18 * scale);
  const medium = Math.max(18, 22 * scale);
  const brandSize = Math.max(24, 34 * scale);
  const font = fontFamilies[settings.font];

  ctx.fillStyle = template.background;
  ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
  ctx.drawImage(image, photoX, photoY, photoWidth, photoHeight);

  text(ctx, date, cardX + inset, footerY + stripHeight * 0.43, small, "#30302e", font);
  text(ctx, shootingDetails(meta), cardX + inset, footerY + stripHeight * 0.70, small, "#30302e", font);

  drawMark(ctx, mark, markImage, middle, footerY + stripHeight * 0.63, cardWidth * 0.16, brandSize, template.accent, font);
  ctx.fillStyle = "#30302e";
  ctx.fillRect(middle + cardWidth * 0.14, footerY + stripHeight * 0.20, Math.max(1, 2 * scale), stripHeight * 0.60);
  text(ctx, camera, middle + cardWidth * 0.155, footerY + stripHeight * 0.42, medium, "#30302e", font);
  text(ctx, lens, middle + cardWidth * 0.155, footerY + stripHeight * 0.70, small, "#30302e", font);
}

function drawPaperGrain(ctx: CanvasRenderingContext2D, width: number, height: number, seed = 17) {
  let value = seed;
  ctx.save();
  for (let index = 0; index < 900; index += 1) {
    value = (value * 16807) % 2147483647;
    const x = value % width;
    value = (value * 16807) % 2147483647;
    const y = value % height;
    value = (value * 16807) % 2147483647;
    const alpha = 0.012 + (value % 10) / 1200;
    ctx.fillStyle = `rgba(92, 76, 58, ${alpha})`;
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.restore();
}

function drawAnalogPrint(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  meta: PhotoMeta,
  settings: FrameSettings,
  template: Template,
  width: number,
  height: number,
  scale: number,
) {
  const edge = Math.max(3 * scale, (settings.frameWidth ?? 12) * scale);
  const footerHeight = Math.max(72 * scale, width * 0.105 * ((settings.footerHeight ?? 105) / 100));
  const photoWidth = width - edge * 2;
  const photoHeight = photoWidth * image.naturalHeight / image.naturalWidth;
  const footerY = edge + photoHeight;
  const inset = edge + Math.max(12 * scale, width * 0.012);
  const font = fontFamilies[settings.font];
  const small = Math.max(15, 16 * scale);
  const micro = Math.max(12, 13 * scale);
  const quiet = template.foreground;
  const right = width - inset;
  const camera = meta.camera === "\u2014" ? "" : meta.camera;
  const lens = meta.lens === "\u2014" ? "" : meta.lens;
  const location = meta.location === "\u2014" ? "" : meta.location;

  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);
  drawPaperGrain(ctx, width, height);
  ctx.drawImage(image, edge, edge, photoWidth, photoHeight);

  text(ctx, meta.date === "\u2014" ? "" : meta.date, inset, footerY + footerHeight * 0.40, small, quiet, font);
  text(ctx, shootingDetails(meta), inset, footerY + footerHeight * 0.62, small, quiet, font);
  text(ctx, location, inset, footerY + footerHeight * 0.82, micro, template.accent, font);
  text(ctx, camera, right, footerY + footerHeight * 0.46, small, quiet, font, "right");
  text(ctx, lens, right, footerY + footerHeight * 0.68, micro, quiet, font, "right");
  text(ctx, "KOREWA FRAME / PRINT", right, footerY + footerHeight * 0.84, micro, template.accent, font, "right");
}

function details(meta: PhotoMeta, settings: FrameSettings) {
  const values = {
    camera: meta.camera,
    lens: meta.lens,
    aperture: `F${meta.aperture}`,
    shutter: meta.shutter,
    iso: `ISO ${meta.iso}`,
    focalLength: meta.focalLength,
    date: meta.date,
    location: meta.location,
  };
  return settings.infoOrder
    .filter((key) => settings.visibleInfo.includes(key))
    .map((key) => values[key])
    .filter((item) => !item.includes("\u2014"))
    .join("  /  ");
}

function drawMark(ctx: CanvasRenderingContext2D, mark: string, markImage: HTMLImageElement | null, x: number, y: number, maxWidth: number, size: number, color: string, font: string, align: CanvasTextAlign = "left") {
  if (!markImage) {
    text(ctx, mark, x, y, size, color, font, align);
    return;
  }
  const width = Math.min(maxWidth, markImage.naturalWidth * (size * 1.65 / markImage.naturalHeight));
  const height = width * markImage.naturalHeight / markImage.naturalWidth;
  const drawX = align === "right" ? x - width : x;
  ctx.drawImage(markImage, drawX, y - height, width, height);
}

function drawCustomInfo(
  ctx: CanvasRenderingContext2D,
  mounted: PhotoBounds,
  mark: string,
  meta: PhotoMeta,
  layout: FrameSettings["infoLayout"],
  foreground: string,
  accent: string,
  font: string,
  scale: number,
  settings: FrameSettings,
  markImage: HTMLImageElement | null,
) {
  const small = Math.max(15, 18 * scale);
  const micro = Math.max(12, 14 * scale);

  if (layout === "clean") return;
  if (layout === "below") {
    const lineY = mounted.cardY + mounted.cardHeight + 30 * scale;
    drawMark(ctx, mark, markImage, mounted.cardX, lineY, 180 * scale, small, foreground, font);
    text(ctx, meta.date, mounted.cardX + mounted.cardWidth, lineY, micro, accent, font, "right");
    text(ctx, details(meta, settings), mounted.cardX, lineY + 30 * scale, micro, foreground, font);
    return;
  }

  const inset = 22 * scale;
  const panelHeight = 78 * scale;
  const panelY = mounted.photoY + mounted.photoHeight - panelHeight - inset;
  const panelX = mounted.photoX + inset;
  const panelWidth = mounted.photoWidth - inset * 2;
  const align = layout === "inside-right" ? "right" : "left";
  const textX = layout === "inside-right" ? panelX + panelWidth - inset : panelX + inset;

  ctx.fillStyle = "rgba(0,0,0,.48)";
  ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
  drawMark(ctx, mark, markImage, textX, panelY + 30 * scale, 180 * scale, small, "#ffffff", font, align);
  text(ctx, details(meta, settings), textX, panelY + 56 * scale, micro, "#ffffff", font, align);
}

function drawMountedPhoto(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  padding: number,
  bottomPadding: number,
) {
  const scale = Math.min(
    (width - padding * 2) / image.naturalWidth,
    (height - padding - bottomPadding) / image.naturalHeight,
  );
  const photoWidth = image.naturalWidth * scale;
  const photoHeight = image.naturalHeight * scale;
  const cardWidth = photoWidth + padding * 2;
  const cardHeight = photoHeight + padding + bottomPadding;
  const cardX = x + (width - cardWidth) / 2;
  const cardY = y + (height - cardHeight) / 2;
  const photoX = cardX + padding;
  const photoY = cardY + padding;

  ctx.save();
  ctx.shadowColor = "rgba(37, 34, 29, .14)";
  ctx.shadowBlur = Math.max(12, padding * 0.9);
  ctx.shadowOffsetY = Math.max(4, padding * 0.24);
  ctx.fillStyle = "#fffdf9";
  ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
  ctx.restore();
  ctx.drawImage(image, photoX, photoY, photoWidth, photoHeight);

  return { cardX, cardY, cardWidth, cardHeight, photoX, photoY, photoWidth, photoHeight } satisfies PhotoBounds;
}

export function drawFrame(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  meta: PhotoMeta,
  template: Template,
  settings: FrameSettings,
  markImage: HTMLImageElement | null = null,
) {
  let [width, height] = ratios[settings.ratio] as readonly [number, number];
  if ((template.layout === "camera-strip" || template.layout === "analog-print") && settings.infoLayout === "template") {
    const edge = Math.max(3 * (width / 1080), (settings.frameWidth ?? 12) * (width / 1080));
    const stripHeight = template.layout === "analog-print"
      ? Math.max(72 * (width / 1080), width * 0.105 * ((settings.footerHeight ?? 105) / 100))
      : Math.max(72 * (width / 1080), width * 0.082 * ((settings.footerHeight ?? 105) / 100));
    const paperEdge = template.layout === "analog-print" ? Math.max(3 * (width / 1080), (settings.frameWidth ?? 12) * (width / 1080)) : edge;
    height = Math.round((width - paperEdge * 2) * image.naturalHeight / image.naturalWidth + paperEdge + stripHeight);
  }
  const scale = width / 1080;
  const margin = width * (settings.margin / 100);
  const font = fontFamilies[settings.font];
  const isPolaroid = template.layout === "polaroid";
  const infoSpace = isPolaroid ? margin * 0.45 : Math.max(96 * scale, margin * 0.72);
  const areaX = margin;
  const areaY = margin;
  const areaWidth = width - margin * 2;
  const areaHeight = height - margin * 2 - infoSpace;
  const mat = Math.max(16 * scale, margin * 0.15);
  const matBottom = isPolaroid ? Math.max(92 * scale, mat * 3.4) : mat;

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = settings.background;
  ctx.fillRect(0, 0, width, height);

  if (template.layout === "camera-strip" && settings.infoLayout === "template") {
    drawCameraStrip(ctx, image, meta, settings, template, markImage, width, height, scale);
    return;
  }

  if (template.layout === "analog-print" && settings.infoLayout === "template") {
    drawAnalogPrint(ctx, image, meta, settings, template, width, height, scale);
    return;
  }

  const mounted = drawMountedPhoto(ctx, image, areaX, areaY, areaWidth, areaHeight, mat, matBottom);
  const lineY = mounted.cardY + mounted.cardHeight + 30 * scale;
  const small = Math.max(15, 18 * scale);
  const micro = Math.max(12, 14 * scale);
  const mark = cameraMark(meta.camera);

  if (settings.infoLayout !== "template") {
    drawCustomInfo(ctx, mounted, mark, meta, settings.infoLayout, settings.foreground, template.accent, font, scale, settings, markImage);
    return;
  }

  if (isPolaroid) {
    drawMark(ctx, mark, markImage, mounted.cardX + mat, mounted.cardY + mounted.cardHeight - matBottom * 0.52, 180 * scale, small, "#292924", font);
    text(ctx, meta.date, mounted.cardX + mounted.cardWidth - mat, mounted.cardY + mounted.cardHeight - matBottom * 0.52, micro, "#77736b", font, "right");
    text(ctx, details(meta, settings), mounted.cardX + mat, mounted.cardY + mounted.cardHeight - matBottom * 0.24, micro, "#77736b", font);
    return;
  }

  if (template.layout === "poster") {
    ctx.fillStyle = "rgba(0,0,0,.24)";
    ctx.fillRect(mounted.photoX, mounted.photoY, mounted.photoWidth, mounted.photoHeight);
    text(ctx, "FRAME / 01", mounted.photoX + 30 * scale, mounted.photoY + 52 * scale, micro, "#ffffff", font);
    drawMark(ctx, mark, markImage, mounted.photoX + 30 * scale, mounted.photoY + mounted.photoHeight - 58 * scale, 240 * scale, 34 * scale, "#ffffff", font);
    text(ctx, details(meta, settings), mounted.photoX + 30 * scale, mounted.photoY + mounted.photoHeight - 28 * scale, micro, "#ffffff", font);
    return;
  }

  if (template.layout === "stamp") {
    drawMark(ctx, mark, markImage, mounted.cardX, lineY, 180 * scale, small, template.accent, font);
    text(ctx, meta.date, mounted.cardX + mounted.cardWidth, lineY, micro, settings.foreground, font, "right");
    text(ctx, details(meta, settings), mounted.cardX, lineY + 30 * scale, micro, settings.foreground, font);
    return;
  }

  drawMark(ctx, mark, markImage, mounted.cardX, lineY, 180 * scale, small, settings.foreground, font);
  text(ctx, template.name.toUpperCase(), mounted.cardX + mounted.cardWidth, lineY, micro, template.accent, font, "right");
  text(ctx, details(meta, settings), mounted.cardX, lineY + 30 * scale, micro, settings.foreground, font);

  if (template.layout === "split") {
    ctx.fillStyle = template.accent;
    ctx.fillRect(mounted.cardX, lineY + 48 * scale, Math.min(mounted.cardWidth, 110 * scale), 3 * scale);
  }
}

export function downloadFrame(canvas: HTMLCanvasElement, type: "png" | "jpeg") {
  const link = document.createElement("a");
  link.download = `korewa-frame-${Date.now()}.${type === "png" ? "png" : "jpg"}`;
  link.href = canvas.toDataURL(`image/${type}`, type === "jpeg" ? 0.92 : undefined);
  link.click();
}

export async function shareFrame(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
  if (!blob) return;

  const file = new File([blob], `korewa-frame-${Date.now()}.jpg`, { type: "image/jpeg" });
  const shareData = { files: [file], text: "#KorewaFrame #写真 #カメラ" };

  if (navigator.share && navigator.canShare?.(shareData)) {
    await navigator.share(shareData);
    return;
  }

  downloadFrame(canvas, "jpeg");
  const text = encodeURIComponent("Korewa Frameで作成しました。\n#KorewaFrame #写真 #カメラ");
  window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
}
