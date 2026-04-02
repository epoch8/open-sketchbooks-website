import type { APIContext } from 'astro';

export const prerender = false;

/* whitelist — защита */
const ALLOWED_GROUPS = [
  "183455938539161323",
];

export async function POST({ request }: APIContext) {
  try {
    const { email, group, artist, event } = await request.json();

    if (!email || !group) {
      return new Response(JSON.stringify({ ok: false }), { status: 400 });
    }

    /* защита */
    if (!ALLOWED_GROUPS.includes(group)) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid group" }),
        { status: 400 }
      );
    }

    /* собираем fields только если есть */
    const fields: Record<string, string> = {};

    if (artist) fields.artist = artist;
    if (event) fields.event = event;

    const body: any = {
      email,
      status: "active",
      groups: [group],
      ...(Object.keys(fields).length > 0 && { fields }),
    };

    const res = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${import.meta.env.MAILERLITE_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log("MailerLite:", data);

    if (!res.ok) {
      return new Response(JSON.stringify({ ok: false }), { status: 400 });
    }

    return new Response(JSON.stringify({ ok: true }));

  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ ok: false }), { status: 500 });
  }
  
}