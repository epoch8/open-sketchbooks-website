import { getCollection } from 'astro:content';

export async function GET() {
  const base = 'https://open-sketchbook.place';

  const sketchbooks = await getCollection('sketchbooks');
  const artists = await getCollection('artists');

  const urls = [
    '',

    ...sketchbooks
      .filter((b) => b.data.published)
      .map((b) => `/sketchbooks/${b.slug}`),

    ...artists.map((a) => `/artists/${a.slug}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls
      .map(
        (url) => `
      <url>
        <loc>${base}${url}</loc>
      </url>`
      )
      .join('')}
  </urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}