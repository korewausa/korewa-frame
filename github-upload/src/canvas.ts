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

function contain(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function text(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, size: number, color: string, font: string, align: CanvasTextAlign = "left") {
  ctx.fillStyle = color;
  ctx.font = `${size}px ${font}`;
  ctx.textAlign = align;
  ctx.fillText(value, x, y);
}

function details(meta: PhotoMeta) {
  return [meta.camera, meta.lens, `F${meta.aperture}`, meta.shutter, `ISO ${meta.iso}`, meta.focalLength]
    .filter((item) => !item.includes("—"))
    .join("  ·  ");
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
  const bottom = template.layout === "poster" ? margin : Math.max(122 * scale, margin * 0.95);
  const top = template.layout === "split" ? margin * 1.5 : margin;
  const imageX = margin;
  const imageY = top;
  const imageWidth = width - margin * 2;
  const imageHeight = height - top - bottom;
  const font = fontFamilies[settings.font];

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = settings.background;
  ctx.fillRect(0, 0, width, height);

  contain(ctx, image, imageX, imageY, imageWidth, imageHeight);
  const lineY = imageY + imageHeight + 28 * scale;
  const small = Math.max(15, 18 * scale);
  const micro = Math.max(12, 14 * scale);

  if (template.layout === "poster") {
    ctx.fillStyle = "rgba(0,0,0,.26)";
    ctx.fillRect(imageX, imageY, imageWidth, imageHeight);
    text(ctx, "FRAME / 01", imageX + 30 * scale, imageY + 52 * scale, micro, "#ffffff", font);
    text(ctx, meta.camera === "—" ? "YOUR PHOTOGRAPH" : meta.camera.toUpperCase(), imageX + 30 * scale, imageY + imageHeight - 60 * scale, 36 * scale, "#ffffff", font);
    text(ctx, details(meta), imageX + 30 * scale, imageY + imageHeight - 30 * scale, micro, "#ffffff", font);
    return;
  }

  if (template.layout === "stamp") {
    text(ctx, "KOREWA FRAME", imageX, lineY, micro, template.accent, font);
    text(ctx, meta.date, imageX + imageWidth, lineY, micro, settings.foreground, font, "right");
    text(ctx, details(meta), imageX, lineY + 30 * scale, micro, settings.foreground, font);
    return;
  }

  text(ctx, meta.camera === "—" ? "YOUR PHOTOGRAPH" : meta.camera, imageX, lineY, small, settings.foreground, font);
  text(ctx, template.name.toUpperCase(), imageX + imageWidth, lineY, micro, template.accent, font, "right");
  text(ctx, details(meta), imageX, lineY + 30 * scale, micro, settings.foreground, font);

  if (template.layout === "split") {
    ctx.fillStyle = template.accent;
    ctx.fillRect(imageX, lineY + 48 * scale, Math.min(imageWidth, 110 * scale), 3 * scale);
  }
}

export function downloadFrame(canvas: HTMLCanvasElement, type: "png" | "jpeg") {
  const link = document.createElement("a");
  link.download = `korewa-frame-${Date.now()}.${type === "png" ? "png" : "jpg"}`;
  link.href = canvas.toDataURL(`image/${type}`, type === "jpeg" ? 0.92 : undefined);
  link.click();
}
