import { createCanvas, loadImage, registerFont } from "canvas";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const OUTPUT_DIR = "./public/og/events";
const META_PATH = "./.cache/og-events-meta.json";
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
const TOP_PADDING = 64;

const BG_COLOR = "#f7f7f7";
const TEXT_COLOR = "#111";
const META_COLOR = "#555";

const MAX_THUMBS = 3;
const BASE_IMAGE_HEIGHT = 300;
const OVERLAP = 60;
const BOTTOM_GAP = 48;
const BORDER_RADIUS = 18;

/* ========================= DATE ========================= */

function formatEventDate(start, end) {
  const startDate = new Date(start);
  if (!end) return formatFullDate(startDate);

  const endDate = new Date(end);
  const sameYear = startDate.getUTCFullYear() === endDate.getUTCFullYear();
  const sameMonth = sameYear && startDate.getUTCMonth() === endDate.getUTCMonth();

  if (sameMonth) {
    const month = startDate.toLocaleDateString("en", { month: "long", timeZone: "UTC" });
    return `${startDate.getUTCDate()}–${endDate.getUTCDate()} ${month} ${startDate.getUTCFullYear()}`;
  }
  if (sameYear) {
    const s = startDate.toLocaleDateString("en", { day: "numeric", month: "long", timeZone: "UTC" });
    const e = endDate.toLocaleDateString("en", { day: "numeric", month: "long", timeZone: "UTC" });
    return `${s} – ${e} ${startDate.getUTCFullYear()}`;
  }
  return `${formatFullDate(startDate)} – ${formatFullDate(endDate)}`;
}

function formatFullDate(date) {
  return date.toLocaleDateString("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/* ========================= */

async function generate() {
  const events = JSON.parse(fs.readFileSync("./.cache/events.json", "utf-8"));

  let meta = {};
  if (fs.existsSync(META_PATH)) {
    meta = JSON.parse(fs.readFileSync(META_PATH, "utf-8"));
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const event of events) {
    const outPath = path.join(OUTPUT_DIR, `${event.slug}.png`);
    const hash = buildHash(event);

    if (
      !FORCE &&
      fs.existsSync(outPath) &&
      meta[event.slug] &&
      meta[event.slug].hash === hash
    ) {
      console.log("⏭ skip (hash)", event.slug);
      continue;
    }

    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");

    drawBackground(ctx);
    const imageStartY = drawText(ctx, event);

    const images = await loadThumbs(
      (event.sketchbooks || []).slice(0, MAX_THUMBS)
    );
    const layout = buildLayout(images, imageStartY);

    if (layout.length > 0) {
      drawImages(ctx, layout);
    }

    fs.writeFileSync(outPath, canvas.toBuffer("image/png"));
    meta[event.slug] = { hash };

    console.log("✅ generated", event.slug);
  }

  fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2));
}

function buildHash(event) {
  return crypto
    .createHash("md5")
    .update(
      JSON.stringify({
        version: OG_VERSION,
        title: event.title,
        date: event.date,
        endDate: event.endDate,
        location: event.location,
        thumbs: (event.sketchbooks || []).map((s) => s.thumb),
      })
    )
    .digest("hex");
}

function drawBackground(ctx) {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawText(ctx, event) {
  let cursorY = TOP_PADDING;

  ctx.fillStyle = META_COLOR;
  ctx.textBaseline = "top";

  // meta line: date range · location
  const metaParts = [];
  if (event.date) metaParts.push(formatEventDate(event.date, event.endDate));
  if (event.location) metaParts.push(event.location);

  if (metaParts.length > 0) {
    ctx.font = `28px "Inter"`;
    ctx.fillText(truncate(ctx, metaParts.join("  ·  "), WIDTH - PADDING_X * 2), PADDING_X, cursorY);
    cursorY += 50;
  }

  // title
  ctx.fillStyle = TEXT_COLOR;
  ctx.font = `bold 64px "Bricolage"`;

  const titleLines = wrapTextLines(ctx, event.title || "Untitled", WIDTH - PADDING_X * 2, 2);
  const lineHeight = 70;

  for (const line of titleLines) {
    ctx.fillText(line, PADDING_X, cursorY);
    cursorY += lineHeight;
  }

  return cursorY + 28;
}

async function loadThumbs(sketchbooks) {
  const loaded = [];

  for (const book of sketchbooks) {
    if (!book.thumb) continue;
    try {
      const img = await loadImage(book.thumb);
      const ratio = img.width / img.height;
      loaded.push({
        img,
        w: BASE_IMAGE_HEIGHT * ratio,
        h: BASE_IMAGE_HEIGHT,
      });
    } catch {
      console.log("❌ thumb failed", book.thumb);
    }
  }

  return loaded;
}

function buildLayout(images, startY) {
  if (images.length === 0) return [];

  const layout = [];
  let x = 0;

  for (let i = 0; i < images.length; i++) {
    const item = images[i];
    layout.push({
      ...item,
      x,
      y: startY + getYOffset(i),
      angle: getAngle(i),
    });
    x += item.w - OVERLAP;
  }

  // center horizontally
  const first = layout[0];
  const last = layout[layout.length - 1];
  const totalWidth = last.x + last.w - first.x;
  const offsetX = (WIDTH - totalWidth) / 2;
  layout.forEach((item) => (item.x += offsetX));

  // pin to bottom
  const lowest = Math.max(...layout.map((i) => i.y + i.h));
  const offsetY = HEIGHT - BOTTOM_GAP - lowest;
  if (offsetY < 0) {
    layout.forEach((item) => (item.y += offsetY));
  }

  return layout;
}

function drawImages(ctx, layout) {
  for (let i = layout.length - 1; i >= 0; i--) {
    const { img, w, h, x, y, angle } = layout[i];

    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(angle);

    ctx.beginPath();
    roundedRect(ctx, -w / 2, -h / 2, w, h, BORDER_RADIUS);
    ctx.closePath();
    ctx.clip();

    ctx.shadowColor = "rgba(0,0,0,0.18)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 14;

    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function getAngle(i) {
  const a = [-0.03, 0.022, -0.016];
  return a[i % a.length];
}

function getYOffset(i) {
  const o = [0, 16, 6];
  return o[i % o.length];
}

function truncate(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + "…").width > maxWidth) {
    t = t.slice(0, -1);
  }
  return t + "…";
}

function wrapTextLines(ctx, text, maxWidth, maxLines) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
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
