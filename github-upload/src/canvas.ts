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
  if (/RICOH|GR\s?III/i.test(camera)) return "RICOH GR";
  if (/SONY|ILCE|DSC-/i.test(camera)) return "SONY";
  if (/PENTAX|K-[0-9]/i.test(camera)) return "PENTAX";
  if (/CANON/i.test(camera)) return "CANON";
  if (/NIKON/i.test(camera)) return "NIKON";
  return camera.toUpperCase();
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
  const stripHeight = Math.max(104 * scale, height * 0.085);
  const imageHeight = height - stripHeight;
  const imageScale = Math.min(width / image.naturalWidth, imageHeight / image.naturalHeight);
  const photoWidth = image.naturalWidth * imageScale;
  const photoHeight = image.naturalHeight * imageScale;
  const photoX = (width - photoWidth) / 2;
  const photoY = (imageHeight - photoHeight) / 2;
  const inset = Math.max(22 * scale, width * 0.018);
  const middle = width * 0.58;
  const mark = cameraMark(meta.camera);
  const date = meta.date === "\u2014" ? "" : meta.date;
  const camera = meta.camera === "\u2014" ? "CAMERA" : meta.camera;
  const lens = meta.lens === "\u2014" ? "" : meta.lens;
  const small = Math.max(16, 18 * scale);
  const medium = Math.max(18, 22 * scale);
  const brandSize = Math.max(24, 34 * scale);
  const font = fontFamilies[settings.font];

  ctx.fillStyle = template.background;
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, photoX, photoY, photoWidth, photoHeight);

  text(ctx, date, inset, imageHeight + stripHeight * 0.45, small, template.foreground, font);
  text(ctx, shootingDetails(meta), inset, imageHeight + stripHeight * 0.72, small, template.foreground, font);

  drawMark(ctx, mark, markImage, middle, imageHeight + stripHeight * 0.63, width * 0.16, brandSize, template.accent, font);
  ctx.fillStyle = template.foreground;
  ctx.fillRect(middle + width * 0.12, imageHeight + stripHeight * 0.22, Math.max(1, 2 * scale), stripHeight * 0.58);
  text(ctx, camera, middle + width * 0.135, imageHeight + stripHeight * 0.43, medium, template.foreground, font);
  text(ctx, lens, middle + width * 0.135, imageHeight + stripHeight * 0.70, small, template.foreground, font);
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
  const [width, height] = ratios[settings.ratio];
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
