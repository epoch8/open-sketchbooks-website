import { createCanvas, loadImage, registerFont } from "canvas";
import fs from "fs";
import path from "path";

const OUTPUT_PATH = "./public/og/home.png";

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

const BG_COLOR = "#f7f7f7";
const TEXT_COLOR = "#111";

const MAX_PAGES = 7;
const BASE_IMAGE_HEIGHT = 350;
const OVERLAP = 82;
const MIN_LEFT = -5;

async function generate() {
  const books = JSON.parse(
    fs.readFileSync("./.cache/sketchbooks.json", "utf-8")
  );

  // 👉 собираем страницы из разных книг
  const allPages = books.flatMap((b) => b.featured || []);

  // 👉 перемешиваем
  const pages = shuffle(allPages).slice(0, MAX_PAGES);

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  drawBackground(ctx);
  drawText(ctx);

  const loaded = await loadImages(pages);
  const layout = buildLayout(loaded);

  drawImages(ctx, layout);

  fs.mkdirSync("./public/og", { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, canvas.toBuffer("image/png"));

  console.log("✅ home OG generated");
}

function drawBackground(ctx) {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawText(ctx) {
  ctx.fillStyle = TEXT_COLOR;

  ctx.font = `bold 72px "Bricolage"`;
  ctx.fillText("Open Sketchbook Gallery", 64, 100);

  ctx.font = `28px "Inter"`;
  ctx.fillText("Flip through real artists’ sketchbooks", 64, 155);
}

async function loadImages(pages) {
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

function buildLayout(images) {
  if (images.length === 0) return [];

  const layout = [];
  let localX = 0;

  const startY = 200;

  // 👉 тот же linear layout как у тебя
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

  // 👉 центрируем
  const first = layout[0];
  const last = layout[layout.length - 1];
  const totalWidth = last.x + last.w - first.x;

  const offsetX = (WIDTH - totalWidth) / 2;

  layout.forEach((item) => {
    item.x += offsetX;
  });

  // 👉 защита от сильного вылета влево (как у тебя)
  const minX = Math.min(...layout.map((i) => i.x));

  if (minX < MIN_LEFT) {
    const shift = MIN_LEFT - minX;
    layout.forEach((item) => (item.x += shift));
  }

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

function getPageAngle(i) {
  const a = [-0.035, 0.025, -0.018, 0.032, -0.026, 0.018, -0.02];
  return a[i % a.length];
}

function getPageYOffset(i) {
  const o = [0, 18, 6, 24, 10, 20, 12];
  return o[i % o.length];
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

generate();