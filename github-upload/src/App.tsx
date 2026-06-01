import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Download, ImagePlus, LockKeyhole, SlidersHorizontal, Upload, X } from "lucide-react";
import { downloadFrame, drawFrame } from "./canvas";
import { emptyMeta, readExif } from "./exif";
import { categories, templates } from "./templates";
import type { AspectRatio, FontChoice, FrameSettings, PhotoMeta, Template } from "./types";

const DEFAULT_TEMPLATE = templates[0];
const ratios: AspectRatio[] = ["1:1", "4:5", "16:9", "9:16"];

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [meta, setMeta] = useState<PhotoMeta>(emptyMeta());
  const [selected, setSelected] = useState<Template>(DEFAULT_TEMPLATE);
  const [category, setCategory] = useState("All");
  const [isDragging, setIsDragging] = useState(false);
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [settings, setSettings] = useState<FrameSettings>({
    background: DEFAULT_TEMPLATE.background,
    foreground: DEFAULT_TEMPLATE.foreground,
    font: DEFAULT_TEMPLATE.font,
    margin: DEFAULT_TEMPLATE.margin,
    ratio: "4:5",
  });

  const filteredTemplates = useMemo(
    () => category === "All" ? templates : templates.filter((template) => template.category === category),
    [category],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (canvas && image) drawFrame(canvas, image, meta, selected, settings);
  }, [meta, selected, settings, photoUrl]);

  async function loadFile(file?: File) {
    if (!file || !file.type.startsWith("image/")) return;
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      imageRef.current = image;
      setPhotoUrl(url);
    };
    image.src = url;
    setFileName(file.name);
    setMeta(await readExif(file));
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    void loadFile(event.dataTransfer.files[0]);
  }

  function chooseTemplate(template: Template) {
    setSelected(template);
    setSettings((current) => ({
      ...current,
      background: template.background,
      foreground: template.foreground,
      font: template.font,
      margin: template.margin,
    }));
  }

  function clearPhoto() {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    imageRef.current = null;
    setPhotoUrl("");
    setFileName("");
    setMeta(emptyMeta());
  }

  return (
    <main>
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark">K</span>
          <span>KOREWA <i>FRAME</i></span>
        </div>
        <div className="header-note"><LockKeyhole size={14} /> 写真はブラウザの外へ送信されません</div>
        <button className="coffee">開発を応援する <span>↗</span></button>
      </header>

      <section className="hero">
        <p className="eyebrow">FOR YOUR EVERYDAY PHOTOGRAPHY</p>
        <h1>写真に、<em>余白</em>を。</h1>
        <p>EXIF情報を添えたSNSフレームを、ブラウザだけで。</p>
      </section>

      {!photoUrl ? (
        <section className="upload-section">
          <div
            className={`dropzone ${isDragging ? "dragging" : ""}`}
            onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
          >
            <input ref={inputRef} type="file" accept="image/*" onChange={(event: ChangeEvent<HTMLInputElement>) => void loadFile(event.target.files?.[0])} />
            <div className="upload-icon"><ImagePlus size={30} strokeWidth={1.4} /></div>
            <h2>写真をここにドロップ</h2>
            <p>または、デバイスから写真を選択</p>
            <button onClick={() => inputRef.current?.click()}><Upload size={16} /> 写真を選ぶ</button>
            <span>JPEG · PNG · WEBP</span>
          </div>
          <div className="privacy-strip">
            <LockKeyhole size={18} />
            <div><strong>完全なプライバシー</strong><small>画像処理はすべてあなたのブラウザ内で完結します。</small></div>
          </div>
        </section>
      ) : (
        <section className="workspace">
          <div className="preview-column">
            <div className="preview-head">
              <div>
                <span className="section-number">01</span>
                <h2>プレビュー</h2>
              </div>
              <button className="text-button" onClick={clearPhoto}><X size={15} /> 写真を変更</button>
            </div>
            <div className="canvas-wrap">
              <canvas ref={canvasRef} />
            </div>
            <p className="file-name">{fileName}</p>
          </div>

          <aside className="controls">
            <section className="control-section">
              <div className="section-title"><span className="section-number">02</span><h2>テンプレート</h2></div>
              <div className="category-row">
                {categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}
              </div>
              <div className="template-grid">
                {filteredTemplates.map((template) => (
                  <button key={template.id} className={`template-card ${selected.id === template.id ? "selected" : ""}`} onClick={() => chooseTemplate(template)}>
                    <span className="template-swatch" style={{ background: template.background, color: template.foreground }}>
                      <b style={{ background: template.accent }} />
                      <i />
                      <small>EXIF / FRAME</small>
                    </span>
                    <span><strong>{template.name}</strong><small>{template.category}</small></span>
                    {selected.id === template.id && <Check className="selected-check" size={13} />}
                  </button>
                ))}
              </div>
            </section>

            <section className="control-section compact">
              <button className="adjustments-toggle" onClick={() => setShowAdjustments(!showAdjustments)}>
                <span><SlidersHorizontal size={16} /> 微調整</span><ChevronDown size={16} className={showAdjustments ? "opened" : ""} />
              </button>
              {showAdjustments && <Adjustments settings={settings} onChange={setSettings} />}
            </section>

            <section className="control-section export-section">
              <div className="section-title"><span className="section-number">03</span><h2>保存する</h2></div>
              <div className="ratio-row">
                {ratios.map((ratio) => <button key={ratio} className={settings.ratio === ratio ? "active" : ""} onClick={() => setSettings({ ...settings, ratio })}>{ratio}</button>)}
              </div>
              <div className="export-buttons">
                <button className="primary" onClick={() => canvasRef.current && downloadFrame(canvasRef.current, "png")}><Download size={17} /> PNGで保存</button>
                <button onClick={() => canvasRef.current && downloadFrame(canvasRef.current, "jpeg")}>JPEG</button>
              </div>
            </section>
          </aside>
        </section>
      )}

      <footer><span>KOREWA FRAME</span><small>YOUR PHOTO, QUIETLY FRAMED.</small></footer>
    </main>
  );
}

function Adjustments({ settings, onChange }: { settings: FrameSettings; onChange: (settings: FrameSettings) => void }) {
  return (
    <div className="adjustments">
      <label>背景色<input type="color" value={settings.background} onChange={(event) => onChange({ ...settings, background: event.target.value })} /></label>
      <label>文字色<input type="color" value={settings.foreground} onChange={(event) => onChange({ ...settings, foreground: event.target.value })} /></label>
      <label>フォント<select value={settings.font} onChange={(event) => onChange({ ...settings, font: event.target.value as FontChoice })}><option value="sans">Sans</option><option value="serif">Serif</option><option value="mono">Mono</option></select></label>
      <label className="range-label">余白 <b>{settings.margin}%</b><input type="range" min="4" max="18" value={settings.margin} onChange={(event) => onChange({ ...settings, margin: Number(event.target.value) })} /></label>
    </div>
  );
}
