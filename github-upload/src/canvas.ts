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
  if (/CANON/i.test(camera)) return "CANON";
  if (/NIKON/i.test(camera)) return "NIKON";
  return camera.toUpperCase();
}

function details(meta: PhotoMeta) {
  return [meta.camera, meta.lens, `F${meta.aperture}`, meta.shutter, `ISO ${meta.iso}`, meta.focalLength, meta.location]
    .filter((item) => !item.includes("\u2014"))
    .join("  /  ");
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
) {
  const small = Math.max(15, 18 * scale);
  const micro = Math.max(12, 14 * scale);

  if (layout === "clean") return;
  if (layout === "below") {
    const lineY = mounted.cardY + mounted.cardHeight + 30 * scale;
    text(ctx, mark, mounted.cardX, lineY, small, foreground, font);
    text(ctx, meta.date, mounted.cardX + mounted.cardWidth, lineY, micro, accent, font, "right");
    text(ctx, details(meta), mounted.cardX, lineY + 30 * scale, micro, foreground, font);
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
  text(ctx, mark, textX, panelY + 30 * scale, small, "#ffffff", font, align);
  text(ctx, details(meta), textX, panelY + 56 * scale, micro, "#ffffff", font, align);
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

  const mounted = drawMountedPhoto(ctx, image, areaX, areaY, areaWidth, areaHeight, mat, matBottom);
  const lineY = mounted.cardY + mounted.cardHeight + 30 * scale;
  const small = Math.max(15, 18 * scale);
  const micro = Math.max(12, 14 * scale);
  const mark = cameraMark(meta.camera);

  if (settings.infoLayout !== "template") {
    drawCustomInfo(ctx, mounted, mark, meta, settings.infoLayout, settings.foreground, template.accent, font, scale);
    return;
  }

  if (isPolaroid) {
    text(ctx, mark, mounted.cardX + mat, mounted.cardY + mounted.cardHeight - matBottom * 0.52, small, "#292924", font);
    text(ctx, meta.date, mounted.cardX + mounted.cardWidth - mat, mounted.cardY + mounted.cardHeight - matBottom * 0.52, micro, "#77736b", font, "right");
    text(ctx, details(meta), mounted.cardX + mat, mounted.cardY + mounted.cardHeight - matBottom * 0.24, micro, "#77736b", font);
    return;
  }

  if (template.layout === "poster") {
    ctx.fillStyle = "rgba(0,0,0,.24)";
    ctx.fillRect(mounted.photoX, mounted.photoY, mounted.photoWidth, mounted.photoHeight);
    text(ctx, "FRAME / 01", mounted.photoX + 30 * scale, mounted.photoY + 52 * scale, micro, "#ffffff", font);
    text(ctx, mark, mounted.photoX + 30 * scale, mounted.photoY + mounted.photoHeight - 58 * scale, 34 * scale, "#ffffff", font);
    text(ctx, details(meta), mounted.photoX + 30 * scale, mounted.photoY + mounted.photoHeight - 28 * scale, micro, "#ffffff", font);
    return;
  }

  if (template.layout === "stamp") {
    text(ctx, mark, mounted.cardX, lineY, small, template.accent, font);
    text(ctx, meta.date, mounted.cardX + mounted.cardWidth, lineY, micro, settings.foreground, font, "right");
    text(ctx, details(meta), mounted.cardX, lineY + 30 * scale, micro, settings.foreground, font);
    return;
  }

  text(ctx, mark, mounted.cardX, lineY, small, settings.foreground, font);
  text(ctx, template.name.toUpperCase(), mounted.cardX + mounted.cardWidth, lineY, micro, template.accent, font, "right");
  text(ctx, details(meta), mounted.cardX, lineY + 30 * scale, micro, settings.foreground, font);

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
