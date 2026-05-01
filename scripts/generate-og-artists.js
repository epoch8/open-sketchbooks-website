import { createCanvas, loadImage, registerFont } from "canvas";
import fs from "fs";
import path from "path";

const OUTPUT_DIR = "./public/og/artists";

registerFont("./scripts/fonts/BricolageGrotesque-Bold.ttf", {
  family: "Bricolage",
  weight: "700",
});

registerFont("./scripts/fonts/Inter-Regular.ttf", {
  family: "Inter",
  weight: "400",
});

const WIDTH = 1200;
const HEIGHT = 630;

const PADDING_X = 64;
const TOP_PADDING = 120;

const BG_COLOR = "#f7f7f7";
const TEXT_COLOR = "#111";

const BASE_IMAGE_HEIGHT = 300;
const OVERLAP = 5; // 👈 сильно уменьшили overlap
const MAX_IMAGES = 5;

const BORDER_RADIUS = 24;

const BOTTOM_GAP = 36; // 👈 отступ снизу

/* ========================= */

function resolveImagePath(src) {
  if (!src) return null;
  if (src.startsWith("http")) return src;
  if (src.startsWith("/")) return path.join("./public", src);
  return src;
}

/* ========================= */

async function generate() {
  const artists = JSON.parse(
    fs.readFileSync("./.cache/artists.json", "utf-8")
  );

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const artist of artists) {
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");

    drawBackground(ctx);
    const startY = drawText(ctx, artist);

    const images = await loadImages(artist.works || []);
    const layout = buildLayout(images, startY);

    if (layout.length > 0) {
      drawImages(ctx, layout);
    }

    const outPath = path.join(OUTPUT_DIR, `${artist.slug}.png`);
    fs.writeFileSync(outPath, canvas.toBuffer("image/png"));

    console.log("✅ artist OG", artist.slug);
  }
}

/* ========================= */

function drawBackground(ctx) {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawText(ctx, artist) {
  let y = TOP_PADDING;

  ctx.fillStyle = TEXT_COLOR;
  ctx.textBaseline = "top";

  // 👉 стиль (сначала)
  if (artist.style) {
    ctx.font = `28px "Inter"`;
    ctx.fillText(artist.style, PADDING_X, y);
    y += 42; // чуть больше воздуха перед именем
  }

  // 👉 имя (главное)
  ctx.font = `bold 72px "Bricolage"`;
  ctx.fillText(artist.name || "Unknown artist", PADDING_X, y);

  y += 84;

  return y + 24;
}

/* ========================= */

async function loadImages(works) {
  const selected = works.slice(0, MAX_IMAGES);
  const loaded = [];

  for (const w of selected) {
    const src = resolveImagePath(w.image);

    try {
      const img = await loadImage(src);
      const ratio = img.width / img.height;

      loaded.push({
        img,
        w: BASE_IMAGE_HEIGHT * ratio,
        h: BASE_IMAGE_HEIGHT,
      });
    } catch {
      console.log("fail", src);
    }
  }

  return loaded;
}

/* ========================= */

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

  // центрируем по X
  const first = layout[0];
  const last = layout[layout.length - 1];
  const totalWidth = last.x + last.w - first.x;

  const offsetX = (WIDTH - totalWidth) / 2;

  layout.forEach((item) => {
    item.x += offsetX;
  });

  // 👇 прижимаем вниз (с учетом BOTTOM_GAP)
  const lowest = Math.max(...layout.map((i) => i.y + i.h));
  const offsetY = HEIGHT - BOTTOM_GAP - lowest;

  layout.forEach((item) => {
    item.y += offsetY;
  });

  return layout;
}

/* ========================= */

function drawImages(ctx, layout) {
  for (let i = layout.length - 1; i >= 0; i--) {
    const { img, w, h, x, y, angle } = layout[i];

    ctx.save();

    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(angle);

    drawRoundedImage(ctx, img, w, h, BORDER_RADIUS);

    ctx.restore();
  }
}

/* ========================= */

function drawRoundedImage(ctx, img, w, h, r) {
  ctx.save();

  ctx.beginPath();
  roundedRect(ctx, -w / 2, -h / 2, w, h, r);
  ctx.closePath();
  ctx.clip();

  ctx.shadowColor = "rgba(0,0,0,0.12)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 8;

  ctx.drawImage(img, -w / 2, -h / 2, w, h);

  ctx.restore();
}

/* ========================= */

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

/* ========================= */

function getAngle(i) {
  const arr = [-0.015, 0.01, -0.008, 0.015, -0.01]; // 👈 ещё мягче
  return arr[i % arr.length];
}

function getYOffset(i) {
  const arr = [0, 6, 2, 8, 4]; // 👈 минимальный шум
  return arr[i % arr.length];
}

generate();