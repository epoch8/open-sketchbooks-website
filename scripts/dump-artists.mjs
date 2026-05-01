import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ARTISTS_DIR = "./src/content/artists";
const WORKS_DIR = "./src/content/works";

const CACHE_PATH = "./.cache/artists.json";

/* =========================
   HELPERS
========================= */

function readCollection(dir) {
  const files = fs.readdirSync(dir);

  return files
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data } = matter(raw);

      return {
        slug: file.replace(/\.mdx?$/, ""),
        data,
        mtime: fs.statSync(path.join(dir, file)).mtimeMs,
      };
    });
}

/* =========================
   LOAD
========================= */

const artists = readCollection(ARTISTS_DIR);
const works = readCollection(WORKS_DIR);

/* =========================
   BUILD
========================= */

const result = artists.map((artist) => {
  const artistWorks = works
    .filter((w) => w.data.artist === artist.slug)
    .map((w) => ({
      image: w.data.image,
      title: w.data.title ?? null,
      slug: w.slug,
    }));

  return {
    slug: artist.slug,
    name: artist.data.title,
    style: artist.data.style ?? null,
    works: artistWorks,

    // 👉 для инкрементальности
    mtime: Math.max(
      artist.mtime,
      ...works
        .filter((w) => w.data.artist === artist.slug)
        .map((w) => w.mtime)
    ),
  };
});

/* =========================
   INCREMENTAL CHECK
========================= */

let shouldWrite = true;

if (fs.existsSync(CACHE_PATH)) {
  try {
    const prev = JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));

    const same =
      prev.length === result.length &&
      prev.every((p, i) => p.mtime === result[i].mtime);

    if (same) {
      console.log("⏭ no changes in artists");
      shouldWrite = false;
    }
  } catch {
    // ignore
  }
}

/* =========================
   SAVE
========================= */

if (shouldWrite) {
  fs.mkdirSync("./.cache", { recursive: true });

  fs.writeFileSync(CACHE_PATH, JSON.stringify(result, null, 2));

  console.log("✅ artists dumped");
}