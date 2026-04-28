import fs from "fs";
import path from "path";
import matter from "gray-matter";

const SKETCHBOOKS_DIR = "./src/content/sketchbooks";
const ARTISTS_DIR = "./src/content/artists";

const CACHE_DIR = "./.cache";
const OUTPUT_FILE = `${CACHE_DIR}/sketchbooks.json`;
const META_FILE = `${CACHE_DIR}/dump-meta.json`;

/* =========================
   HELPERS
========================= */

function getFiles(dir) {
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
}

function getMtime(filePath) {
  return fs.statSync(filePath).mtimeMs;
}

/* =========================
   LOAD PREVIOUS META
========================= */

let prevMeta = {};
if (fs.existsSync(META_FILE)) {
  prevMeta = JSON.parse(fs.readFileSync(META_FILE, "utf-8"));
}

/* =========================
   BUILD ARTIST MAP
========================= */

const artistFiles = getFiles(ARTISTS_DIR);

const artistMap = {};

for (const file of artistFiles) {
  const filePath = path.join(ARTISTS_DIR, file);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(raw);

  const slug = file.replace(".md", "");
  artistMap[slug] = data.title;
}

/* =========================
   PROCESS SKETCHBOOKS
========================= */

const files = getFiles(SKETCHBOOKS_DIR);

const books = [];
const newMeta = {};

let hasChanges = false;

for (const file of files) {
  const filePath = path.join(SKETCHBOOKS_DIR, file);
  const slug = file.replace(".md", "");

  const mtime = getMtime(filePath);

  // 👉 если не изменился — можем пропустить
  if (prevMeta[slug]?.mtime === mtime) {
    newMeta[slug] = prevMeta[slug];
    continue;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(raw);

  const book = {
    slug,
    title: data.title,
    authorSlug: data.author,
    authorName: artistMap[data.author] || data.author,
    featured: data.featured || [],
    mtime,
  };

  books.push(book);
  newMeta[slug] = { mtime };

  hasChanges = true;

  console.log("✏️ updated", slug);
}

/* =========================
   HANDLE NO CHANGES
========================= */

if (!hasChanges && fs.existsSync(OUTPUT_FILE)) {
  console.log("⏭ no changes in sketchbooks");
  process.exit(0);
}

/* =========================
   MERGE WITH EXISTING DATA
========================= */

let existing = [];

if (fs.existsSync(OUTPUT_FILE)) {
  existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8"));
}

// 👉 обновляем только изменённые
const merged = [
  ...existing.filter((b) => !books.find((n) => n.slug === b.slug)),
  ...books,
];

/* =========================
   SAVE
========================= */

fs.mkdirSync(CACHE_DIR, { recursive: true });

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(merged, null, 2));
fs.writeFileSync(META_FILE, JSON.stringify(newMeta, null, 2));

console.log("✅ sketchbooks dumped (incremental)");