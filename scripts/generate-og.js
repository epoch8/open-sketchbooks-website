import { createCanvas, loadImage, registerFont } from "canvas";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const OUTPUT_DIR = "./public/og/sketchbooks";
const META_PATH = "./.cache/og-meta.json";
const FORCE = process.argv.includes("--force");

// 👉 меняешь layout → увеличиваешь версию
const OG_VERSION = 1;

registerFont(path.resolve("./scripts/fonts/BricolageGrotesque-Bold.ttf"), {
  family: "Bricolage",
  weight: "700",
});

registerFont(path.resolve("./scripts/fonts/Inter-Regular.ttf"), {
  family: "Inter",
  weight: "400",
});

const WIDTH = 1200;
const HEIGHT = 630;

const PADDING_X = 64;
const TOP_PADDING = 42;

const BG_COLOR = "#f7f7f7";
const TEXT_COLOR = "#111";
const GALLERY_LABEL = "Open Sketchbook Gallery";

const MAX_PAGES = 5;
const BASE_IMAGE_HEIGHT = 350;
const OVERLAP = 82;

async function generate() {
  const books = JSON.parse(
    fs.readFileSync("./.cache/sketchbooks.json", "utf-8")
  );

  let meta = {};
  if (fs.existsSync(META_PATH)) {
    meta = JSON.parse(fs.readFileSync(META_PATH, "utf-8"));
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const book of books) {
    const outPath = path.join(OUTPUT_DIR, `${book.slug}.png`);

    const hash = buildHash(book);

    if (
    !FORCE &&
    fs.existsSync(outPath) && // 👈 ВОТ ЭТО КЛЮЧЕВОЕ
    meta[book.slug] &&
    meta[book.slug].hash === hash
  ) {
    console.log("⏭ skip (hash)", book.slug);
    continue;
  }

    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");

    drawBackground(ctx);

    const { imageStartY } = drawText(ctx, book);

    const loadedImages = await loadSketchbookImages(
      (book.featured || []).slice(0, MAX_PAGES)
    );

    const imageLayout = buildImageLayout(loadedImages, imageStartY);

    if (imageLayout.length > 0) {
      drawImages(ctx, imageLayout);
    } else {
      drawFallback(ctx, imageStartY);
    }

    fs.writeFileSync(outPath, canvas.toBuffer("image/png"));

    meta[book.slug] = { hash };

    console.log("✅ generated", book.slug);
  }

  fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2));
}

function buildHash(book) {
  const data = {
    version: OG_VERSION,
    title: book.title,
    author: book.authorName,
    featured: (book.featured || []).map((p) => p.src),
  };

  return crypto
    .createHash("md5")
    .update(JSON.stringify(data))
    .digest("hex");
}

function drawBackground(ctx) {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawText(ctx, book) {
  let cursorY = TOP_PADDING;

  ctx.fillStyle = TEXT_COLOR;
  ctx.textBaseline = "top";

  const authorLine = book.authorName
    ? `${book.authorName} / ${GALLERY_LABEL}`
    : GALLERY_LABEL;

  ctx.font = `28px "Inter"`;
  ctx.fillText(authorLine, PADDING_X, cursorY);

  cursorY += 48;

  ctx.font = `bold 72px "Bricolage"`;

  const titleLines = wrapTextLines(
    ctx,
    book.title || "Untitled",
    WIDTH * 0.62,
    2
  );

  const lineHeight = 76;

  for (const line of titleLines) {
    ctx.fillText(line, PADDING_X, cursorY);
    cursorY += lineHeight;
  }

  const missing = 2 - titleLines.length;
  if (missing > 0) {
    cursorY += missing * lineHeight;
  }

  let imageStartY = cursorY + 18;

  if (titleLines.length === 1) {
    imageStartY -= 50;
  }

  return { imageStartY };
}

async function loadSketchbookImages(pages) {
  const loaded = [];

  for (const page of pages) {
    try {
      const img = await loadImage(page.src);
      const ratio = img.width / img.height;

      loaded.push({
        img,
        w: BASE_IMAGE_HEIGHT * ratio,
        h: BASE_IMAGE_HEIGHT,
      });
    } catch {
      console.log("❌ image failed", page.src);
    }
  }

  return loaded;
}

function buildImageLayout(images, startY) {
  if (images.length === 0) return [];

  const layout = [];
  let localX = 0;

  for (let i = 0; i < images.length; i++) {
    const item = images[i];

    layout.push({
      ...item,
      x: localX,
      y: startY + getPageYOffset(i),
      angle: getPageAngle(i),
    });

    localX += item.w - OVERLAP;
  }

  const first = layout[0];
  const last = layout[layout.length - 1];

  const totalWidth = last.x + last.w - first.x;
  const offsetX = (WIDTH - totalWidth) / 2;

  layout.forEach((item) => {
    item.x += offsetX;
  });

  return layout;
}

function drawImages(ctx, layout) {
  for (let i = layout.length - 1; i >= 0; i--) {
    const { img, w, h, x, y, angle } = layout[i];

    ctx.save();

    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(angle);

    ctx.shadowColor = "rgba(0,0,0,0.18)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 14;

    ctx.drawImage(img, -w / 2, -h / 2, w, h);

    ctx.restore();
  }
}

function drawFallback(ctx, y) {
  ctx.fillStyle = TEXT_COLOR;
  ctx.font = `bold 40px "Inter"`;
  ctx.fillText("No preview", PADDING_X, y + 60);
}

function getPageAngle(i) {
  const a = [-0.035, 0.025, -0.018, 0.032, -0.026];
  return a[i % a.length];
}

function getPageYOffset(i) {
  const o = [0, 18, 6, 24, 10];
  return o[i % o.length];
}

function wrapTextLines(ctx, text, maxWidth, maxLines) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    const w = ctx.measureText(test).width;

    if (w > maxWidth && line) {
      lines.push(line);
      line = word;

      if (lines.length === maxLines) break;
    } else {
      line = test;
    }
  }

  if (lines.length < maxLines && line) {
    lines.push(line);
  }

  return lines.slice(0, maxLines);
}

generate();