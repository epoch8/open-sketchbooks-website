import fs from "fs";
import path from "path";
import matter from "gray-matter";

const EVENTS_DIR = "./src/content/events";
const SKETCHBOOKS_DIR = "./src/content/sketchbooks";
const ARTISTS_DIR = "./src/content/artists";

const CACHE_DIR = "./.cache";
const OUTPUT_FILE = `${CACHE_DIR}/events.json`;

/* =========================
   HELPERS
========================= */

function getFiles(dir) {
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
}

function readFrontmatter(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  return matter(raw).data;
}

/* =========================
   BUILD ARTIST MAP
========================= */

const artistMap = {};

for (const file of getFiles(ARTISTS_DIR)) {
  const slug = file.replace(/\.mdx?$/, "");
  const data = readFrontmatter(path.join(ARTISTS_DIR, file));
  artistMap[slug] = data.title;
}

/* =========================
   BUILD SKETCHBOOK MAP
========================= */

const sketchbookMap = {};

for (const file of getFiles(SKETCHBOOKS_DIR)) {
  const slug = file.replace(/\.mdx?$/, "");
  const data = readFrontmatter(path.join(SKETCHBOOKS_DIR, file));

  sketchbookMap[slug] = {
    slug,
    title: data.title,
    published: data.published ?? false,
    featured: data.featured || [],
    cover: data.cover || null,
  };
}

/* =========================
   PROCESS EVENTS
========================= */

const events = [];

for (const file of getFiles(EVENTS_DIR)) {
  const slug = file.replace(/\.mdx?$/, "");
  const data = readFrontmatter(path.join(EVENTS_DIR, file));

  // Resolve featured sketchbooks → first featured page thumbnail
  const sketchbooks = (data.sketchbooks || [])
    .map((s) => sketchbookMap[s])
    .filter(Boolean)
    .filter((s) => s.published)
    .map((s) => ({
      slug: s.slug,
      title: s.title,
      thumb: s.featured?.[0]?.src ?? s.cover ?? null,
    }));

  events.push({
    slug,
    title: data.title,
    date: data.date ? new Date(data.date).toISOString() : null,
    endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
    location: data.location || null,
    sketchbooks,
  });

  console.log("✏️ event", slug);
}

/* =========================
   SAVE
========================= */

fs.mkdirSync(CACHE_DIR, { recursive: true });
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(events, null, 2));

console.log("✅ events dumped");
